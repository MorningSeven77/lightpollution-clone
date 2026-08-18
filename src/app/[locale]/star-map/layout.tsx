import type { Metadata } from "next";

const PAGE_COPY = {
  en: {
    title: "Star Map — Real-Time Night Sky Viewer | Light Pollution Map",
    description:
      "A real-time 3D star map: drag to look around the sky, see the Sun, Moon and planets in their true positions, and the 88 constellations, for any date, time and location.",
  },
  zh: {
    title: "星空图 — 实时夜空查看器 | 光污染地图",
    description: "实时 3D 星空图：拖拽转向查看星空，展示任意日期、时间、地点下太阳/月亮/行星的真实位置和 88 个星座连线。",
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

export default function StarMapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
