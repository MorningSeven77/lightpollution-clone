import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { JsonLd } from "@/components/JsonLd";
import { siteGraph } from "@/lib/structuredData";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://www.lightpollutionmap.io";

const SITE_COPY = {
  en: {
    title: "Light Pollution Map – World Night Lights, Bortle and SQM",
    description:
      "World light pollution map of artificial night lights. Click any place for an approximate Bortle class and SQM-style value from VIIRS. The United States has a separate map.",
  },
  zh: {
    title: "光污染地图 – 世界夜间灯光、波特尔等级与 SQM",
    description: "世界光污染地图，展示人工夜间灯光。点击任意地点，查看由 VIIRS 换算的近似波特尔等级和 SQM 风格数值。美国有单独的地图。",
  },
} as const;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? SITE_COPY.zh : SITE_COPY.en;
  // "as-needed" localePrefix: the default locale (en) lives at the bare
  // path, every other locale gets a /<locale> prefix.
  return {
    metadataBase: new URL(SITE_URL),
    title: copy.title,
    description: copy.description,
    // Canonical and og:url are set per page. Setting them here made every
    // inner page inherit the homepage address.
    // Preview deployments should not be indexed. Production builds leave
    // robots unset so they stay indexable.
    ...(process.env.VERCEL_ENV === "preview" ? { robots: { index: false, follow: false } } : {}),
    // Not using the app/icon.svg file convention here on purpose — this
    // layout lives under the [locale] dynamic segment, and that convention
    // generates a per-segment icon route that needs its own
    // generateStaticParams; pointing straight at the existing public/
    // asset avoids that entirely and works identically across locales.
    icons: {
      icon: "/logo.svg",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Enables static rendering for this locale — see next-intl's docs on
  // setRequestLocale for why this matters even though most of our own
  // translation consumption happens in Client Components.
  setRequestLocale(locale);

  const tHeader = await getTranslations({ locale, namespace: "siteHeader" });

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Site-wide structured data (WebSite + Organization). Page-specific
            nodes (WebApplication, FAQPage, BreadcrumbList, …) are rendered
            from the individual page/layout components. */}
        <JsonLd
          data={siteGraph({
            locale,
            name: tHeader("title"),
            description: tHeader("subtitle"),
          })}
        />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
        {/* Privacy-friendly analytics by Plausible */}
        <Script src="https://plausible.lumenfeng.com/js/pa-fLteL5i6UPhNafhIpnWqJ.js" strategy="afterInteractive" />
        <Script id="plausible-init" strategy="afterInteractive">
          {`window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
plausible.init()`}
        </Script>
      </body>
    </html>
  );
}
