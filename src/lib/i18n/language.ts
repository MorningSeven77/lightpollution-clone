import { routing } from "@/i18n/routing";

export type Language = (typeof routing.locales)[number];

export const LANGUAGE_META: Record<Language, { flag: string; label: string }> = {
  zh: { flag: "🇨🇳", label: "中文" },
  en: { flag: "🇺🇸", label: "English" },
};
