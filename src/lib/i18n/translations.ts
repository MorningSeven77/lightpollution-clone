import { MoonPhaseId } from "@/lib/moonPhase";
import { StargazingTier, ConstraintFactor } from "@/lib/stargazing";
import { DarkSkyPlaceCategory } from "@/lib/darkSkyPlaces";
import { ColorStyleId } from "@/lib/colorStyles";
import { BasemapId } from "@/lib/basemapStyles";
import { WeatherOverlayId } from "@/lib/weatherOverlay";

export type Translations = {
  siteHeader: {
    title: string;
    subtitle: string;
    languageSwitcherAria: string;
  };
  infoPanel: {
    openAria: string;
    closeAria: string;
    title: string;
    intro: string;
    qa: Array<{ question: string; answer: string }>;
  };
  searchBar: {
    placeholder: string;
    searching: string;
    noResults: string;
  };
  legend: {
    title: (styleLabel: string) => string;
    hint: string;
  };
  moonPhase: {
    openAria: string;
    closeAria: string;
    title: string;
    ageDays: (n: string) => string;
    illumination: (n: string) => string;
    nextPhases: string;
    phaseLabels: Record<MoonPhaseId, string>;
  };
  locationHistory: {
    openAria: string;
    closeAria: string;
    title: string;
    clear: string;
    empty: string;
    addToCompareAria: string;
    compareTitle: string;
    darkestBadge: string;
    ratioNote: string;
    relativeTime: {
      justNow: string;
      minutesAgo: (n: number) => string;
      hoursAgo: (n: number) => string;
      daysAgo: (n: number) => string;
    };
  };
  mapControls: {
    openAria: string;
    closeAria: string;
    title: string;
    basemapLabel: string;
    lightPollutionLayerLabel: string;
    weatherOverlayLabel: string;
    darkSkyPlacesLabel: string;
    auroraLabel: string;
    terminatorLabel: string;
    colorStyleLabel: string;
    opacityLabel: string;
  };
  locationDetail: {
    title: string;
    closeAria: string;
    loadingPlaceName: string;
    unknownPlace: string;
    loading: string;
    errorText: string;
    retry: string;
    bortleUnitLabel: (desc: string) => string;
    sqmLabel: (n: string) => string;
    starEstimate: (min: number, max: number) => string;
    trendLoading: string;
    weatherLoading: string;
  };
  darkSkyPlace: {
    title: string;
    closeAria: string;
    yearLabel: (year: number) => string;
    areaLabel: (area: string) => string;
    linkText: string;
  };
  trendChart: {
    title: (startYear: number, endYear: number) => string;
    ariaLabel: string;
    tooltip: (year: number, sqm: string, bortleClass: number) => string;
  };
  weatherSection: {
    title: string;
    bestNightLabel: string;
    scoreUnit: string;
    cloudLabel: (n: number) => string;
    moonLabel: (n: number) => string;
    bestBadge: (score: number) => string;
    scoreWithTier: (score: number, tierLabel: string) => string;
    visibilityKm: (n: number) => string;
    footer: string;
    yesterday: string;
    today: string;
    weekdays: string[];
    constraint: (factor: ConstraintFactor) => string;
    tiers: Record<StargazingTier, string>;
  };
  exposureCalculator: {
    title: string;
    cameraTypeLabel: string;
    focalRatioLabel: string;
    recommendedLabel: string;
    cappedNote: (maxSeconds: number) => string;
    footnote: (sqm: string, pct: number) => string;
    cameraPresets: Record<string, string>;
  };
  dataLabels: {
    bortleDescriptions: Record<number, string>;
    weatherCodes: Record<number, string>;
    unknownWeather: string;
    darkSkyCategories: Record<DarkSkyPlaceCategory, string>;
    colorStyles: Record<ColorStyleId, { label: string; description: string }>;
    basemaps: Record<BasemapId, string>;
    weatherOverlays: Record<WeatherOverlayId, string>;
  };
};

