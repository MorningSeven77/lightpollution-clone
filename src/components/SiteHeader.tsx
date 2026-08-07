"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Language, LANGUAGE_META } from "@/lib/i18n/language";

const LANGUAGE_ORDER: Language[] = ["zh", "en"];

function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGE_META[language];

  return (
    // Click-outside-to-close via a full-screen transparent overlay behind the
    // dropdown, rather than a document-level listener — same pattern used by
    // the reference site's own language menu.
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.siteHeader.languageSwitcherAria}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-800/80 px-2.5 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.label}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.293l3.71-4.06a.75.75 0 1 1 1.08 1.04l-4.25 4.65a.75.75 0 0 1-1.08 0l-4.25-4.65a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1 w-32 overflow-hidden rounded-md border border-white/10 bg-zinc-900 text-xs text-zinc-100 shadow-lg">
            {LANGUAGE_ORDER.map((id) => {
              const meta = LANGUAGE_META[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setLanguage(id);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800"
                >
                  <span>{meta.flag}</span>
                  <span className="flex-1">{meta.label}</span>
                  {language === id && <span className="text-emerald-400">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default function SiteHeader() {
  const { t } = useLanguage();

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900 px-4 text-zinc-100">
      <div className="flex items-baseline gap-2 overflow-hidden">
        <span className="text-lg">🌌</span>
        <h1 className="truncate font-semibold">{t.siteHeader.title}</h1>
        <p className="hidden truncate text-xs text-zinc-400 sm:inline">{t.siteHeader.subtitle}</p>
      </div>
      <LanguageSwitcher />
    </header>
  );
}
