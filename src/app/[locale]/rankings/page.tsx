"use client";

import { Fragment, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import CountryTrendPanel from "@/components/CountryTrendPanel";
import { COUNTRY_LIGHT_POLLUTION } from "@/lib/countryRankings";
import { computeSkyBackgroundRatio } from "@/lib/locationHistory";
import type { CountryTrendResponse } from "@/app/api/country-trend/route";

type SortKey = "avgSqm" | "ratio" | "bortleLe4Percent" | "pixelCount" | "name";
type SortDirection = "asc" | "desc";
type TrendCacheEntry = { status: "loading" } | { status: "error" } | { status: "done"; data: CountryTrendResponse };

export default function RankingsPage() {
  const t = useTranslations("rankings");
  const tCountryTrend = useTranslations("countryTrend");
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("avgSqm");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [trendCache, setTrendCache] = useState<Record<string, TrendCacheEntry>>({});

  // Fetched on the click that opens a row (not in an effect) — each
  // country's trend is expensive enough (a live Earth Engine zonal query)
  // that it should only ever run in response to the user actually asking
  // for it, and only once per country per page load (cached by name).
  const toggleExpand = (name: string) => {
    if (expandedCountry === name) {
      setExpandedCountry(null);
      return;
    }
    setExpandedCountry(name);
    if (trendCache[name]) return;
    setTrendCache((prev) => ({ ...prev, [name]: { status: "loading" } }));
    fetch(`/api/country-trend?name=${encodeURIComponent(name)}`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error("request failed"))))
      .then((data: CountryTrendResponse) => setTrendCache((prev) => ({ ...prev, [name]: { status: "done", data } })))
      .catch(() => setTrendCache((prev) => ({ ...prev, [name]: { status: "error" } })));
  };

  // Darkest (highest SQM) country in the whole dataset is the reference
  // point for every row's ratio — same relationship computeSkyBackgroundRatio
  // already uses for the location-history "compare" feature.
  const darkestSqm = useMemo(
    () => COUNTRY_LIGHT_POLLUTION.reduce((max, c) => Math.max(max, c.avgSqm), -Infinity),
    []
  );

  const rows = useMemo(() => {
    const withRatio = COUNTRY_LIGHT_POLLUTION.map((c) => ({
      ...c,
      ratio: computeSkyBackgroundRatio(darkestSqm, c.avgSqm),
    }));

    const filtered = query.trim()
      ? withRatio.filter(
          (c) =>
            c.name.toLowerCase().includes(query.trim().toLowerCase()) ||
            c.code.toLowerCase().includes(query.trim().toLowerCase())
        )
      : withRatio;

    const sorted = [...filtered].sort((a, b) => {
      const cmp =
        sortKey === "name" ? a.name.localeCompare(b.name) : a[sortKey] - b[sortKey];
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return sorted;
  }, [darkestSqm, query, sortKey, sortDirection]);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      // SQM/ratio/bortle/pixels are all "bigger number = more interesting"
      // metrics — default to descending on a fresh column, ascending only
      // makes sense for the alphabetical name column.
      setSortDirection(key === "name" ? "asc" : "desc");
    }
  };

  const columns: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "name", label: t("columnCountry") },
    { key: "avgSqm", label: t("columnAvgSqm"), align: "right" },
    { key: "ratio", label: t("columnRatio"), align: "right" },
    { key: "bortleLe4Percent", label: t("columnBortleLe4"), align: "right" },
    { key: "pixelCount", label: t("columnPixels"), align: "right" },
  ];

  return (
    <div className="flex h-dvh flex-col bg-zinc-950 text-zinc-100">
      <SiteHeader titleAsHeading={false} />
      <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-200">
            {t("backToMap")}
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{t("pageTitle")}</h1>
          <p className="mt-1 text-sm text-zinc-400">{t("pageSubtitle")}</p>

          <div className="mt-4 flex items-center justify-between gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full max-w-xs rounded-md border border-white/10 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-white/30 focus:outline-none"
            />
            <span className="shrink-0 text-xs text-zinc-500">
              {t("countLabel", { count: rows.length })}
            </span>
          </div>

          <div className="mt-3 overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-zinc-900/80 text-xs text-zinc-400">
                  <th className="px-3 py-2 text-left font-medium">{t("columnRank")}</th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className={`px-3 py-2 font-medium ${col.align === "right" ? "text-right" : "text-left"}`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={`inline-flex items-center gap-1 hover:text-zinc-200 ${sortKey === col.key ? "text-zinc-100" : ""}`}
                      >
                        {col.label}
                        {sortKey === col.key && <span>{sortDirection === "asc" ? "↑" : "↓"}</span>}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-3 py-6 text-center text-zinc-500">
                      {t("noResults")}
                    </td>
                  </tr>
                ) : (
                  rows.map((row, i) => {
                    const isExpanded = expandedCountry === row.name;
                    const trendEntry = trendCache[row.name];
                    return (
                      <Fragment key={row.name}>
                        <tr className="border-b border-white/5 last:border-b-0 hover:bg-white/5">
                          <td className="px-3 py-2 text-zinc-500">{i + 1}</td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(row.name)}
                              aria-expanded={isExpanded}
                              aria-label={t(isExpanded ? "collapseTrendAria" : "expandTrendAria", { country: row.name })}
                              className="inline-flex items-center gap-1.5 hover:text-zinc-200"
                            >
                              <svg
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className={`h-3 w-3 shrink-0 text-zinc-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                              >
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 .02-1.06L11.293 10 7.23 6.29a.75.75 0 1 1 1.04-1.08l4.65 4.25a.75.75 0 0 1 0 1.08l-4.65 4.25a.75.75 0 0 1-1.06-.02Z" clipRule="evenodd" />
                              </svg>
                              <span>{row.name}</span>
                              <span className="text-xs text-zinc-500">{row.code}</span>
                            </button>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums">{row.avgSqm.toFixed(2)}</td>
                          <td className="px-3 py-2 text-right tabular-nums">{row.ratio.toFixed(1)}×</td>
                          <td className="px-3 py-2 text-right tabular-nums">{row.bortleLe4Percent.toFixed(1)}%</td>
                          <td className="px-3 py-2 text-right tabular-nums text-zinc-500">
                            {row.pixelCount.toLocaleString()}
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${row.name}-trend`} className="border-b border-white/5 bg-black/20 last:border-b-0">
                            <td colSpan={columns.length + 1} className="px-3 py-3">
                              {trendEntry?.status === "loading" && (
                                <div className="text-xs text-zinc-400">{tCountryTrend("loading")}</div>
                              )}
                              {trendEntry?.status === "error" && (
                                <div className="text-xs text-rose-400">{tCountryTrend("error")}</div>
                              )}
                              {trendEntry?.status === "done" && (
                                <CountryTrendPanel data={trendEntry.data} darkestSqm={darkestSqm} />
                              )}
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-lg border border-white/10 bg-zinc-900/50 p-4 text-xs leading-relaxed text-zinc-400">
            <p className="mb-1 font-medium text-zinc-300">{t("methodologyTitle")}</p>
            <p>{t("methodologyBody")}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
