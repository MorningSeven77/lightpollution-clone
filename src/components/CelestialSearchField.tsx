"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { searchCelestialObjects, SEARCHABLE_PLANET_BODIES, type SearchResult } from "@/lib/starmap/searchIndex";

type CelestialSearchFieldProps = {
  onSelect: (result: SearchResult) => void;
};

// Search box for the star-map's object search (task: "按名称搜索天体") --
// matches against planets/named stars/Messier objects (see searchIndex.ts)
// and calls onSelect with the picked result; the caller (StarMapPage) is
// responsible for computing where that object currently is and pointing
// the camera there (see lookAtTarget.ts), not this component.
export default function CelestialSearchField({ onSelect }: CelestialSearchFieldProps) {
  const t = useTranslations("starMap");
  const tPlanetNames = useTranslations("starMap.planetNames");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const localizedNameByBody = useMemo(
    () => Object.fromEntries(SEARCHABLE_PLANET_BODIES.map((body) => [body, tPlanetNames(body)])),
    [tPlanetNames],
  );

  const results = useMemo(() => searchCelestialObjects(query, localizedNameByBody), [query, localizedNameByBody]);

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => query.trim().length > 0 && setOpen(true)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAria")}
        className="w-full rounded-md border border-white/10 bg-zinc-800 px-2 py-2 text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500"
      />
      {open && query.trim().length > 0 && (
        <>
          {/* Click-outside-to-close, same pattern as LocationSearchField and
              SiteHeader's own dropdowns. */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-md border border-white/10 bg-zinc-900 text-sm shadow-lg">
            {results.length === 0 && <li className="px-3 py-2 text-zinc-400">{t("searchNoResults")}</li>}
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  className="block w-full px-3 py-2 text-left hover:bg-zinc-800"
                  onClick={() => {
                    onSelect(r);
                    setQuery(r.label);
                    setOpen(false);
                  }}
                >
                  {r.label}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
