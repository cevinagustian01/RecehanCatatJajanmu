"use client";

import { useState, useEffect, useCallback } from "react";
import { updateConnections, getTelegramLinkStatus } from "@/actions/settings-actions";

export default function ConnectionsForm({ initial }: { initial: { connectWhatsApp: boolean; connectTelegram: boolean; phoneNumber: string | null } }) {
  const [connectWhatsApp, setConnectWhatsApp] = useState(initial.connectWhatsApp);
  const [phoneNumber, setPhoneNumber] = useState(initial.phoneNumber ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [telegramStatus, setTelegramStatus] = useState<{ connected: boolean; verified: boolean } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await getTelegramLinkStatus();
      if (res.success && res.data) setTelegramStatus(res.data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/generate-code", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        window.location.href = "https://t.me/dompttapp_bot/start/" + data.code;
      } else {
        setError(data.message ?? "Failed to connect Telegram");
      }
    } catch (e) {
      setError("Failed to connect Telegram");
    } finally {
      setConnecting(false);
    }
  }

  async function handleDisconnect() {
    setRevoking(true);
    setError(null);
    try {
      const res = await fetch("/api/telegram/revoke", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setTelegramStatus({ connected: false, verified: false });
        await updateConnections({ connectWhatsApp, connectTelegram: false, phoneNumber: phoneNumber.trim() || undefined });
        setMessage("Telegram disconnected.");
      } else {
        setError(data.message ?? "Failed to disconnect");
      }
    } catch (e) {
      setError("Failed to disconnect Telegram");
    } finally {
      setRevoking(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);
    try {
      const res = await updateConnections({
        connectWhatsApp,
        connectTelegram: telegramStatus?.verified ?? false,
        phoneNumber: phoneNumber.trim() || undefined,
      });
      if (res.success) setMessage("Saved.");
      else setError(res.message ?? "Failed");
    } catch (err: any) { setError(err?.message); }
    finally { setPending(false); }
  }

  return (
    <section className="rounded-xl border border-gray-100 bg-white/70 p-6 shadow-sm">
      <h2 className="text-lg font-semibold tracking-tight text-gray-900">Connections</h2>
      <p className="mt-1 text-sm text-[#86868b]">Manage external services.</p>

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div><p className="font-medium text-gray-900">WhatsApp</p><p className="text-xs text-[#86868b]">Alerts & reminders</p></div>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input type="checkbox" checked={connectWhatsApp} onChange={(e) => setConnectWhatsApp(e.target.checked)} className="peer sr-only" />
            <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-['] peer-checked:bg-black peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          </label>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.466.466 0 0 1 .151.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
            </div>
            <div><p className="font-medium text-gray-900">Telegram</p><p className="text-xs text-[#86868b]">Voice notes & commands</p></div>
          </div>
          <div className="flex items-center gap-2">
            {telegramStatus?.verified ? (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">Connected</span>
            ) : (
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-[#86868b]">Not connected</span>
            )}
            {telegramStatus?.verified ? (
              <button type="button" onClick={handleDisconnect} disabled={revoking} className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50">
                {revoking ? "Disconnecting..." : "Putuskan"}
              </button>
            ) : (
              <button type="button" onClick={handleConnect} disabled={connecting} className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50">
                {connecting ? "Connecting..." : "Connect"}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Phone Number</label>
          <input className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm placeholder:text-[#86868b] focus:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-100" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+62 812 3456 7890" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={pending} className="rounded-lg bg-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50">
            {pending ? "Saving..." : "Save Changes"}
          </button>
          {message && <span className="text-sm text-green-600">{message}</span>}
          {error && <span className="text-sm text-red-500">{error}</span>}
        </div>
      </form>
    </section>
  );
}
