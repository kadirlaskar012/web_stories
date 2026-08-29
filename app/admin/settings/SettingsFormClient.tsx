"use client";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/FormFields";
import { toast } from "@/components/ui/Toast";
import { Save } from "lucide-react";

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
    <form onSubmit={handleSave} className="space-y-8 max-w-2xl">
      {/* General Settings */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">General Configuration</h2>
        <Input
          label="Site Name"
          value={settings.site_name || ""}
          onChange={(e) => updateSetting("site_name", e.target.value)}
          placeholder="StoryFlow"
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
          placeholder="StoryFlow Media Inc."
        />
        <Input
          label="Publisher Logo URL"
          value={settings.publisher_logo || ""}
          onChange={(e) => updateSetting("publisher_logo", e.target.value)}
          placeholder="https://... 96x96 px logo"
          type="url"
        />
        <Input
          label="Footer Copyright Text"
          value={settings.footer_text || ""}
          onChange={(e) => updateSetting("footer_text", e.target.value)}
          placeholder="© 2026 StoryFlow. All rights reserved."
        />
      </div>

      {/* Social Profiles */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Social Profiles</h2>
        <Input
          label="Twitter / X URL"
          value={settings.social_twitter || ""}
          onChange={(e) => updateSetting("social_twitter", e.target.value)}
          placeholder="https://x.com/storyflow"
        />
        <Input
          label="Instagram URL"
          value={settings.social_instagram || ""}
          onChange={(e) => updateSetting("social_instagram", e.target.value)}
          placeholder="https://instagram.com/storyflow"
        />
        <Input
          label="Facebook URL"
          value={settings.social_facebook || ""}
          onChange={(e) => updateSetting("social_facebook", e.target.value)}
          placeholder="https://facebook.com/storyflow"
        />
      </div>

      {/* Tracking & Analytics */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm space-y-4">
        <h2 className="text-base font-semibold text-gray-900 border-b border-gray-100 pb-3">Integrations & Tracking</h2>
        <Input
          label="Google Analytics ID (GA4)"
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
