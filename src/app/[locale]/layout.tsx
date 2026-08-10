import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
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
    title: "Light Pollution Map – Bortle Scale & Dark Sky Finder",
    description:
      "Interactive light pollution map with Bortle Scale ratings. Find dark sky spots, check SQM levels, and plan stargazing trips near you.",
  },
  zh: {
    title: "光污染地图 – 波特尔等级与暗夜地点查找",
    description: "交互式光污染地图，提供波特尔等级评分——查找附近暗夜观星地点，查看 SQM 天空亮度，规划观星行程。",
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
  const localizedPath = locale === routing.defaultLocale ? "" : `/${locale}`;
  const canonicalUrl = `${SITE_URL}${localizedPath}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: copy.title,
    description: copy.description,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: SITE_URL,
        zh: `${SITE_URL}/zh`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: canonicalUrl,
      type: "website",
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

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
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
