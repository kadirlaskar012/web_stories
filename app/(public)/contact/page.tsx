import { getSiteSettings } from "@/lib/settings";
import type { Metadata } from "next";
import { Mail, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with our editorial and support team.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Contact</span>
        <h1 className="text-3xl font-bold text-gray-900 mt-2 mb-3">Get in touch with us</h1>
        <p className="text-gray-600 text-sm">Have a question, feedback, or a story tip? We would love to hear from you.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Editorial & Press</h2>
            <p className="text-xs text-gray-500 mt-0.5">For story pitches, press releases, and editorial feedback</p>
            <p className="text-sm font-medium text-blue-600 mt-1">editorial@{settings.site_url.replace(/^https?:\/\//, '') || "example.com"}</p>
          </div>
        </div>

        <div className="flex items-start gap-4 pt-6 border-t border-gray-50">
          <div className="p-3 bg-green-50 text-green-600 rounded-xl">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">General Inquiries</h2>
            <p className="text-xs text-gray-500 mt-0.5">For partnerships, licensing, and technical support</p>
            <p className="text-sm font-medium text-blue-600 mt-1">support@{settings.site_url.replace(/^https?:\/\//, '') || "example.com"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
