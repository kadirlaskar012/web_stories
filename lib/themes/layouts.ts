export type SlideLayoutType =
  // Original 6 Core News
  | "breaking-news"
  | "news-explainer"
  | "photo-news"
  | "data-facts"
  | "live-update"
  | "entertainment-magazine"
  // 10 New Unique & Stylish Editorial Templates
  | "tech-spotlight"
  | "investigative-report"
  | "sports-bulletin"
  | "opinion-column"
  | "travel-guide"
  | "finance-market"
  | "science-discovery"
  | "culinary-review"
  | "climate-pulse"
  | "automotive-showcase"
  // Generic Utility Layouts
  | "quote-spotlight"
  | "cta-finale";

export interface DataFactItem {
  icon?: string;
  stat: string;
  label: string;
  subtext?: string;
}

export interface TimelineItem {
  time: string;
  text: string;
}

export interface SlideLayoutConfig {
  id: SlideLayoutType;
  name: string;
  category: "News & Politics" | "Editorial & Feature" | "Economy & Tech" | "Travel & Lifestyle" | "Entertainment & Sports";
  description: string;
  previewClass: string;
  defaultData: {
    badgeText?: string;
    headingText: string;
    subheadText?: string;
    descriptionText: string;
    locationDate?: string;
    sourceText?: string;
    quoteAuthor?: string;
    mediaUrl?: string;
    statsList?: DataFactItem[];
    timelineList?: TimelineItem[];
  };
}

