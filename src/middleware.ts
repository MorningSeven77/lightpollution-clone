import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip API routes, static assets, and files with an extension (favicon,
  // maplibre worker files under /maplibre/, etc.) — only page routes need
  // locale negotiation/prefixing.
  matcher: ["/((?!api|_next|_vercel|maplibre|.*\\..*).*)"],
};
