"use client";

import { useState } from "react";
import {
  backupWalletsAndTransactions,
  resetWalletsAndTransactions,
} from "@/actions/settings-actions";

function downloadTextFile(filename: string, content: string, mime = "application/octet-stream") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
}

export default function DataManagement() {
  const [pendingBackup, setPendingBackup] = useState(false);
  const [pendingReset, setPendingReset] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onBackup() {
    setPendingBackup(true);
    setMessage(null);
    setError(null);
    try {
      const res = await backupWalletsAndTransactions();
      if (!res.success) {
        setError(res.message ?? "Backup failed");
        return;
      }

      downloadTextFile("wallet-transactions-backup.json", res.data.json, "application/json");
      downloadTextFile("wallet-transactions-backup.csv", res.data.csv, "text/csv");

      setMessage("Backup exported (JSON + CSV).");
    } catch (e: any) {
      setError(e?.message ?? "Backup failed");
    } finally {
      setPendingBackup(false);
    }
  }

  async function onReset() {
    if (!confirm("Danger Zone: This will delete ALL wallets' transactions and wallets for your account. Continue?")) return;

    setPendingReset(true);
    setMessage(null);
    setError(null);
    try {
      const res = await resetWalletsAndTransactions();
      if (!res.success) {
        setError(res.message ?? "Reset failed");
        return;
      }
      setMessage("Data reset complete.");
    } catch (e: any) {
      setError(e?.message ?? "Reset failed");
    } finally {
      setPendingReset(false);
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Data Management</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Backup/Restore your local wallet + transaction data, or reset everything (Danger Zone).
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={pendingBackup}
            onClick={onBackup}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pendingBackup ? "Backing up..." : "Backup Wallets & Transactions"}
          </button>
        </div>

        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-red-700">Danger Zone</div>
              <div className="text-xs text-red-700/80">This permanently deletes wallets & transactions (keeps your User account).</div>
            </div>
            <button
              type="button"
              disabled={pendingReset}
              onClick={onReset}
              className="rounded bg-red-600 px-4 py-2 text-white disabled:opacity-50"
            >
              {pendingReset ? "Resetting..." : "RESET DATA"}
            </button>
          </div>
        </div>

        {message ? <div className="text-sm text-green-600">{message}</div> : null}
        {error ? <div className="text-sm text-red-600">{error}</div> : null}
      </div>
    </section>
  );
}
