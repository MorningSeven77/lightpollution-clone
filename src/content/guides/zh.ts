import type { GuideCopy } from "@/content/guides/types";
import { withLinks } from "@/content/guides/linkSets";

const zh = "zh" as const;

export const zhGuides: Record<string, GuideCopy> = {
  us: {
    metaTitle: "美国光污染地图 – 美国夜间灯光与暗夜",
    metaDescription:
      "打开对准美国的光污染地图。城市走廊和乡村看到的是不同的天空。州页面包括得克萨斯、加利福尼亚、科罗拉多和其他九个州。",
    h1: "美国光污染地图",
    eyebrow: "美国",
    lede: [
      "这是美国光污染地图：和世界夜间灯光图层是同一套数据，只是打开时对准美国。搜美国暗夜地图、美国夜间地图，也应该落在这一页。首页仍然是世界光污染地图。",
      "颜色越暗，表示 NOAA VIIRS 年度合成里向上的灯光越弱。点击会给出近似的波特尔等级和 SQM 风格数值。这两个数都不是有人拿着仪器在当地测的，也不是今晚的天气预报。",
    ],
    sections: [
      {
        id: "pattern",
        heading: "美国夜间地图实际在显示什么",
        paragraphs: [
          "亮的地方跟着人口走。东北走廊、五大湖城市、佛罗里达、得克萨斯的休斯敦–达拉斯–奥斯汀–圣安东尼奥一带，以及太平洋沿岸都市，贡献了大部分辐射。内陆西部和北部平原在同一层上看起来更暗，是因为灯少，不是因为某张证书这么写。",
          "全国尺度的夜图只适合先看格局。它不会告诉你某条步道尽头的天空。放大，或打开州页面，再点击你真正要站的那个点。视图对准本土 48 州时很容易漏掉阿拉斯加；排行榜里阿拉斯加是单独一行。",
        ],
      },
      {
        id: "average",
        heading: "为什么全国平均值不适合用来描述一次出行",
        paragraphs: [
          "美国大部分土地不是市中心。按面积加权的平均值会被乡村土地拉高，所以这一页不以一个全国数字开头。排行榜和关于本站与数据来源页说明了 NOAA VIIRS 夜间灯光的简化换算。这个换算不是天空质量计读数。",
          "如果要找一个能站上去的地方，用州页面或暗空公园名录。名录列出本站有坐标的 DarkSky International 地点，并链到对方的地点页。",
        ],
      },
    ],
    faq: [
      {
        question: "这和世界光污染地图有什么区别？",
        answer: "首页是全球夜间灯光地图。这一页对准美国，并链到各州。两页用的是同一套卫星图层。",
      },
      {
        question: "美国暗夜地图会显示认证公园吗？",
        answer: "彩色图层是卫星辐射。认证地点是另一层圆点，来自我们的快照。类别和缺漏写在名录页。",
      },
      {
        question: "能用它计划明天的美国行程吗？",
        answer: "可以用它比较地点。云和月亮要看完整地图里点击后的位置面板。晴夜页面只是历史月份气候，不是今晚预报。",
      },
      {
        question: "哪些州有单独页面？",
        answer: "得克萨斯、加利福尼亚、科罗拉多、佛罗里达、犹他、俄勒冈、密歇根、亚利桑那、明尼苏达、威斯康星、俄亥俄和华盛顿。其他州仍可在这张地图上查看，只是这一批没有单独页面。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/texas", label: "得克萨斯州光污染地图" },
      { href: "/light-pollution-map/california", label: "加利福尼亚州光污染地图" },
      { href: "/light-pollution-map/colorado", label: "科罗拉多州光污染地图" },
      { href: "/light-pollution-map/florida", label: "佛罗里达州光污染地图" },
      { href: "/light-pollution-map/utah", label: "犹他州暗夜地图" },
      { href: "/light-pollution-map/oregon", label: "俄勒冈州光污染地图" },
      { href: "/light-pollution-map/michigan", label: "密歇根州光污染地图" },
      { href: "/light-pollution-map/arizona", label: "亚利桑那州暗夜地图" },
      { href: "/light-pollution-map/minnesota", label: "明尼苏达州光污染地图" },
      { href: "/light-pollution-map/wisconsin", label: "威斯康星州光污染地图" },
      { href: "/light-pollution-map/ohio", label: "俄亥俄州光污染地图" },
      { href: "/light-pollution-map/washington", label: "华盛顿州光污染地图" },
    ]),
  },
  texas: {
    metaTitle: "得克萨斯州光污染地图与暗夜地图",
    metaDescription:
      "打开得克萨斯州光污染地图。休斯敦、达拉斯、奥斯汀和圣安东尼奥连成亮带。大弯和丘陵地区的地点链到各自的 DarkSky 页面。",
    h1: "得克萨斯州光污染地图",
    eyebrow: "得克萨斯",
    lede: [
      "这张得克萨斯州光污染地图把夜间灯光图层打开在得州。得州暗夜地图指的是同一页：颜色更暗表示模型里的向上灯光更少，不是法律意义上的暗空认证。",
      "城市里的得州夜空不是大弯国家公园的夜空。请点击你真正会去的那个点。",
    ],
    sections: [
      {
        id: "corridor",
        heading: "亮带，以及奥斯汀的夜空",
        paragraphs: [
          "休斯敦、达拉斯–沃斯堡、奥斯汀和圣安东尼奥是这张图上的亮团。奥斯汀市区是大城市夜空。快照里希尔乡的 Bee Cave、Dripping Springs、Wimberley Valley、Blanco、Fredericksburg、Horseshoe Bay、Jonestown 和 Liberty Hill 被记为暗空社区。那是照明政策记录，不是天空亮度计读数，也不能说明奥斯汀市中心很暗。",
          "Lakewood Village 也在快照里，位于达拉斯北侧。同样先打开地点页，再在地图上点击那个针。",
        ],
      },
      {
        id: "west",
        heading: "西得州和高原上的条目",
        paragraphs: [
          "再往西，图层通常更暗。这份快照里 Big Bend National Park 是公园，年份为 2012，旁边还有 Big Bend Ranch State Park、Black Gap Wildlife Management Area、Devils River 的 Del Norte 单元，以及 Greater Big Bend International Dark Sky Reserve。保护区的名字带有“国际”；我们保存的坐标落在得州。边界以对方地点页为准。",
          "Caprock Canyons 和 Copper Breaks 是高原条目，不是大弯。Enchanted Rock、South Llano River、Milton Reimers Ranch、UBarU 和林登·约翰逊国家历史公园在希尔乡，离奥斯汀的灯光比大弯近得多。同在一州不等于一样暗。",
        ],
      },
    ],
    faq: [
      {
        question: "想看得到州暗空，应该点哪里？",
        answer: "点步道或公园的针，不要点最近的城市。奥斯汀的读数不能描述大弯，社区认证也不能描述天空。",
      },
      {
        question: "快照里大弯算认证公园吗？",
        answer: "Big Bend National Park 被存为公园，年份 2012，链接指向 DarkSky International 的地点页。现状和开放信息以其和国家公园管理局为准。我们不公布该公园的实测 SQM。",
      },
      {
        question: "这一页会给得州城市打分吗？",
        answer: "不会。没有城市页，也没有编造的城市分数。要数值就点地图。",
      },
      {
        question: "能告诉我今晚得州晴不晴吗？",
        answer: "不能。晴夜页面是历史月份气候。点击地点后的短时云量和月相也仍然不是保证。",
      },
    ],
    related: withLinks(zh),
  },
  california: {
    metaTitle: "加利福尼亚州光污染地图与暗夜地图",
    metaDescription:
      "打开加利福尼亚州光污染地图。从圣地亚哥到湾区的海岸城市是亮的一侧。死亡谷、约书亚树和安沙-博雷戈链到各自的 DarkSky 页面。",
    h1: "加利福尼亚州光污染地图",
    eyebrow: "加利福尼亚",
    lede: [
      "这张加利福尼亚州光污染地图打开在加州。加州暗夜地图是同一个视图。太平洋沿岸都市是亮的一侧，沙漠公园是另一次点击。",
    ],
    sections: [
      {
        id: "coast",
        heading: "海岸都市和内陆沙漠",
        paragraphs: [
          "洛杉矶、湾区、圣地亚哥和中央谷地的城市，构成全州视图里的大部分辐射。在这些盆地里平移，不会突然出现一片暗空。你得离开它们。",
          "这份快照里落在加州的条目是：Anza-Borrego Desert State Park（没有保存认证年份）、Borrego Springs（社区，2009）、Death Valley National Park（公园，2013）、Joshua Tree National Park（公园，2017）和 Julian（社区，2021）。大盆地国家公园的坐标在内华达，不在这份加州名单里。",
        ],
      },
      {
        id: "use",
        heading: "怎么读一个针",
        paragraphs: [
          "Borrego Springs 和 Julian 是沙漠公园旁边的社区记录。社区记录是照明政策。死亡谷和约书亚树被存为公园。安沙-博雷戈的类别是公园，但我们的副本里年份为空，所以这里不编一个年份。",
          "点击针可以得到近似等级。园区规定、封路和门票在土地管理机构的网站上，不在这里。这一页也不给出加州平均 SQM。",
        ],
      },
    ],
    faq: [
      {
        question: "为什么海岸这么亮？",
        answer: "因为卫星看到的是海岸城市。这张图上更暗的是内陆和沙漠，而且只有点到那个点才算一个读数。",
      },
      {
        question: "是不是每个沙漠公园都列出了？",
        answer: "只列出这份 DarkSky International 快照里有的。没有列出，不能证明那个公园的天空不暗，只是我们不会称它已认证。",
      },
      {
        question: "Julian 或 Borrego Springs 能保证天空很暗吗？",
        answer: "不能。它们是社区记录。请看地图上的针和对方的地点页。",
      },
      {
        question: "世界地图在哪里？",
        answer: "首页是世界地图。这一页只是加州的取景。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/oregon", label: "俄勒冈州光污染地图" },
      { href: "/light-pollution-map/arizona", label: "亚利桑那州暗夜地图" },
    ]),
  },
  colorado: {
    metaTitle: "科罗拉多州光污染地图与科罗拉多夜空",
    metaDescription:
      "打开科罗拉多州光污染地图，查看这个州的夜空。包括丹佛在内的前沿山脉是亮带。西部的公园和城镇链到各自的 DarkSky 页面。",
    h1: "科罗拉多州光污染地图",
    eyebrow: "科罗拉多",
    lede: [
      "这是科罗拉多州光污染地图，给“科罗拉多的天空”“科罗拉多夜空”这类其实在问户外灯光的搜索。科罗拉多暗夜地图也是这一页。它不是天气预报，也不是星图。",
    ],
    sections: [
      {
        id: "front-range",
        heading: "前沿山脉是科罗拉多天空里亮的一侧",
        paragraphs: [
          "丹佛、博尔德和科罗拉多斯普林斯位于前沿山脉，这是全州图层上的亮脊。若要在科罗拉多看银河，夜空通常不是丹佛市中心的夜空。从丹佛出发找观星地，应把城市当起点，再点击西边或平原上的目的地，读那个点。",
          "快照里的城镇仍可能是灯光附近的社区。Breckenridge 和 Old Snowmass 是社区记录。认证年份不是天空测量。",
        ],
      },
      {
        id: "parks",
        heading: "离开前沿山脉的条目",
        paragraphs: [
          "这份快照包括黑峡谷、Curecanti、大沙丘、梅萨维德、弗洛里森特化石床、Browns Canyon、Chimney Rock、Gunnison Gorge 和恐龙国家纪念地，以及 Westcliffe 与 Silver Cliff、Crestone、Norwood、Nucla 与 Naturita、Ridgway、Paonia 等社区。恐龙国家纪念地保存的针落在科罗拉多；纪念地本身延伸到犹他，去哪一侧要以地点页为准。",
          "Jackson Lake State Park 在前沿山脉的平原一侧，比西部条目更靠近亮带。不要把每个科罗拉多的针都当成一样暗。逐个点击。",
        ],
      },
    ],
    faq: [
      {
        question: "这页怎么说科罗拉多的夜空？",
        answer: "它显示的是模型化的户外灯光，不是科罗拉多天空的照片。前沿山脉是亮的。许多公园针在山区和南部。",
      },
      {
        question: "丹佛在这份数据里是暗空城市吗？",
        answer: "不是。快照里没有丹佛这条认证。它在卫星图层上是明亮的都市。",
      },
      {
        question: "Westcliffe 和 Silver Cliff 等于荒野公园吗？",
        answer: "它们被存为社区，年份 2015。那是照明政策记录。出发前请读地点页。",
      },
      {
        question: "科罗拉多观星的搜索该去哪？",
        answer: "“最佳观星地点”页是附近搜索，包括科罗拉多和丹佛。这一页是接下来可以打开的州地图。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/utah", label: "犹他州暗夜地图" },
      { href: "/best-places-to-stargaze", label: "观星地点搜索（含科罗拉多与丹佛）" },
    ]),
  },
  florida: {
    metaTitle: "佛罗里达州光污染地图与暗空",
    metaDescription:
      "打开佛罗里达州光污染地图。迈阿密、坦帕、奥兰多和杰克逊维尔集中了大部分灯光。基西米草原和大柏树链到各自的 DarkSky 页面。",
    h1: "佛罗里达州光污染地图",
    eyebrow: "佛罗里达",
    lede: [
      "这张佛罗里达州光污染地图就是该州的暗空视图，用的仍是同一套卫星图层。半岛很亮，是因为两侧海岸和内陆走廊都是城市。在这张图上，佛罗里达的暗空是某一次内陆或保护区点击，不是全州状态。",
    ],
    sections: [
      {
        id: "peninsula",
        heading: "半岛哪里亮",
        paragraphs: [
          "迈阿密–劳德代尔、坦帕湾、奥兰多和杰克逊维尔是大块亮区。白天看起来空的岸岛，夜里仍可能浸在都市辉光里。不要用全州缩放判断“佛罗里达到底暗不暗”。",
        ],
      },
      {
        id: "kissimmee",
        heading: "基西米草原和另外两条佛罗里达记录",
        paragraphs: [
          "快照里佛罗里达有三个地点。Kissimmee Prairie Preserve State Park 是公园，年份 2016。Big Cypress National Preserve 是公园，年份 2016。Groveland 是社区，年份 2023，靠近奥兰多一侧，社区标签不是荒野声明。",
          "人们说的基西米草原暗空，指的就是这座州立公园。我们保存类别和年份，并链到 DarkSky International。我们不保存开门时间、火烧封园或实测 SQM。Stephen C. Foster 州立公园在坐标检验中落在佐治亚，所以不列为佛罗里达。",
        ],
      },
    ],
    faq: [
      {
        question: "佛罗里达是暗空州吗？",
        answer: "对大都市来说，地图的回答是否。对保护区，地图不会自动下结论。请打开基西米草原或大柏树再点击。",
      },
      {
        question: "佛罗里达暗空列出了哪些？",
        answer: "基西米草原保护州立公园、大柏树国家保护区，以及 Groveland 社区。这就是这份快照里的全部佛罗里达条目。",
      },
      {
        question: "这个周末草原会放晴吗？",
        answer: "这一页不能回答。出行前请看天气预报。本站晴夜页只给出历史上各月晴夜所占的比例。",
      },
      {
        question: "为什么全州看起来这么亮？",
        answer: "城市灯光覆盖了一个不大的半岛的很大一部分。先放大，再判断一个点。",
      },
    ],
    related: withLinks(zh),
  },
  utah: {
    metaTitle: "犹他州暗夜地图与光污染地图",
    metaDescription:
      "打开犹他州暗夜地图。瓦萨奇前沿是亮带。包括天然桥在内的峡谷公园链到各自的 DarkSky 页面。",
    h1: "犹他州暗夜地图",
    eyebrow: "犹他",
    lede: [
      "犹他州暗夜地图也就是犹他州光污染地图，两个说法是同一个工具。犹他北部沿瓦萨奇前沿是灯光堆积的地方。南部和东部峡谷是这份快照里多数公园针所在的地方。",
    ],
    sections: [
      {
        id: "wasatch",
        heading: "瓦萨奇前沿和科罗拉多高原",
        paragraphs: [
          "盐湖城及其南北社区、犹他谷是亮带。快照里的羚羊岛、East Canyon、Jordanelle、Rockport、Steinaker 和 Timpanogos Cave 比南部公园更靠近这条亮带。Timpanogos Cave 被存为城市夜空地点，年份 2020，不是偏远公园。雪峡谷被存为城市类，年份 2025。",
          "都市附近的针是认证记录。先点击，再假设它的天空是否像峡谷公园。",
        ],
      },
      {
        id: "canyons",
        heading: "快照里的峡谷公园",
        paragraphs: [
          "天然桥国家纪念地是公园，年份 2007，是这份犹他副本里最早的公园年份。拱门、布莱斯、峡谷地、国会礁和锡安是更晚年份的公园。雪松坡、死马角、哥布林谷、Goosenecks、霍文威普、彩虹桥（保护区类别）和弗里蒙特印第安州立公园也在列。霍文威普的针落在犹他；纪念地在科罗拉多州界上，去哪一侧要核对。",
          "摩押、Bluff、Springdale、Torrey、Helper 和 Castle Valley 是社区。摩押在这份快照里的社区年份是 2024。镇子紧挨峡谷公园，也有自己的灯。标签不是天空测量。",
        ],
      },
    ],
    faq: [
      {
        question: "这份快照里犹他最早的公园年份是哪一条？",
        answer: "天然桥国家纪念地存的是 2007。这是我们目录副本里的事实，不是一次现场审计。",
      },
      {
        question: "条目多是不是说明全州都很暗？",
        answer: "不是。瓦萨奇前沿很亮。名单是认证，其中好几条靠近城市。",
      },
      {
        question: "年份为空是错误吗？",
        answer: "羚羊岛在这份快照里没有年份。我们留空，不填一个。",
      },
      {
        question: "开放信息去哪查？",
        answer: "看链接的 DarkSky International 页面和土地管理机构。这张地图不知道某条路开不开。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/arizona", label: "亚利桑那州暗夜地图" },
      { href: "/light-pollution-map/colorado", label: "科罗拉多州光污染地图" },
    ]),
  },
  oregon: {
    metaTitle: "俄勒冈州光污染地图与暗空",
    metaDescription:
      "打开俄勒冈州光污染地图。威拉米特谷是亮带。俄勒冈内陆保护区和高原沙漠公园链到各自的 DarkSky 页面。",
    h1: "俄勒冈州光污染地图",
    eyebrow: "俄勒冈",
    lede: [
      "这张俄勒冈州光污染地图就是俄勒冈暗空页面。波特兰和威拉米特谷是全州最亮的带子。喀斯喀特山脉以东通常更暗，所以高沙漠条目不能和波特兰的读数互换。",
    ],
    sections: [
      {
        id: "valley",
        heading: "威拉米特谷和高沙漠",
        paragraphs: [
          "波特兰、塞勒姆和尤金构成全州视图里的亮谷。从波特兰开始找俄勒冈暗空，需要一个目的地，而不是把地图缩小后看颜色。",
          "这份快照里的地点是：Antelope（社区，2024）、Cottonwood Canyon State Park（公园，2024）、俄勒冈洞穴国家纪念地（公园，2024）、Oregon Outback（保护区类别，2024）、Prineville Reservoir State Park（公园，2021）和 Sisters（社区，2025）。Cottonwood Canyon 的坐标落在俄勒冈，不是华盛顿。",
        ],
      },
      {
        id: "outback",
        heading: "Oregon Outback 这条记录是什么",
        paragraphs: [
          "Oregon Outback 被存为 sanctuary（保护区类别），不是公园，也不是承诺喀斯喀特以东每一英亩都一样暗。Sisters 是社区，位置更靠本德一带。每个针要分开点。",
          "我们不公布其中任何一处的实测 SQM，也不描述内陆公路状况。",
        ],
      },
    ],
    faq: [
      {
        question: "俄勒冈暗夜地图是不是只有内陆？",
        answer: "地图是整个州。内陆是一条保护区记录。河谷是亮的部分。",
      },
      {
        question: "为什么有好几个年份是 2024？",
        answer: "那是这些行里保存的认证年份，不是观测日期。",
      },
      {
        question: "Sisters 是不是表示小镇有荒野天空？",
        answer: "不是。Sisters 是社区记录。请读地点页并点击地图。",
      },
      {
        question: "这份俄勒冈名单里有华盛顿的公园吗？",
        answer: "没有。华盛顿自己的页面会说明这份快照里没有落在该州的针。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/washington", label: "华盛顿州光污染地图" },
      { href: "/light-pollution-map/california", label: "加利福尼亚州光污染地图" },
    ]),
  },
  michigan: {
    metaTitle: "密歇根州光污染地图与暗夜地图",
    metaDescription:
      "打开密歇根州光污染地图。底特律和下半岛南部是亮区。Headlands、基威诺、比弗岛和 Dr. T.K. Lawless 县公园链到各自的 DarkSky 页面。",
    h1: "密歇根州光污染地图",
    eyebrow: "密歇根",
    lede: [
      "密歇根州光污染地图就是该州的暗夜地图。下半岛南部，尤其是底特律一带，是亮区。要找更暗的点击，得看上半岛和下半岛西北角。",
    ],
    sections: [
      {
        id: "south",
        heading: "南部城市不是上半岛",
        paragraphs: [
          "底特律、安娜堡、兰辛、大急流城和南部州际走廊主导辐射。那里的读数不能描述基威诺。",
          "芝加哥一带的 Palos Preserves 在多边形检验中落在伊利诺伊，所以即使在区域地图上很近，也不算密歇根条目。",
        ],
      },
      {
        id: "pins",
        heading: "这份快照里的四条密歇根记录",
        paragraphs: [
          "Headlands 是公园，年份 2011，在下半岛西北角。Dr. T.K. Lawless County Park 是公园，年份 2019，在南部。Keweenaw Dark Sky Park 是公园，年份 2022，在基威诺半岛。比弗岛州立野生动物研究区是 sanctuary，年份 2024。",
          "四条记录不是一份行程。开放规则不同，比弗岛是岛。这一页不写渡轮、季节或实测天空。",
        ],
      },
    ],
    faq: [
      {
        question: "快照里有几个密歇根地点？",
        answer: "四个：Headlands、Dr. T.K. Lawless County Park、Keweenaw Dark Sky Park，以及比弗岛州立野生动物研究区。",
      },
      {
        question: "Headlands 和社区条例是同一类吗？",
        answer: "它被存为公园。南部都市本身根本不在密歇根名单里。",
      },
      {
        question: "包括多尔县吗？",
        answer: "不包括。Newport State Park 的针落在威斯康星，写在威斯康星页面上。",
      },
      {
        question: "地图能告诉我上半岛晴不晴吗？",
        answer: "它能显示模型灯光。云是另一套数据，晴夜页是气候历史。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/wisconsin", label: "威斯康星州光污染地图" },
      { href: "/light-pollution-map/ohio", label: "俄亥俄州光污染地图" },
    ]),
  },
  arizona: {
    metaTitle: "亚利桑那州暗夜地图与光污染地图",
    metaDescription:
      "打开亚利桑那州暗夜地图。凤凰城和图森是亮的盆地。旗杆镇以及峡谷和沙漠公园链到各自的 DarkSky 页面。",
    h1: "亚利桑那州暗夜地图",
    eyebrow: "亚利桑那",
    lede: [
      "亚利桑那州暗夜地图就是该州的光污染地图。凤凰城和图森是亮的盆地。科罗拉多高原和南部沙漠是不同的点击。旗杆镇在快照里是社区，并不表示整座城市等于一座峡谷公园。",
    ],
    sections: [
      {
        id: "flagstaff",
        heading: "旗杆镇的记录，以及它不是什么",
        paragraphs: [
          "亚利桑那州旗杆镇被存为暗空社区，认证年份 2001，是这份亚利桑那副本里最早的年份。旗杆地区国家纪念地是另一条公园记录，年份 2016。人们把旗杆镇搜成暗空城市，是因为这条社区记录。记录是照明认证，不是我们在市中心测到的 SQM，也不能描述凤凰城。",
          "塞多纳、Camp Verde、Cottonwood、Big Park / Oak Creek、Fountain Hills、Bisbee 和 Tubac 也是社区。Fountain Hills 和阿帕奇章克申在凤凰城盆地里。阿帕奇章克申那一行是城市夜空地点，年份 2026，对象是一处市政综合体。那是小场地，不是一片暗区。",
        ],
      },
      {
        id: "parks",
        heading: "快照里的公园行",
        paragraphs: [
          "大峡谷国家公园（2016）、Parashant（2014）、石化林（2018）、Chiricahua（2021）、风琴管仙人掌（2026）、Oracle 州立公园（2014）、Kartchner 洞穴（2017）、Pipe Spring（2021）和 Tumacácori（2018）是公园行。萨瓜罗国家公园被存为城市夜空地点，年份 2023，不是公园类别。我们照保存的类别显示，不自行“改正”。",
          "风琴管仙人掌在这份副本里的年份是 2026。所有年份都只是目录字段，引用前请到链接页面核对。",
        ],
      },
    ],
    faq: [
      {
        question: "旗杆镇被列成暗空城市了吗？",
        answer: "快照把它列为暗空社区，年份 2001。搜索里的“城市”通常就是这个社区类别。我们不另加排名或实测天空。",
      },
      {
        question: "为什么萨瓜罗不在公园类别里？",
        answer: "因为快照写的是城市类。措辞以官方地点页为准。",
      },
      {
        question: "大峡谷的针是不是表示整个公园同一等级？",
        answer: "不是。公园很大。请点击你要去的观景点。南缘设施和北侧偏远点不是同一个像素。",
      },
      {
        question: "凤凰城的条目是暗处吗？",
        answer: "Fountain Hills 和阿帕奇章克申是明亮盆地里的认证。把它们读成政策记录。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/utah", label: "犹他州暗夜地图" },
      { href: "/light-pollution-map/california", label: "加利福尼亚州光污染地图" },
    ]),
  },
  minnesota: {
    metaTitle: "明尼苏达州光污染地图",
    metaDescription:
      "打开明尼苏达州光污染地图。双子城是亮核。边界水域和旅行者国家公园链到各自的 DarkSky 页面。",
    h1: "明尼苏达州光污染地图",
    eyebrow: "明尼苏达",
    lede: [
      "这张明尼苏达州光污染地图打开在明尼苏达。双子城是亮核，德卢斯和其他地区城市是较小的亮点。北部才是这份快照里两条认证记录所在的地方。",
    ],
    sections: [
      {
        id: "north",
        heading: "两条北部记录，以及一座不属于明尼苏达的加拿大公园",
        paragraphs: [
          "边界水域独木舟荒野被存为 sanctuary，年份 2020。旅行者国家公园被存为公园，年份 2020。这是明尼苏达的两行。",
          "奎提科省立公园也在更大的数据集里，坐标落在安大略。它不是明尼苏达条目。如果要过境，那是另一个公园管理机构，也是名录里的另一页。",
        ],
      },
      {
        id: "cities",
        heading: "不要把双子城的读数带到北边",
        paragraphs: [
          "明尼阿波利斯或圣保罗的点击描述的是那个盆地，不是边界水域里的一座湖。荒野也不会因为有 sanctuary 标签就变成“零光污染”。点击你要露营的区域，并记住极光、云和月亮与这一层无关。",
        ],
      },
    ],
    faq: [
      {
        question: "列出了几个明尼苏达地点？",
        answer: "两个：边界水域独木舟荒野和旅行者国家公园。",
      },
      {
        question: "这一页把边界水域标成实测的波特尔 1 级了吗？",
        answer: "没有。我们不公布它的实测等级。地图会在你点击的点给出近似值。",
      },
      {
        question: "为什么要提奎提科？",
        answer: "因为它很容易和边界水域写在一起，而坐标检验里它不在明尼苏达。",
      },
      {
        question: "有明尼苏达州平均值吗？",
        answer: "没有。我们没有计算州平均。国家表是按面积加权的，说明在美国页面。",
      },
    ],
    related: withLinks(zh, [{ href: "/light-pollution-map/wisconsin", label: "威斯康星州光污染地图" }]),
  },
  wisconsin: {
    metaTitle: "威斯康星州光污染地图",
    metaDescription:
      "打开威斯康星州光污染地图。密尔沃基和麦迪逊是明亮都市。多尔县的 Newport State Park 链到它的 DarkSky 页面。",
    h1: "威斯康星州光污染地图",
    eyebrow: "威斯康星",
    lede: [
      "这张威斯康星州光污染地图打开在威斯康星。东南部的密尔沃基一带和麦迪逊是亮的一侧。北部在卫星图层上更暗，但这份快照里全州只有一个认证地点。",
    ],
    sections: [
      {
        id: "newport",
        heading: "Newport State Park 是州内唯一记录",
        paragraphs: [
          "Newport State Park 被存为公园，年份 2017。坐标落在威斯康星的多尔县。它是唯一的威斯康星行。Headlands 和基威诺在密歇根。我们不把它们借来把这一页填满。",
          "多尔县不是密尔沃基。计划去 Newport，就要读 Newport 那个点。开放规则在土地管理机构和链接的地点页上。",
        ],
      },
      {
        id: "south",
        heading: "东南部是都市天空",
        paragraphs: [
          "密尔沃基、拉辛、基诺沙和麦迪逊在这一层上就是普通的明亮城市。它们和多尔县之间的乡村县不会自动获得认证，也不会自动变暗。点击你指的那个县。",
        ],
      },
    ],
    faq: [
      {
        question: "为什么威斯康星的名单这么短？",
        answer: "因为快照里只有一个威斯康星坐标。短名单才是诚实的名单。",
      },
      {
        question: "多尔县到处都很暗吗？",
        answer: "不是。Newport 是一座公园。半岛其余地方仍要点击，镇上的灯仍然算数。",
      },
      {
        question: "在那里能看见银河吗？",
        answer: "这一页不保证。黑暗、云和月亮都得配合。银河指南说明了差别。",
      },
      {
        question: "密歇根的名单在哪？",
        answer: "在密歇根州光污染地图上，那里有它自己的四条记录。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/michigan", label: "密歇根州光污染地图" },
      { href: "/light-pollution-map/minnesota", label: "明尼苏达州光污染地图" },
    ]),
  },
  ohio: {
    metaTitle: "俄亥俄州光污染地图",
    metaDescription:
      "打开俄亥俄州光污染地图。克利夫兰、哥伦布和辛辛那提让这个州大部分地区都有灯光。Geauga 天文台公园和 Fry Family Park 链到各自的 DarkSky 页面。",
    h1: "俄亥俄州光污染地图",
    eyebrow: "俄亥俄",
    lede: [
      "这张俄亥俄州光污染地图打开的是一个有三座大都市、城镇之间也很密的州。克利夫兰、哥伦布和辛辛那提是亮的支点。在俄亥俄找暗空，通常是在找一块空隙，不是在找一个空州。",
    ],
    sections: [
      {
        id: "metros",
        heading: "三座都市和它们之间的土地",
        paragraphs: [
          "俄亥俄上空的卫星图层是斑驳的，不是一半荒野、一半城市。州际公路和县城把辐射铺开。东南部往往是全州视图里不那么亮的部分，而“不那么亮”仍然只是一次点击，不是我们给一个地区指定的等级。",
        ],
      },
      {
        id: "two",
        heading: "两条记录，类别不同",
        paragraphs: [
          "Geauga Observatory Park 被存为公园，年份 2011，在克利夫兰以东。Fry Family Park 被存为城市夜空地点，年份 2021。城市夜空地点可以是镇上做得好的照明项目，不是偏远天空。快照里没有的其他俄亥俄天文台，我们不会添上。",
        ],
      },
    ],
    faq: [
      {
        question: "俄亥俄是不是亮到不值得打开地图？",
        answer: "不是。市中心和乡村县的差别仍然看得到，只是比犹他或西得州的差别小。",
      },
      {
        question: "列出了哪些地点？",
        answer: "Geauga Observatory Park 和 Fry Family Park。这就是这份副本里的全部俄亥俄条目。",
      },
      {
        question: "会为克利夫兰或哥伦布做城市页吗？",
        answer: "这一批不会。在地图上搜索城市，读那个点。",
      },
      {
        question: "Geauga 的年份是测量值吗？",
        answer: "不是。2011 是这一行保存的认证年份。",
      },
    ],
    related: withLinks(zh, [{ href: "/light-pollution-map/michigan", label: "密歇根州光污染地图" }]),
  },
  washington: {
    metaTitle: "华盛顿州光污染地图",
    metaDescription:
      "打开华盛顿州光污染地图。普吉特海湾的城市是亮的一侧。这份名单里没有落在华盛顿州境内的 DarkSky International 地点。",
    h1: "华盛顿州光污染地图",
    eyebrow: "华盛顿州",
    lede: [
      "这张华盛顿州光污染地图打开的是太平洋西北的华盛顿州，不是华盛顿哥伦比亚特区。西雅图、塔科马和普吉特海湾其余城市是亮的一侧。奥林匹克半岛和喀斯喀特以东在同一层上看起来更暗。更暗不是认证。",
    ],
    sections: [
      {
        id: "gap",
        heading: "这份快照里没有落在州内的认证针",
        paragraphs: [
          "我们用州界多边形检验了 DarkSky International 副本里的每个坐标。没有一个落在华盛顿州。Cottonwood Canyon State Park 在俄勒冈。我们不会编造奥林匹克或雷尼尔的认证来填这个空。",
          "如果认证是在这份副本保存之后才出现的，这里就会缺。更新的信息去看该组织，灯光格局则仍然用地图看。",
        ],
      },
      {
        id: "pattern",
        heading: "没有名录时地图仍然能用",
        paragraphs: [
          "点击你要去的步道或海岸。西雅图的点击描述西雅图。奥林匹克外海岸的点击描述那个像素，它仍是模型，仍不承诺云况。若要比较西北，隔壁的俄勒冈页面有内陆和其他俄勒冈记录。",
          "喀斯喀特山脉对天气的影响大于对这套卫星产品的影响。晴夜气候页是历史云量工具，不是周末预报。",
        ],
      },
    ],
    faq: [
      {
        question: "华盛顿州真的没有暗空公园吗？",
        answer: "这份快照里没有坐标落在州内的。这不是对未来的判断，也不是说华盛顿乡村很亮。",
      },
      {
        question: "为什么还做这一页？",
        answer: "因为灯光格局是真实的，地图可以对准。认证名单为空是页面的一部分，不是编造条目的理由。",
      },
      {
        question: "这是华盛顿特区吗？",
        answer: "不是。视图是太平洋西北的那个州。",
      },
      {
        question: "最近的已列出地点在哪？",
        answer: "在俄勒冈州光污染地图上。不要把它们当成华盛顿的公园。",
      },
    ],
    related: withLinks(zh, [{ href: "/light-pollution-map/oregon", label: "俄勒冈州光污染地图" }]),
  },
  parks: {
    metaTitle: "暗空公园、保护区、庇护地与社区",
    metaDescription:
      "在世界地图上浏览暗空公园、保护区、庇护地、社区和城市夜空地点。每个名称都链到它的 DarkSky International 页面。",
    h1: "暗空公园",
    eyebrow: "名录",
    lede: [
      "这是暗空公园名录，以及快照里的其他类型：公园、reserve、sanctuary、社区和城市夜空地点。国际暗空公园和美国暗空公园，只要坐标在副本里，都会出现。",
      "地图就是暗空公园地图。圆点是快照。底下的颜色是卫星灯光，不是认证图层。",
    ],
    sections: [
      {
        id: "categories",
        heading: "这里的类别是什么意思",
        paragraphs: [
          "暗空公园、暗空保护地（reserve）和 sanctuary 在来源名单里是不同的行。我们保留保存的类别。暗空社区是有照明政策的地方，可以位于明亮都市里。城市夜空地点是更小的照明认证。口语里的 preserve 或“夜空保护区”不会在这份数据里变成额外类别。行里写了 reserve 才是 reserve，没写我们就不改名。",
          "搜暗空城市，多半是在找社区。旗杆镇是这份副本里最清楚的例子：社区，年份 2001。基西米草原保护州立公园是佛罗里达的公园行，年份 2016。得州和科罗拉多的公园问题，也写在各自的州页面上。",
        ],
      },
      {
        id: "limits",
        heading: "这份名录拒绝编造的内容",
        paragraphs: [
          "我们不保存银级、金级或任何档位。搜“国际暗空公园银级”必须去该组织自己的页面。我们也没有名为 International Dark Sky Discovery Center 的行，所以不去描述它。",
          "“附近”不是预先排好的半径。在地图上使用你的位置，或搜索一个镇。下面的列表在筛选后按名称排列，不按你家的距离排。旧资料里仍会见到 IDA；我们保存的地点链接在 darksky.org。",
          "这里不排名美国最佳暗空公园。美国条目多，并不构成顺序。点击公园，看模型灯光，再核对是否开放。名字里的国家公园以来源用词为准，我们不审计土地权属。",
        ],
      },
    ],
    faq: [
      {
        question: "什么是暗空社区？",
        answer: "在这份快照里，它是因照明政策被记录的城镇或片区类别。它不是“那里的夜空 pristine”的测量。旗杆镇那一行就是人们通常指的例子。",
      },
      {
        question: "会显示银级国际暗空公园吗？",
        answer: "不会。档位不是我们副本里的字段。链接的地点页也许会讨论。我们不猜测。",
      },
      {
        question: "怎么找附近的暗空公园？",
        answer: "在地图上使用你的位置或搜索，看那个视图周围的点。这一页不计算车程半径。",
      },
      {
        question: "所有国际暗空地点都在吗？",
        answer: "只有这份离线快照里的。更新的认证可能缺失。每一行的链接是该行的来源。",
      },
      {
        question: "暗空区等于公园吗？",
        answer: "我们没有单独的“区”产品。点是地点。颜色是辐射。",
      },
    ],
    related: withLinks(zh, [
      { href: "/light-pollution-map/texas", label: "得克萨斯州的暗空公园" },
      { href: "/light-pollution-map/colorado", label: "科罗拉多州的暗空公园" },
      { href: "/light-pollution-map/florida", label: "基西米草原及其他佛罗里达记录" },
      { href: "/light-pollution-map/arizona", label: "旗杆镇及其他亚利桑那记录" },
    ]),
  },
  "milky-way": {
    metaTitle: "哪里能看到银河",
    metaDescription:
      "了解更暗的天空、偏低的月亮、晴朗天气和季节怎样一起影响银河，再打开光污染地图查看一个地点。",
    h1: "哪里能看到银河",
    eyebrow: "说明",
    lede: [
      "哪里能看到银河？在天光、月光和云都足够低，而且一年里银河较亮的部分升到地平线以上的时候。没有一个针每天晚上都有效。",
      "这一页是解释。地图是查询。本站不会画一层“保证能看见银河”的可见度地图。",
    ],
    sections: [
      {
        id: "need",
        heading: "必须同时成立的条件",
        paragraphs: [
          "你需要足够暗的天空、偏低的月亮、足够晴的夜晚，以及银河确实升起来了。波特尔 1 到 3 级是人们描述细致银河时常用的说法。本站的等级是卫星灯光的近似换算，所以点击得到的“4 级”只是计划时的提示，不是当晚一定能看见银河的承诺。",
          "城市附近“看银河的最佳地点”可能只是“比市中心不那么差”。郊区夜空常常还留着亮星，却失去那条暗带。若要看带状结构，就得计划移动。",
        ],
      },
      {
        id: "season",
        heading: "季节：针对中纬度北半球",
        paragraphs: [
          "在美国和欧洲的很多地方，人马座方向的银河亮核是夏季傍晚的目标。冬季傍晚头顶是银河较暗的一段，经过猎户座一带。春秋介于两者之间。图是中纬度北半球的示意图，不是南半球日历，也不是多云一周的承诺。",
          "本站的实时星空图可以按你选的日期、时间和地点显示这条带在哪里。用它回答“升起来了吗”。用光污染地图回答“这个地方亮不亮”。云要用真正的预报。晴夜页面只说明哪些月份在历史上晴夜更多。",
        ],
      },
      {
        id: "photo",
        heading: "拍照是另一件事",
        paragraphs: [
          "用眼睛看银河，主要就是上面那张清单。拍摄银河还要相机、三脚架和曝光。地图的位置面板里有一个简化的曝光计算器。它对照过一个已公开的例子，并标明是估算。它不会告诉你唯一正确的快门，这一页也不会编一个。",
          "观景点就是你点击的地方，再加上没有被树或体育场挡住的地平线。我们不维护风景停车点名单。",
        ],
      },
    ],
    faq: [
      {
        question: "我家附近哪里能看到银河？",
        answer: "在地图上搜索你的镇，找你真正能到达的更暗土地。再看月亮和云。附近是行程问题，不是我们可以事先指定的一个坐标。",
      },
      {
        question: "在美国从哪些州看起？",
        answer: "犹他、亚利桑那、得克萨斯、俄勒冈等州页面展示灯光格局和我们确实有的认证地点。它们仍然不保证银河。",
      },
      {
        question: "暗空公园是不是自动就是银河观景点？",
        answer: "不是。认证不是天气预报，有些社区认证还在明亮地区。",
      },
      {
        question: "有银河可见度地图吗？",
        answer: "没有专门图层。暗不暗看光污染地图。在天空的位置看星图。合在一起也仍然不是对今晚的肯定回答。",
      },
    ],
    related: withLinks(zh),
    diagram: {
      kind: "season",
      title: "中纬度北半球，银河亮核何时更高",
      caption: "仅为示意图。柱高表示傍晚观看银河亮核通常有多有利。不是照片，也不是预报。",
      labels: ["冬", "春", "夏", "秋"],
    },
    toolEntry: true,
  },
  "night-sky": {
    metaTitle: "没有光污染的夜空是什么样",
    metaDescription:
      "看看更暗的夜空和明亮的城市夜空有什么差别，再在光污染地图上比较地点。",
    h1: "没有光污染的夜空",
    eyebrow: "说明",
    lede: [
      "没有光污染的夜空，是天文学里说的暗处：银河是结构而不只是一点痕迹，星星也比城市里多得多。严格意义上完全没有光污染的天空很少。有人定居的地方，卫星图几乎总能看见一些光。",
      "这一页用文字说明差别。它不展示伪造的前后对比照片。",
    ],
    sections: [
      {
        id: "looks",
        heading: "灯光增加时天空看起来怎样",
        paragraphs: [
          "在很暗的天空下，没有月亮且晴朗时，银河很明显，地平线也不发亮。郊区夜空通常还留着亮星和行星，但失去暗弱的带子。城市天空留下月亮、最亮的星，以及灰色或橙色的背景。这就是波特尔等级从 1 级走向 9 级想描述的视觉台阶。我们地图上的等级是卫星灯光的简化读数，不会每次都和仔细的目视估计一致。",
          "如果你的镇子没有光污染，夜空会是什么样？打开地图，点击你能到达的更暗处，再和家里的点击比较近似等级。这是模型比较，不是两地天空的照片。",
        ],
      },
      {
        id: "zero",
        heading: "“没有光污染”和“零”很容易说满",
        paragraphs: [
          "人们会把最暗的公园说成没有光污染的地方、零光污染的天空。真正的零，不是这套数据能证明的。即使是暗的公园，也可能看见远处的天光。 “很少”和“最少”是比较。用地图比较，认证页只说明认证。",
          "附近光污染低，和观星搜索是同一件事：从你所在的地方出发，再移动。地球上最暗的夜空是另一个问题，本站不给它排名。",
        ],
      },
      {
        id: "ladder",
        heading: "阶梯是图例，不是照片",
        paragraphs: [
          "色条用的是和经典地图风格类似的分档颜色，从暗的等级到亮的等级。它们不是光污染照片，也不是原始夜空的照片。若要等级定义，波特尔等级地图把文字说明和交互地图放在同一个网址上。",
        ],
      },
    ],
    faq: [
      {
        question: "没有光污染的天空是什么样？",
        answer: "在没有月亮、天气晴朗的极暗地点，银河容易看见，星也很密。多数读者家里不是这种天空。地图显示的是模型亮度如何随地点变化。",
      },
      {
        question: "附近光污染最少的地方在哪？",
        answer: "在观星页或地图上使用你的位置。没有这个点，我们不会指名最近的镇。",
      },
      {
        question: "有没有“无光污染地图”？",
        answer: "工具就是光污染地图。颜色越暗，模型辐射越低。没有一层专门标出经认证的零。",
      },
      {
        question: "这和波特尔页面有何不同？",
        answer: "波特尔页面是逐级的地图。这一页是用白话说明那些等级想表达的景象。",
      },
    ],
    related: withLinks(zh),
    diagram: {
      kind: "ladder",
      title: "从更暗到更亮的波特尔阶梯示意图",
      caption: "这是图例，不是任何一片天空的照片。数字是波特尔 1 到 9 级。地图点击给出的等级是近似值。",
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    },
    toolEntry: true,
  },
  "what-is": {
    metaTitle: "什么是光污染",
    metaDescription:
      "阅读光污染是什么，包括天光、眩光和溢到不需要之处的光，再打开地图比较地点。",
    h1: "什么是光污染",
    eyebrow: "说明",
    lede: [
      "光污染是夜间被浪费的人工光。它照亮天空，照进并不需要它的地方，并让星星更难看清。当搜索说的是夜空而不是烟尘或水体时，天空污染和光污染指的是同一件事。",
      "城市上空被照亮的天空是日常例子。城市夜空通常是明亮的背景加上几颗星。这是体验。地图是本站用来比较地点的方法。它不是相册。",
    ],
    sections: [
      {
        id: "types",
        heading: "常见的几种",
        paragraphs: [
          "天光是光在空气中散射，也就是城市上空的光穹。眩光是亮到影响你看清别的东西的光。光侵扰是光越过地界或照进窗户。杂光是一堆明亮招牌。这一页说的光污染例子就是这些。图是示意图，不是某条真实街道的照片。",
          "我们不发布光污染照片、图片或图库。卫星地图是测量产品，不是对着地平线的相机。如果你是来找图片的，请用地图看格局，并把别处的照片视为别人的版权作品。",
        ],
      },
      {
        id: "measure",
        heading: "人们怎么谈论测量，以及我们实际算什么",
        paragraphs: [
          "天文学家有时用极限星等描述天空，也就是人眼能看见的最暗恒星。本站不把模型换算成极限星等。它从 NOAA VIIRS 辐射出发，使用“关于数据”页写明的简化对数公式，再归入波特尔等级。用极限星等测量光污染是另一种观测。不要把我们的等级引用成那种观测。",
          "九个等级写在波特尔等级地图上。首页是世界地图。搜索里如果写了年份，打开的仍是这个工具。年度层是数据页说明的那一层合成。我们不会按搜索词里的年份给它改名。",
        ],
      },
      {
        id: "reduce",
        heading: "减少是本地的、具体的",
        paragraphs: [
          "暗空项目反复说的减少办法，是把光朝下照、少用一些，并在不需要白光时选用更暖的灯。暗空照明和“符合暗空”的灯具是政策和产品用语。本网站不认证一盏灯、一部城镇条例或一个“合规”标签。",
          "彻底停止光污染不是这张地图能按的开关。有效的办法是市政和家庭的决定。我们的工作是显示卫星格局，并把话说得比结论短。",
        ],
      },
    ],
    faq: [
      {
        question: "用一句话说明什么是光污染？",
        answer: "人工光照亮了夜空，或者溢到它被安装时并不负责的地方。",
      },
      {
        question: "天空污染等于空气污染吗？",
        answer: "在本站，天空污染指夜空中的人工光。烟和霾也会影响你看见什么，但它们不是这张地图。",
      },
      {
        question: "图片在哪里？",
        answer: "我们不托管对比照片。示意图标出类型。地图显示卫星格局。",
      },
      {
        question: "等级在哪里看？",
        answer: "打开波特尔等级地图。等级说明和交互地图是同一个网址。",
      },
    ],
    related: withLinks(zh),
    diagram: {
      kind: "types",
      title: "三种被浪费的光",
      caption: "天光、眩光和光侵扰的示意图。不是照片，也不是任何真实地点的前后对比。",
      labels: ["天光", "眩光", "光侵扰"],
    },
    toolEntry: true,
  },
};
