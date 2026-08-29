import { SlideLayoutType, DataFactItem, TimelineItem } from "./layouts";

export interface StoryTemplatePreset {
  id: string;
  name: string;
  category: "News & Politics" | "Editorial & Feature" | "Economy & Tech" | "Travel & Photography" | "Entertainment & Culture";
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
  {
    id: "photojournalism-immersive",
    name: "Photo News – Immersive Photography",
    category: "Travel & Photography",
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
  {
    id: "entertainment-glamour",
    name: "Entertainment – Magazine Spotlight",
    category: "Entertainment & Culture",
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
];

export function getStoryTemplateById(templateId: string): StoryTemplatePreset {
  return (
    STORY_TEMPLATES.find((t) => t.id === templateId) || STORY_TEMPLATES[0]
  );
}
