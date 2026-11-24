"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";

export type DirectoryRow = {
  id: number;
  name: string;
  category: string;
  categoryLabel: string;
  yearText: string;
  link: string;
  regionLabel: string | null;
};

export default function PlaceDirectory({ rows }: { rows: DirectoryRow[] }) {
  const t = useTranslations("guides");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const row of rows) seen.set(row.category, row.categoryLabel);
    return [...seen.entries()];
  }, [rows]);
  const shown = rows.filter((row) => {
    if (category !== "all" && row.category !== category) return false;
    if (!query.trim()) return true;
    return row.name.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <div>
      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("directoryFilter")}
          className="w-full rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label={t("directoryAll")}
          className="rounded-md border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
        >
          <option value="all">{t("directoryAll")}</option>
          {categories.map(([id, label]) => (
            <option key={id} value={id}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <ul className="space-y-2">
        {shown.map((row) => (
          <li key={row.id} className="rounded-md border border-white/10 bg-zinc-900/40 px-3 py-2">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-medium text-zinc-100">{row.name}</h3>
              <span className="text-[11px] text-zinc-400">{row.categoryLabel}</span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {row.yearText}
              {row.regionLabel ? ` · ${row.regionLabel}` : ""}
            </p>
            <a href={row.link} className="mt-1 inline-block text-xs text-blue-400 hover:text-blue-300">
              {t("officialLink")}
            </a>
          </li>
        ))}
      </ul>
      {shown.length === 0 && <p className="text-xs text-zinc-500">{t("directoryEmpty")}</p>}
    </div>
  );
}
