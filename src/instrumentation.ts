export async function register() {
  // Importing this here — as early as Next.js will ever run our code, before
  // any route module or its dependencies get a chance to load — is load-
  // bearing. @google/earthengine captures `require("xmlhttprequest").XMLHttpRequest`
  // into a module-level const the *first* time it's required anywhere in the
  // process, and that happens only once (Node's module cache). Patching the
  // export from a route's own import graph was too late: something (Next.js's
  // route compilation/analysis pass, apparently) was already requiring
  // @google/earthengine before any request-handling code ran, so it always
  // captured the original, unpatched class regardless of import order within
  // a route file. Doing it here — the one place Next.js guarantees runs
  // before all of that — fixes it for good. See earthEngineTransport.ts for
  // the rest of the story.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./lib/earthEngineTransport");
  }

  // This dev machine only reaches the public internet through a local proxy
  // (see HTTP_PROXY/HTTPS_PROXY). Node's built-in fetch (undici) ignores those
  // env vars by default, so outbound calls to Nominatim/Earth Engine/etc. would
  // otherwise hang until they time out. Route everything through the proxy instead.
  //
  // Must stay a dynamic import: statically importing "undici" pulls in its
  // mock-agent code path, which references node:console and fails webpack's
  // build ("Reading from node:console is not handled by plugins").
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const proxyUrl = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
    if (proxyUrl) {
      const { setGlobalDispatcher, ProxyAgent } = await import("undici");
      setGlobalDispatcher(new ProxyAgent(proxyUrl));
    }
  }
}
