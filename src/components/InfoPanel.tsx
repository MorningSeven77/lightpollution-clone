"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function InfoPanel() {
  const [open, setOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t.infoPanel.openAria}
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
          <h2 className="font-medium">{t.infoPanel.title}</h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t.infoPanel.closeAria}
            className="text-zinc-400 hover:text-zinc-100"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <p className="mb-4 text-xs text-zinc-400">{t.infoPanel.intro}</p>

          <div className="space-y-4">
            {t.infoPanel.qa.map((item) => (
              <div key={item.question}>
                <h3 className="mb-1 text-xs font-medium text-zinc-200">{item.question}</h3>
                <p className="text-xs leading-relaxed text-zinc-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
