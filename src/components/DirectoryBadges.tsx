"use client";

import { useState } from "react";

// Backlink badges for directory listings this project is featured on
// (Fazier, DANG, ...). Collapsed into a single small trigger button by
// default — a full-size badge stack sitting permanently on the map got
// flagged as too obtrusive, and more directories are expected to be added
// here over time, so a fixed-footprint trigger (like the app's other
// toolbar buttons — MoonPhasePanel, LocationHistoryPanel, etc.) scales to
// any number of badges without growing the on-screen footprint.
export default function DirectoryBadges() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Featured on"
        aria-expanded={open}
        className="absolute bottom-2 right-12 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-zinc-900/90 text-sm text-zinc-100 shadow-lg backdrop-blur hover:bg-zinc-800"
      >
        🏅
      </button>

      {open && (
        <>
          {/* Click-outside-to-close via a full-screen transparent overlay,
              same pattern used by the site's other dropdown menus. */}
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          {/* A sibling of the trigger button, not nested inside it — nesting
              it there made this panel's shrink-to-fit width resolve against
              the button's own 32px box (absolutely positioned descendants
              don't contribute to their ancestor's auto width), squeezing the
              260px-wide DANG badge down to ~110px. Positioned independently
              here against the map container instead. */}
          <div className="absolute bottom-12 right-12 z-40 flex flex-col items-end gap-2">
            <a href="https://dang.ai" target="_blank" rel="dofollow noopener" style={{ display: "inline-block", textDecoration: "none" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- external badge asset served from dang.ai, not a locally optimizable image */}
              <img
                src="https://assets.dang.ai/badges/dang-verified-dark.png"
                alt="Verified on DANG!"
                width={260}
                height={94}
                style={{ display: "block", width: 260, maxWidth: "100%", height: "auto", border: 0, outline: "none", textDecoration: "none" }}
              />
            </a>
            {/* Fazier's badge is plain text with no background of its own, so
                it gets a light chip here so its dark text stays legible
                against the map's dark basemap — DANG's badge above is
                already a fully designed image and needs no such wrapper. */}
            <div className="rounded-md bg-white px-2 py-1 shadow-lg">
              <a
                href="https://fazier.com"
                target="_blank"
                rel="noopener"
                style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "#1a1a1a", textDecoration: "none" }}
              >
                Featured on <strong>Fazier</strong>
              </a>
            </div>
          </div>
        </>
      )}
    </>
  );
}
