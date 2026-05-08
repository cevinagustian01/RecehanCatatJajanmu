"use client";

import { useState } from "react";
import { updateNotifications } from "@/actions/settings-actions";

export default function NotificationsForm({
  initial,
}: {
  initial: {
    notifyTransactionAlerts: boolean;
    notifyWeeklyReports: boolean;
    notifyDailyReminders: boolean;
  };
}) {
  const [notifyTransactionAlerts, setNotifyTransactionAlerts] = useState(initial.notifyTransactionAlerts);
  const [notifyWeeklyReports, setNotifyWeeklyReports] = useState(initial.notifyWeeklyReports);
  const [notifyDailyReminders, setNotifyDailyReminders] = useState(initial.notifyDailyReminders);

  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const res = await updateNotifications({
        notifyTransactionAlerts,
        notifyWeeklyReports,
        notifyDailyReminders,
      });

      if (res.success) setMessage("Notification preferences saved.");
      else setError(res.message ?? "Failed to save notification preferences");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save notification preferences");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Connections & Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">Choose what updates you want to receive.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Transaction Alerts</label>
          <input
            type="checkbox"
            checked={notifyTransactionAlerts}
            onChange={(e) => setNotifyTransactionAlerts(e.target.checked)}
            name="notifyTransactionAlerts"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Weekly Reports</label>
          <input
            type="checkbox"
            checked={notifyWeeklyReports}
            onChange={(e) => setNotifyWeeklyReports(e.target.checked)}
            name="notifyWeeklyReports"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Daily Reminders</label>
          <input
            type="checkbox"
            checked={notifyDailyReminders}
            onChange={(e) => setNotifyDailyReminders(e.target.checked)}
            name="notifyDailyReminders"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Notifications"}
          </button>
          {message ? <span className="text-sm text-green-600">{message}</span> : null}
          {error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}