const zh: Translations = {
  siteHeader: {
    title: "光污染地图",
    subtitle: "一份光污染地图与暗夜地点查找工具——点击地图任意位置，即可查看当地波特尔等级评分与附近推荐的观星地点。",
    languageSwitcherAria: "切换语言",
  },
  infoPanel: {
    openAria: "打开光污染地图常见问题",
    closeAria: "关闭常见问题",
    title: "光污染地图常见问题",
    intro: "一份光污染地图与暗夜地点查找工具——点击地图任意位置，即可查看当地波特尔等级评分与附近推荐的观星地点。",
    qa: [
      {
        question: "这是一份怎样的光污染地图？它是怎么工作的？",
        answer:
          "这份光污染地图（也叫暗夜地图或光害地图）基于卫星夜间灯光数据，展示地球上任意位置的人造天光污染程度。作为一张可交互的光污染地图，你可以点击世界地图上任意一点，立即查看该精确位置的详细亮度读数——从灯火通明的城市中心，到最暗的乡村夜空，一目了然。",
      },
      {
        question: "什么是波特尔等级（Bortle Scale）？天空亮度（SQM）又是怎么测量的？",
        answer:
          "波特尔等级（也叫波特尔分级、波特尔星空等级）是一套 9 级的暗夜分级标准，从波特尔 1 级（最暗的天空，银河清晰可见）到波特尔 9 级（市中心夜空，只能看到最亮的几颗星）。它的基础是 SQM（天空质量计）读数——一种以每平方角秒星等为单位的更精确的天空亮度测量方式。点击地图上任意一点，无需实体测光仪，就能立刻查到你所在地区属于波特尔几级。",
      },
      {
        question: "怎么找到附近光污染最低、接近零光污染的暗夜地点？",
        answer:
          "把这份地图当作暗夜地点查找工具，用来定位你附近光污染最低的区域——地图上颜色最暗的区域，标记的就是认证暗空公园、暗空社区等各类无光污染或低光污染地点。真正的零光污染其实很罕见，但远离大城市的波特尔 1-2 级区域已经非常接近，是观星、看星空最理想的目的地。",
      },
      {
        question: "没有光污染的夜空是什么样子？光污染又是怎么被测量、造成、以及该如何减少的？",
        answer:
          "在真正不受光污染影响的夜空下，成千上万颗星星、银河，甚至暗弱的星云都清晰可见——你可以在地图上把自己所在地区的光污染水平和波特尔 1 级地点做对比，直观感受差异。光污染的测量方式，是用 SQM 天空质量计实测，或者像本地图这样通过卫星数据估算；城市天光甚至能传播 100 公里以上，所以选观测地点时「光污染能传多远」是个很关键的问题。常见的光污染来源包括路灯、广告招牌、没有遮罩的照明灯具，这些加在一起就是让整座城市夜空变亮的光污染源；而在实践层面，加装遮光灯罩、改用更暖色温的照明，是社区长期降低光污染最主要的两个办法。",
      },
      {
        question: "怎么用这张地图规划观星、看银河或天文摄影？",
        answer:
          "把地图当作观星地图来规划行程：波特尔 4 级或更暗的区域（最好选新月前后），银河能见度就比较理想，能帮你判断什么时候、去哪里能看清银河。做天文摄影时，天空越亮，单帧曝光时间就得越短——拍摄夜空照片前，先在地图上查一下当地的光污染读数，能帮你更快确定合适的起始曝光时间。",
      },
      {
        question: "这张地图能查流星雨或极光的能见度吗？",
        answer:
          "可以——把这张暗夜地图和流星雨预测结合起来看，既能找到足够暗的观测地点，也能确认流星雨辐射点的方向。至于极光，打开极光概率图层就能看到你所在纬度当前的极光能见度概率，再对照地图确认当地有没有明显的光污染干扰。",
      },
      {
        question: "有没有针对具体城市或地区的光污染地图？",
        answer:
          "有——直接在地图的位置搜索框里输入州名或城市名（比如美国的德克萨斯州、加州，或者纽约、拉斯维加斯这类光污染严重的大城市），地图就会飞到对应位置并显示当地的波特尔等级和 SQM 读数；专门的分地区浏览列表页正在计划中，之后会加入地图的入口里。",
      },
    ],
  },
  searchBar: {
    placeholder: "搜索地点…",
    searching: "搜索中…",
    noResults: "没有找到结果",
  },
  legend: {
    title: (styleLabel) => `光污染强度（VIIRS 卫星数据 · ${styleLabel}）`,
    hint: "点击地图查看该点的 Bortle 等级与近似 SQM 值",
  },
  moonPhase: {
    openAria: "打开月相面板",
    closeAria: "关闭月相面板",
    title: "月相",
    ageDays: (n) => `月龄 ${n} 天`,
    illumination: (n) => `照亮度：${n}%`,
    nextPhases: "近期关键相位",
    phaseLabels: {
      "new-moon": "新月",
      "waxing-crescent": "娥眉月（渐盈）",
      "first-quarter": "上弦月",
      "waxing-gibbous": "盈凸月",
      "full-moon": "满月",
      "waning-gibbous": "亏凸月",
      "last-quarter": "下弦月",
      "waning-crescent": "残月（渐亏）",
    },
  },
  locationHistory: {
    openAria: "打开位置历史面板",
    closeAria: "关闭位置历史面板",
    title: "位置历史",
    clear: "清空",
    empty: "还没有查询记录，点击地图上的位置看看吧",
    addToCompareAria: "加入对比",
    compareTitle: "位置对比（按暗到亮排序）",
    darkestBadge: "最暗",
    ratioNote: "天光背景倍数是物理亮度比例，不是曝光时间或信噪比预测。",
    relativeTime: {
      justNow: "刚刚",
      minutesAgo: (n) => `${n} 分钟前`,
      hoursAgo: (n) => `${n} 小时前`,
      daysAgo: (n) => `${n} 天前`,
    },
  },
  mapControls: {
    openAria: "打开地图控制",
    closeAria: "关闭地图控制",
    title: "地图控制",
    basemapLabel: "底图",
    lightPollutionLayerLabel: "光污染图层（VIIRS 2024）",
    weatherOverlayLabel: "天气叠加",
    darkSkyPlacesLabel: "认证暗空地点",
    auroraLabel: "极光概率（NOAA 预测）",
    terminatorLabel: "昼夜分界线",
    colorStyleLabel: "配色风格",
    opacityLabel: "透明度",
  },
  locationDetail: {
    title: "位置详情",
    closeAria: "关闭位置详情",
    loadingPlaceName: "查询中…",
    unknownPlace: "未知地点",
    loading: "查询中…",
    errorText: "查询失败，请重试",
    retry: "重试",
    bortleUnitLabel: (desc) => `Bortle 等级 · ${desc}（近似值）`,
    sqmLabel: (n) => `SQM ≈ ${n} mag/arcsec²`,
    starEstimate: (min, max) => `预计肉眼可见恒星数：约 ${min}-${max} 颗（粗略估算）`,
    trendLoading: "趋势图查询中…",
    weatherLoading: "天气查询中…",
  },
  darkSkyPlace: {
    title: "认证暗空地点",
    closeAria: "关闭暗空地点详情",
    yearLabel: (year) => `认证年份：${year}`,
    areaLabel: (area) => `保护面积：${area}`,
    linkText: "在 DarkSky 官网查看 ↗",
  },
  trendChart: {
    title: (startYear, endYear) => `光害趋势（${startYear}-${endYear}，SQM 越高越暗）`,
    ariaLabel: "历年 SQM 趋势柱状图",
    tooltip: (year, sqm, bortleClass) => `${year} 年：SQM ≈ ${sqm}，Bortle ${bortleClass}`,
  },
  weatherSection: {
    title: "夜间天气",
    bestNightLabel: "最佳观测夜",
    scoreUnit: "分",
    cloudLabel: (n) => `云量 ${n}%`,
    moonLabel: (n) => `月光 ${n}%`,
    bestBadge: (score) => `最佳 ${score}`,
    scoreWithTier: (score, tierLabel) => `${score} ${tierLabel}`,
    visibilityKm: (n) => `👁 ${n}km`,
    footer: "天气数据来自 Open-Meteo",
    yesterday: "昨天",
    today: "今天",
    weekdays: ["周日", "周一", "周二", "周三", "周四", "周五", "周六"],
    constraint: (factor) => {
      const names: Record<Exclude<ConstraintFactor, "none">, string> = {
        cloud: "云量较高",
        moon: "月光较亮",
        "light-pollution": "光污染较重",
      };
      return factor === "none" ? "各项条件都不错" : `主要受限于：${names[factor]}`;
    },
    tiers: {
      poor: "较差",
      marginal: "一般",
      fair: "良好",
      good: "极佳",
    },
  },
  exposureCalculator: {
    title: "曝光计算器（简化估算）",
    cameraTypeLabel: "相机类型",
    focalRatioLabel: "焦比 f/",
    recommendedLabel: "建议单帧曝光时长",
    cappedNote: (maxSeconds) =>
      `已按最长单帧 ${maxSeconds}s 封顶——暗天空下噪声预算本可以更长，但受跟踪精度、卫星拖尾等实际因素限制`,
    footnote: (sqm, pct) =>
      `基于 SQM ${sqm} 估算天空背景信号强度，目标读出噪声占比 ${pct}%——简化估算，仅供参考，不是精确曝光建议。`,
    cameraPresets: {
      "cooled-cmos": "制冷 CMOS",
      "uncooled-cmos": "非制冷 CMOS",
      dslr: "单反/微单",
    },
  },
  dataLabels: {
    bortleDescriptions: {
      1: "极暗夜空",
      2: "典型暗夜空",
      3: "乡村夜空",
      4: "乡村/郊区过渡",
      5: "郊区夜空",
      6: "较亮郊区夜空",
      7: "郊区/城市过渡",
      8: "城市夜空",
      9: "市中心夜空",
    },
    weatherCodes: {
      0: "晴朗",
      1: "大部晴朗",
      2: "局部多云",
      3: "阴天",
      45: "有雾",
      48: "有雾",
      51: "毛毛雨",
      53: "毛毛雨",
      55: "毛毛雨",
      56: "冻雨",
      57: "冻雨",
      61: "降雨",
      63: "降雨",
      65: "强降雨",
      66: "冻雨",
      67: "冻雨",
      71: "降雪",
      73: "降雪",
      75: "强降雪",
      77: "米雪",
      80: "阵雨",
      81: "阵雨",
      82: "强阵雨",
      85: "阵雪",
      86: "强阵雪",
      95: "雷暴",
      96: "雷暴伴冰雹",
      99: "雷暴伴冰雹",
    },
    unknownWeather: "未知天气",
    darkSkyCategories: {
      park: "暗空公园",
      community: "暗空社区",
      sanctuary: "暗空保护区",
      reserve: "暗空保留地",
      urban: "城市暗空地点",
    },
    colorStyles: {
      classic: { label: "经典", description: "清晰分区" },
      soft: { label: "高亮", description: "平滑强度" },
      vivid: { label: "辉光", description: "天光扩散" },
      amber: { label: "科研", description: "固定 SQM 标尺" },
    },
    basemaps: {
      street: "街道",
      dark: "暗色",
      satellite: "卫星图",
    },
    weatherOverlays: {
      none: "无/隐藏",
      clouds: "云层",
      rain: "降水",
    },
  },
};

