export async function register() {
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
