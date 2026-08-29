export type SlideLayoutType =
  | "breaking-bold"          // 1. Hero Full-Bleed Breaking News
  | "split-screen-card"      // 2. 50/50 Diagonal/Horizontal Split Card
  | "top-rank-countdown"     // 3. Numbered Rank Countdown (Giant "01", "02")
  | "glassmorphism-card"     // 4. Floating Frosted Glass Card
  | "polaroid-photo-frame"   // 5. Retro Editorial Polaroid / Pinned Frame
  | "infographic-stats-grid" // 6. 2x2 Metric Data Fact Cards
  | "connected-timeline"     // 7. Vertical Connected Live Timeline
  | "big-quote-spotlight"    // 8. Thought Leader Pull Quote with Avatar
  | "versus-comparison"      // 9. Side-by-Side A vs B Showdown
  | "magazine-cutout"        // 10. High-Fashion Editorial Magazine Multi-Layer
  | "recipe-step-card"       // 11. Step-by-Step Guide with Checklist
  | "sports-scoreboard";     // 12. Athletic Scoreboard & MVP Card

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

export interface VersusItem {
  nameA: string;
  statA: string;
  labelA: string;
  nameB: string;
  statB: string;
  labelB: string;
}

export interface ChecklistItem {
  step: string;
  text: string;
}

export interface SlideLayoutConfig {
  id: SlideLayoutType;
  name: string;
  category: "News & Politics" | "Editorial & Feature" | "Economy & Tech" | "Travel & Lifestyle" | "Entertainment & Sports";
  structureDescription: string;
  defaultData: {
    badgeText?: string;
    headingText: string;
    subheadText?: string;
    descriptionText: string;
    locationDate?: string;
    sourceText?: string;
    quoteAuthor?: string;
    mediaUrl?: string;
    rankNumber?: string;
    statsList?: DataFactItem[];
    timelineList?: TimelineItem[];
    versusData?: VersusItem;
    checklist?: ChecklistItem[];
    ctaLabel?: string;
    ctaUrl?: string;
  };
}

