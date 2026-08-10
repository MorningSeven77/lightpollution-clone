"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";

export type GeocodeResult = {
  displayName: string;
  lat: number;
  lng: number;
};

export default function SearchBar({
  onSelect,
}: {
  onSelect: (result: GeocodeResult) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const t = useTranslations("searchBar");

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(trimmed)}`);
        const data: GeocodeResult[] = await res.json();
        setResults(data);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="absolute left-4 top-4 z-10 w-full max-w-xs">
      <input
        value={query}
        onChange={(e) => {
          const value = e.target.value;
          setQuery(value);
          if (value.trim().length < 2) {
            setResults([]);
            setOpen(false);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        placeholder={t("placeholder")}
        className="w-full rounded-md border border-white/10 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 shadow-lg backdrop-blur focus:outline-none focus:ring-2 focus:ring-zinc-400"
      />
      {open && (
        <ul className="mt-1 max-h-64 overflow-y-auto rounded-md border border-white/10 bg-zinc-900/95 text-sm text-zinc-100 shadow-lg backdrop-blur">
          {loading && <li className="px-3 py-2 text-zinc-400">{t("searching")}</li>}
          {!loading && results.length === 0 && (
            <li className="px-3 py-2 text-zinc-400">{t("noResults")}</li>
          )}
          {!loading &&
            results.map((r, i) => (
              <li key={`${r.lat}-${r.lng}-${i}`}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-zinc-800"
                  onClick={() => {
                    onSelect(r);
                    setQuery(r.displayName);
                    setOpen(false);
                  }}
                >
                  {r.displayName}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
