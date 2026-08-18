import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Best Places to Stargaze – Interactive Dark Sky Finder Map",
    description:
      "Find the best places to stargaze near you on a full-screen map — algorithmically ranked dark-sky spots from live light pollution data, plus certified Dark Sky Places worldwide.",
  },
  zh: {
    title: "最佳观星地点 – 交互式暗夜地图",
    description: "全屏地图直接找到附近最佳观星地点——基于实时光污染数据算法推荐的暗夜观星点，叠加全球官方认证的暗夜地点。",
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

export default function BestPlacesToStargazeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
