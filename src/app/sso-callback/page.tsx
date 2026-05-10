"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SSOCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Clerk handles the redirect automatically, just wait and redirect
    const timer = setTimeout(() => {
      router.push("/");
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 p-4">
      <div className="flex flex-col items-center">
        <div className="relative mb-6">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-500" />
        </div>
        <h2 className="text-xl font-semibold text-slate-700">
          Signing you in...
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          You&apos;ll be redirected shortly.
        </p>
      </div>
    </div>
  );
}
