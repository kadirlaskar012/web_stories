import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy and data protection terms for our web stories publishing platform.",
};

export default async function PrivacyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-xs text-gray-400 mb-8">Last Updated: August 2026</p>

      <div className="prose prose-gray max-w-none space-y-6 text-gray-600 text-sm leading-relaxed">
        <h2 className="text-base font-bold text-gray-900">1. Information We Collect</h2>
        <p>
          We respect your privacy and are committed to protecting it. When you visit {settings.site_name}, we may collect non-personal analytics data such as browser type, referring URLs, and story view interactions to optimize content delivery and site performance.
        </p>

        <h2 className="text-base font-bold text-gray-900">2. Cookies & Analytics</h2>
        <p>
          We use minimal, privacy-friendly cookies and analytics identifiers (such as Google Analytics 4) to monitor aggregate traffic and understand which stories resonate most with our audience.
        </p>

        <h2 className="text-base font-bold text-gray-900">3. Third-Party Services</h2>
        <p>
          We utilize content delivery networks (Cloudinary) to securely serve fast, responsive images and videos. These third parties process asset requests in accordance with their respective privacy standards.
        </p>

        <h2 className="text-base font-bold text-gray-900">4. Contact Information</h2>
        <p>
          If you have questions or concerns about this policy, please reach out via our contact page.
        </p>
      </div>
    </div>
  );
}
