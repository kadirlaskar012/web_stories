"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { toast } from "@/components/ui/Toast";
import { Save, ShieldCheck, Globe, Share2 } from "lucide-react";

export default function SettingsFormClient({ initialSettings }: { initialSettings: Record<string, string> }) {
  const [settings, setSettings] = useState(initialSettings);
  const [loading, setLoading] = useState(false);

  const updateSetting = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed to save settings");
      toast.success("Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-3xl">
      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Globe className="w-4 h-4 text-blue-600" />
          <h2 className="text-base font-semibold text-gray-900">General Brand Configuration</h2>
        </div>
        <Input
          label="Site Name"
          value={settings.site_name || ""}
          onChange={(e) => updateSetting("site_name", e.target.value)}
          placeholder="StoryPulse"
          required
        />
        <Input
          label="Site URL"
          value={settings.site_url || ""}
          onChange={(e) => updateSetting("site_url", e.target.value)}
          placeholder="https://example.com"
          type="url"
          required
        />
        <Textarea
          label="Site Description"
          value={settings.site_description || ""}
          onChange={(e) => updateSetting("site_description", e.target.value)}
          placeholder="Visual stories that engage and inform"
          rows={3}
        />
        <Input
          label="Publisher Name"
          value={settings.publisher_name || ""}
          onChange={(e) => updateSetting("publisher_name", e.target.value)}
          placeholder="StoryPulse Media Inc."
        />
        <Input
          label="Publisher Logo URL (192x192 Square for Google Discover)"
          value={settings.logo_url || ""}
          onChange={(e) => updateSetting("logo_url", e.target.value)}
          placeholder="https://... 192x192 px square logo"
          type="url"
        />
        <Input
          label="Footer Copyright Text"
          value={settings.footer_text || ""}
          onChange={(e) => updateSetting("footer_text", e.target.value)}
          placeholder="© 2026 StoryPulse Media. All rights reserved."
        />
      </div>

      {/* Webmaster & Search Engine Verification */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <h2 className="text-base font-semibold text-gray-900">Search Engine & Pinterest Verification</h2>
        </div>
        <p className="text-xs text-gray-500">
          Paste the verification content or token provided by webmaster tools. These meta tags will automatically be rendered in the site header.
        </p>
        <Input
          label="Google Search Console Verification (content attribute)"
          value={settings.google_verification || ""}
          onChange={(e) => updateSetting("google_verification", e.target.value)}
          placeholder="e.g. 4zX7k9Lm1OpQrStUvWxYz..."
        />
        <Input
          label="Bing Webmaster Tools (msvalidate.01)"
          value={settings.bing_verification || ""}
          onChange={(e) => updateSetting("bing_verification", e.target.value)}
          placeholder="e.g. 7A1B2C3D4E5F6G7H8I9J0K..."
        />
        <Input
          label="Pinterest Domain Verification (p:domain_verify)"
          value={settings.pinterest_verification || ""}
          onChange={(e) => updateSetting("pinterest_verification", e.target.value)}
          placeholder="e.g. 8f9e0a1b2c3d4e5f6a7b8c..."
        />
        <Input
          label="Yandex Webmaster (yandex-verification)"
          value={settings.yandex_verification || ""}
          onChange={(e) => updateSetting("yandex_verification", e.target.value)}
          placeholder="e.g. 1a2b3c4d5e6f7g8h"
        />
      </div>

      {/* Social Profiles */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <Share2 className="w-4 h-4 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-900">Social Profiles & Integrations</h2>
        </div>
        <Input
          label="Twitter / X URL"
          value={settings.social_twitter || ""}
          onChange={(e) => updateSetting("social_twitter", e.target.value)}
          placeholder="https://x.com/storypulse"
        />
        <Input
          label="Instagram URL"
          value={settings.social_instagram || ""}
          onChange={(e) => updateSetting("social_instagram", e.target.value)}
          placeholder="https://instagram.com/storypulse"
        />
        <Input
          label="Facebook URL"
          value={settings.social_facebook || ""}
          onChange={(e) => updateSetting("social_facebook", e.target.value)}
          placeholder="https://facebook.com/storypulse"
        />
        <Input
          label="Google Analytics 4 Measurement ID"
          value={settings.ga_id || ""}
          onChange={(e) => updateSetting("ga_id", e.target.value)}
          placeholder="G-XXXXXXXXXX"
        />
      </div>

      <Button type="submit" variant="secondary" size="lg" loading={loading}>
        <Save className="w-4 h-4" /> Save Settings
      </Button>
    </form>
  );
}
