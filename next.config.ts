import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  // Node's real require() cache (not webpack's) for these two — earthEngineTransport.ts
  // patches xmlhttprequest's exported class, and that only reaches
  // @google/earthengine reliably when both resolve through the same,
  // single, real module instance instead of being bundled per-route.
  serverExternalPackages: ["@google/earthengine", "xmlhttprequest"],
};

export default withNextIntl(nextConfig);
