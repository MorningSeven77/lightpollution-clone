export type Language = "zh" | "en";

export const DEFAULT_LANGUAGE: Language = "zh";
export const STORAGE_KEY = "lightpollution-language";

export const LANGUAGE_META: Record<Language, { flag: string; label: string }> = {
  zh: { flag: "🇨🇳", label: "中文" },
  en: { flag: "🇺🇸", label: "English" },
};

export function isLanguage(value: string | null): value is Language {
  return value === "zh" || value === "en";
}
