"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

type QaItem = { question: string; answer: string };
type QaModule = { title: string; qa: QaItem[] };

const FEEDBACK_EMAIL = "morning.seven.77.77.77@gmail.com";

export type InfoPanelProps = {
  // Lets keyword-landing variants of the home page (e.g. /bortle-scale-map)
  // swap in their own FAQ content while reusing this same component. Must
  // point at a namespace with the same shape as the default "infoPanel".
  namespace?: string;
  // When true, reads a "modules" array (QaModule[]) instead of a flat "qa"
  // array — each module gets its own h3 heading grouping a handful of
  // questions (rendered as h4 instead of the flat layout's h3), for FAQs
  // long enough that a flat list stops being easy to scan.
  grouped?: boolean;
};

export default function InfoPanel({ namespace = "infoPanel", grouped = false }: InfoPanelProps) {
  const [open, setOpen] = useState(false);
  const t = useTranslations(namespace);
  // FAQ questions/answers are structured, non-parameterized content — t.raw()
  // is next-intl's mechanism for retrieving that directly instead of running
  // each field through ICU message formatting individually.
  const qa = grouped ? null : (t.raw("qa") as QaItem[]);
  const modules = grouped ? (t.raw("modules") as QaModule[]) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("openAria")}
        className="absolute bottom-4 left-64 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-sm font-semibold text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
      >
        i
      </button>

      {/* Docked to the right edge like the reference site's own FAQ panel —
          full height, no dark backdrop, map stays visible and interactive
          on the left. Always mounted (not `open &&`) so the slide-in
          transform has something to animate from/to instead of just
          appearing. */}
      <div
        className={`absolute right-0 top-0 bottom-0 z-30 w-80 overflow-y-auto border-l border-white/10 bg-zinc-900 text-sm text-zinc-100 shadow-2xl transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-zinc-900 px-4 py-3">
          <h2 className="font-medium">{t("title")}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeAria")}
            className="text-zinc-400 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-xs text-zinc-400">{t("intro")}</p>

          {modules ? (
            <div className="space-y-5">
              {modules.map((module) => (
                <div key={module.title}>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">{module.title}</h3>
                  <div className="space-y-4">
                    {module.qa.map((item) => (
                      <div key={item.question}>
                        <h4 className="mb-1 text-xs font-medium text-zinc-200">{item.question}</h4>
                        <p className="text-xs leading-relaxed text-zinc-400">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {qa!.map((item) => (
                <div key={item.question}>
                  <h3 className="mb-1 text-xs font-medium text-zinc-200">{item.question}</h3>
                  <p className="text-xs leading-relaxed text-zinc-400">{item.answer}</p>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 border-t border-white/10 pt-4">
            <h3 className="mb-2 text-xs font-medium text-zinc-200">{t("feedbackTitle")}</h3>
            <div className="space-y-1 text-xs">
              <Link href="/about-data" className="block text-blue-400 hover:text-blue-300">
                {t("feedbackAboutLink")}
              </Link>
              <a href={`mailto:${FEEDBACK_EMAIL}`} className="block text-blue-400 hover:text-blue-300">
                {t("feedbackEmailLabel")}: {FEEDBACK_EMAIL}
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
