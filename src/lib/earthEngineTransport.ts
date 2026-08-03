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
// Node's built-in fetch *does* go through the proxy once instrumentation.ts
// installs undici's ProxyAgent, so this file replaces `xmlhttprequest`'s
// exported constructor with a minimal shim backed by fetch instead — only
// the transport changes; every ee.* call and its request/response shape stay
// exactly as the SDK builds them.
//
// This only works because @google/earthengine looks up
// `require("xmlhttprequest").XMLHttpRequest` at call time rather than
// capturing a reference when it's first imported, so overwriting the export
// here (as long as this module is imported before "@google/earthengine" is)
// is enough — no need to patch the SDK itself.

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
    fetch(this.url, { method: this.method, headers: this.headers, body: fetchBody })
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
