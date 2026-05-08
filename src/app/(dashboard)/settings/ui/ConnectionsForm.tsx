"use client";

import { useState } from "react";
import { updateConnections } from "@/actions/settings-actions";

export default function ConnectionsForm({
  initial,
}: {
  initial: {
    connectWhatsApp: boolean;
    connectTelegram: boolean;
    phoneNumber: string | null;
  };
}) {
  const [connectWhatsApp, setConnectWhatsApp] = useState(initial.connectWhatsApp);
  const [connectTelegram, setConnectTelegram] = useState(initial.connectTelegram);
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const res = await updateConnections({
        connectWhatsApp,
        connectTelegram,
        phoneNumber: phoneNumber.trim() ? phoneNumber.trim() : undefined,
      });

      if (res.success) setMessage("Connections updated.");
      else setError(res.message ?? "Failed to update connections");
    } catch (err: any) {
      setError(err?.message ?? "Failed to update connections");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Connections & Notifications</h2>
      <p className="mt-1 text-sm text-muted-foreground">Connect WhatsApp/Telegram and configure contact.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm">Connect WhatsApp</label>
          <input
            type="checkbox"
            checked={connectWhatsApp}
            onChange={(e) => setConnectWhatsApp(e.target.checked)}
            name="connectWhatsApp"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm">Connect Telegram</label>
          <input
            type="checkbox"
            checked={connectTelegram}
            onChange={(e) => setConnectTelegram(e.target.checked)}
            name="connectTelegram"
          />
        </div>

        <div>
          <label className="text-sm">Phone Number</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            name="phoneNumber"
            placeholder="+1 555 123 4567"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Connections"}
          </button>
          {message ? <span className="text-sm text-green-600">{message}</span> : null}
          {error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}
