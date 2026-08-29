export type SlideLayoutType =
  | "breaking-news"
  | "news-explainer"
  | "photo-news"
  | "data-facts"
  | "live-update"
  | "entertainment-magazine"
  | "quote-spotlight"
  | "cta-finale";

export interface DataFactItem {
  icon: "users" | "trending" | "dollar" | "briefcase";
  stat: string;
  label: string;
  subtext: string;
}

export interface TimelineItem {
  time: string;
  text: string;
  image?: string;
}

export interface SlideLayoutConfig {
  id: SlideLayoutType;
  name: string;
  category: "USA News" | "Editorial" | "Data & Live" | "Culture & Action";
  description: string;
  previewThumbnail: string;
  defaultData: {
    badgeText?: string;
    headingText: string;
    subheadText?: string;
    descriptionText: string;
    locationDate?: string;
    sourceText?: string;
    mediaUrl?: string;
    quoteAuthor?: string;
    hasCta?: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
    statsList?: DataFactItem[];
    timelineList?: TimelineItem[];
  };
}

export const SLIDE_LAYOUTS: SlideLayoutConfig[] = [
  {
    id: "breaking-news",
    name: "Breaking News – Bold",
    category: "USA News",
    description: "High-impact urgent breaking news with red badge, massive white headline, and dateline",
    previewThumbnail: "breaking-news",
    defaultData: {
      badgeText: "BREAKING NEWS",
      headingText: "MASSIVE WILDFIRE HITS CALIFORNIA",
      descriptionText: "Thousands evacuated as firefighters battle the blaze across state canyons",
      locationDate: "JUNE 1, 2024 | CALIFORNIA, USA",
      mediaUrl: "https://images.unsplash.com/photo-1542382257-80dedb725088?w=1080&q=80",
      hasCta: false,
    },
  },
  {
    id: "news-explainer",
    name: "News Explainer – Editorial",
    category: "Editorial",
    description: "Clean cream background, elegant serif typography, red accent rule, and framed photo",
    previewThumbnail: "news-explainer",
    defaultData: {
      badgeText: "EXPLAINER",
      headingText: "What You Need to Know About The New Student Loan Plan",
      descriptionText: "The U.S. Department of Education has announced a major update to the student loan forgiveness program.",
      mediaUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1080&q=80",
      hasCta: false,
    },
  },
  {
    id: "photo-news",
    name: "Photo News – Immersive",
    category: "USA News",
    description: "Full-bleed photojournalism visual with minimal UI and elegant lower-third caption",
    previewThumbnail: "photo-news",
    defaultData: {
      badgeText: "U.S. NEWS",
      headingText: "Foggy Morning in San Francisco",
      descriptionText: "A breathtaking start to the day across the Bay Area as maritime fog blankets the bridge.",
      mediaUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1080&q=80",
      hasCta: false,
    },
  },
  {
    id: "data-facts",
    name: "Data / Facts – Infographic",
    category: "Data & Live",
    description: "Dark navy theme with 4 structured metric cards, custom icons, and official source cite",
    previewThumbnail: "data-facts",
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
      hasCta: false,
    },
  },
  {
    id: "live-update",
    name: "Live Update – Timeline",
    category: "Data & Live",
    description: "Real-time chronological timeline with red tracker line, timestamps, and event thumbnails",
    previewThumbnail: "live-update",
    defaultData: {
      badgeText: "🔴 LIVE UPDATE",
      headingText: "What We Know So Far",
      locationDate: "May 31, 2024",
      descriptionText: "",
      timelineList: [
        { time: "2:45 PM", text: "Severe storms reported across Texas and Oklahoma.", image: "https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?w=300&q=80" },
        { time: "3:30 PM", text: "Tornado warnings issued for 6 Midwestern states.", image: "https://images.unsplash.com/photo-1527482797697-8795b05a13fe?w=300&q=80" },
        { time: "4:10 PM", text: "Over 120,000 utility customers without power.", image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=300&q=80" },
        { time: "4:45 PM", text: "Emergency rescue operations underway in affected counties.", image: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=300&q=80" },
      ],
      hasCta: false,
    },
  },
  {
    id: "entertainment-magazine",
    name: "Entertainment – Magazine",
    category: "Culture & Action",
    description: "Sleek dark backdrop, purple accents, stylish magazine typography, and celebrity portrait",
    previewThumbnail: "entertainment-magazine",
    defaultData: {
      badgeText: "ENTERTAINMENT",
      headingText: "Zendaya",
      subheadText: "Stars in New Blockbuster Movie",
      descriptionText: "Everything we know about the highly anticipated film hitting theaters this autumn.",
      mediaUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1080&q=80",
      hasCta: true,
      ctaLabel: "Swipe Up for Details",
      ctaUrl: "/stories",
    },
  },
  {
    id: "quote-spotlight",
    name: "Quote & Statement Spotlight",
    category: "Editorial",
    description: "Impactful oversized quote marks with centered serif editorial statement and byline cite",
    previewThumbnail: "quote-spotlight",
    defaultData: {
      badgeText: "STATEMENT",
      headingText: "We are committed to delivering swift relief to working families across the country.",
      quoteAuthor: "White House Press Secretary",
      descriptionText: "",
      hasCta: false,
    },
  },
  {
    id: "cta-finale",
    name: "Conclusion & Swipe Up CTA",
    category: "Culture & Action",
    description: "Story conclusion with high-visibility call-to-action button and publication branding",
    previewThumbnail: "cta-finale",
    defaultData: {
      badgeText: "STAY INFORMED",
      headingText: "Follow Live Coverage on USA Daily",
      descriptionText: "Get real-time breaking alerts and in-depth visual journalism on your mobile device.",
      hasCta: true,
      ctaLabel: "Read Full Investigation",
      ctaUrl: "/stories",
    },
  },
];

export function getLayoutById(layoutId: SlideLayoutType): SlideLayoutConfig {
  return SLIDE_LAYOUTS.find((l) => l.id === layoutId) || SLIDE_LAYOUTS[0];
}
