export interface StoryTheme {
  id: string;
  name: string;
  description: string;
  badge: string;
  previewBg: string;
  previewTextColor: string;
  previewAccentColor: string;
  styles: {
    background: string;
    overlayOpacity: number;
    overlayGradient?: string;
    cardStyle?: string;
    heading: {
      fontSize: number;
      fontWeight: number | string;
      color: string;
      lineHeight: number;
      textShadow?: string;
      fontFamily?: string;
      textTransform?: "uppercase" | "none" | "capitalize";
      letterSpacing?: string;
    };
    body: {
      fontSize: number;
      fontWeight: number | string;
      color: string;
      lineHeight: number;
      textShadow?: string;
    };
    badge: {
      bg: string;
      color: string;
      fontSize: number;
      fontWeight: number | string;
      textTransform?: "uppercase";
    };
    cta: {
      bg: string;
      color: string;
      borderRadius: number;
      fontWeight: number | string;
    };
  };
}

export const STORY_THEMES: StoryTheme[] = [
  {
    id: "editorial-luxe",
    name: "Editorial Luxe",
    description: "Vogue & National Geographic style with dark glass, gold accents, and serif headings",
    badge: "Premium Vogue",
    previewBg: "#0c0d12",
    previewTextColor: "#fef08a",
    previewAccentColor: "#eab308",
    styles: {
      background: "#0c0d12",
      overlayOpacity: 0.88,
      overlayGradient: "linear-gradient(to top, rgba(12, 13, 18, 0.95) 0%, rgba(12, 13, 18, 0.5) 50%, transparent 100%)",
      heading: {
        fontSize: 30,
        fontWeight: 800,
        color: "#fef08a",
        lineHeight: 1.18,
        textShadow: "0 4px 16px rgba(0,0,0,0.9)",
        letterSpacing: "-0.02em",
      },
      body: {
        fontSize: 16,
        fontWeight: 400,
        color: "#f1f5f9",
        lineHeight: 1.55,
        textShadow: "0 2px 8px rgba(0,0,0,0.8)",
      },
      badge: {
        bg: "rgba(234, 179, 8, 0.25)",
        color: "#fef08a",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
      },
      cta: {
        bg: "#eab308",
        color: "#0f172a",
        borderRadius: 9999,
        fontWeight: 800,
      },
    },
  },
  {
    id: "cyber-neon",
    name: "Cyber Neon",
    description: "High-contrast dark tech with glowing cyan typography and futuristic vibes",
    badge: "Tech & AI",
    previewBg: "#030712",
    previewTextColor: "#38bdf8",
    previewAccentColor: "#06b6d4",
    styles: {
      background: "#030712",
      overlayOpacity: 0.9,
      overlayGradient: "linear-gradient(to top, rgba(3, 7, 18, 0.95) 0%, rgba(3, 7, 18, 0.4) 60%, transparent 100%)",
      heading: {
        fontSize: 32,
        fontWeight: 900,
        color: "#38bdf8",
        lineHeight: 1.15,
        textShadow: "0 0 20px rgba(56, 189, 248, 0.6), 0 2px 8px rgba(0,0,0,0.9)",
        letterSpacing: "-0.01em",
      },
      body: {
        fontSize: 16,
        fontWeight: 500,
        color: "#e0f2fe",
        lineHeight: 1.5,
      },
      badge: {
        bg: "rgba(6, 182, 212, 0.2)",
        color: "#67e8f9",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
      },
      cta: {
        bg: "#0ea5e9",
        color: "#ffffff",
        borderRadius: 12,
        fontWeight: 800,
      },
    },
  },
  {
    id: "breaking-punch",
    name: "Breaking Punch",
    description: "High-impact bold red/yellow accents with punchy headlines for news and facts",
    badge: "High Impact",
    previewBg: "#180303",
    previewTextColor: "#ffffff",
    previewAccentColor: "#ef4444",
    styles: {
      background: "#180303",
      overlayOpacity: 0.92,
      overlayGradient: "linear-gradient(to top, rgba(24, 3, 3, 0.95) 0%, rgba(24, 3, 3, 0.45) 50%, transparent 100%)",
      heading: {
        fontSize: 34,
        fontWeight: 900,
        color: "#ffffff",
        lineHeight: 1.1,
        textShadow: "0 4px 20px rgba(0,0,0,0.95)",
        textTransform: "uppercase",
        letterSpacing: "-0.02em",
      },
      body: {
        fontSize: 16,
        fontWeight: 600,
        color: "#fecaca",
        lineHeight: 1.45,
      },
      badge: {
        bg: "#ef4444",
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
      },
      cta: {
        bg: "#ef4444",
        color: "#ffffff",
        borderRadius: 9999,
        fontWeight: 900,
      },
    },
  },
  {
    id: "nordic-minimal",
    name: "Nordic Minimal",
    description: "Frosted glass card with clean humanist typography and generous whitespace",
    badge: "Clean & Modern",
    previewBg: "#1e293b",
    previewTextColor: "#ffffff",
    previewAccentColor: "#ffffff",
    styles: {
      background: "#0f172a",
      overlayOpacity: 0.82,
      overlayGradient: "linear-gradient(to top, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%)",
      heading: {
        fontSize: 28,
        fontWeight: 700,
        color: "#ffffff",
        lineHeight: 1.25,
        letterSpacing: "-0.02em",
      },
      body: {
        fontSize: 15,
        fontWeight: 400,
        color: "#cbd5e1",
        lineHeight: 1.6,
      },
      badge: {
        bg: "rgba(255, 255, 255, 0.15)",
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 700,
      },
      cta: {
        bg: "#ffffff",
        color: "#0f172a",
        borderRadius: 14,
        fontWeight: 700,
      },
    },
  },
  {
    id: "tropical-vivid",
    name: "Tropical Vivid",
    description: "Warm sunset orange, emerald greens, and rich travel documentary vibe",
    badge: "Travel & Food",
    previewBg: "#1a0b02",
    previewTextColor: "#fed7aa",
    previewAccentColor: "#f97316",
    styles: {
      background: "#1a0b02",
      overlayOpacity: 0.88,
      overlayGradient: "linear-gradient(to top, rgba(26, 11, 2, 0.95) 0%, rgba(26, 11, 2, 0.45) 50%, transparent 100%)",
      heading: {
        fontSize: 32,
        fontWeight: 800,
        color: "#ffedd5",
        lineHeight: 1.15,
        textShadow: "0 3px 12px rgba(0,0,0,0.85)",
      },
      body: {
        fontSize: 16,
        fontWeight: 500,
        color: "#fed7aa",
        lineHeight: 1.5,
      },
      badge: {
        bg: "#f97316",
        color: "#ffffff",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
      },
      cta: {
        bg: "#f97316",
        color: "#ffffff",
        borderRadius: 9999,
        fontWeight: 800,
      },
    },
  },
  {
    id: "cinematic-dark",
    name: "Cinematic Dark",
    description: "Film documentary lower-third subtitle typography with maximum image visibility",
    badge: "Documentary",
    previewBg: "#050505",
    previewTextColor: "#ffffff",
    previewAccentColor: "#3b82f6",
    styles: {
      background: "#000000",
      overlayOpacity: 0.85,
      overlayGradient: "linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.4) 40%, transparent 70%)",
      heading: {
        fontSize: 26,
        fontWeight: 800,
        color: "#ffffff",
        lineHeight: 1.2,
        textShadow: "0 2px 10px rgba(0,0,0,0.9)",
      },
      body: {
        fontSize: 15,
        fontWeight: 400,
        color: "#e2e8f0",
        lineHeight: 1.55,
        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
      },
      badge: {
        bg: "rgba(59, 130, 246, 0.3)",
        color: "#93c5fd",
        fontSize: 11,
        fontWeight: 800,
        textTransform: "uppercase",
      },
      cta: {
        bg: "#2563eb",
        color: "#ffffff",
        borderRadius: 9999,
        fontWeight: 800,
      },
    },
  },
  {
    id: "gradient-aurora",
    name: "Gradient Aurora",
    description: "Vibrant violet & rose gradient highlights with ultra-modern Gen-Z aesthetic",
    badge: "Creative & Pop",
    previewBg: "#17031e",
    previewTextColor: "#f472b6",
    previewAccentColor: "#ec4899",
    styles: {
      background: "#17031e",
      overlayOpacity: 0.88,
      overlayGradient: "linear-gradient(to top, rgba(23, 3, 30, 0.95) 0%, rgba(23, 3, 30, 0.45) 50%, transparent 100%)",
      heading: {
        fontSize: 32,
        fontWeight: 900,
        color: "#fbcfe8",
        lineHeight: 1.15,
        textShadow: "0 4px 16px rgba(236, 72, 153, 0.4), 0 2px 8px rgba(0,0,0,0.9)",
      },
      body: {
        fontSize: 16,
        fontWeight: 500,
        color: "#fdf2f8",
        lineHeight: 1.5,
      },
      badge: {
        bg: "rgba(236, 72, 153, 0.3)",
        color: "#fbcfe8",
        fontSize: 11,
        fontWeight: 900,
        textTransform: "uppercase",
      },
      cta: {
        bg: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
        color: "#ffffff",
        borderRadius: 9999,
        fontWeight: 900,
      },
    },
  },
];

export function getThemeById(themeId: string): StoryTheme {
  return STORY_THEMES.find((t) => t.id === themeId) || STORY_THEMES[0];
}
