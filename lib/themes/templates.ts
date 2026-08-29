import { SlideLayoutType, DataFactItem, TimelineItem, VersusItem, ChecklistItem } from "./layouts";

export interface StoryTemplatePreset {
  id: string;
  name: string;
  category: "News & Politics" | "Editorial & Feature" | "Economy & Tech" | "Travel & Lifestyle" | "Entertainment & Sports";
  badge: string;
  badgeColor: string;
  layoutBadge: string;
  description: string;
  coverImage: string;
  defaultTitle: string;
  defaultExcerpt: string;
  defaultTags: string[];
  layoutType: SlideLayoutType;
  defaultSlides: Array<{
    headingText: string;
    descriptionText: string;
    subheadText?: string;
    badgeText?: string;
    locationDate?: string;
    sourceText?: string;
    quoteAuthor?: string;
    rankNumber?: string;
    backgroundMedia: string;
    backgroundColor: string;
    duration: number;
    hasCta?: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
    statsList?: DataFactItem[];
    timelineList?: TimelineItem[];
    versusData?: VersusItem;
    checklist?: ChecklistItem[];
  }>;
}

export const STORY_TEMPLATES: StoryTemplatePreset[] = [
  // 1. BREAKING BOLD
  {
    id: "usa-breaking-news",
    name: "Breaking News – Bold Edition",
    category: "News & Politics",
    badge: "Urgent News",
    badgeColor: "bg-red-600",
    layoutBadge: "Full-Bleed Scrim",
    description: "Urgent red badge, heavy all-caps headline, location dateline bar, and full-bleed photojournalism.",
    coverImage: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
    defaultTitle: "Massive Wildfire Hits California as Firefighters Battle Blaze",
    defaultExcerpt: "Thousands evacuated across California canyons as high winds fuel rapid wildfire growth.",
    defaultTags: ["breaking", "news", "wildfire", "california"],
    layoutType: "breaking-bold",
    defaultSlides: [
      {
        badgeText: "BREAKING NEWS",
        headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
        descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons under severe dry winds.",
        locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
        backgroundMedia: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
        backgroundColor: "#0c0d12",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "STATE OF EMERGENCY",
        headingText: "Over 50,000 Acres Burned Overnight",
        descriptionText: "Governor issues emergency declaration as gale-force winds complicate air drops and containment lines.",
        locationDate: "JUNE 1, 2024 | TOPANGA CANYON, CA",
        backgroundMedia: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1080&q=80",
        backgroundColor: "#0c0d12",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "EVACUATION MAP",
        headingText: "Emergency Shelters Open Across County",
        descriptionText: "Red Cross stations activated with emergency beds, food supplies, and air filters for residents.",
        locationDate: "JUNE 1, 2024 | LOS ANGELES COUNTY",
        backgroundMedia: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=1080&q=80",
        backgroundColor: "#0c0d12",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Live Evacuation Map",
        ctaUrl: "/stories",
      },
    ],
  },

  // 2. SPLIT SCREEN CARD
  {
    id: "news-explainer-editorial",
    name: "News Explainer – Split Card",
    category: "Editorial & Feature",
    badge: "Ivory Explainer",
    badgeColor: "bg-slate-900",
    layoutBadge: "50/50 Split Card",
    description: "Top 50% framed photo, bottom 50% ivory editorial card with serif headline and red accent divider.",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
    defaultTitle: "What You Need to Know About The New Student Loan Plan",
    defaultExcerpt: "A comprehensive breakdown of the updated federal education repayment guidelines.",
    defaultTags: ["explainer", "education", "policy", "finance"],
    layoutType: "split-screen-card",
    defaultSlides: [
      {
        badgeText: "EXPLAINER",
        headingText: "What You Need to Know About The New Student Loan Plan",
        descriptionText: "The U.S. Department of Education has announced a major update capping monthly payments at 5% of discretionary income.",
        locationDate: "01 / 07",
        backgroundMedia: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
        backgroundColor: "#f7f4ed",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "ELIGIBILITY RULES",
        headingText: "Income Caps Lowered for Working Families",
        descriptionText: "Borrowers earning under $75,000 annually will see payments reduced and unpaid interest forgiven.",
        locationDate: "02 / 07",
        backgroundMedia: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1080&q=80",
        backgroundColor: "#f7f4ed",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "NEXT STEPS",
        headingText: "How to Apply Before the Fall Deadline",
        descriptionText: "Submitting proof of income via the federal student portal takes under 10 minutes with auto-verification.",
        locationDate: "03 / 07",
        backgroundMedia: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&q=80",
        backgroundColor: "#f7f4ed",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Complete Policy Guide",
        ctaUrl: "/stories",
      },
    ],
  },

  // 3. TOP RANK COUNTDOWN
  {
    id: "travel-rank-countdown",
    name: "City Countdown – Giant Numeral",
    category: "Travel & Lifestyle",
    badge: "Top 10 Rank",
    badgeColor: "bg-amber-600",
    layoutBadge: "Giant Rank Numeral",
    description: "Massive translucent outline numeral (01, 02), framed capsule photo, bold rank title and highlight callout.",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80",
    defaultTitle: "Top 10 Hidden Temples & Sanctuaries in Kyoto",
    defaultExcerpt: "From bamboo groves at sunrise to lantern-lit alleys in Gion, discover the spiritual heart of Japan.",
    defaultTags: ["travel", "japan", "kyoto", "top10"],
    layoutType: "top-rank-countdown",
    defaultSlides: [
      {
        rankNumber: "01",
        badgeText: "#1 TOP DESTINATION",
        headingText: "Arashiyama Bamboo Sanctuary",
        subheadText: "MUST-VISIT AT DAWN",
        descriptionText: "Walk through towering emerald bamboo groves at dawn for an unforgettable serene journey.",
        backgroundMedia: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80",
        backgroundColor: "#111827",
        duration: 7,
        hasCta: false,
      },
      {
        rankNumber: "02",
        badgeText: "#2 SACRED SHRINE",
        headingText: "Fushimi Inari Torii Passages",
        subheadText: "10,000 VERMILION GATES",
        descriptionText: "Wind through forested mountain trails framed by thousands of vibrant vermilion gates.",
        backgroundMedia: "https://images.unsplash.com/photo-1478436127897-769e00d2c715?w=1080&q=80",
        backgroundColor: "#111827",
        duration: 8,
        hasCta: true,
        ctaLabel: "View All 10 Destinations",
        ctaUrl: "/stories",
      },
    ],
  },

  // 4. GLASSMORPHISM FLOATING CARD
  {
    id: "tech-glassmorphism",
    name: "Tech Launch – Frosted Glass",
    category: "Economy & Tech",
    badge: "AI Hardware",
    badgeColor: "bg-cyan-600",
    layoutBadge: "Frosted Glass Card",
    description: "Full-bleed background with a central floating frosted glass container, neon cyan accents, and structured specs.",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
    defaultTitle: "Quantum Neural Chip: Next-Gen Architecture Unveiled",
    defaultExcerpt: "Engineers unveil ultra-efficient 3nm processors delivering 100 TOPS on device.",
    defaultTags: ["tech", "ai", "hardware", "quantum"],
    layoutType: "glassmorphism-card",
    defaultSlides: [
      {
        badgeText: "QUANTUM SILICON",
        headingText: "Neural Silicon Architecture Revealed",
        subheadText: "On-Device Multimodal Reasoning",
        descriptionText: "Engineers unveil ultra-efficient 3nm quantum neural processors delivering 100 TOPS without cloud latency.",
        backgroundMedia: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
        backgroundColor: "#050b14",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "BENCHMARKS",
        headingText: "10x Power Efficiency Gains",
        subheadText: "128-Core Neural Cluster",
        descriptionText: "Runs local vision models, voice synthesis, and encryption at just 5 Watts total draw.",
        backgroundMedia: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&q=80",
        backgroundColor: "#050b14",
        duration: 8,
        hasCta: true,
        ctaLabel: "Download Technical Paper",
        ctaUrl: "/stories",
      },
    ],
  },

  // 5. POLAROID RETRO FRAME
  {
    id: "photojournalism-polaroid",
    name: "Photo Dispatch – Polaroid Frame",
    category: "Travel & Lifestyle",
    badge: "Vintage Field",
    badgeColor: "bg-blue-600",
    layoutBadge: "Polaroid Photo Frame",
    description: "Textured paper background, angled Polaroid photo with white border, taped corner, and handwritten dateline.",
    coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
    defaultTitle: "Foggy Morning in San Francisco: Visual Field Dispatch",
    defaultExcerpt: "Witness the maritime Pacific fog rolling through the Golden Gate strait at dawn.",
    defaultTags: ["photography", "san-francisco", "california", "field"],
    layoutType: "polaroid-photo-frame",
    defaultSlides: [
      {
        badgeText: "FIELD DISPATCH",
        headingText: "Foggy Sunrise at Golden Gate",
        descriptionText: "A breathtaking start to the day across Marin Headlands as Pacific maritime fog blankets the bridge.",
        locationDate: "SAN FRANCISCO, CA · MAY 2026",
        backgroundMedia: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
        backgroundColor: "#f4ede4",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "MARITIME LAYER",
        headingText: "Twin Peaks View Above the Clouds",
        descriptionText: "The city skyline pierces through a 500-foot ceiling of cool maritime fog as the sun breaks.",
        locationDate: "TWIN PEAKS · 06:15 AM",
        backgroundMedia: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1080&q=80",
        backgroundColor: "#f4ede4",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Full Photo Gallery",
        ctaUrl: "/stories",
      },
    ],
  },

  // 6. INFOGRAPHIC STATS GRID (2x2)
  {
    id: "economy-infographic-grid",
    name: "Economy & Markets – 2x2 Grid",
    category: "Economy & Tech",
    badge: "Market Data",
    badgeColor: "bg-amber-500",
    layoutBadge: "2x2 Metric Cards Grid",
    description: "Dark navy tech aesthetic with 4 glowing metric cards, colored icons, big numbers, and source line.",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&q=80",
    defaultTitle: "May Jobs Report: Key Economic Highlights & Analysis",
    defaultExcerpt: "Breaking down labor market metrics, unemployment trends, and wage growth figures.",
    defaultTags: ["economy", "jobs", "finance", "markets"],
    layoutType: "infographic-stats-grid",
    defaultSlides: [
      {
        badgeText: "U.S. ECONOMY UPDATE",
        headingText: "May Jobs Report Key Highlights",
        descriptionText: "",
        sourceText: "Source: U.S. Bureau of Labor Statistics",
        backgroundMedia: "",
        backgroundColor: "#070d1d",
        duration: 8,
        hasCta: false,
        statsList: [
          { icon: "users", stat: "272K", label: "Jobs added in May", subtext: "vs. 165K in April" },
          { icon: "trending", stat: "3.9%", label: "Unemployment Rate", subtext: "Unchanged from April" },
          { icon: "dollar", stat: "4.1%", label: "Average Hourly Earnings", subtext: "vs. May 2023" },
          { icon: "briefcase", stat: "8.1M", label: "Job Openings", subtext: "at the end of April" },
        ],
      },
      {
        badgeText: "SECTOR BREAKDOWN",
        headingText: "Top Hiring Industries in Q2",
        descriptionText: "",
        sourceText: "Source: Department of Labor Economic Analysis",
        backgroundMedia: "",
        backgroundColor: "#070d1d",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Complete Market Analysis",
        ctaUrl: "/stories",
        statsList: [
          { icon: "briefcase", stat: "68K", label: "Healthcare & Care", subtext: "+15% year-over-year" },
          { icon: "users", stat: "42K", label: "Government & Public", subtext: "Seasonal municipal roles" },
          { icon: "dollar", stat: "35K", label: "Hospitality & Travel", subtext: "Summer surge hiring" },
          { icon: "trending", stat: "25K", label: "Tech & Professional", subtext: "Stabilizing baseline" },
        ],
      },
    ],
  },

  // 7. CONNECTED TIMELINE
  {
    id: "live-update-timeline",
    name: "Live Tracker – Stepped Timeline",
    category: "News & Politics",
    badge: "Live Timeline",
    badgeColor: "bg-red-500",
    layoutBadge: "Connected Node Timeline",
    description: "Vertical red tracker pipe with pulsing node bullets, timestamps, and real-time live dispatches.",
    coverImage: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1080&q=80",
    defaultTitle: "Severe Weather Tracker: Storms & Tornado Alerts",
    defaultExcerpt: "Minute-by-minute updates as severe storm systems move across the Central Plains.",
    defaultTags: ["weather", "storm", "live", "emergency"],
    layoutType: "connected-timeline",
    defaultSlides: [
      {
        badgeText: "🔴 LIVE UPDATE",
        headingText: "What We Know So Far",
        locationDate: "May 31, 2024",
        descriptionText: "",
        backgroundMedia: "",
        backgroundColor: "#0d0f15",
        duration: 8,
        hasCta: false,
        timelineList: [
          { time: "2:45 PM", text: "Severe storms reported across Texas and Oklahoma." },
          { time: "3:30 PM", text: "Tornado warnings issued for 6 Midwestern states." },
          { time: "4:10 PM", text: "Over 120,000 utility customers without power." },
          { time: "4:45 PM", text: "Emergency rescue operations underway in affected counties." },
        ],
      },
      {
        badgeText: "🔴 LIVE UPDATE",
        headingText: "Evening Radar & Power Grid Status",
        locationDate: "May 31, 2024 · 6:00 PM EST",
        descriptionText: "",
        backgroundMedia: "",
        backgroundColor: "#0d0f15",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Live Radar Map",
        ctaUrl: "/stories",
        timelineList: [
          { time: "5:15 PM", text: "Flight delays top 4 hours at DFW and ORD international hubs." },
          { time: "5:40 PM", text: "Flash flood warnings extended through midnight for river basins." },
          { time: "6:00 PM", text: "National Guard units deployed with sandbags and pumps." },
          { time: "6:30 PM", text: "Governor to deliver emergency live briefing." },
        ],
      },
    ],
  },

  // 8. BIG QUOTE SPOTLIGHT
  {
    id: "opinion-quote-spotlight",
    name: "Pull Quote – Leader Spotlight",
    category: "Editorial & Feature",
    badge: "Op-Ed Opinion",
    badgeColor: "bg-stone-700",
    layoutBadge: "Big Pull Quote + Avatar",
    description: "Giant quotation marks, circular author portrait with gradient border, huge italic statement, and bio badge.",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
    defaultTitle: "Why The Future of Great Cities Belongs to Pedestrians",
    defaultExcerpt: "Reclaiming downtown avenues from vehicles is not an urban dream—it is an economic necessity.",
    defaultTags: ["opinion", "urbanism", "cities", "culture"],
    layoutType: "big-quote-spotlight",
    defaultSlides: [
      {
        badgeText: "OP-ED THOUGHT LEADERSHIP",
        headingText: "The future of great cities belongs to pedestrians, not cars.",
        quoteAuthor: "David Brooks · Senior Editorial Columnist",
        descriptionText: "When streets are designed for human connection rather than vehicle speed, community commerce and public safety soar.",
        backgroundMedia: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
        backgroundColor: "#18181b",
        duration: 8,
        hasCta: false,
      },
      {
        badgeText: "URBAN COMMERCE",
        headingText: "Foot traffic increases retail spending by 40% in pedestrianized zones.",
        quoteAuthor: "Urban Land Institute Report",
        descriptionText: "Cities around the globe are transforming noisy highways into lush parks and thriving commercial promenades.",
        backgroundMedia: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&q=80",
        backgroundColor: "#18181b",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Full Op-Ed Column",
        ctaUrl: "/stories",
      },
    ],
  },

  // 9. VERSUS COMPARISON SHOWDOWN
  {
    id: "tech-versus-showdown",
    name: "Tech Showdown – A vs B Comparison",
    category: "Economy & Tech",
    badge: "Head-to-Head",
    badgeColor: "bg-indigo-600",
    layoutBadge: "Side-by-Side Dual Cards",
    description: "Dual side-by-side comparison cards with glowing center 'VS' circle, stat badges, and pros/cons showdown.",
    coverImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&q=80",
    defaultTitle: "Quantum Neural Chip vs Legacy GPU: The AI Silicon Battle",
    defaultExcerpt: "Benchmarking power efficiency, latency, and on-device inference speed across architectures.",
    defaultTags: ["tech", "ai", "hardware", "versus"],
    layoutType: "versus-comparison",
    defaultSlides: [
      {
        badgeText: "HEAD-TO-HEAD BENCHMARK",
        headingText: "Quantum Neural vs Traditional GPU",
        subheadText: "Next-Gen AI Hardware Showdown",
        descriptionText: "Comparing efficiency, latency, and local compute limits across modern microarchitectures.",
        backgroundMedia: "",
        backgroundColor: "#09090b",
        duration: 8,
        hasCta: false,
        versusData: {
          nameA: "Quantum Neural",
          statA: "100 TOPS",
          labelA: "5W Power · 0ms Cloud",
          nameB: "Legacy GPU",
          statB: "45 TOPS",
          labelB: "35W Power · Cloud Lag",
        },
      },
      {
        badgeText: "THERMAL & COST SHOWDOWN",
        headingText: "Thermal Throttling & Price",
        subheadText: "Sustained Heavy Workloads",
        descriptionText: "Quantum chips maintain peak clock speeds without liquid cooling setups.",
        backgroundMedia: "",
        backgroundColor: "#09090b",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Full Benchmark Breakdown",
        ctaUrl: "/stories",
        versusData: {
          nameA: "Quantum Neural",
          statA: "42°C Peak",
          labelA: "Fanless Passive Cooling",
          nameB: "Legacy GPU",
          statB: "84°C Peak",
          labelB: "Requires Dual Fans",
        },
      },
    ],
  },

  // 10. MAGAZINE EDITORIAL CUTOUT
  {
    id: "entertainment-vogue-magazine",
    name: "Fashion Magazine – Editorial Cutout",
    category: "Entertainment & Sports",
    badge: "Vogue Style",
    badgeColor: "bg-purple-600",
    layoutBadge: "Multi-Layer Magazine",
    description: "Oversized serif celebrity title overlapping portrait photo, rotated issue text, and elegant swipe CTA.",
    coverImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
    defaultTitle: "Zendaya: Inside the Making of the Autumn Blockbuster",
    defaultExcerpt: "An exclusive behind-the-scenes look at the upcoming cinematic release.",
    defaultTags: ["entertainment", "celebrity", "movies", "culture"],
    layoutType: "magazine-cutout",
    defaultSlides: [
      {
        badgeText: "VOGUE EXCLUSIVE",
        headingText: "Zendaya",
        subheadText: "Stars in Autumn Cinematic Masterpiece",
        descriptionText: "An intimate look into the physical transformation and desert filming behind the year's most anticipated film.",
        locationDate: "ISSUE 48 · AUTUMN EDITION",
        backgroundMedia: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
        backgroundColor: "#0a060e",
        duration: 8,
        hasCta: true,
        ctaLabel: "Swipe Up for Full Interview",
        ctaUrl: "/stories",
      },
      {
        badgeText: "DIRECTOR'S VISION",
        headingText: "Filmed in 70mm IMAX",
        subheadText: "Mastering Scale and Emotion",
        descriptionText: "Director praises the lead star's raw intensity across unsparing remote desert locations.",
        locationDate: "BEHIND THE SCENES",
        backgroundMedia: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080&q=80",
        backgroundColor: "#0a060e",
        duration: 8,
        hasCta: true,
        ctaLabel: "Watch Exclusive Clip",
        ctaUrl: "/stories",
      },
    ],
  },

  // 11. RECIPE & STEP-BY-STEP CHECKLIST
  {
    id: "culinary-recipe-checklist",
    name: "Gourmet Guide – Step Checklist",
    category: "Travel & Lifestyle",
    badge: "Michelin Guide",
    badgeColor: "bg-rose-700",
    layoutBadge: "Step-by-Step Checklist",
    description: "Compact top photo, numbered step pill, bulleted instruction checklist, and Chef's Pro-Tip box.",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
    defaultTitle: "Wood-Fired Tagliolini with White Truffles: Chef Masterclass",
    defaultExcerpt: "Hand-rolled tagliolini with white truffles paired alongside dry-aged heritage butter.",
    defaultTags: ["food", "culinary", "michelin", "recipe"],
    layoutType: "recipe-step-card",
    defaultSlides: [
      {
        badgeText: "STEP 01 OF 03",
        headingText: "Tagliolini with White Truffles",
        subheadText: "Prep: 15m · Cook: 8m",
        descriptionText: "Emulsify cultured French butter with starchy pasta water over low flame until glossy.",
        backgroundMedia: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
        backgroundColor: "#160d09",
        duration: 8,
        hasCta: false,
        checklist: [
          { step: "01", text: "Boil fresh pasta for exactly 90 seconds in salted water." },
          { step: "02", text: "Swirl French butter with starchy water to form emulsion." },
          { step: "03", text: "Plate immediately and finish with hand-shaved Alba truffles." },
        ],
      },
      {
        badgeText: "CHEF'S WINE PAIRING",
        headingText: "2018 Barolo Riserva Pairing",
        subheadText: "Piedmont, Italy",
        descriptionText: "The earthy mushroom notes of aged Nebbiolo elevate the pungent fragrance of fresh white truffles.",
        backgroundMedia: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80",
        backgroundColor: "#160d09",
        duration: 8,
        hasCta: true,
        ctaLabel: "Download Full Recipe PDF",
        ctaUrl: "/stories",
      },
    ],
  },

  // 12. SPORTS SCOREBOARD & MVP
  {
    id: "sports-game-scoreboard",
    name: "Sports Finals – Jumbotron Scoreboard",
    category: "Entertainment & Sports",
    badge: "Game 7 Finals",
    badgeColor: "bg-orange-600",
    layoutBadge: "Stadium Scoreboard + MVP",
    description: "Top scoreboard jumbotron box (LAL 114 - 108 BOS), athlete photo, and bottom MVP stat line.",
    coverImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80",
    defaultTitle: "Championship Victory in Overtime: Epic Game 7 Thriller",
    defaultExcerpt: "A dramatic 3-pointer with 4.2 seconds remaining in overtime seals an unforgettable victory.",
    defaultTags: ["sports", "basketball", "finals", "nba"],
    layoutType: "sports-scoreboard",
    defaultSlides: [
      {
        badgeText: "FINAL SCORE · OT",
        headingText: "Championship Victory in Overtime",
        subheadText: "LAL 114 — 108 BOS",
        descriptionText: "A clutch 3-pointer with 4.2 seconds remaining in overtime seals an unforgettable Game 7 championship victory.",
        backgroundMedia: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80",
        backgroundColor: "#0a0d18",
        duration: 7,
        hasCta: false,
        statsList: [
          { stat: "44", label: "Points" },
          { stat: "12", label: "Rebounds" },
          { stat: "8", label: "Assists" },
        ],
      },
      {
        badgeText: "CHAMPIONSHIP TROPHY",
        headingText: "Franchise 18th Banner Raised",
        subheadText: "Historic Playoff Run",
        descriptionText: "The team celebrates on home court before 19,000 cheering fans after a grueling 7-game battle.",
        backgroundMedia: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1080&q=80",
        backgroundColor: "#0a0d18",
        duration: 8,
        hasCta: true,
        ctaLabel: "Watch Trophy Presentation",
        ctaUrl: "/stories",
      },
    ],
  },
];

export function getStoryTemplateById(templateId: string): StoryTemplatePreset {
  return (
    STORY_TEMPLATES.find((t) => t.id === templateId) || STORY_TEMPLATES[0]
  );
}
