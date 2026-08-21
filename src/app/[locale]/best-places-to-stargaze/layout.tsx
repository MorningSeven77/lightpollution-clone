import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Best Places to Stargaze – Find Stargazing Spots Near You",
    description:
      "Find the best places to stargaze near you, ranked by night-sky darkness — locate dark, clear spots to see the Milky Way and stars in full view.",
  },
  zh: {
    title: "最佳观星地点 – 查找附近的观星点",
    description: "在地图上直接找到附近最佳观星地点——按夜空黑暗程度排名，定位适合看银河和满天繁星的黑暗晴朗地点。",
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
