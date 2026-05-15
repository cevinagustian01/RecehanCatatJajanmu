import prisma from "@/lib/prisma";
import { SettingsEditor } from "./SettingsEditor";

export default async function SettingsPage() {
  const settings = await prisma.siteSetting.findMany({
    orderBy: { key: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Site Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Konfigurasi global platform</p>
      </div>

      <SettingsEditor initialSettings={settings} />
    </div>
  );
}
