import type { GuideCopy } from "@/content/guides/types";
import { withLinks } from "@/content/guides/linkSets";

const en = "en" as const;

export const enGuides: Record<string, GuideCopy> = {
  us: {
    metaTitle: "US Light Pollution Map – United States Night Lights",
    metaDescription:
      "US light pollution map and dark sky map of the United States. The map opens on the country. City corridors and rural land are not the same sky, and the area-weighted national average is not a city reading.",
    h1: "US light pollution map",
    eyebrow: "UNITED STATES",
    lede: [
      "This is the US light pollution map: the same world night-light layer, opened on the United States instead of the whole planet. A light pollution map USA, a map of the US at night, or a USA dark sky map search belongs here. The homepage stays the world light pollution map.",
      "Dark colors mean less modeled upward light in the NOAA VIIRS annual composite. A click gives an approximate Bortle class and an SQM-style value. Neither number is a meter held up at that spot, and neither one is a forecast for tonight.",
    ],
    sections: [
      {
        id: "pattern",
        heading: "What the United States night map actually shows",
        paragraphs: [
          "The bright areas follow people. The Northeast corridor, the Great Lakes cities, Florida, the Houston–Dallas–Austin–San Antonio band in Texas, and the Pacific coast metros carry most of the radiance. The interior West and the northern plains look darker on the same layer because fewer lights are there, not because a park designation says so.",
          "A night map of the USA at national zoom is a screening picture. It will not tell you the sky over a trailhead. Zoom in, or open a state page, and click the point you mean to stand on. Alaska is easy to miss when the view is centered on the lower 48; the rankings table keeps it as its own row.",
        ],
      },
      {
        id: "average",
        heading: "Why a national average is a poor description of a visit",
        paragraphs: [
          "Most of the land area of the United States is not a downtown. An area-weighted average is therefore pulled toward rural pixels. Use the figures next to this section only with that warning. They come from this site’s country table, which documents the shortcut formula. They are not a federal sky survey.",
          "If you want a place to stand, use a state map or the dark sky parks directory. Those pages list only places whose coordinates are in our DarkSky International snapshot, with a link to the place page. They do not rank “the darkest town in America.”",
        ],
      },
    ],
    faq: [
      {
        question: "Is this different from the world light pollution map?",
        answer:
          "Yes. The homepage is the global night light map. This page opens on the United States and links to state pages. Both use the same satellite layer.",
      },
      {
        question: "Does the US dark sky map show certified parks?",
        answer:
          "The colored layer is satellite radiance. Certified places are a separate dot layer from our snapshot. The directory page explains the categories and the gaps.",
      },
      {
        question: "Can I use this as a light map of the United States for a trip tomorrow?",
        answer:
          "Use it to compare places. Check clouds and the Moon in the location panel on the full map, and use the clear-sky page only as a historical monthly climate, not as tonight’s forecast.",
      },
      {
        question: "Which states have their own pages?",
        answer:
          "Texas, California, Colorado, Florida, Utah, Oregon, Michigan, Arizona, Minnesota, Wisconsin, Ohio, and Washington. Other states are still on this map; they do not have a separate page in this set.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/texas", label: "Texas light pollution map" },
      { href: "/light-pollution-map/california", label: "California light pollution map" },
      { href: "/light-pollution-map/colorado", label: "Colorado light pollution map" },
      { href: "/light-pollution-map/florida", label: "Florida light pollution map" },
      { href: "/light-pollution-map/utah", label: "Utah dark sky map" },
      { href: "/light-pollution-map/oregon", label: "Oregon light pollution map" },
      { href: "/light-pollution-map/michigan", label: "Michigan light pollution map" },
      { href: "/light-pollution-map/arizona", label: "Arizona dark sky map" },
      { href: "/light-pollution-map/minnesota", label: "Minnesota light pollution map" },
      { href: "/light-pollution-map/wisconsin", label: "Wisconsin light pollution map" },
      { href: "/light-pollution-map/ohio", label: "Ohio light pollution map" },
      { href: "/light-pollution-map/washington", label: "Washington light pollution map" },
    ]),
  },
  texas: {
    metaTitle: "Texas Light Pollution Map & Texas Dark Sky Map",
    metaDescription:
      "Texas light pollution map centered on the state. The Houston–Dallas–Austin–San Antonio band is the bright part; Big Bend and the plains parks are separate listings in our snapshot. The Austin, Texas night sky is a metro sky until you click a point outside it.",
    h1: "Texas light pollution map",
    eyebrow: "TEXAS",
    lede: [
      "This Texas light pollution map is the night-light layer opened on Texas. Light pollution map Texas, Texas dark sky map, and dark sky map Texas are the same page. Dark sky Texas here means “where the satellite layer is darker,” not a legal designation.",
      "The Texas night sky you get in a city is not the sky at Big Bend. Click the point you will actually use.",
    ],
    sections: [
      {
        id: "corridor",
        heading: "The bright band, and the Austin, Texas night sky",
        paragraphs: [
          "Houston, Dallas–Fort Worth, Austin, and San Antonio are the bright cluster on this map. The Austin, Texas night sky over the city is a large-metro sky. Our snapshot also lists Hill Country communities — Bee Cave, Dripping Springs, Wimberley Valley, Blanco, Fredericksburg, Horseshoe Bay, Jonestown, and Liberty Hill — as Dark Sky Communities. That records a lighting policy. It does not record a sky-quality meter reading, and it does not make downtown Austin a dark site.",
          "Lakewood Village is in the snapshot too, on the north side of the Dallas area. Treat it the same way: open the place page, then click the map at the pin.",
        ],
      },
      {
        id: "west",
        heading: "West Texas and the plains listings",
        paragraphs: [
          "Farther west, the layer is generally darker. In this snapshot Big Bend National Park is a park with designation year 2012, alongside Big Bend Ranch State Park, Black Gap Wildlife Management Area, Devils River State Natural Area — Del Norte Unit, and the Greater Big Bend International Dark Sky Reserve. The reserve’s name says international; the coordinate we store falls in Texas. The place page is the boundary, not this sentence.",
          "Caprock Canyons State Park and Copper Breaks State Park are plains listings, not Big Bend. Enchanted Rock, South Llano River, Milton Reimers Ranch, UBarU, and Lyndon B. Johnson National Historical Park sit in the Hill Country, closer to the Austin lights than Big Bend is. Distance matters more than sharing a state.",
        ],
      },
    ],
    faq: [
      {
        question: "Where should I click for a Texas dark sky reading?",
        answer:
          "Click the trailhead or park pin, not the nearest city. A reading in Austin does not describe Big Bend, and a community designation does not describe the sky.",
      },
      {
        question: "Is Big Bend certified in this snapshot?",
        answer:
          "Big Bend National Park is stored as a park with year 2012, and the link goes to its DarkSky International place page. Confirm current status and access there and with the National Park Service. We do not publish a measured SQM for the park.",
      },
      {
        question: "Does this page rank Texas cities?",
        answer:
          "No. There is no city page and no fabricated city score. The map is the lookup.",
      },
      {
        question: "Can this tell me if tonight is clear in Texas?",
        answer:
          "No. The clear-sky page is a historical monthly climate. Short-range cloud and Moon information is in the location panel after you click a point, and it is still not a guarantee.",
      },
    ],
    related: withLinks(en),
  },
  california: {
    metaTitle: "California Light Pollution Map & Dark Sky Map",
    metaDescription:
      "California light pollution map centered on the state. Coastal metros from San Diego through Los Angeles to the Bay Area dominate the bright pixels. Death Valley, Joshua Tree, and Anza-Borrego are the park listings in this snapshot.",
    h1: "California light pollution map",
    eyebrow: "CALIFORNIA",
    lede: [
      "This California light pollution map opens on California. California dark sky map and dark sky map California mean this same view. The Pacific coast metros are the bright part of the state. The desert parks are a different click.",
    ],
    sections: [
      {
        id: "coast",
        heading: "Coastal metros versus inland deserts",
        paragraphs: [
          "Los Angeles, the Bay Area, San Diego, and the Central Valley cities account for most of the radiance a statewide view shows. A dark reading does not appear by panning across those basins. You have to leave them.",
          "In this snapshot the California park and community pins are Anza-Borrego Desert State Park (no designation year stored), Borrego Springs (community, 2009), Death Valley National Park (park, 2013), Joshua Tree National Park (park, 2017), and Julian (community, 2021). Great Basin National Park is not in this list; its coordinate falls in Nevada.",
        ],
      },
      {
        id: "use",
        heading: "How to read a pin",
        paragraphs: [
          "Borrego Springs and Julian are community designations next to desert parks. A community record is a lighting policy. Death Valley and Joshua Tree are stored as parks. Anza-Borrego has a park category and a null year in our copy, so this page does not invent one.",
          "Click the pin for an approximate class. Park rules, road closures, and fees are on the land manager’s site, not here. The state page does not claim a California average SQM.",
        ],
      },
    ],
    faq: [
      {
        question: "Why is the California dark sky map so bright along the coast?",
        answer:
          "Because the satellite is seeing the coastal cities. Darkness on this map is inland and in the deserts, and only a click at the actual point is a reading.",
      },
      {
        question: "Is every desert park listed?",
        answer:
          "Only places present in our DarkSky International snapshot. Absence is not proof that a park has no dark sky. It means we will not call it designated.",
      },
      {
        question: "Does Julian or Borrego Springs guarantee a dark sky?",
        answer:
          "No. They are community records. Use the map at the pin and the linked place page.",
      },
      {
        question: "Where is the world map?",
        answer:
          "The homepage is the world map. This page is only the California framing.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/oregon", label: "Oregon light pollution map" },
      { href: "/light-pollution-map/arizona", label: "Arizona dark sky map" },
    ]),
  },
  colorado: {
    metaTitle: "Colorado Light Pollution Map & Colorado Night Sky",
    metaDescription:
      "Colorado light pollution map for the Colorado night sky and dark sky Colorado searches. The Front Range is the bright corridor. Western and San Luis Valley listings in our snapshot are a separate click from Denver.",
    h1: "Colorado light pollution map",
    eyebrow: "COLORADO",
    lede: [
      "This page is the Colorado light pollution map, for a Colorado sky or night sky Colorado query that is really about outdoor lighting. Dark sky Colorado and Colorado dark sky map land here too. It is not a weather page and not a star chart.",
    ],
    sections: [
      {
        id: "front-range",
        heading: "The Front Range is the bright part of the Colorado sky",
        paragraphs: [
          "Denver, Boulder, and Colorado Springs sit on the Front Range, and that corridor is the bright spine of the state on this layer. A night sky in Colorado that you want for the Milky Way is usually not the sky over downtown Denver. People searching for stargazing around Denver should treat the city as the starting point and click a destination to the west or on the plains, then read that point.",
          "Towns in the snapshot can still be communities inside or near lit areas. Breckenridge and Old Snowmass are community records. A designation year is not a sky measurement.",
        ],
      },
      {
        id: "parks",
        heading: "Listings away from the Front Range",
        paragraphs: [
          "This snapshot includes Black Canyon of the Gunnison, Curecanti, Great Sand Dunes, Mesa Verde, Florissant Fossil Beds, Browns Canyon, Chimney Rock, Gunnison Gorge, and Dinosaur National Monument, plus communities such as Westcliffe and Silver Cliff, Crestone, Norwood, Nucla and Naturita, Ridgway, and Paonia. Dinosaur National Monument’s stored pin falls in Colorado; the monument itself also extends into Utah, so use the place page for which side you are visiting.",
          "Jackson Lake State Park is on the plains side of the Front Range, closer to the corridor than the western listings. Do not treat every Colorado pin as equally dark. Click each one.",
        ],
      },
    ],
    faq: [
      {
        question: "What does this say about the night sky in Colorado?",
        answer:
          "It shows modeled outdoor light, not a photograph of the Colorado sky. The Front Range is bright. Many of the stored park pins are in the mountains and the south.",
      },
      {
        question: "Is Denver a dark sky city in this dataset?",
        answer:
          "No. Denver is not a designated place in our snapshot. It is a bright metro on the satellite layer.",
      },
      {
        question: "Are Westcliffe and Silver Cliff the same as a wilderness park?",
        answer:
          "They are stored as a community, year 2015. That is a lighting-policy record. Read the place page before you plan a night there.",
      },
      {
        question: "Where do Colorado stargazing searches go?",
        answer:
          "The best-places page is the near-you search, including Colorado and Denver queries. This page is the state map those queries can open next.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/utah", label: "Utah dark sky map" },
      { href: "/best-places-to-stargaze", label: "Stargazing spots, including Colorado and Denver" },
    ]),
  },
  florida: {
    metaTitle: "Florida Light Pollution Map & Dark Sky Florida",
    metaDescription:
      "Florida light pollution map centered on the peninsula. Miami, Tampa, Orlando, and Jacksonville dominate the lights. Kissimmee Prairie Preserve State Park and Big Cypress are the park records in this snapshot.",
    h1: "Florida light pollution map",
    eyebrow: "FLORIDA",
    lede: [
      "This Florida light pollution map is the dark sky Florida view of the same satellite layer. The peninsula is bright because the cities run down both coasts and through the interior corridor. A dark sky in Florida, on this map, is a specific inland or preserve click, not a statewide condition.",
    ],
    sections: [
      {
        id: "peninsula",
        heading: "Where the peninsula is bright",
        paragraphs: [
          "Miami–Fort Lauderdale, Tampa Bay, Orlando, and Jacksonville are the large bright areas. Coastal barrier islands that look empty by day can still sit in a metro glow. Do not read a statewide zoom as “Florida is either dark or not.”",
        ],
      },
      {
        id: "kissimmee",
        heading: "Kissimmee Prairie and the other Florida records",
        paragraphs: [
          "Our snapshot has three Florida places. Kissimmee Prairie Preserve State Park is a park, year 2016. Big Cypress National Preserve is a park, year 2016. Groveland is a community, year 2023, and it sits near the Orlando side of the state, so a community label there is not a wilderness claim.",
          "Kissimmee Prairie is the place people mean by the preserve’s dark-sky name. We store the category and year and link to the DarkSky International page. We do not store gate hours, burn closures, or a measured SQM. Stephen C. Foster State Park is in Georgia in this coordinate test, so it is not listed as Florida.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Florida a dark sky state?",
        answer:
          "The map says no for the big metros and says nothing automatic about a preserve. Open Kissimmee Prairie or Big Cypress and click.",
      },
      {
        question: "What is listed for dark sky Florida?",
        answer:
          "Kissimmee Prairie Preserve State Park, Big Cypress National Preserve, and the community of Groveland. That is the whole Florida set in this snapshot.",
      },
      {
        question: "Will the prairie be clear this weekend?",
        answer:
          "This page cannot say. Use a forecast before you travel. Our clear-sky page is only the historical fraction of clear nights by month.",
      },
      {
        question: "Why is the map so bright at a statewide zoom?",
        answer:
          "City light covers a large share of a small peninsula. Zoom in before you judge a point.",
      },
    ],
    related: withLinks(en),
  },
  utah: {
    metaTitle: "Utah Dark Sky Map & Light Pollution Map",
    metaDescription:
      "Utah dark sky map centered on the state. The Wasatch Front is the bright corridor. Canyon country parks in our snapshot, including Natural Bridges in 2007, are separate from Salt Lake City.",
    h1: "Utah dark sky map",
    eyebrow: "UTAH",
    lede: [
      "This Utah dark sky map is also the Utah light pollution map. The two phrases are one tool. Northern Utah along the Wasatch Front is where the lights pile up. Southern and eastern canyon country is where most of the park pins in our snapshot sit.",
    ],
    sections: [
      {
        id: "wasatch",
        heading: "Wasatch Front versus the Colorado Plateau",
        paragraphs: [
          "Salt Lake City, the communities north and south of it, and Utah Valley are the bright band. Antelope Island, East Canyon, Jordanelle, Rockport, Steinaker, and Timpanogos Cave are stored in this snapshot and sit nearer that band than the southern parks do. Timpanogos Cave is stored as an urban night sky place, year 2020, not as a remote park. Snow Canyon is stored as urban, year 2025.",
          "A pin near a metro is a designation record. Click it before you assume the sky matches a canyon park.",
        ],
      },
      {
        id: "canyons",
        heading: "Canyon parks in the snapshot",
        paragraphs: [
          "Natural Bridges National Monument is a park with year 2007, the earliest park year stored for Utah in this copy. Arches, Bryce Canyon, Canyonlands, Capitol Reef, and Zion are parks with later years. So are Cedar Breaks, Dead Horse Point, Goblin Valley, Goosenecks, Hovenweep, Rainbow Bridge (sanctuary), and Fremont Indian State Park. Hovenweep’s pin falls in Utah; the monument is on the Colorado line, so check which unit you are visiting.",
          "Moab, Bluff, Springdale, Torrey, Helper, and Castle Valley are communities. Moab’s community year in this snapshot is 2024. The town sits beside canyon parks and beside its own lights. The label is not a sky measurement.",
        ],
      },
    ],
    faq: [
      {
        question: "What is the oldest Utah park year in this snapshot?",
        answer:
          "Natural Bridges National Monument is stored as 2007. That is a fact about our copy of the directory, not a live audit.",
      },
      {
        question: "Does a long list mean the whole state is dark?",
        answer:
          "No. The Wasatch Front is bright. The list is designations, and several of them are near cities.",
      },
      {
        question: "Is a null year an error?",
        answer:
          "Antelope Island has no year in this snapshot. We leave it blank instead of filling one in.",
      },
      {
        question: "Where do I check access?",
        answer:
          "On the linked DarkSky International page and the land manager. This map does not know if a road is open.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/arizona", label: "Arizona dark sky map" },
      { href: "/light-pollution-map/colorado", label: "Colorado light pollution map" },
    ]),
  },
  oregon: {
    metaTitle: "Oregon Light Pollution Map & Dark Sky Oregon",
    metaDescription:
      "Oregon light pollution map centered on the state. The Willamette Valley is the bright corridor. The Oregon Outback sanctuary and the high-desert parks in this snapshot are east and south of Portland.",
    h1: "Oregon light pollution map",
    eyebrow: "OREGON",
    lede: [
      "This Oregon light pollution map is the dark sky Oregon page. Portland and the Willamette Valley hold the state’s brightest band. East of the Cascades the layer is generally darker, which is why the high-desert listings are not interchangeable with a Portland reading.",
    ],
    sections: [
      {
        id: "valley",
        heading: "Willamette Valley and the high desert",
        paragraphs: [
          "Portland, Salem, and Eugene define the bright valley on a statewide view. A dark sky Oregon search that starts in Portland needs a destination, not a zoom-out color.",
          "In this snapshot the places are Antelope (community, 2024), Cottonwood Canyon State Park (park, 2024), Oregon Caves National Monument and Preserve (park, 2024), the Oregon Outback (sanctuary, 2024), Prineville Reservoir State Park (park, 2021), and Sisters (community, 2025). Cottonwood Canyon’s coordinate falls in Oregon, not Washington.",
        ],
      },
      {
        id: "outback",
        heading: "What the Oregon Outback record is",
        paragraphs: [
          "The Oregon Outback is stored as a sanctuary, not as a park and not as a promise that every acre east of the Cascades is equally dark. Sisters is a community west of that sanctuary’s pin, closer to Bend’s region of the map. Click each pin separately.",
          "We do not publish a measured SQM for any of these, and we do not describe road conditions in the Outback.",
        ],
      },
    ],
    faq: [
      {
        question: "Is the Oregon dark sky map only the Outback?",
        answer:
          "The map is the whole state. The Outback is one sanctuary record. The valley is the bright part.",
      },
      {
        question: "Why are several years 2024?",
        answer:
          "That is the designation year stored for those rows. It is not an observation date.",
      },
      {
        question: "Does Sisters mean the town has a wilderness sky?",
        answer:
          "No. Sisters is a community record. Read the place page and click the map.",
      },
      {
        question: "Is there a Washington park in this Oregon list?",
        answer:
          "No. Washington’s own page explains that this snapshot has no pin inside that state.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/washington", label: "Washington light pollution map" },
      { href: "/light-pollution-map/california", label: "California light pollution map" },
    ]),
  },
  michigan: {
    metaTitle: "Michigan Light Pollution Map & Michigan Dark Sky Map",
    metaDescription:
      "Michigan light pollution map centered on the state. Detroit and the southern Lower Peninsula are the bright area. Headlands, Keweenaw, Beaver Island, and Dr. T.K. Lawless County Park are the snapshot listings.",
    h1: "Michigan light pollution map",
    eyebrow: "MICHIGAN",
    lede: [
      "This Michigan light pollution map is the Michigan dark sky map for the same layer. The southern Lower Peninsula, especially around Detroit, is the bright region. The Upper Peninsula and the northwest tip of the Lower Peninsula are where you have to look for a darker click.",
    ],
    sections: [
      {
        id: "south",
        heading: "Southern cities are not the Upper Peninsula",
        paragraphs: [
          "Detroit, Ann Arbor, Lansing, Grand Rapids, and the southern interstate corridors dominate the radiance. A reading there does not describe the Keweenaw.",
          "Chicago-area places such as Palos Preserves fall in Illinois in the polygon test, so they are not Michigan listings even though they are nearby on a regional map.",
        ],
      },
      {
        id: "pins",
        heading: "The four Michigan records in this snapshot",
        paragraphs: [
          "Headlands is a park, year 2011, at the northwest tip of the Lower Peninsula. Dr. T.K. Lawless County Park is a park, year 2019, in the south. Keweenaw Dark Sky Park is a park, year 2022, on the Keweenaw Peninsula. Beaver Island State Wildlife Research Area is a sanctuary, year 2024.",
          "Four records are not a tour plan. Access rules differ, and Beaver Island is an island. This page does not describe ferries, seasons, or a measured sky.",
        ],
      },
    ],
    faq: [
      {
        question: "How many Michigan places are in the snapshot?",
        answer:
          "Four: Headlands, Dr. T.K. Lawless County Park, Keweenaw Dark Sky Park, and Beaver Island State Wildlife Research Area.",
      },
      {
        question: "Is Headlands the same kind of place as a community ordinance?",
        answer:
          "It is stored as a park. The southern metro towns are not in the Michigan list at all.",
      },
      {
        question: "Does this include Door County?",
        answer:
          "No. Newport State Park’s pin falls in Wisconsin. It is on the Wisconsin page.",
      },
      {
        question: "Can the map tell me if the Upper Peninsula is clear?",
        answer:
          "It can show modeled light. Clouds are a different dataset, and the clear-night page is climate history.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/wisconsin", label: "Wisconsin light pollution map" },
      { href: "/light-pollution-map/ohio", label: "Ohio light pollution map" },
    ]),
  },
  arizona: {
    metaTitle: "Arizona Dark Sky Map & Light Pollution Map",
    metaDescription:
      "Arizona dark sky map centered on the state. Phoenix and Tucson are the bright basins. Flagstaff is a Dark Sky Community with year 2001 in this snapshot, which is a lighting record, not a sky-meter reading.",
    h1: "Arizona dark sky map",
    eyebrow: "ARIZONA",
    lede: [
      "This Arizona dark sky map is the light pollution map for Arizona. Phoenix and Tucson are the bright basins. The Colorado Plateau and the southern deserts are different clicks. Flagstaff is in the snapshot as a community, not as a claim that the whole city matches a canyon park.",
    ],
    sections: [
      {
        id: "flagstaff",
        heading: "Flagstaff’s record, and what it is not",
        paragraphs: [
          "Flagstaff, Arizona is stored as a Dark Sky Community with designation year 2001, the earliest year on any Arizona row in this copy. Flagstaff Area National Monuments are a separate park row, year 2016. People search for Flagstaff as a dark sky city because of that community record. The record is a lighting designation. It is not an SQM we measured downtown, and it does not describe Phoenix.",
          "Sedona, Camp Verde, Cottonwood, Big Park / Village of Oak Creek, Fountain Hills, Bisbee, and Tubac are also communities. Fountain Hills and Apache Junction sit in the Phoenix basin. Apache Junction’s row is an urban night sky place, year 2026, for a municipal complex. That is a small site, not a dark region.",
        ],
      },
      {
        id: "parks",
        heading: "Park rows in the snapshot",
        paragraphs: [
          "Grand Canyon National Park (2016), Grand Canyon-Parashant (2014), Petrified Forest (2018), Chiricahua (2021), Organ Pipe Cactus (2026), Oracle State Park (2014), Kartchner Caverns (2017), Pipe Spring (2021), and Tumacácori (2018) are park rows. Saguaro National Park is stored as an urban night sky place, year 2023, not as a park category. We show the stored category instead of “correcting” it.",
          "Organ Pipe’s year is 2026 in this copy. Treat every year as a directory field, then confirm it on the linked page before you repeat it.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Flagstaff listed as a dark sky city?",
        answer:
          "The snapshot lists Flagstaff as a Dark Sky Community, year 2001. “City” in a search usually means that community category. We do not add a ranking or a measured sky.",
      },
      {
        question: "Why is Saguaro not in the park category?",
        answer:
          "Because the snapshot says urban. The official place page is the place to resolve the wording.",
      },
      {
        question: "Does the Grand Canyon pin mean the whole park is one class?",
        answer:
          "No. A park is large. Click the overlook you will use. South Rim facilities and remote north-side points are not the same pixel.",
      },
      {
        question: "Are Phoenix listings dark sites?",
        answer:
          "Fountain Hills and Apache Junction are designations inside a bright basin. Read them as policy records.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/utah", label: "Utah dark sky map" },
      { href: "/light-pollution-map/california", label: "California light pollution map" },
    ]),
  },
  minnesota: {
    metaTitle: "Minnesota Light Pollution Map",
    metaDescription:
      "Minnesota light pollution map centered on the state. The Twin Cities are the bright core. Boundary Waters Canoe Area Wilderness and Voyageurs National Park are the snapshot listings. Quetico is in Canada and is not listed as Minnesota.",
    h1: "Minnesota light pollution map",
    eyebrow: "MINNESOTA",
    lede: [
      "This Minnesota light pollution map opens on Minnesota. The Twin Cities are the bright core; Duluth and the regional cities are smaller bright spots. The north is where the two designated records in this snapshot sit.",
    ],
    sections: [
      {
        id: "north",
        heading: "Two northern records, and one Canadian park that is not Minnesota",
        paragraphs: [
          "Boundary Waters Canoe Area Wilderness is stored as a sanctuary, year 2020. Voyageurs National Park is stored as a park, year 2020. Those are the Minnesota rows.",
          "Quetico Provincial Park is in the broader dataset, and its coordinate falls in Ontario. It is not a Minnesota listing. If you are crossing the border, that is a different park authority and a different page in the directory.",
        ],
      },
      {
        id: "cities",
        heading: "Do not carry a Twin Cities reading north",
        paragraphs: [
          "A click in Minneapolis or St. Paul describes that basin. It does not describe a lake in the Boundary Waters. The wilderness is also not “zero light” by virtue of a sanctuary label. Click the area you will camp, and remember that aurora, clouds, and the Moon are separate from this layer.",
        ],
      },
    ],
    faq: [
      {
        question: "How many Minnesota places are listed?",
        answer: "Two: Boundary Waters Canoe Area Wilderness and Voyageurs National Park.",
      },
      {
        question: "Is the Boundary Waters a measured Bortle 1 site on this page?",
        answer: "No. We do not publish a measured class for it. The map will give an approximate value at the point you click.",
      },
      {
        question: "Why mention Quetico?",
        answer: "Because it is easy to group with the Boundary Waters and it is not in Minnesota in this coordinate test.",
      },
      {
        question: "Does this page include a Minnesota average?",
        answer: "No. We did not compute a state average. The national table is area-weighted and is explained on the US page.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/wisconsin", label: "Wisconsin light pollution map" },
    ]),
  },
  wisconsin: {
    metaTitle: "Wisconsin Light Pollution Map",
    metaDescription:
      "Wisconsin light pollution map centered on the state. Milwaukee and Madison are the bright metros. Newport State Park in Door County is the only Wisconsin place in this DarkSky International snapshot.",
    h1: "Wisconsin light pollution map",
    eyebrow: "WISCONSIN",
    lede: [
      "This Wisconsin light pollution map opens on Wisconsin. The southeast, around Milwaukee, and the Madison area are the bright side. The north is darker on the satellite layer, but this snapshot contains only one designated place in the state.",
    ],
    sections: [
      {
        id: "newport",
        heading: "Newport State Park is the only in-state record",
        paragraphs: [
          "Newport State Park is stored as a park, year 2017. Its coordinate falls in Door County, Wisconsin. It is the only Wisconsin row. Headlands and Keweenaw are in Michigan. We do not borrow them to make this page look fuller.",
          "Door County is not Milwaukee. A night planned for Newport has to be read at Newport. The park’s access rules are on the land manager’s site and the linked place page.",
        ],
      },
      {
        id: "south",
        heading: "The southeast is a metro sky",
        paragraphs: [
          "Milwaukee, Racine, Kenosha, and Madison are ordinary bright cities on this layer. Rural counties between them and Door County are not automatically designated and are not automatically dark. Click the county you mean.",
        ],
      },
    ],
    faq: [
      {
        question: "Why is the Wisconsin list so short?",
        answer:
          "Because the snapshot has one Wisconsin coordinate. A short list is the honest list.",
      },
      {
        question: "Is Door County dark everywhere?",
        answer:
          "No. Newport is one park. The rest of the peninsula still needs a click, and town lights still count.",
      },
      {
        question: "Can I see the Milky Way there?",
        answer:
          "This page does not promise that. Darkness, clouds, and the Moon all have to cooperate. The Milky Way guide explains the difference.",
      },
      {
        question: "Where is the Michigan list?",
        answer: "On the Michigan light pollution map, which has its own four records.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/michigan", label: "Michigan light pollution map" },
      { href: "/light-pollution-map/minnesota", label: "Minnesota light pollution map" },
    ]),
  },
  ohio: {
    metaTitle: "Ohio Light Pollution Map",
    metaDescription:
      "Ohio light pollution map centered on the state. Cleveland, Columbus, and Cincinnati leave little empty land on the layer. Geauga Observatory Park and Fry Family Park are the only Ohio records in this snapshot.",
    h1: "Ohio light pollution map",
    eyebrow: "OHIO",
    lede: [
      "This Ohio light pollution map opens on a state with three large metros and a lot of towns between them. Cleveland, Columbus, and Cincinnati are the bright anchors. An Ohio dark-sky search is usually a search for a pocket, not for an empty state.",
    ],
    sections: [
      {
        id: "metros",
        heading: "Three metros and the land between them",
        paragraphs: [
          "The satellite layer over Ohio is mottled rather than split into one wild half and one urban half. Interstates and county seats keep radiance spread out. Southeastern Ohio is often the less bright part of a statewide view, and “less bright” is still a click, not a class we assign to a region.",
        ],
      },
      {
        id: "two",
        heading: "Two records, different categories",
        paragraphs: [
          "Geauga Observatory Park is stored as a park, year 2011, east of Cleveland. Fry Family Park is stored as an urban night sky place, year 2021. An urban night sky place can be a good lighting project inside a town. It is not a remote sky. We do not add other Ohio observatories that are absent from the snapshot.",
        ],
      },
    ],
    faq: [
      {
        question: "Is Ohio too bright to bother opening the map?",
        answer:
          "No. The differences between a downtown and a rural county still show. They are just smaller than the differences in Utah or west Texas.",
      },
      {
        question: "What places are listed?",
        answer: "Geauga Observatory Park and Fry Family Park. That is the full Ohio set in this copy.",
      },
      {
        question: "Will you add a city page for Cleveland or Columbus?",
        answer: "Not in this set. Search the city on the map and read the point.",
      },
      {
        question: "Is Geauga’s year a measurement?",
        answer: "No. 2011 is the designation year stored with the row.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/michigan", label: "Michigan light pollution map" },
    ]),
  },
  washington: {
    metaTitle: "Washington Light Pollution Map",
    metaDescription:
      "Washington light pollution map centered on the state. The Puget Sound cities are the bright side. This DarkSky International snapshot has no place pin inside Washington. That is a data gap, not a claim that no dark sites exist.",
    h1: "Washington light pollution map",
    eyebrow: "WASHINGTON",
    lede: [
      "This Washington light pollution map opens on Washington state, not on Washington, D.C. Seattle, Tacoma, and the rest of Puget Sound are the bright side. The Olympic Peninsula and the country east of the Cascades look darker on the same layer. Darker is not a designation.",
    ],
    sections: [
      {
        id: "gap",
        heading: "No designated pin falls inside the state in this snapshot",
        paragraphs: [
          "We tested every place coordinate in our DarkSky International copy against state polygons. None land in Washington. Cottonwood Canyon State Park is in Oregon. We will not invent an Olympic or Mount Rainier designation to fill the gap.",
          "If a designation was added after this copy was saved, it will be missing here. Use the linked organization for anything newer, and use the map for the light pattern regardless.",
        ],
      },
      {
        id: "pattern",
        heading: "How to use the map anyway",
        paragraphs: [
          "Click the trailhead or shore you mean. A Seattle click describes Seattle. A click on the outer Olympic coast describes that pixel, still as a model, still without a promise about clouds. The Oregon page next door has the Outback and the other Oregon rows if you are comparing the Northwest.",
          "The Cascades affect weather more than they affect this satellite product. The clear-night climate page is the historical cloud tool. It is not a weekend forecast.",
        ],
      },
    ],
    faq: [
      {
        question: "Are there really no dark sky parks in Washington?",
        answer:
          "This snapshot has none whose coordinates fall in the state. That is not a claim about the future, and it is not a claim that rural Washington is bright.",
      },
      {
        question: "Why does the state still have a page?",
        answer:
          "Because the light pattern is real and the map can be centered correctly. An empty designation list is part of the page, not a reason to fake entries.",
      },
      {
        question: "Is this Washington, D.C.?",
        answer: "No. The view is the Pacific Northwest state.",
      },
      {
        question: "Where are the nearest listed places?",
        answer: "On the Oregon light pollution map. Do not treat them as Washington parks.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/oregon", label: "Oregon light pollution map" },
    ]),
  },
  parks: {
    metaTitle: "Dark Sky Parks, Reserves, Sanctuaries & Communities",
    metaDescription:
      "Directory of dark sky parks and other International Dark Sky Places in this site’s DarkSky International snapshot, with a world map. Categories and years are copied from that snapshot. Tiers are not. Near-me search is the map, not a sorted radius list.",
    h1: "Dark sky parks",
    eyebrow: "DIRECTORY",
    lede: [
      "This is a directory of dark sky parks and the other place types in our snapshot of DarkSky International’s public list: parks, reserves, sanctuaries, communities, and urban night sky places. International dark sky parks and US dark sky parks are both in the list when their coordinates are in the copy.",
      "The map is the dark sky park map. Dots are the snapshot. Color under them is satellite light, not a certification layer.",
    ],
    sections: [
      {
        id: "categories",
        heading: "What the categories mean here",
        paragraphs: [
          "A dark sky park, a dark sky reserve, and a dark sky sanctuary are different rows in the source list. We keep the stored category. A dark sky community is a place with a lighting policy; it can sit in a bright metro. An urban night sky place is a smaller lit-area designation. “Dark sky preserve” and “night sky reserve” in ordinary speech are not extra categories in this dataset. If a row says reserve, it is a reserve. If it does not, we do not relabel it.",
          "A dark sky city search often means a community. Flagstaff is the clearest example in this copy: community, year 2001. Kissimmee Prairie Preserve State Park is the Florida park row, year 2016. Texas and Colorado park questions belong to those state pages as well as to this list.",
        ],
      },
      {
        id: "limits",
        heading: "What this directory refuses to invent",
        paragraphs: [
          "We do not store a silver tier, gold tier, or any other tier. A search for an international dark sky park silver tier has to be answered on the organization’s own page. We also do not have a row named International Dark Sky Discovery Center, so we do not describe one.",
          "“Near me” is not a pre-ranked radius. Use your location on the map, or search a town. The list below is alphabetical within the filter, not sorted by your house. IDA still appears in older writing; the place links we store are on darksky.org.",
          "Best dark sky parks in the United States are not ranked here. A long US list is not an ordering. Click the park and read the modeled light, then check access. National park in a name means the source used that name. We do not audit land status.",
        ],
      },
    ],
    faq: [
      {
        question: "What is a dark sky community?",
        answer:
          "In this snapshot it is a category for a town or district recognized for its lighting policy. It is not a measurement that the night sky there is pristine. Flagstaff’s row is the usual example people mean.",
      },
      {
        question: "Do you show silver-tier international dark sky parks?",
        answer:
          "No. Tiers are not a field in our copy. The place page we link may discuss them. We will not guess.",
      },
      {
        question: "How do I find a dark sky park near me?",
        answer:
          "Use your location or search on the map and look at the dots around that view. This page does not calculate a driving radius.",
      },
      {
        question: "Are all international dark sky places included?",
        answer:
          "Only the ones in this offline snapshot. Newer designations can be missing. The link on each row is the source for that row.",
      },
      {
        question: "Is a dark sky zone the same as a park?",
        answer:
          "We do not map a separate “zone” product. The dots are places. The color is radiance.",
      },
    ],
    related: withLinks(en, [
      { href: "/light-pollution-map/texas", label: "Dark sky parks in Texas" },
      { href: "/light-pollution-map/colorado", label: "Dark sky parks in Colorado" },
      { href: "/light-pollution-map/florida", label: "Kissimmee Prairie and other Florida records" },
      { href: "/light-pollution-map/arizona", label: "Flagstaff and other Arizona records" },
    ]),
  },
  "milky-way": {
    metaTitle: "Where to See the Milky Way",
    metaDescription:
      "Where you can see the Milky Way depends on sky darkness, the Moon, clouds, season, and how high the bright galactic center is. This guide explains that and opens the light pollution map. It does not guarantee a view.",
    h1: "Where to see the Milky Way",
    eyebrow: "GUIDE",
    lede: [
      "Where can you see the Milky Way? From a place where skyglow, moonlight, and clouds are all low enough, and at a time of year when the bright part of the galaxy is above your horizon. There is no single pin that works every night.",
      "This page is the explanation. The map is the lookup. A milky way visibility map, in the sense of a layer that promises the galaxy, is not something this site draws.",
    ],
    sections: [
      {
        id: "need",
        heading: "What has to be true at the same time",
        paragraphs: [
          "You need a dark enough sky, a low Moon, a clear enough night, and the galaxy actually up. Bortle classes 1–3 are the usual descriptions for a detailed Milky Way. This site’s class is an approximate conversion from satellite light, so treat “class 4” at a click as a planning hint. It is not a promise that you will see the galaxy that night.",
          "A best place to view the Milky Way near a city may only mean “less bad than downtown.” Suburban skies often show the brightest stars and still lose the dusty band. If you want the band, plan to move.",
        ],
      },
      {
        id: "season",
        heading: "Season, for mid-northern latitudes",
        paragraphs: [
          "From much of the United States and Europe, the bright center in Sagittarius is a summer-evening object. Winter evenings put a fainter stretch of the Milky Way overhead, through the Orion region. Spring and autumn sit between those. The diagram is a schematic for mid-northern latitudes, not a calendar for the Southern Hemisphere and not a promise for a cloudy week.",
          "The live star map on this site shows where the band is for a date, time, and place you choose. Use it for “is it up?” Use the light pollution map for “is this place bright?” Use a real forecast for clouds. Our clear-sky page only says which months have historically had more clear nights.",
        ],
      },
      {
        id: "photo",
        heading: "Photographs are a different problem",
        paragraphs: [
          "How to view the Milky Way by eye is mostly the list above. How to photo the Milky Way adds a camera, a tripod, and exposure. The location panel on the map includes a simplified exposure calculator. It is calibrated against one published example and labeled as an estimate. It will not tell you the only correct shutter speed, and this page will not invent one.",
          "A viewpoint is the place you clicked, plus a horizon that is not blocked by trees or a stadium. We do not keep a list of scenic pullouts.",
        ],
      },
    ],
    faq: [
      {
        question: "Where can you see the Milky Way near me?",
        answer:
          "Search your town on the map and look for darker land you can actually reach. Then check the Moon and the clouds. Near-me is a trip-planning question, not a coordinate we can assign in advance.",
      },
      {
        question: "Which states are a starting point in the US?",
        answer:
          "The state pages for Utah, Arizona, Texas, Oregon, and the others show the light pattern and the designated places we actually have. They still do not guarantee the galaxy.",
      },
      {
        question: "Is a dark sky park automatically a Milky Way viewpoint?",
        answer:
          "No. A designation is not a weather report, and some community designations are in bright areas.",
      },
      {
        question: "Do you show a milky way visibility map?",
        answer:
          "No dedicated layer. Darkness is the light pollution map. Position in the sky is the star map. Together they are still not a yes for tonight.",
      },
    ],
    related: withLinks(en),
    diagram: {
      kind: "season",
      title: "When the bright Milky Way is highest, mid-northern latitudes",
      caption:
        "Schematic only. Bar height suggests how favorable evening viewing of the bright galactic center tends to be. It is not a photograph and not a forecast.",
      labels: ["Winter", "Spring", "Summer", "Autumn"],
    },
    toolEntry: true,
  },
  "night-sky": {
    metaTitle: "What a Night Sky without Light Pollution Looks Like",
    metaDescription:
      "A night sky without light pollution shows the Milky Way and thousands of stars. Most people live under a brighter sky. This page explains the difference with a schematic Bortle ladder and the map. It is not a photograph and not a zero-light guarantee.",
    h1: "Night sky without light pollution",
    eyebrow: "GUIDE",
    lede: [
      "A night sky without light pollution is the sky astronomers mean by a dark site: the Milky Way as structure, not a hint, and far more stars than a city shows. A sky without light pollution in the strict sense is rare. Satellite maps still see some light almost everywhere people have settled.",
      "This page says what that difference looks like in words. It does not display a fake before-and-after photo.",
    ],
    sections: [
      {
        id: "looks",
        heading: "What the sky looks like as light increases",
        paragraphs: [
          "Under a very dark sky, the Milky Way is obvious on a moonless night and the horizon is not glowing. A suburban night sky usually keeps the bright stars and planets and loses the faint band. A city sky keeps the Moon, the brightest stars, and a gray or orange background. Those are the Bortle scale’s visual steps, from class 1 toward class 9. Our map’s class is a simplified reading of satellite light, so it will not match a careful visual estimate every time.",
          "What would the night sky look like without light pollution from your town? Open the map, click a darker patch you can reach, and compare the approximate class with a click at home. That is a model comparison, not a picture of either sky.",
        ],
      },
      {
        id: "zero",
        heading: "“No light pollution” and “zero” are easy to overclaim",
        paragraphs: [
          "Places with no light pollution, areas with no light pollution, and a zero light pollution sky are phrases people use for the darkest parks. True zero is not what this dataset can certify. Even a dark park can see a distant dome of skyglow. “Little” and “the least” are comparative. Use the map to compare, and use a designated-place page only for the designation.",
          "Low light pollution near me is the same task as the stargazing search: start from where you are, then move. The darkest night sky on Earth is a different question, and this site does not rank it.",
        ],
      },
      {
        id: "ladder",
        heading: "The ladder is a legend, not a photo",
        paragraphs: [
          "The bars use the same kind of discrete colors as the Classic map style, from a dark class toward a bright one. They are not images of light pollution and not photos of a pristine sky. If you need the class definitions, the Bortle scale map keeps the written scale and the interactive map on one URL.",
        ],
      },
    ],
    faq: [
      {
        question: "What does the sky look like without light pollution?",
        answer:
          "On a moonless, clear night at a very dark site, the Milky Way is easy to see and the star field is dense. Most readers do not have that sky at home. The map shows how modeled brightness changes from place to place.",
      },
      {
        question: "Where are places with the least light pollution near me?",
        answer:
          "Use your location on the stargazing page or the map. We will not name a nearest town without that point.",
      },
      {
        question: "Is there a no light pollution map?",
        answer:
          "The light pollution map is the tool. Darker colors are less modeled radiance. There is no layer that marks certified zero.",
      },
      {
        question: "How is this different from the Bortle page?",
        answer:
          "The Bortle page is the class-by-class map. This page is the plain-language description of what those classes are trying to say about the view.",
      },
    ],
    related: withLinks(en),
    diagram: {
      kind: "ladder",
      title: "Schematic Bortle steps from darker to brighter",
      caption:
        "A legend, not a photograph of any sky. Numbers are Bortle classes 1 through 9. The map’s own class at a click is an approximation.",
      labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    },
    toolEntry: true,
  },
  "what-is": {
    metaTitle: "What Is Light Pollution?",
    metaDescription:
      "Light pollution is artificial light that hides the night sky or spills where it is not needed. This page explains skyglow, glare, and light trespass, how this map measures a shortcut, and what it cannot certify.",
    h1: "What is light pollution?",
    eyebrow: "GUIDE",
    lede: [
      "Light pollution is wasted artificial light at night. It brightens the sky, shines into places that did not ask for it, and makes the stars harder to see. Sky pollution and light contamination are the same topic when the search is about the night sky rather than about smoke or water.",
      "A polluted sky over a city is the everyday example. The night sky in the city is usually a bright background plus a handful of stars. That is the experience. The map is how this site compares places. It is not a photograph album.",
    ],
    sections: [
      {
        id: "types",
        heading: "The usual examples",
        paragraphs: [
          "Skyglow is light scattered in the air, the dome over a city. Glare is light so bright it cuts your ability to see. Light trespass is light that crosses onto a property or into a window. Clutter is a crowd of bright signs. Those are the examples of light pollution this page means. The drawing is a schematic, not a picture of a real street.",
          "We do not publish photos of light pollution, pictures, or a gallery. A satellite map is a measurement product, not a camera pointed at the horizon. If you came for images of light pollution, use the map for the pattern and treat any photo you see elsewhere as someone else’s copyrighted picture.",
        ],
      },
      {
        id: "measure",
        heading: "How light pollution is talked about, and what we actually compute",
        paragraphs: [
          "Astronomers sometimes describe a sky by limiting magnitude, the faintest star a person can see. This site does not convert its model into a limiting magnitude. It starts from NOAA VIIRS radiance and applies the simplified logarithmic shortcut documented on the About & Data page, then bins that into a Bortle class. Light pollution measured by limiting magnitude is a different observation. Do not quote our class as if it were one.",
          "The Bortle scale map is where the nine classes are written down. The homepage is the world map. A year in a search, such as a 2025 map, still opens this tool. The annual layer we publish is the 2024 composite described on the data page. We do not relabel it.",
        ],
      },
      {
        id: "reduce",
        heading: "Reduction is local and specific",
        paragraphs: [
          "How to decrease light pollution, in the advice dark-sky programs repeat, means aiming light down, using less of it, and choosing warmer lamps where a white lamp is not required. Dark sky lighting and dark sky compliant fixtures are policy and product phrases. This website does not certify a lamp, a town ordinance, or a “compliant” label.",
          "How to stop light pollution entirely is not a switch this map can throw. Solutions that work are municipal and household decisions. Our job is to show the satellite pattern and to keep the wording shorter than the claim.",
        ],
      },
    ],
    faq: [
      {
        question: "What is light pollution in one sentence?",
        answer:
          "Artificial light that brightens the night sky or spills beyond the task it was installed for.",
      },
      {
        question: "Is sky pollution the same as air pollution?",
        answer:
          "On this site, sky pollution means artificial light in the night sky. Smoke and haze also affect what you see, and they are not this map.",
      },
      {
        question: "Where are the pictures?",
        answer:
          "We do not host comparison photos. The schematic names the types. The map shows the satellite pattern.",
      },
      {
        question: "How do I see the scale?",
        answer:
          "Open the Bortle scale map. The class guide and the interactive map are the same URL.",
      },
    ],
    related: withLinks(en),
    diagram: {
      kind: "types",
      title: "Three kinds of wasted light",
      caption:
        "Schematic diagram of skyglow, glare, and light trespass. Not a photograph and not a before-and-after of any real place.",
      labels: ["Skyglow", "Glare", "Light trespass"],
    },
    toolEntry: true,
  },
};
