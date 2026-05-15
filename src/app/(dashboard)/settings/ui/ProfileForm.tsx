"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateProfile } from "@/actions/settings-actions";

export default function ProfileForm({
  initial,
}: {
  initial: { displayName: string | null; avatarUrl: string | null };
}) {
  const { user, isLoading } = useAuth();

  const [displayName, setDisplayName] = useState(initial.displayName ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initial.avatarUrl ?? null);

  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => !isLoading && !!user && !pending, [isLoading, user, pending]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <section className="rounded-lg border p-4">
      <h2 className="text-lg font-semibold">Profile Management</h2>
      <p className="mt-1 text-sm text-muted-foreground">Update name and avatar.</p>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setError(null);

          try {
            if (!user) throw new Error("Unauthenticated");

            let nextAvatarUrl = previewUrl;

            if (file) {
              const formData = new FormData();
              formData.append("file", file);
              const res = await fetch("/api/upload/avatar", { method: "POST", body: formData });
              const data = await res.json();
              if (data.avatarUrl) nextAvatarUrl = data.avatarUrl;
            }

            const res = await updateProfile({
              displayName: displayName.trim() ? displayName.trim() : null,
              avatarUrl: nextAvatarUrl ?? null,
            } as any);

            if (!res.success) throw new Error(res.message ?? "Failed to update profile");

            toast.success("Success");
          } catch (err: any) {
            setError(err?.message ?? "Failed to update profile.");
          } finally {
            setPending(false);
          }
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <label className="text-sm">Name</label>
          <input
            className="mt-1 w-full rounded border px-3 py-2"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            name="displayName"
            placeholder="Your name"
            disabled={pending}
          />
        </div>

        <div>
          <label className="text-sm">Avatar</label>

          <div className="mt-3 flex items-center gap-4">
            <div className="h-14 w-14 overflow-hidden rounded-full border bg-muted/30 flex items-center justify-center">
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Avatar preview" className="h-full w-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No image</span>
              )}
            </div>

            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                disabled={pending}
                onChange={(e) => {
                  const next = e.target.files?.[0] ?? null;
                  setFile(next);

                  if (next) {
                    const url = URL.createObjectURL(next);
                    setPreviewUrl(url);
                  } else {
                    setPreviewUrl(initial.avatarUrl ?? null);
                  }
                }}
                className="mt-1 w-full rounded border px-3 py-2 text-sm file:mr-4 file:rounded file:border-0 file:bg-black file:px-3 file:py-1 file:text-white file:font-semibold hover:file:bg-black/90"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={!canSubmit}
            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50 inline-flex items-center gap-2"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? "Uploading..." : "Save Profile"}
          </button>

          {error ? <span className="text-sm text-red-600">{error}</span> : null}
        </div>
      </form>
    </section>
  );
}

