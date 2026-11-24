import type { GuideLink } from "@/content/guides/types";

export function withLinks(locale: "en" | "zh", extra: GuideLink[] = []): GuideLink[] {
  const common: GuideLink[] =
    locale === "zh"
      ? [
          { href: "/", label: "世界光污染地图" },
          { href: "/us-light-pollution-map", label: "美国光污染地图" },
          { href: "/dark-sky-parks", label: "暗空公园名录" },
          { href: "/bortle-scale-map", label: "波特尔等级地图" },
          { href: "/best-places-to-stargaze", label: "最佳观星地点" },
          { href: "/what-is-light-pollution", label: "什么是光污染" },
          { href: "/where-to-see-the-milky-way", label: "哪里能看到银河" },
          { href: "/night-sky-without-light-pollution", label: "没有光污染的夜空" },
          { href: "/clear-sky-map", label: "晴夜气候地图" },
          { href: "/star-map", label: "实时星空图" },
        ]
      : [
          { href: "/", label: "World light pollution map" },
          { href: "/us-light-pollution-map", label: "US light pollution map" },
          { href: "/dark-sky-parks", label: "Dark sky parks" },
          { href: "/bortle-scale-map", label: "Bortle scale map" },
          { href: "/best-places-to-stargaze", label: "Best places to stargaze" },
          { href: "/what-is-light-pollution", label: "What is light pollution" },
          { href: "/where-to-see-the-milky-way", label: "Where to see the Milky Way" },
          { href: "/night-sky-without-light-pollution", label: "Night sky without light pollution" },
          { href: "/clear-sky-map", label: "Clear-night climate" },
          { href: "/star-map", label: "Live star map" },
        ];
  const seen = new Set<string>();
  return [...extra, ...common].filter((link) => {
    if (seen.has(link.href)) return false;
    seen.add(link.href);
    return true;
  });
}
