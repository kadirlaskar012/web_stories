import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service and usage conditions for our web stories publishing platform.",
};

export default async function TermsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
      <p className="text-xs text-gray-400 mb-8">Last Updated: August 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 text-sm leading-relaxed">
        <h2 className="text-base font-bold text-gray-900">1. Acceptance of Terms</h2>
        <p>
          By accessing and using {settings.site_name}, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please refrain from using the platform.
        </p>

        <h2 className="text-base font-bold text-gray-900">2. Intellectual Property</h2>
        <p>
          All published web stories, imagery, multimedia assets, graphics, and trademarks published on this site are the property of {settings.publisher_name || settings.site_name} or its content licensors and are protected by applicable copyright and intellectual property laws.
        </p>

        <h2 className="text-base font-bold text-gray-900">3. User Conduct</h2>
        <p>
          You agree not to scrape, reverse engineer, or disrupt the operation of this platform, nor misuse any media assets without express written consent.
        </p>

        <h2 className="text-base font-bold text-gray-900">4. Modifications</h2>
        <p>
          We reserve the right to modify these terms at any time. Changes will be reflected on this page with an updated revision date.
        </p>
      </div>
    </div>
  );
}
