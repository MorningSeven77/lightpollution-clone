import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Golden Hour Calculator & Light Direction | Light Pollution Map",
    description:
      "Find today's sunrise, sunset, golden hour, and blue hour times for any location, with the sun's azimuth at each — for photography and stargazing planning.",
  },
  zh: {
    title: "日出日落黄金时刻计算器 | 光污染地图",
    description: "查询任意地点今天的日出、日落、黄金时刻和蓝调时刻时间，附带太阳方位角——方便安排摄影和观星行程。",
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

export default function GoldenHourLayout({ children }: { children: React.ReactNode }) {
  return children;
}
