"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import SiteHeader from "@/components/SiteHeader";

const FEEDBACK_EMAIL = "morning.seven.77.77.77@gmail.com";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
      <h3 className="mb-1 text-sm font-medium text-zinc-200">{title}</h3>
      <p className="text-xs leading-relaxed text-zinc-400">{children}</p>
    </div>
  );
}

export default function AboutDataPage() {
  const t = useTranslations("aboutData");

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100">
      <SiteHeader titleAsHeading={false} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        <Link href="/" className="text-xs text-zinc-400 hover:text-zinc-100">
          {t("backToMap")}
        </Link>

        <p className="mt-4 text-xs font-medium tracking-wide text-blue-400">{t("eyebrow")}</p>
        <h1 className="mt-2 text-2xl font-semibold">{t("pageTitle")}</h1>
        <p className="mt-1 text-sm text-zinc-400">{t("pageSubtitle")}</p>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">{t("dataStatusTitle")}</h2>
          <div className="rounded-lg border border-white/10 bg-zinc-900/50 p-4">
            <p className="text-[10px] font-medium tracking-wide text-emerald-400">{t("dataStatusBadge")}</p>
            <p className="mt-1 text-2xl font-semibold">2024</p>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">{t("dataStatusBody")}</p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">{t("producedTitle")}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Card title={t("producedStep1Title")}>{t("producedStep1Body")}</Card>
            <Card title={t("producedStep2Title")}>{t("producedStep2Body")}</Card>
            <Card title={t("producedStep3Title")}>{t("producedStep3Body")}</Card>
          </div>
        </section>

        <section className="mt-8">
          <Card title={t("limitsTitle")}>{t("limitsBody")}</Card>
        </section>

        <section className="mt-8">
          <Card title={t("otherFeaturesTitle")}>{t("otherFeaturesBody")}</Card>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium text-zinc-300">{t("sourcesTitle")}</h2>
          <ul className="space-y-2 text-xs leading-relaxed text-zinc-400">
            <li>• {t("sourceViirs")}</li>
            <li>• {t("sourceBortle")}</li>
            <li>• {t("sourceOpenMeteo")}</li>
            <li>• {t("sourceNoaaSwpc")}</li>
            <li>• {t("sourceHyg")}</li>
            <li>• {t("sourceD3Celestial")}</li>
            <li>• {t("sourceAstronomyEngine")}</li>
          </ul>
        </section>

        <section className="mt-8 rounded-lg border border-white/10 bg-zinc-900/50 p-4">
          <h2 className="mb-1 text-sm font-medium text-zinc-200">{t("contactTitle")}</h2>
          <p className="text-xs leading-relaxed text-zinc-400">{t("contactBody")}</p>
          <a href={`mailto:${FEEDBACK_EMAIL}`} className="mt-2 inline-block text-xs text-blue-400 hover:text-blue-300">
            {t("contactEmailLabel")}: {FEEDBACK_EMAIL}
          </a>
        </section>
      </main>
    </div>
  );
}
