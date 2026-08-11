import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Clear Sky Map & Climate | Light Pollution Map",
    description:
      "Historical share of clear nights by month for any location, based on 5 years of weather archive data — plan the best season to visit, not just the best night.",
  },
  zh: {
    title: "晴夜气候地图 | 光污染地图",
    description: "查询任意地点每个月历史晴夜比例，基于 5 年天气历史归档数据——不只是找最佳的一晚，而是找最佳的季节。",
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

export default function ClearSkyMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