export const SLIDE_LAYOUTS: SlideLayoutConfig[] = [
  // 1. BREAKING NEWS – BOLD
  {
    id: "breaking-news",
    name: "Breaking News – Bold",
    category: "News & Politics",
    description: "Urgent red badge, bold all-caps headline, dateline pipe, and full-bleed photojournalism.",
    previewClass: "bg-black text-white",
    defaultData: {
      badgeText: "BREAKING NEWS",
      headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
      descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons",
      locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
      mediaUrl: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
    },
  },

  // 2. NEWS EXPLAINER – EDITORIAL
  {
    id: "news-explainer",
    name: "News Explainer – Ivory",
    category: "Editorial & Feature",
    description: "Light cream background, serif headline, red divider bar, and framed photography.",
    previewClass: "bg-[#f7f4ed] text-slate-900",
    defaultData: {
      badgeText: "EXPLAINER",
      headingText: "What You Need to Know About The New Student Loan Plan",
      descriptionText: "The U.S. Department of Education has announced a major update to the federal forgiveness program.",
      mediaUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
    },
  },

  // 3. PHOTO NEWS – IMMERSIVE
  {
    id: "photo-news",
    name: "Photo News – Immersive",
    category: "Travel & Lifestyle",
    description: "Full-bleed 9:16 photography, minimal UI, and elegant lower-third caption.",
    previewClass: "bg-black text-white",
    defaultData: {
      badgeText: "U.S. NEWS",
      headingText: "Foggy Morning in San Francisco",
      descriptionText: "A beautiful start to the day across the Bay Area as maritime fog blankets the bridge.",
      mediaUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
    },
  },

  // 4. DATA / FACTS – INFOGRAPHIC
  {
    id: "data-facts",
    name: "Data / Facts – Infographic",
    category: "Economy & Tech",
    description: "Dark navy background with 4 structured metric cards, custom icons, and source citation.",
    previewClass: "bg-[#070d1d] text-white",
    defaultData: {
      badgeText: "U.S. ECONOMY UPDATE",
      headingText: "May Jobs Report Key Highlights",
      descriptionText: "",
      sourceText: "Source: U.S. Bureau of Labor Statistics",
      statsList: [
        { icon: "users", stat: "272K", label: "Jobs added in May", subtext: "vs. 165K in April" },
        { icon: "trending", stat: "3.9%", label: "Unemployment Rate", subtext: "Unchanged from April" },
        { icon: "dollar", stat: "4.1%", label: "Average Hourly Earnings", subtext: "vs. May 2023" },
        { icon: "briefcase", stat: "8.1M", label: "Job Openings", subtext: "at the end of April" },
      ],
    },
  },

  // 5. LIVE UPDATE – TIMELINE
  {
    id: "live-update",
    name: "Live Update – Timeline",
    category: "News & Politics",
    description: "Chronological live tracker with pulsing indicator, vertical connected line, and timestamps.",
    previewClass: "bg-[#0d0f15] text-white",
    defaultData: {
      badgeText: "🔴 LIVE UPDATE",
      headingText: "What We Know So Far",
      locationDate: "May 31, 2024",
      descriptionText: "",
      timelineList: [
        { time: "2:45 PM", text: "Severe storms reported in Texas and Oklahoma." },
        { time: "3:30 PM", text: "Tornado warnings issued for 6 states." },
        { time: "4:10 PM", text: "Over 120,000 customers without power." },
        { time: "4:45 PM", text: "Rescue operations underway in affected areas." },
      ],
    },
  },

  // 6. ENTERTAINMENT – MAGAZINE
  {
    id: "entertainment-magazine",
    name: "Entertainment – Magazine",
    category: "Entertainment & Sports",
    description: "Dark purple/magenta aesthetic, glamorous serif name, italic subhead, and portrait photo.",
    previewClass: "bg-black text-white",
    defaultData: {
      badgeText: "ENTERTAINMENT",
      headingText: "Zendaya",
      subheadText: "Stars in New Blockbuster Movie",
      descriptionText: "Everything we know about the highly anticipated cinematic release hitting theaters.",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
    },
  },

  // ─── 10 NEW STYLISH & UNIQUE EDITORIAL DESIGNS ─────────────────────────────

  // 7. TECH LAUNCH & GADGET SPOTLIGHT
  {
    id: "tech-spotlight",
    name: "Tech Launch – Silicon Cyber",
    category: "Economy & Tech",
    description: "Electric cyan accents, dark carbon look, processor specs badge, and futuristic hardware styling.",
    previewClass: "bg-[#050b14] text-cyan-400",
    defaultData: {
      badgeText: "HARDWARE REVEAL",
      headingText: "Next-Gen Quantum Neural Chip Announced",
      subheadText: "3nm Architecture • 45% Lower Power",
      descriptionText: "Engineers unveil revolutionary microchip capable of running multimodal AI on device without cloud dependency.",
      mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
    },
  },

  // 8. INVESTIGATIVE DEEP DIVE
  {
    id: "investigative-report",
    name: "Investigative – Deep Dive",
    category: "Editorial & Feature",
    description: "Monochrome investigative dispatch with dramatic contrast, red confidential seal, and evidence callout.",
    previewClass: "bg-[#0b0c10] text-slate-100",
    defaultData: {
      badgeText: "INVESTIGATION",
      headingText: "The Secret Water Pipeline of the Mojave",
      descriptionText: "A 6-month investigative probe reveals covert industrial aquifers altering desert ecosystems.",
      locationDate: "SPECIAL DISPATCH | LAS VEGAS, NV",
      mediaUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1080&q=80",
    },
  },

  // 9. SPORTS BULLETIN & MATCH TRACKER
  {
    id: "sports-bulletin",
    name: "Sports Bulletin – Game Night",
    category: "Entertainment & Sports",
    description: "High-energy athletic typography, bold score card, star player photo, and stadium atmosphere.",
    previewClass: "bg-[#0a0d18] text-white",
    defaultData: {
      badgeText: "FINAL SCORE",
      headingText: "Championship Victory in Overtime",
      subheadText: "LAL 114 — 108 BOS",
      descriptionText: "A dramatic 3-pointer with 4.2 seconds remaining seals the Eastern Conference championship thriller.",
      mediaUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80",
    },
  },

  // 10. OPINION & OP-ED COLUMNIST
  {
    id: "opinion-column",
    name: "Opinion – Op-Ed Column",
    category: "Editorial & Feature",
    description: "Oversized decorative quotation marks, author headshot badge, warm parchment styling, and bold thought leadership.",
    previewClass: "bg-[#f4efe6] text-slate-950",
    defaultData: {
      badgeText: "OP-ED COLUMN",
      headingText: "Why The Future of Cities Belongs to Pedestrians",
      quoteAuthor: "By David Brooks · Senior Columnist",
      descriptionText: "Reclaiming downtown avenues from vehicles is not just an urban dream—it is an economic revitalization imperative.",
      mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
    },
  },

  // 11. TRAVEL & CITY GUIDE
  {
    id: "travel-guide",
    name: "Travel – Wanderlust Guide",
    category: "Travel & Lifestyle",
    description: "Terracotta and golden sunset aesthetic with destination badge, curated stop numbers, and scenic photography.",
    previewClass: "bg-[#1c130d] text-amber-100",
    defaultData: {
      badgeText: "CITY GUIDE",
      headingText: "48 Hours in Kyoto: Ancient Temples & Tea Gardens",
      subheadText: "HIGASHIYAMA DISTRICT",
      descriptionText: "From bamboo groves at sunrise to lantern-lit alleys in Gion, discover the spiritual heart of Japan.",
      mediaUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80",
    },
  },

  // 12. FINANCE & MARKET MOVERS
  {
    id: "finance-market",
    name: "Finance – Market Mover",
    category: "Economy & Tech",
    description: "Emerald green ticker pulse, dark carbon background, stock index metrics, and Wall Street insight.",
    previewClass: "bg-[#06100d] text-emerald-400",
    defaultData: {
      badgeText: "MARKET MOVERS",
      headingText: "Tech Rally Drives S&P 500 to All-Time Record High",
      subheadText: "+2.4% NASDAQ • S&P 5,500",
      descriptionText: "Semiconductor earnings beat analyst estimates by 30%, igniting a global equities surge.",
      mediaUrl: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&q=80",
    },
  },

  // 13. SCIENCE & HEALTH BREAKTHROUGH
  {
    id: "science-discovery",
    name: "Science – Breakthrough Discovery",
    category: "Economy & Tech",
    description: "Teal & mint discovery palette, scientific fact badge, micro-lens imagery, and peer-reviewed summary.",
    previewClass: "bg-[#041417] text-teal-300",
    defaultData: {
      badgeText: "NATURE & SCIENCE",
      headingText: "Deep Ocean Species Discovered at 8,000m Trench",
      descriptionText: "Marine biologists catalog bioluminescent organisms thriving under extreme hydrothermal pressures.",
      sourceText: "Published in Nature Geoscience",
      mediaUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1080&q=80",
    },
  },

  // 14. CULINARY & GASTRONOMY REVIEW
  {
    id: "culinary-review",
    name: "Culinary – Gourmet Review",
    category: "Travel & Lifestyle",
    description: "Warm gourmet tones, 5-star rating badge, dish highlights, chef quotation, and mouthwatering photography.",
    previewClass: "bg-[#160d09] text-amber-200",
    defaultData: {
      badgeText: "MICHELIN GUIDE ★★★",
      headingText: "Tasting Menu at L’Atelier: Wood-Fired Mastery",
      subheadText: "Chef Marco Pierre · Napa Valley",
      descriptionText: "Hand-rolled tagliolini with white truffles paired alongside dry-aged heritage beef.",
      mediaUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
    },
  },

  // 15. CLIMATE & PLANET PULSE
  {
    id: "climate-pulse",
    name: "Climate – Earth Pulse",
    category: "News & Politics",
    description: "Forest green & dark slate, satellite aerial photography, global temperature metric, and urgent environmental call.",
    previewClass: "bg-[#06120c] text-emerald-300",
    defaultData: {
      badgeText: "PLANET PULSE",
      headingText: "Arctic Ice Melt Reaches Critical Threshold",
      subheadText: "Polar Satellite Observation Data",
      descriptionText: "Glaciologists record record summer retreat across Greenland ice sheet as ocean temperatures rise.",
      mediaUrl: "https://images.unsplash.com/photo-1516900557549-41557d405adf?w=1080&q=80",
    },
  },

  // 16. AUTOMOTIVE & SPEED SHOWCASE
  {
    id: "automotive-showcase",
    name: "Automotive – Supercar Velocity",
    category: "Entertainment & Sports",
    description: "Matte carbon black, crimson racing lines, 0-60 mph stats, and dynamic track photography.",
    previewClass: "bg-[#08080a] text-red-400",
    defaultData: {
      badgeText: "TRACK TEST",
      headingText: "The 1,200 HP Electric Hypercar Unleashed",
      subheadText: "0-60 MPH in 1.8s • Top Speed 250 MPH",
      descriptionText: "Quad-motor torque vectoring delivers mind-bending acceleration on the Nürburgring circuit.",
      mediaUrl: "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=1080&q=80",
    },
  },

  // 17. QUOTE SPOTLIGHT
  {
    id: "quote-spotlight",
    name: "Quote Spotlight",
    category: "Editorial & Feature",
    description: "Minimalist bold quote layout for impactful speeches, statements, and thought leaders.",
    previewClass: "bg-slate-950 text-white",
    defaultData: {
      headingText: "The only limit to our realization of tomorrow will be our doubts of today.",
      quoteAuthor: "Franklin D. Roosevelt",
      descriptionText: "",
    },
  },

  // 18. CTA FINALE
  {
    id: "cta-finale",
    name: "CTA Finale",
    category: "News & Politics",
    description: "High-conversion end card directing viewers to read the full article, subscribe, or visit website.",
    previewClass: "bg-[#090d16] text-white",
    defaultData: {
      headingText: "Follow Live Coverage on USA Daily",
      descriptionText: "Get real-time breaking news alerts and in-depth visual journalism on your mobile device.",
    },
  },
];

export function getLayoutById(layoutId: SlideLayoutType): SlideLayoutConfig {
  return SLIDE_LAYOUTS.find((l) => l.id === layoutId) || SLIDE_LAYOUTS[0];
}
