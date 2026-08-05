import "server-only";
// @ts-expect-error xmlhttprequest ships no type declarations
import xhrModule from "xmlhttprequest";

// @google/earthengine's Node client sends every request through the
// `xmlhttprequest` package with `agent: false` hardcoded — it ignores
// HTTP_PROXY/HTTPS_PROXY entirely and can't be routed through a proxy no
// matter what's configured elsewhere. That makes it unreachable on networks
// that need a proxy to reach googleapis.com at all (this dev machine among
// them).
//
// Node's built-in fetch *can* go through the proxy once instrumentation.ts
// installs undici's ProxyAgent as the process-wide default dispatcher, so
// this file replaces `xmlhttprequest`'s exported constructor with a minimal
// shim backed by fetch instead — only the transport changes; every ee.* call
// and its request/response shape stay exactly as the SDK builds them.
//
// In practice that process-wide default was unreliable in two ways:
//
// 1. Next.js compiles each API route as its own webpack bundle, and a route
//    whose bundle ends up with a *different* copy of the `undici` module
//    than the one instrumentation.ts configured never sees the dispatcher it
//    set — fetch silently falls back to a direct connection, which fails
//    outright on a network that needs the proxy to reach googleapis.com at
//    all.
// 2. Even passing a ProxyAgent explicitly isn't enough on its own: Node's
//    built-in fetch is backed by whatever undici version ships *inside* that
//    Node release, and the `undici` *npm* package installed here (used to
//    build the ProxyAgent) can be a different major version. undici's
//    Dispatcher is an internal interface, not a stable public contract
//    across versions — Node's native fetch validates the object shape and
//    rejects a ProxyAgent built by a mismatched version outright
//    ("InvalidArgumentError: invalid onRequestStart method").
//
// The fix for both: use the npm `undici` package's *own* fetch together with
// its *own* ProxyAgent — same module instance, so there's no cross-version
// mismatch and no dependence on which copy of `undici` the ambient global
// default dispatcher happens to apply to.
//
// @google/earthengine's main.js captures `require("xmlhttprequest").XMLHttpRequest`
// into a module-level `const` the *first* time it's required anywhere in the
// process — not at call time, despite that seeming like the natural read of
// its source. That capture only happens once (Node's module cache), so this
// file has to be imported — and its patch applied — before anything else
// ever requires "@google/earthengine", not just before whichever route
// happens to need it. Importing this from a route's own module graph wasn't
// early enough in practice: something (Next.js's route compilation/analysis
// pass, apparently) was already requiring @google/earthengine before any
// request-handling code ran, so main.js's capture always got the original,
// unpatched class regardless of import order within a route file. The actual
// fix is in instrumentation.ts, which imports this module — this file isn't
// enough on its own without that.
//
// Note: this shim only covers EE's *data-layer* requests (tiles, value
// compute, etc). Authentication is a separate path — see
// getGoogleAccessToken() in earthEngine.ts, which reuses getUndiciClient()
// below for the same reason.

type UndiciModule = typeof import("undici");
type UndiciClient = { fetch: UndiciModule["fetch"]; dispatcher?: InstanceType<UndiciModule["ProxyAgent"]> };

let undiciClientPromise: Promise<UndiciClient> | null = null;

// Cached and shared (not rebuilt per request) so repeated calls reuse the
// same underlying proxy connection pool instead of opening a fresh one each
// time.
export function getUndiciClient(): Promise<UndiciClient> {
  if (!undiciClientPromise) {
    undiciClientPromise = (async () => {
      const undici = await import("undici");
      const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
      const dispatcher = proxyUrl ? new undici.ProxyAgent(proxyUrl) : undefined;
      return { fetch: undici.fetch, dispatcher };
    })();
  }
  return undiciClientPromise;
}

type XhrEventType = "load" | "error";

class FetchBackedXMLHttpRequest {
  status = 0;
  responseText = "";
  readyState = 0;
  withCredentials = false;
  onreadystatechange: (() => void) | null = null;

  private method = "GET";
  private url = "";
  private headers: Record<string, string> = {};
  private listeners: Record<XhrEventType, Array<(err?: unknown) => void>> = { load: [], error: [] };

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string) {
    this.headers[key] = value;
  }

  addEventListener(type: XhrEventType, callback: (err?: unknown) => void) {
    this.listeners[type]?.push(callback);
  }

  removeEventListener(type: XhrEventType, callback: (err?: unknown) => void) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((cb) => cb !== callback);
  }

  // @google/earthengine doesn't read response headers, but implements
  // enough of the XHR surface to call these — no-op stubs are enough.
  getAllResponseHeaders() {
    return "";
  }
  getResponseHeader() {
    return null;
  }
  abort() {}

  send(body?: string) {
    // xmlhttprequest calls send("") for bodiless GET requests, but fetch()
    // throws if a body is present at all (even "") on GET/HEAD.
    const fetchBody = body ? body : undefined;
    getUndiciClient()
      .then(({ fetch: undiciFetch, dispatcher }) =>
        undiciFetch(this.url, {
          method: this.method,
          headers: this.headers,
          body: fetchBody,
          ...(dispatcher ? { dispatcher } : {}),
        }),
      )
      .then(async (res) => {
        this.status = res.status;
        this.responseText = await res.text();
        this.readyState = 4;
        this.listeners.load.forEach((cb) => cb());
        this.onreadystatechange?.();
      })
      .catch((err) => {
        console.error("[earthEngineTransport] fetch failed for", this.method, this.url, err);
        this.status = 0;
        this.readyState = 4;
        this.listeners.error.forEach((cb) => cb(err));
        this.onreadystatechange?.();
      });
  }
}

xhrModule.XMLHttpRequest = FetchBackedXMLHttpRequest;
