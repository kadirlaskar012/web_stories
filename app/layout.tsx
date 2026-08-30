import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  const verification: Record<string, string | string[]> = {};
  if (settings.google_verification) {
    verification.google = settings.google_verification;
  }
  if (settings.yandex_verification) {
    verification.yandex = settings.yandex_verification;
  }
  if (settings.bing_verification) {
    verification.bing = settings.bing_verification;
  }

  const otherMeta: Record<string, string> = {};
  if (settings.bing_verification) {
    otherMeta["msvalidate.01"] = settings.bing_verification;
  }
  if (settings.pinterest_verification) {
    otherMeta["p:domain_verify"] = settings.pinterest_verification;
  }

  return {
    title: {
      default: settings.default_seo_title,
      template: `%s | ${settings.site_name}`,
    },
    description: settings.default_seo_description,
    metadataBase: new URL(settings.site_url),
    openGraph: {
      type: "website",
      siteName: settings.site_name,
    },
    twitter: { card: "summary_large_image" },
    verification: Object.keys(verification).length > 0 ? verification : undefined,
    other: Object.keys(otherMeta).length > 0 ? otherMeta : undefined,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettings();

  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${newsreader.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-white text-gray-900">
        {settings.ga_id && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${settings.ga_id}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${settings.ga_id}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
