"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import LocationSearchField, { type PickedLocation } from "@/components/LocationSearchField";
import ClearSkyMonthChart, { type MonthlyClearNights } from "@/components/ClearSkyMonthChart";

type MonthlyState = { status: "loading" } | { status: "error" } | { status: "done"; monthly: MonthlyClearNights[] };

// Keyed on location by the parent so switching locations remounts this
// component instead of needing a synchronous setState-to-"loading" inside
// the effect (react-hooks/set-state-in-effect) — same key-remount pattern
// LocationDetailPanel uses for its own location-keyed inner content component.
function MonthlyClearSkyResults({ location }: { location: PickedLocation }) {
  const t = useTranslations("clearSkyMap");
  const [monthly, setMonthly] = useState<MonthlyState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    Promise.all(
      Array.from({ length: 12 }, (_, i) => i + 1).map((month) =>
        fetch(`/api/clear-nights?lat=${location.lat}&lng=${location.lng}&month=${month}`, { signal: controller.signal })
          .then((res) => (res.ok ? res.json() : null))
          .then((data: { percentClear: number | null } | null) => ({ month, percentClear: data?.percentClear ?? null })),
      ),
    )
      .then((results) => setMonthly({ status: "done", monthly: results }))
      .catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setMonthly({ status: "error" });
      });

    return () => controller.abort();
  }, [location]);

  return (
    <>
      {monthly.status === "loading" && <div className="mt-6 text-xs text-zinc-400">{t("loadingMonths")}</div>}
      {monthly.status === "done" && (
        <div className="mt-6">
          <ClearSkyMonthChart monthly={monthly.monthly} />
        </div>
      )}
      {/* A failed fetch here isn't worth a scary error block — same "stays
          quiet on failure" treatment the rest of the app uses for optional
          sections; the chart just won't render. */}
    </>
  );
}

export default function ClearSkyMapPage() {
  const t = useTranslations("clearSkyMap");
  const [location, setLocation] = useState<PickedLocation | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <SiteHeader titleAsHeading={false} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-100">
          {t("backToMap")}
        </Link>

        <h1 className="mt-3 text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t("pageSubtitle")}</p>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <LocationSearchField onSelect={setLocation} />
        </div>

        {location && (
          <div className="mt-2 text-xs text-zinc-400">
            {location.placeName || `${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}`}
          </div>
        )}

        {location && <MonthlyClearSkyResults key={`${location.lat},${location.lng}`} location={location} />}

        <div className="mt-6 text-xs leading-relaxed text-zinc-500">{t("chartCaption")}</div>

        <div className="mt-8 border-t border-white/10 pt-4">
          <h2 className="text-sm font-medium">{t("definitionTitle")}</h2>
          <p className="mt-1 text-xs leading-relaxed text-zinc-400">{t("definitionBody")}</p>
        </div>
      </main>
    </div>
  );
}
