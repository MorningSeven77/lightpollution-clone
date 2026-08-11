import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "About & Data | Light Pollution Map",
    description:
      "How this light pollution map is built, what SQM and Bortle class mean here, and where the satellite and weather data comes from.",
  },
  zh: {
    title: "关于本站与数据来源 | 光污染地图",
    description: "光污染地图是怎么做出来的、SQM 和波特尔等级在本站代表什么、卫星与天气数据都来自哪里。",
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

export default function AboutDataLayout({ children }: { children: React.ReactNode }) {
  return children;
}
