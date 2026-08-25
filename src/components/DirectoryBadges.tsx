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

      {/* Click-outside-to-close via a full-screen transparent overlay, same
          pattern used by the site's other dropdown menus. Conditionally
          mounted is correct here (unlike the badge panel below) — this is
          just a click-catcher with no content of its own, and if it stayed
          mounted while closed it would block every click on the map
          underneath it. */}
      {open && <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />}

      {/* Always mounted (not `open &&`) — several of these directories
          (Startup Fame, DANG, Fazier) verify their badge by fetching this
          page's raw HTML and looking for the <a>/<img> markup, without
          executing JS. Conditionally rendering this panel meant the badge
          markup simply didn't exist in the server-rendered HTML (or the
          initial client DOM) until a visitor clicked the trigger, so those
          verification crawlers never saw it. Only *visibility* is toggled
          client-side now — same "always mounted, CSS-hidden" approach
          InfoPanel.tsx uses for its slide-in FAQ panel — and it's still a
          sibling of the trigger button, not nested inside it: nesting it
          there made this panel's shrink-to-fit width resolve against the
          button's own 32px box (absolutely positioned descendants don't
          contribute to their ancestor's auto width), squeezing the 260px-
          wide DANG badge down to ~110px. */}
      <div
        className={`absolute bottom-12 right-12 z-40 flex-col items-end gap-2 ${open ? "flex" : "hidden"}`}
        aria-hidden={!open}
      >
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
        {/* Fazier's badge is plain text with no background of its own, so it
            gets a light chip here so its dark text stays legible against the
            map's dark basemap — DANG's badge above is already a fully
            designed image and needs no such wrapper. */}
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
        <a
          href="https://startupfa.me/s/light-pollution-map?utm_source=www.lightpollutionmap.io"
          target="_blank"
          rel="noopener"
          style={{ display: "inline-block" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- external badge asset served from startupfa.me, not a locally optimizable image */}
          <img
            src="https://startupfa.me/badges/featured-badge.webp"
            alt="Light Pollution Map - Featured on Startup Fame"
            width={171}
            height={54}
            style={{ display: "block", width: 171, maxWidth: "100%", height: "auto" }}
          />
        </a>
        {/* "white" variant is designed for dark backgrounds, so like DANG's
            badge above it needs no extra chip. */}
        <a href="https://twelve.tools" target="_blank" rel="noopener" style={{ display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external badge asset served from twelve.tools, not a locally optimizable image */}
          <img
            src="https://twelve.tools/badge0-white.svg"
            alt="Featured on Twelve Tools"
            width={148}
            height={40}
            style={{ display: "block", width: 148, maxWidth: "100%", height: "auto" }}
          />
        </a>
        <a href="https://www.toolpilot.ai" target="_blank" rel="noopener" style={{ display: "inline-block" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- external badge asset served from toolpilot.ai, not a locally optimizable image */}
          <img
            src="https://www.toolpilot.ai/cdn/shop/files/f-b.png"
            alt="Featured on ToolPilot"
            width={300}
            height={66}
            style={{ display: "block", width: 300, maxWidth: "100%", height: "auto" }}
          />
        </a>
        {/* Self-contained white-background badge (verified its SVG source has
            its own white rounded rect + border baked in), so like DANG's and
            Twelve Tools' badges above it needs no extra chip. */}
        <a
          href="https://findly.tools/light-pollution-map?utm_source=light-pollution-map"
          target="_blank"
          rel="noopener"
          style={{ display: "inline-block" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- external badge asset served from findly.tools, not a locally optimizable image. No height given upstream, so it's left to the image's natural aspect ratio. */}
          <img
            src="https://findly.tools/badges/findly-tools-badge-light.svg"
            alt="Featured on Findly.tools"
            width={150}
            style={{ display: "block", width: 150, maxWidth: "100%", height: "auto" }}
          />
        </a>
      </div>
    </>
  );
}
