import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Dark Sky Map – Check the Dark Sky Scale by Location",
    description:
      "An interactive dark sky map showing night sky darkness worldwide, rated on the dark sky scale used to compare stargazing conditions by location.",
  },
  zh: {
    title: "暗夜地图 – 按地点查询暗夜等级",
    description: "交互式暗夜地图，展示全球任意地点的夜空黑暗程度，评级标准与用于比较各地观星条件的暗夜等级一致。",
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

export default function DarkSkyMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
