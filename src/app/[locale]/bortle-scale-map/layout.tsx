import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Bortle Scale Map – Find Your Bortle Class | LightPollutionMap.io",
    description:
      "See how dark the night sky is anywhere on Earth with our interactive Bortle scale map — built for stargazers, photographers, and dark-sky seekers.",
  },
  zh: {
    title: "波特尔等级地图 – 查询你所在地的波特尔等级 | LightPollutionMap.io",
    description: "用交互式波特尔等级地图查看地球上任意地点的夜空黑暗程度——专为观星爱好者、摄影师和暗夜寻访者打造。",
  },
} as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const copy = locale === "zh" ? PAGE_COPY.zh : PAGE_COPY.en;
  return {
    title: copy.title,
    description: copy.description,
  };
}

export default function BortleScaleMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
