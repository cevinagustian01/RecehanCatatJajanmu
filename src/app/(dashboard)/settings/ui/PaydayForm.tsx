"use client";

import { useState } from "react";
import { updatePaydayDate } from "@/actions/settings-actions";

function toDateInputValue(d: Date | string | null) {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function PaydayForm({
  initial,
}: {
  initial: { paydayDate: Date | string | null };
}) {
  const [paydayValue, setPaydayValue] = useState(toDateInputValue(initial.paydayDate));
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setMessage(null);
    setError(null);

    try {
      const res = await updatePaydayDate(paydayValue ? new Date(paydayValue).toISOString() : null);
      if (res.success) setMessage("Payday date saved.");
      else setError(res.message ?? "Failed to save payday date.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to save payday date.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Payday Tracker</h2>
      <p className="mt-1 text-sm text-muted-foreground">Set your payday date for reminders and insights.</p>

      <form onSubmit={onSubmit} className="mt-4 space-y-3">
        <div>
          <label className="text-sm">Payday date</label>
          <input
            type="date"
            className="mt-1 w-full rounded border px-3 py-2"
            value={paydayValue}
            onChange={(e) => setPaydayValue(e.target.value)}
            name="paydayDate"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save Payday Date"}
          </button>

          {message ? <span className="text-sm text-green-600">{message}</span> : null}
          {error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}