const en: Translations = {
  siteHeader: {
    title: "Light Pollution Map",
    subtitle: "A light pollution map and dark sky finder — click anywhere to see the Bortle Scale rating and best nearby stargazing spots.",
    languageSwitcherAria: "Switch language",
  },
  infoPanel: {
    openAria: "Open Light Pollution Map FAQ",
    closeAria: "Close FAQ",
    title: "Light Pollution Map FAQ",
    intro: "A light pollution map and dark sky finder — click anywhere to see the Bortle Scale rating and best nearby stargazing spots.",
    qa: [
      {
        question: "What is this light pollution map and how does it work?",
        answer:
          "This light pollution map (also called a dark sky map or light map) uses satellite-derived night-light data to show artificial skyglow anywhere on Earth. It works as an interactive light pollution map — click any point on the world light pollution map to see a detailed brightness reading for that exact location, from heavily lit cities down to the darkest rural skies.",
      },
      {
        question: "What is the Bortle Scale, and how is sky brightness (SQM) measured?",
        answer:
          "The Bortle Scale (also called bortle class or bortle rating) is a 9-level scale from Bortle 1 (the darkest possible sky, Milky Way clearly visible) to Bortle 9 (inner-city skies where only the brightest stars show). It's built on top of SQM (Sky Quality Meter) readings — a more precise sky quality measurement in magnitudes per square arcsecond. Click anywhere on the map to instantly check what bortle am i in, without needing a physical darkness scale meter.",
      },
      {
        question: "How do I find dark skies or zero-light-pollution places near me?",
        answer:
          "Use the map as a dark sky finder or dark site finder to locate the lowest light pollution near me — look for the darkest shading on the map, which marks certified dark sky places, dark sky parks, and other places with no light pollution. True zero light pollution is rare, but Bortle 1–2 areas away from major cities come very close, making them the best spots for genuinely dark, unpolluted skies.",
      },
      {
        question: "What does the sky look like without light pollution, and how is light pollution measured, caused, and reduced?",
        answer:
          "Under a truly dark night sky without light pollution, thousands of stars, the Milky Way, and faint nebulae become visible — compare your area's light pollution levels on the map against a Bortle 1 site to see the difference. Light pollution is measured with an SQM or estimated from satellite data (this map's method for how to measure light pollution), and skyglow can travel over 100 km from a city, so how far does light pollution travel matters when picking a site. Common examples of light pollution include streetlights, signage, and unshielded fixtures — together they cause light contamination that raises sky brightness citywide. On a practical level, shielded fixtures and warmer lighting are the main way communities reduce light pollution over time.",
      },
      {
        question: "How can I use this map for stargazing, Milky Way viewing, and astrophotography?",
        answer:
          "Use the map as a stargazing map to plan trips: a milky way visibility map reading of Bortle 4 or darker (ideally during a new moon) tells you how to view the milky way clearly. For astrophotography, brighter skies push you toward shorter sub-exposures — check the map's light pollution reading before taking night sky photos to pick a starting exposure time.",
      },
      {
        question: "Can I check meteor shower or aurora visibility on this map?",
        answer:
          "Yes — combine the darkness map with a meteor shower forecast to find both a dark viewing spot and the shower's radiant direction. For the northern lights, enable the aurora probability layer to see current visibility odds for your latitude, then cross-reference with the map to avoid local skyglow.",
      },
      {
        question: "Do you have light pollution maps for specific US states or cities?",
        answer:
          "Yes — search directly for any location in the map's search bar, from broad regions like light pollution map texas or light pollution map california down to specific cities such as light pollution in nyc or las vegas light pollution, and the map will fly straight to that spot with its Bortle and SQM readings. A dedicated regional browse page is planned for the future.",
      },
    ],
  },
  searchBar: {
    placeholder: "Search location…",
    searching: "Searching…",
    noResults: "No results found",
  },
  legend: {
    title: (styleLabel) => `Light Pollution Intensity (VIIRS satellite data · ${styleLabel})`,
    hint: "Click the map to see the Bortle class and approximate SQM value for that point",
  },
  moonPhase: {
    openAria: "Open moon phase panel",
    closeAria: "Close moon phase panel",
    title: "Moon Phase",
    ageDays: (n) => `Age ${n} days`,
    illumination: (n) => `Illumination: ${n}%`,
    nextPhases: "Upcoming key phases",
    phaseLabels: {
      "new-moon": "New Moon",
      "waxing-crescent": "Waxing Crescent",
      "first-quarter": "First Quarter",
      "waxing-gibbous": "Waxing Gibbous",
      "full-moon": "Full Moon",
      "waning-gibbous": "Waning Gibbous",
      "last-quarter": "Last Quarter",
      "waning-crescent": "Waning Crescent",
    },
  },
  locationHistory: {
    openAria: "Open location history panel",
    closeAria: "Close location history panel",
    title: "Location History",
    clear: "Clear",
    empty: "No history yet — click a point on the map to get started",
    addToCompareAria: "Add to comparison",
    compareTitle: "Comparison (darkest to brightest)",
    darkestBadge: "Darkest",
    ratioNote: "The sky-background ratio is a physical brightness comparison, not an exposure-time or signal-to-noise prediction.",
    relativeTime: {
      justNow: "Just now",
      minutesAgo: (n) => `${n}m ago`,
      hoursAgo: (n) => `${n}h ago`,
      daysAgo: (n) => `${n}d ago`,
    },
  },
  mapControls: {
    openAria: "Open map controls",
    closeAria: "Close map controls",
    title: "Map Controls",
    basemapLabel: "Basemap",
    lightPollutionLayerLabel: "Light pollution layer (VIIRS 2024)",
    weatherOverlayLabel: "Weather overlay",
    darkSkyPlacesLabel: "Certified Dark Sky Places",
    auroraLabel: "Aurora probability (NOAA forecast)",
    terminatorLabel: "Day/night terminator",
    colorStyleLabel: "Color style",
    opacityLabel: "Opacity",
  },
  locationDetail: {
    title: "Location Details",
    closeAria: "Close location details",
    loadingPlaceName: "Looking up…",
    unknownPlace: "Unknown location",
    loading: "Loading…",
    errorText: "Failed to load — please retry",
    retry: "Retry",
    bortleUnitLabel: (desc) => `Bortle class · ${desc} (approximate)`,
    sqmLabel: (n) => `SQM ≈ ${n} mag/arcsec²`,
    starEstimate: (min, max) => `Estimated naked-eye visible stars: ~${min}-${max} (rough estimate)`,
    trendLoading: "Loading trend chart…",
    weatherLoading: "Loading weather…",
  },
  darkSkyPlace: {
    title: "Certified Dark Sky Place",
    closeAria: "Close dark sky place details",
    yearLabel: (year) => `Designated: ${year}`,
    areaLabel: (area) => `Land area: ${area}`,
    linkText: "View on DarkSky.org ↗",
  },
  trendChart: {
    title: (startYear, endYear) => `Light pollution trend (${startYear}-${endYear}, higher SQM = darker)`,
    ariaLabel: "Yearly SQM trend bar chart",
    tooltip: (year, sqm, bortleClass) => `${year}: SQM ≈ ${sqm}, Bortle ${bortleClass}`,
  },
  weatherSection: {
    title: "Nighttime Weather",
    bestNightLabel: "Best observing night",
    scoreUnit: "pts",
    cloudLabel: (n) => `Cloud ${n}%`,
    moonLabel: (n) => `Moon ${n}%`,
    bestBadge: (score) => `Best ${score}`,
    scoreWithTier: (score, tierLabel) => `${score} ${tierLabel}`,
    visibilityKm: (n) => `👁 ${n}km`,
    footer: "Weather data from Open-Meteo",
    yesterday: "Yesterday",
    today: "Today",
    weekdays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    constraint: (factor) => {
      const names: Record<Exclude<ConstraintFactor, "none">, string> = {
        cloud: "cloud cover",
        moon: "moonlight",
        "light-pollution": "light pollution",
      };
      return factor === "none" ? "Conditions look good" : `Main limiting factor: ${names[factor]}`;
    },
    tiers: {
      poor: "Poor",
      marginal: "Marginal",
      fair: "Fair",
      good: "Good",
    },
  },
  exposureCalculator: {
    title: "Exposure Calculator (simplified estimate)",
    cameraTypeLabel: "Camera type",
    focalRatioLabel: "Focal ratio f/",
    recommendedLabel: "Recommended sub-exposure",
    cappedNote: (maxSeconds) =>
      `Capped at the ${maxSeconds}s maximum sub-exposure — dark-sky noise budgets could allow longer, but tracking precision, satellite trails, etc. make that impractical`,
    footnote: (sqm, pct) =>
      `Estimated sky-background signal from SQM ${sqm}, targeting ${pct}% read-noise contribution — a simplified estimate for reference only, not precise exposure guidance.`,
    cameraPresets: {
      "cooled-cmos": "Cooled CMOS",
      "uncooled-cmos": "Uncooled CMOS",
      dslr: "DSLR/Mirrorless",
    },
  },
  dataLabels: {
    bortleDescriptions: {
      1: "Excellent dark sky",
      2: "Typical dark sky",
      3: "Rural sky",
      4: "Rural/suburban transition",
      5: "Suburban sky",
      6: "Bright suburban sky",
      7: "Suburban/urban transition",
      8: "City sky",
      9: "Inner-city sky",
    },
    weatherCodes: {
      0: "Clear",
      1: "Mostly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Fog",
      48: "Fog",
      51: "Drizzle",
      53: "Drizzle",
      55: "Drizzle",
      56: "Freezing rain",
      57: "Freezing rain",
      61: "Rain",
      63: "Rain",
      65: "Heavy rain",
      66: "Freezing rain",
      67: "Freezing rain",
      71: "Snow",
      73: "Snow",
      75: "Heavy snow",
      77: "Snow grains",
      80: "Showers",
      81: "Showers",
      82: "Heavy showers",
      85: "Snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with hail",
      99: "Thunderstorm with hail",
    },
    unknownWeather: "Unknown weather",
    darkSkyCategories: {
      park: "Dark Sky Park",
      community: "Dark Sky Community",
      sanctuary: "Dark Sky Sanctuary",
      reserve: "Dark Sky Reserve",
      urban: "Urban Night Sky Place",
    },
    colorStyles: {
      classic: { label: "Classic", description: "Clear zones" },
      soft: { label: "Bright", description: "Smooth intensity" },
      vivid: { label: "Glow", description: "Sky glow spread" },
      amber: { label: "Scientific", description: "Fixed SQM scale" },
    },
    basemaps: {
      street: "Streets",
      dark: "Dark",
      satellite: "Satellite",
    },
    weatherOverlays: {
      none: "None",
      clouds: "Clouds",
      rain: "Precipitation",
    },
  },
};

export const translations: Record<"zh" | "en", Translations> = { zh, en };
