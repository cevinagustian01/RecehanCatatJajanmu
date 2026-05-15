export const dynamic = "force-dynamic";

import { getSettings } from "@/actions/settings-actions";
import ProfileForm from "./ui/ProfileForm";
import ConnectionsForm from "./ui/ConnectionsForm";
import NotificationsForm from "./ui/NotificationsForm";
import PaydayForm from "./ui/PaydayForm";
import DataManagement from "./ui/DataManagement";
import AnalyticsHub from "./ui/AnalyticsHub";

type SettingsPayload = {
  displayName: string | null;
  avatarUrl: string | null;

  connectWhatsApp: boolean;
  connectTelegram: boolean;
  phoneNumber: string | null;

  notifyTransactionAlerts: boolean;
  notifyWeeklyReports: boolean;
  notifyDailyReminders: boolean;

  paydayDate: string | Date | null;
};

export default async function SettingsPage() {
  const res = await getSettings();
  const settings = (res.success ? res.data : null) as SettingsPayload | null;

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage profile, connections, notifications, data backup/reset, and analytics.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {settings ? (
          <>
            <ProfileForm initial={settings} />
            <ConnectionsForm initial={settings} />
            <NotificationsForm initial={settings} />
            <PaydayForm initial={settings} />
            <DataManagement />
            <AnalyticsHub />
          </>
        ) : (
          <div className="rounded-lg border p-4 text-sm">
            Failed to load settings. Please refresh and try again.
          </div>
        )}
      </div>
    </div>
  );
}
