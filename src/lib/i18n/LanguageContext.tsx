"use client";

import { createContext, useCallback, useContext, useEffect, useSyncExternalStore, ReactNode } from "react";
import { Language, DEFAULT_LANGUAGE, STORAGE_KEY, isLanguage } from "./language";
import { translations, Translations } from "./translations";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

// localStorage is read through useSyncExternalStore rather than a
// useEffect+setState pair — the latter is flagged by
// react-hooks/set-state-in-effect (cascading render), and this is exactly
// the kind of external-store read the hook was designed for: the server
// snapshot (default language) is used for SSR/first paint, then React
// swaps in the real client snapshot right after hydration with no manual
// setState call.
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => listeners.delete(onStoreChange);
}

function getSnapshot(): Language {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isLanguage(stored) ? stored : DEFAULT_LANGUAGE;
}

function getServerSnapshot(): Language {
  return DEFAULT_LANGUAGE;
}

function persistLanguage(next: Language) {
  window.localStorage.setItem(STORAGE_KEY, next);
  listeners.forEach((listener) => listener());
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => persistLanguage(next), []);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