export const SLIDE_LAYOUTS: SlideLayoutConfig[] = [
  // 1. BREAKING BOLD
  {
    id: "breaking-bold",
    name: "Breaking News – Bold Scrim",
    category: "News & Politics",
    structureDescription: "Full-bleed 9:16 background photo, urgent red pill, heavy all-caps typography, red dateline bar.",
    defaultData: {
      badgeText: "BREAKING NEWS",
      headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
      descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons under severe dry winds.",
      locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
      mediaUrl: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
    },
  },

  // 2. SPLIT SCREEN CARD
  {
    id: "split-screen-card",
    name: "Split Screen – Editorial Card",
    category: "Editorial & Feature",
    structureDescription: "Top 50% framed photo with rounded corners, bottom 50% clean ivory card with serif typography & accent rule.",
    defaultData: {
      badgeText: "EXPLAINER",
      headingText: "What You Need to Know About The New Student Loan Plan",
      descriptionText: "The U.S. Department of Education has announced a major update capping payments at 5% of income.",
      locationDate: "01 / 07",
      mediaUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
    },
  },

  // 3. TOP RANK COUNTDOWN
  {
    id: "top-rank-countdown",
    name: "Rank Countdown – Giant Numeral",
    category: "Travel & Lifestyle",
    structureDescription: "Massive translucent outline number (01), center framed circular/rounded photo, rank headline & takeaway highlight.",
    defaultData: {
      rankNumber: "01",
      badgeText: "#1 TOP DESTINATION",
      headingText: "Kyoto: The Bamboo Grove of Arashiyama",
      descriptionText: "Walk through towering emerald bamboo groves at dawn for an unforgettable zen experience in Japan.",
      subheadText: "MUST-VISIT IN 2026",
      mediaUrl: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1080&q=80",
    },
  },

  // 4. GLASSMORPHISM FLOATING CARD
  {
    id: "glassmorphism-card",
    name: "Glassmorphism – Floating Card",
    category: "Economy & Tech",
    structureDescription: "Cinematic full background with a central frosted glass container, glowing border, and structured bullet takeaways.",
    defaultData: {
      badgeText: "NEXT-GEN AI",
      headingText: "Neural Silicon Architecture Revealed",
      subheadText: "On-Device Multimodal Reasoning",
      descriptionText: "Engineers unveil ultra-efficient 3nm quantum neural processors delivering 100 TOPS without cloud latency.",
      mediaUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&q=80",
    },
  },

  // 5. POLAROID PHOTO FRAME
  {
    id: "polaroid-photo-frame",
    name: "Polaroid Frame – Retro Editorial",
    category: "Travel & Lifestyle",
    structureDescription: "Textured paper background, angled Polaroid photo with white border & taped corner, handwritten-feel caption.",
    defaultData: {
      badgeText: "FIELD DISPATCH",
      headingText: "Foggy Sunrise at Golden Gate",
      descriptionText: "A breathtaking start to the day across Marin Headlands as Pacific maritime fog blankets the bridge.",
      locationDate: "SAN FRANCISCO, CA · MAY 2026",
      mediaUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
    },
  },

  // 6. INFOGRAPHIC STATS GRID (2x2)
  {
    id: "infographic-stats-grid",
    name: "Infographic – 2x2 Metric Grid",
    category: "Economy & Tech",
    structureDescription: "Dark navy tech aesthetic with 4 distinct metric cards, vibrant glowing icons, big numbers, and source line.",
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

  // 7. CONNECTED TIMELINE
  {
    id: "connected-timeline",
    name: "Timeline – Real-Time Bulletins",
    category: "News & Politics",
    structureDescription: "Continuous vertical red tracker pipe with pulsing node bullets, timestamps, and chronological live updates.",
    defaultData: {
      badgeText: "🔴 LIVE UPDATE",
      headingText: "Severe Storm & Tornado Tracker",
      locationDate: "May 31, 2024 · Live Dispatch",
      descriptionText: "",
      timelineList: [
        { time: "2:45 PM", text: "Severe storms reported across Texas and Oklahoma." },
        { time: "3:30 PM", text: "Tornado warnings issued for 6 Midwestern states." },
        { time: "4:10 PM", text: "Over 120,000 utility customers without power." },
        { time: "4:45 PM", text: "Emergency rescue operations underway in affected counties." },
      ],
    },
  },

  // 8. BIG QUOTE SPOTLIGHT
  {
    id: "big-quote-spotlight",
    name: "Pull Quote – Leader Spotlight",
    category: "Editorial & Feature",
    structureDescription: "Giant quotation marks, circular author portrait with gradient border, huge italic statement, and verified bio badge.",
    defaultData: {
      badgeText: "OP-ED THOUGHT LEADERSHIP",
      headingText: "The future of great cities belongs to pedestrians, not cars.",
      quoteAuthor: "David Brooks · Senior Editorial Columnist",
      descriptionText: "When streets are designed for human connection rather than vehicle speed, community commerce and public safety soar.",
      mediaUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1080&q=80",
    },
  },

  // 9. VERSUS COMPARISON SHOWDOWN
  {
    id: "versus-comparison",
    name: "Versus Showdown – A vs B",
    category: "Economy & Tech",
    structureDescription: "Dual side-by-side comparison cards with glowing center 'VS' circle, stat badges, and pros/cons showdown.",
    defaultData: {
      badgeText: "HEAD-TO-HEAD SHOWDOWN",
      headingText: "Quantum Neural vs Traditional GPU",
      subheadText: "Hardware Benchmark Comparison",
      descriptionText: "Benchmarking power efficiency, latency, and on-device inference speed across next-gen compute architectures.",
      versusData: {
        nameA: "Quantum Neural",
        statA: "100 TOPS",
        labelA: "5W Power · 0ms Cloud",
        nameB: "Legacy GPU",
        statB: "45 TOPS",
        labelB: "35W Power · Cloud Delay",
      },
    },
  },

  // 10. MAGAZINE EDITORIAL CUTOUT
  {
    id: "magazine-cutout",
    name: "Magazine Cutout – Fashion Multi-Layer",
    category: "Entertainment & Sports",
    structureDescription: "High-fashion magazine layout with oversized serif name overlapping portrait, vertical rotated issue text, and pill CTA.",
    defaultData: {
      badgeText: "VOGUE EXCLUSIVE",
      headingText: "Zendaya",
      subheadText: "Stars in Autumn Cinematic Masterpiece",
      descriptionText: "An intimate look into the physical transformation and desert filming behind the year's most anticipated film.",
      locationDate: "ISSUE 48 · AUTUMN EDITION",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
      ctaLabel: "Swipe Up for Full Interview",
      ctaUrl: "/stories",
    },
  },

  // 11. RECIPE & STEP-BY-STEP GUIDE
  {
    id: "recipe-step-card",
    name: "Step Guide – Recipe Checklist",
    category: "Travel & Lifestyle",
    structureDescription: "Warm gourmet theme, compact top photo, numbered step pill, bulleted ingredient checklist, and Chef's Tip callout.",
    defaultData: {
      badgeText: "STEP 03 OF 05",
      headingText: "Wood-Fired Tagliolini with White Truffles",
      subheadText: "Prep Time: 15 Mins · Cook: 8 Mins",
      descriptionText: "Gently emulsify cultured butter with pasta water over low flame until glossy, then shave fresh truffles generously.",
      mediaUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1080&q=80",
      checklist: [
        { step: "01", text: "Boil fresh tagliolini for exactly 90 seconds in salted water." },
        { step: "02", text: "Swirl French butter with starchy pasta water to form emulsion." },
        { step: "03", text: "Plate immediately and finish with hand-shaved Alba truffles." },
      ],
    },
  },

  // 12. SPORTS SCOREBOARD & MVP
  {
    id: "sports-scoreboard",
    name: "Sports Scoreboard – Game Finals",
    category: "Entertainment & Sports",
    structureDescription: "Top stadium scoreboard box with live scores (LAL 114 - 108 BOS), athlete action photo, and bottom MVP stat bar.",
    defaultData: {
      badgeText: "FINAL SCORE · OT",
      headingText: "Championship Victory in Overtime Thriller",
      subheadText: "LAL 114 — 108 BOS",
      descriptionText: "A clutch 3-pointer with 4.2 seconds remaining in overtime seals an unforgettable Game 7 championship victory.",
      mediaUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1080&q=80",
      statsList: [
        { stat: "44", label: "Points" },
        { stat: "12", label: "Rebounds" },
        { stat: "8", label: "Assists" },
      ],
    },
  },
];

export function getLayoutById(layoutId: SlideLayoutType): SlideLayoutConfig {
  return SLIDE_LAYOUTS.find((l) => l.id === layoutId) || SLIDE_LAYOUTS[0];
}
