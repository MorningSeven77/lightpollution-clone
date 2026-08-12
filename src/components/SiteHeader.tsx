"use client";

import { Suspense, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { usePathname, useRouter, Link } from "@/i18n/navigation";
import { Language, LANGUAGE_META } from "@/lib/i18n/language";

const LANGUAGE_ORDER: Language[] = ["zh", "en"];

function LanguageSwitcher() {
  const t = useTranslations("siteHeader");
  const locale = useLocale() as Language;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const current = LANGUAGE_META[locale];

  // Preserves the map's own lat/lng/zoom query string across a language
  // switch — this is a real page navigation (locale is part of the URL now,
  // not just client state), so without this the map would reset to the
  // default view every time someone toggles language.
  const switchTo = (next: Language) => {
    const query = searchParams.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}`, { locale: next });
    setOpen(false);
  };

  return (
    // Click-outside-to-close via a full-screen transparent overlay behind the
    // dropdown, rather than a document-level listener — same pattern used by
    // the reference site's own language menu.
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("languageSwitcherAria")}
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
                  onClick={() => switchTo(id)}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800"
                >
                  <span>{meta.flag}</span>
                  <span className="flex-1">{meta.label}</span>
                  {locale === id && <span className="text-emerald-400">✓</span>}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function MorePagesMenu() {
  const t = useTranslations("siteHeader");
  const tGoldenHour = useTranslations("goldenHour");
  const tClearSkyMap = useTranslations("clearSkyMap");
  const tRankings = useTranslations("rankings");
  const tAboutData = useTranslations("aboutData");
  const [open, setOpen] = useState(false);

  const items = [
    { href: "/golden-hour", icon: "☀️", label: tGoldenHour("navLabel") },
    { href: "/clear-sky-map", icon: "✨", label: tClearSkyMap("navLabel") },
    { href: "/rankings", icon: "🌍", label: tRankings("navLabel") },
    { href: "/about-data", icon: "ℹ️", label: tAboutData("navLabel") },
  ] as const;

  return (
    // Same click-outside-to-close dropdown pattern as the language switcher
    // right next to it — groups the four standalone pages (golden hour,
    // clear-night climate, rankings, about & data) the reference site keeps
    // under its own "Resources" menu, renamed since "Resources" doesn't
    // quite describe this project's mix of a calculator, a climate stat
    // page, a data table, and an about page.
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("moreMenuAria")}
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-md border border-white/10 bg-zinc-800/80 px-2.5 py-1.5 text-xs text-zinc-100 hover:bg-zinc-800"
      >
        <span className="hidden sm:inline">{t("moreMenuLabel")}</span>
        <svg viewBox="0 0 20 20" fill="currentColor" className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.293l3.71-4.06a.75.75 0 1 1 1.08 1.04l-4.25 4.65a.75.75 0 0 1-1.08 0l-4.25-4.65a.75.75 0 0 1 .02-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-40 mt-1 w-48 overflow-hidden rounded-md border border-white/10 bg-zinc-900 text-xs text-zinc-100 shadow-lg">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-zinc-800"
              >
                <span>{item.icon}</span>
                <span className="flex-1">{item.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export type SiteHeaderProps = {
  // The home page has no other natural top-level heading, so the title
  // renders as the page's one-and-only <h1> there. Other pages (like
  // /golden-hour) have their own real <h1> — on those this renders as plain
  // text instead, to avoid two competing h1s on one page.
  titleAsHeading?: boolean;
};

export default function SiteHeader({ titleAsHeading = true }: SiteHeaderProps) {
  const t = useTranslations("siteHeader");
  const TitleTag = titleAsHeading ? "h1" : "span";

  return (
    <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-900 px-4 text-zinc-100">
      <div className="flex items-baseline gap-2 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element -- static file in public/, no next/image optimization needed for a 24px logo */}
        <img src="/logo.svg" alt="" className="h-6 w-6 shrink-0 self-center rounded-md" />
        <TitleTag className="truncate font-semibold">{t("title")}</TitleTag>
        <p className="hidden truncate text-xs text-zinc-400 sm:inline">{t("subtitle")}</p>
      </div>
      <div className="flex items-center gap-2">
        <MorePagesMenu />
        <Suspense fallback={<div className="h-8 w-20 rounded-md border border-white/10 bg-zinc-800/80" />}>
          <LanguageSwitcher />
        </Suspense>
      </div>
    </header>
  );
}
