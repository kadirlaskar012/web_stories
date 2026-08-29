import { SlideLayoutType, DataFactItem, TimelineItem } from "./layouts";

export interface StoryTemplatePreset {
  id: string;
  name: string;
  category: "News & Politics" | "Editorial & Feature" | "Economy & Tech" | "Travel & Lifestyle" | "Entertainment & Sports";
  badge: string;
  badgeColor: string;
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
    backgroundMedia: string;
    backgroundColor: string;
    duration: number;
    hasCta?: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
    statsList?: DataFactItem[];
    timelineList?: TimelineItem[];
  }>;
}

export const STORY_TEMPLATES: StoryTemplatePreset[] = [
  // 1. BREAKING NEWS – BOLD
  {
    id: "usa-breaking-news",
    name: "Breaking News – Bold Edition",
    category: "News & Politics",
    badge: "Breaking Urgent",
    badgeColor: "bg-red-600",
    description: "High-impact urgent breaking news with red badge, bold all-caps headlines, location line, and dramatic photojournalism.",
    coverImage: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
    defaultTitle: "Massive Wildfire Hits California as Firefighters Battle Blaze",
    defaultExcerpt: "Thousands evacuated across California canyons as high winds fuel rapid wildfire growth.",
    defaultTags: ["breaking", "news", "wildfire", "california"],
    layoutType: "breaking-news",
    defaultSlides: [
      {
        badgeText: "BREAKING NEWS",
        headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
        descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons",
        locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
        backgroundMedia: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
        backgroundColor: "#0c0d12",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "BREAKING NEWS",
        headingText: "Over 50,000 Acres Burned Overnight",
        descriptionText: "Governor issues state of emergency declaration as gale-force winds complicate air drops.",
        locationDate: "JUNE 1, 2024 | TOPANGA CANYON, CA",
        backgroundMedia: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1080&q=80",
        backgroundColor: "#0c0d12",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "EVACUATION MAP",
        headingText: "Emergency Shelters Open Across County",
        descriptionText: "Red Cross stations activated with emergency beds, food supplies, and air filters.",
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

  // 2. NEWS EXPLAINER – EDITORIAL
  {
    id: "news-explainer-editorial",
    name: "News Explainer – Ivory Editorial",
    category: "Editorial & Feature",
    badge: "In-Depth Explainer",
    badgeColor: "bg-slate-900",
    description: "Classic American digital magazine aesthetic with cream background, serif typography, red accent bar, and framed photography.",
    coverImage: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
    defaultTitle: "What You Need to Know About The New Student Loan Plan",
    defaultExcerpt: "A comprehensive breakdown of the updated federal education repayment guidelines.",
    defaultTags: ["explainer", "education", "policy", "finance"],
    layoutType: "news-explainer",
    defaultSlides: [
      {
        badgeText: "EXPLAINER",
        headingText: "What You Need to Know About The New Student Loan Plan",
        descriptionText: "The U.S. Department of Education has announced a major update to the student loan forgiveness program.",
        backgroundMedia: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
        backgroundColor: "#f7f4ed",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "KEY CHANGE",
        headingText: "Income Caps Lowered for Working Families",
        descriptionText: "Borrowers earning under $75,000 annually will see monthly payments capped at 5% of discretionary income.",
        backgroundMedia: "https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1080&q=80",
        backgroundColor: "#f7f4ed",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "NEXT STEPS",
        headingText: "How to Apply Before the Fall Deadline",
        descriptionText: "Submitting proof of income via the federal student portal takes under 10 minutes with auto-verification.",
        backgroundMedia: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1080&q=80",
        backgroundColor: "#f7f4ed",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Complete Policy Guide",
        ctaUrl: "/stories",
      },
    ],
  },

  // 3. PHOTO NEWS – IMMERSIVE
  {
    id: "photojournalism-immersive",
    name: "Photo News – Immersive Essay",
    category: "Travel & Lifestyle",
    badge: "Visual Essay",
    badgeColor: "bg-blue-600",
    description: "Full-bleed 9:16 photojournalism with minimal UI, small category pill, and elegant lower-third storytelling caption.",
    coverImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
    defaultTitle: "Foggy Morning in San Francisco: Visual Dispatch",
    defaultExcerpt: "Witness the maritime Pacific fog rolling through the Golden Gate strait at dawn.",
    defaultTags: ["photography", "san-francisco", "california", "travel"],
    layoutType: "photo-news",
    defaultSlides: [
      {
        badgeText: "U.S. NEWS",
        headingText: "Foggy Morning in San Francisco",
        descriptionText: "A breathtaking start to the day across the Bay Area as maritime fog blankets the bridge.",
        backgroundMedia: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
        backgroundColor: "#000000",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "PACIFIC COAST",
        headingText: "The Marine Layer at Marin Headlands",
        descriptionText: "Cool ocean air collides with inland valley heat, creating nature's most iconic meteorological spectacle.",
        backgroundMedia: "https://images.unsplash.com/photo-1506146332389-18140dc7b2fb?w=1080&q=80",
        backgroundColor: "#000000",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "EXPLORE",
        headingText: "Golden Hour Over Twin Peaks",
        descriptionText: "Sunset illuminates the coastal ridge as downtown towers emerge from the low-lying clouds.",
        backgroundMedia: "https://images.unsplash.com/photo-1449034446853-66c86144b0ad?w=1080&q=80",
        backgroundColor: "#000000",
        duration: 8,
        hasCta: true,
        ctaLabel: "View High-Res Photo Gallery",
        ctaUrl: "/stories",
      },
    ],
  },

  // 4. DATA / FACTS – INFOGRAPHIC
  {
    id: "economy-infographic-data",
    name: "Data / Facts – Economy & Markets",
    category: "Economy & Tech",
    badge: "Data & Charts",
    badgeColor: "bg-amber-500",
    description: "Dark navy professional backdrop with 4 structured metric cards, custom icons, big numbers, and official source cite.",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&q=80",
    defaultTitle: "May Jobs Report: Key Economic Highlights & Analysis",
    defaultExcerpt: "Breaking down labor market metrics, unemployment trends, and wage growth figures.",
    defaultTags: ["economy", "jobs", "finance", "markets"],
    layoutType: "data-facts",
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
        headingText: "Top Hiring Industries",
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

  // 5. LIVE UPDATE – TIMELINE
  {
    id: "live-update-chronology",
    name: "Live Update – Real-Time Timeline",
    category: "News & Politics",
    badge: "Live Chronology",
    badgeColor: "bg-red-500",
    description: "Chronological live tracker with pulsing red indicator, timestamped bullet nodes, and real-time dispatch entries.",
    coverImage: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=1080&q=80",
    defaultTitle: "Severe Weather Tracker: Storms & Tornado Alerts",
    defaultExcerpt: "Minute-by-minute updates as severe storm systems move across the Central Plains.",
    defaultTags: ["weather", "storm", "live", "emergency"],
    layoutType: "live-update",
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
          { time: "2:45 PM", text: "Severe storms reported in Texas and Oklahoma." },
          { time: "3:30 PM", text: "Tornado warnings issued for 6 states." },
          { time: "4:10 PM", text: "Over 120,000 customers without power." },
          { time: "4:45 PM", text: "Rescue operations underway in affected areas." },
        ],
      },
      {
        badgeText: "🔴 LIVE UPDATE",
        headingText: "Evening Storm Tracker & Advisories",
        locationDate: "May 31, 2024 · 6:00 PM EST",
        descriptionText: "",
        backgroundMedia: "",
        backgroundColor: "#0d0f15",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Live Radar Feed",
        ctaUrl: "/stories",
        timelineList: [
          { time: "5:15 PM", text: "Airport delays top 4 hours at DFW and ORD." },
          { time: "5:40 PM", text: "Flash flood warnings extended through midnight." },
          { time: "6:00 PM", text: "National Guard units deployed with sandbags." },
          { time: "6:30 PM", text: "Governor to deliver emergency televised briefing." },
        ],
      },
    ],
  },

  // 6. ENTERTAINMENT – MAGAZINE
  {
    id: "entertainment-glamour",
    name: "Entertainment – Magazine Spotlight",
    category: "Entertainment & Sports",
    badge: "Culture & Style",
    badgeColor: "bg-purple-600",
    description: "Sleek dark backdrop, purple accents, stylish magazine typography, celebrity portrait, and Swipe Up for Details CTA.",
    coverImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
    defaultTitle: "Zendaya: Inside the Making of the Autumn Blockbuster",
    defaultExcerpt: "An exclusive behind-the-scenes look at the upcoming cinematic release.",
    defaultTags: ["entertainment", "celebrity", "movies", "culture"],
    layoutType: "entertainment-magazine",
    defaultSlides: [
      {
        badgeText: "ENTERTAINMENT",
        headingText: "Zendaya",
        subheadText: "Stars in New Blockbuster Movie",
        descriptionText: "Everything we know about the highly anticipated film hitting theaters this autumn.",
        backgroundMedia: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
        backgroundColor: "#0a060e",
        duration: 8,
        hasCta: true,
        ctaLabel: "Swipe Up for Details",
        ctaUrl: "/stories",
      },
      {
        badgeText: "BEHIND THE SCENES",
        headingText: "Filmed in 70mm IMAX",
        subheadText: "Directorial Vision Revealed",
        descriptionText: "Director praises the lead star's transformational physical performance across desert sets.",
        backgroundMedia: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1080&q=80",
        backgroundColor: "#0a060e",
        duration: 8,
        hasCta: true,
        ctaLabel: "Watch Official Teaser Trailer",
        ctaUrl: "/stories",
      },
    ],
  },

  // 7. TECH LAUNCH & GADGET SPOTLIGHT
  {
    id: "tech-spotlight-silicon",
    name: "Tech Launch – Silicon Cyber",
    category: "Economy & Tech",
    badge: "Hardware Reveal",
    badgeColor: "bg-cyan-600",
    description: "Electric cyan cyber aesthetic with processor specs pill, dark carbon background, and futuristic AI gadget presentation.",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
    defaultTitle: "Next-Gen Quantum Neural Chip Announced at Tech Summit",
    defaultExcerpt: "Engineers unveil revolutionary silicon architecture capable of on-device multimodal reasoning.",
    defaultTags: ["tech", "ai", "hardware", "chips"],
    layoutType: "tech-spotlight",
    defaultSlides: [
      {
        badgeText: "HARDWARE REVEAL",
        headingText: "Next-Gen Quantum Neural Chip",
        subheadText: "3nm Architecture • 45% Lower Power",
        descriptionText: "Engineers unveil revolutionary microchip capable of running multimodal AI on device without cloud dependency.",
        backgroundMedia: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
        backgroundColor: "#050b14",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "BENCHMARK PERFORMANCE",
        headingText: "100 Trillion Operations Per Sec",
        subheadText: "128-Core Neural Engine",
        descriptionText: "Unmatched performance across local computer vision, voice synthesis, and real-time encryption tasks.",
        backgroundMedia: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&q=80",
        backgroundColor: "#050b14",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Architecture Whitepaper",
        ctaUrl: "/stories",
      },
    ],
  },

  // 8. INVESTIGATIVE REPORT & SPECIAL DISPATCH
  {
    id: "investigative-deep-dive",
    name: "Investigative – Special Dispatch",
    category: "Editorial & Feature",
    badge: "Special Investigation",
    badgeColor: "bg-red-700",
    description: "Dramatic monochrome investigative aesthetic, confidential badge, stark typography, and deep-dive journalism.",
    coverImage: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&q=80",
    defaultTitle: "The Secret Water Pipeline of the Mojave Desert",
    defaultExcerpt: "A 6-month investigative probe reveals covert industrial aquifers altering desert ecosystems.",
    defaultTags: ["investigation", "environment", "california", "water"],
    layoutType: "investigative-report",
    defaultSlides: [
      {
        badgeText: "SPECIAL INVESTIGATION",
        headingText: "The Secret Water Pipeline of the Mojave",
        descriptionText: "A 6-month investigative probe reveals covert industrial aquifers altering desert ecosystems.",
        locationDate: "SPECIAL DISPATCH | LAS VEGAS, NV",
        backgroundMedia: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&q=80",
        backgroundColor: "#0b0c10",
        duration: 8,
        hasCta: false,
      },
      {
        badgeText: "CONFIDENTIAL LEAK",
        headingText: "Millions of Gallons Siphoned Annually",
        descriptionText: "Satellite thermal imagery uncovers unpermitted extraction wells draining public groundwater reserves.",
        locationDate: "DOCUMENT ARCHIVE · DESERT CENTER",
        backgroundMedia: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1080&q=80",
        backgroundColor: "#0b0c10",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Leaked Satellite Evidence",
        ctaUrl: "/stories",
      },
    ],
  },

  // 9. SPORTS BULLETIN & MATCH NIGHT
  {
    id: "sports-bulletin-game-night",
    name: "Sports Bulletin – Game Night",
    category: "Entertainment & Sports",
    badge: "Match Finals",
    badgeColor: "bg-orange-600",
    description: "High-energy athletic bold typography, game score box e.g. LAL 114 - 108 BOS, MVP spotlight, and court action.",
    coverImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80",
    defaultTitle: "Championship Victory in Overtime: Epic Game 7 Thriller",
    defaultExcerpt: "A dramatic 3-pointer with 4.2 seconds remaining seals the Eastern Conference championship.",
    defaultTags: ["sports", "basketball", "finals", "nba"],
    layoutType: "sports-bulletin",
    defaultSlides: [
      {
        badgeText: "FINAL SCORE",
        headingText: "Championship Victory in Overtime",
        subheadText: "LAL 114 — 108 BOS",
        descriptionText: "A dramatic 3-pointer with 4.2 seconds remaining seals the Eastern Conference championship thriller.",
        backgroundMedia: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80",
        backgroundColor: "#0a0d18",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "FINALS MVP",
        headingText: "44 Points, 12 Rebounds, 8 Assists",
        subheadText: "Historic Playoff Performance",
        descriptionText: "Captain delivers the most dominant Game 7 display in franchise history before home crowd.",
        backgroundMedia: "https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=1080&q=80",
        backgroundColor: "#0a0d18",
        duration: 8,
        hasCta: true,
        ctaLabel: "Watch Game Highlights",
        ctaUrl: "/stories",
      },
    ],
  },

  // 10. OPINION & OP-ED COLUMN
  {
    id: "opinion-column-op-ed",
    name: "Opinion – Op-Ed Columnist",
    category: "Editorial & Feature",
    badge: "Thought Leadership",
    badgeColor: "bg-stone-700",
    description: "Oversized decorative quotation marks, author headshot badge, warm parchment styling, and provocative ideas.",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
    defaultTitle: "Why The Future of Great Cities Belongs to Pedestrians",
    defaultExcerpt: "Reclaiming downtown avenues from vehicles is not an urban dream—it is an economic necessity.",
    defaultTags: ["opinion", "urbanism", "cities", "culture"],
    layoutType: "opinion-column",
    defaultSlides: [
      {
        badgeText: "OP-ED COLUMN",
        headingText: "Why The Future of Cities Belongs to Pedestrians",
        quoteAuthor: "David Brooks · Senior Editorial Columnist",
        descriptionText: "Reclaiming downtown avenues from vehicles is not just an urban dream—it is an economic revitalization imperative.",
        backgroundMedia: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
        backgroundColor: "#f4efe6",
        duration: 8,
        hasCta: false,
      },
      {
        badgeText: "URBAN METRICS",
        headingText: "Foot Traffic Boosts Local Retail by 40%",
        quoteAuthor: "Urban Land Institute Report",
        descriptionText: "When streets are designed for human interaction rather than speed, community commerce flourishes.",
        backgroundMedia: "https://images.unsplash.com/photo-1477959858617-67f30bc75b82?w=1080&q=80",
        backgroundColor: "#f4efe6",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Full Column & Discussion",
        ctaUrl: "/stories",
      },
    ],
  },

  // 11. TRAVEL & WANDERLUST GUIDE
  {
    id: "travel-wanderlust-guide",
    name: "Travel – Wanderlust Guide",
    category: "Travel & Lifestyle",
    badge: "City Guide",
    badgeColor: "bg-amber-600",
    description: "Warm terracotta & golden sunset vibe with destination badge, curated stop numbers, and scenic photography.",
    coverImage: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80",
    defaultTitle: "48 Hours in Kyoto: Ancient Temples & Secret Tea Gardens",
    defaultExcerpt: "From bamboo groves at sunrise to lantern-lit alleys in Gion, discover the spiritual heart of Japan.",
    defaultTags: ["travel", "japan", "kyoto", "culture"],
    layoutType: "travel-guide",
    defaultSlides: [
      {
        badgeText: "CITY GUIDE",
        headingText: "48 Hours in Kyoto: Temples & Tea Gardens",
        subheadText: "HIGASHIYAMA DISTRICT",
        descriptionText: "From bamboo groves at sunrise to lantern-lit alleys in Gion, discover the spiritual heart of Japan.",
        backgroundMedia: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80",
        backgroundColor: "#1c130d",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "MORNING RITUAL",
        headingText: "Sunrise at Fushimi Inari Taisha",
        subheadText: "10,000 Vermilion Torii Gates",
        descriptionText: "Arrive at dawn to walk the quiet mountain trails before the crowds fill the ancient shrine passages.",
        backgroundMedia: "https://images.unsplash.com/photo-1478436127897-769e00d2c715?w=1080&q=80",
        backgroundColor: "#1c130d",
        duration: 8,
        hasCta: true,
        ctaLabel: "Download Complete 48h Itinerary",
        ctaUrl: "/stories",
      },
    ],
  },

  // 12. FINANCE & MARKET MOVER
  {
    id: "finance-market-mover",
    name: "Finance – Market Mover",
    category: "Economy & Tech",
    badge: "Wall Street Movers",
    badgeColor: "bg-emerald-600",
    description: "Emerald green ticker pulse, dark carbon background, stock index metrics, and Wall Street insight.",
    coverImage: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&q=80",
    defaultTitle: "Tech Rally Drives S&P 500 to All-Time Record High",
    defaultExcerpt: "Semiconductor earnings beat analyst estimates by 30%, igniting a global equities surge.",
    defaultTags: ["finance", "stocks", "wall-street", "markets"],
    layoutType: "finance-market",
    defaultSlides: [
      {
        badgeText: "MARKET MOVERS",
        headingText: "Tech Rally Drives S&P 500 to All-Time Record",
        subheadText: "+2.4% NASDAQ • S&P 5,500",
        descriptionText: "Semiconductor earnings beat analyst estimates by 30%, igniting a global equities surge.",
        backgroundMedia: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&q=80",
        backgroundColor: "#06100d",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "RATE OUTLOOK",
        headingText: "Federal Reserve Signals Rate Reductions",
        subheadText: "Inflation Cools to 2.8% Baseline",
        descriptionText: "Bond yields tumble as central bankers indicate potential easing at the upcoming autumn meeting.",
        backgroundMedia: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1080&q=80",
        backgroundColor: "#06100d",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Wall Street Daily Digest",
        ctaUrl: "/stories",
      },
    ],
  },

  // 13. SCIENCE & NATURE DISCOVERY
  {
    id: "science-nature-discovery",
    name: "Science – Breakthrough Discovery",
    category: "Economy & Tech",
    badge: "Science & Nature",
    badgeColor: "bg-teal-600",
    description: "Teal & mint discovery palette, scientific fact badge, micro-lens imagery, and peer-reviewed summary.",
    coverImage: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&q=80",
    defaultTitle: "Deep Ocean Species Discovered at 8,000m Trench",
    defaultExcerpt: "Marine biologists catalog bioluminescent organisms thriving under extreme ocean trench pressures.",
    defaultTags: ["science", "ocean", "biology", "discovery"],
    layoutType: "science-discovery",
    defaultSlides: [
      {
        badgeText: "NATURE & SCIENCE",
        headingText: "Deep Ocean Species Discovered at 8,000m",
        descriptionText: "Marine biologists catalog bioluminescent organisms thriving under extreme hydrothermal pressures.",
        sourceText: "Published in Nature Geoscience",
        backgroundMedia: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&q=80",
        backgroundColor: "#041417",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "GENETIC SECRETS",
        headingText: "Proteins Resistant to Extreme Pressure",
        descriptionText: "Newly mapped cellular structures offer promising avenues for biomedical temperature stabilization.",
        sourceText: "Scripps Institution of Oceanography",
        backgroundMedia: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80",
        backgroundColor: "#041417",
        duration: 8,
        hasCta: true,
        ctaLabel: "Read Journal Publication",
        ctaUrl: "/stories",
      },
    ],
  },

  // 14. CULINARY & GOURMET REVIEW
  {
    id: "culinary-gourmet-review",
    name: "Culinary – Gourmet Review",
    category: "Travel & Lifestyle",
    badge: "Food & Wine",
    badgeColor: "bg-rose-700",
    description: "Warm gourmet tones, 5-star rating badge, dish highlights, chef quotation, and mouthwatering photography.",
    coverImage: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
    defaultTitle: "Tasting Menu at L’Atelier: Wood-Fired Culinary Mastery",
    defaultExcerpt: "Hand-rolled tagliolini with white truffles paired alongside dry-aged heritage beef in Napa Valley.",
    defaultTags: ["food", "culinary", "michelin", "wine"],
    layoutType: "culinary-review",
    defaultSlides: [
      {
        badgeText: "MICHELIN GUIDE ★★★",
        headingText: "Tasting Menu at L’Atelier",
        subheadText: "Chef Marco Pierre · Napa Valley",
        descriptionText: "Hand-rolled tagliolini with white truffles paired alongside dry-aged heritage beef in Napa Valley.",
        backgroundMedia: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
        backgroundColor: "#160d09",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "SIGNATURE DISH",
        headingText: "Wood-Smoked Black Cod with Yuzu Miso",
        subheadText: "Course 5 of 9",
        descriptionText: "Glazed for 48 hours over binchotan charcoal and garnished with wild mountain sea herbs.",
        backgroundMedia: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1080&q=80",
        backgroundColor: "#160d09",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Full Tasting Menu",
        ctaUrl: "/stories",
      },
    ],
  },

  // 15. CLIMATE & EARTH PULSE
  {
    id: "climate-earth-pulse",
    name: "Climate – Earth Pulse",
    category: "News & Politics",
    badge: "Planet Pulse",
    badgeColor: "bg-emerald-800",
    description: "Forest green & dark slate, satellite aerial photography, global temperature metric, and urgent environmental call.",
    coverImage: "https://images.unsplash.com/photo-1516900557549-41557d405adf?w=1080&q=80",
    defaultTitle: "Arctic Ice Melt Reaches Critical Threshold in Summer Survey",
    defaultExcerpt: "Glaciologists record record summer retreat across Greenland ice sheet as ocean temperatures rise.",
    defaultTags: ["climate", "earth", "environment", "science"],
    layoutType: "climate-pulse",
    defaultSlides: [
      {
        badgeText: "PLANET PULSE",
        headingText: "Arctic Ice Melt Reaches Critical Threshold",
        subheadText: "Polar Satellite Observation Data",
        descriptionText: "Glaciologists record record summer retreat across Greenland ice sheet as ocean temperatures rise.",
        backgroundMedia: "https://images.unsplash.com/photo-1516900557549-41557d405adf?w=1080&q=80",
        backgroundColor: "#06120c",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "GLOBAL IMPACT",
        headingText: "Coastal Tides Rise 3.4mm Annually",
        subheadText: "NASA Sea Level Analysis",
        descriptionText: "Low-lying island nations accelerate coastal defense seawall construction to protect vulnerable shores.",
        backgroundMedia: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1080&q=80",
        backgroundColor: "#06120c",
        duration: 8,
        hasCta: true,
        ctaLabel: "View Live Climate Dashboard",
        ctaUrl: "/stories",
      },
    ],
  },

  // 16. AUTOMOTIVE & SPEED SHOWCASE
  {
    id: "automotive-hypercar-velocity",
    name: "Automotive – Supercar Velocity",
    category: "Entertainment & Sports",
    badge: "Track Tested",
    badgeColor: "bg-zinc-800",
    description: "Matte carbon black, crimson racing lines, 0-60 mph stats, and dynamic track photography.",
    coverImage: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1080&q=80",
    defaultTitle: "The 1,200 HP Electric Hypercar Unleashed on Track",
    defaultExcerpt: "Quad-motor torque vectoring delivers mind-bending acceleration on the Nürburgring circuit.",
    defaultTags: ["cars", "supercars", "automotive", "speed"],
    layoutType: "automotive-showcase",
    defaultSlides: [
      {
        badgeText: "TRACK TEST",
        headingText: "The 1,200 HP Electric Hypercar Unleashed",
        subheadText: "0-60 MPH in 1.8s • Top Speed 250 MPH",
        descriptionText: "Quad-motor torque vectoring delivers mind-bending acceleration on the Nürburgring circuit.",
        backgroundMedia: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1080&q=80",
        backgroundColor: "#08080a",
        duration: 7,
        hasCta: false,
      },
      {
        badgeText: "LAP RECORD",
        headingText: "6 Minutes 42 Seconds at Nürburgring",
        subheadText: "All-Time EV Production Record",
        descriptionText: "Active aerodynamics generate over 1,800 kg of downforce through high-speed S-curves.",
        backgroundMedia: "https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=1080&q=80",
        backgroundColor: "#08080a",
        duration: 8,
        hasCta: true,
        ctaLabel: "Watch On-Board Lap Video",
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
