"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";
import GoldenHourCalculator from "@/components/GoldenHourCalculator";

export default function GoldenHourPage() {
  const t = useTranslations("goldenHour");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <SiteHeader titleAsHeading={false} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-100">
          {t("backToMap")}
        </Link>

        <h1 className="mt-3 text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t("pageSubtitle")}</p>

        <div className="mt-5">
          <GoldenHourCalculator />
        </div>
      </main>
    </div>
  );
}
