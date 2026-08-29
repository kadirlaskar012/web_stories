import { prisma } from "@/lib/db";
import SettingsFormClient from "./SettingsFormClient";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const settings = await prisma.siteSetting.findMany();
  const settingsMap: Record<string, string> = Object.fromEntries(settings.map((s) => [s.key, s.value || ""]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Configure global application variables and brand metadata</p>
      </div>
      <SettingsFormClient initialSettings={settingsMap} />
    </div>
  );
}
