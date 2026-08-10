import { defineRouting } from "next-intl/routing";

// "as-needed" keeps the default locale (English) unprefixed at the root —
// / serves English, /zh serves Chinese — matching the SEO goal of giving
// each language its own crawlable, indexable URL instead of hiding the
// switch behind client-side state.
export const routing = defineRouting({
  locales: ["en", "zh"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});
