"use client";

import { Search } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";

export default function TransactionSearch({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (value !== defaultValue) {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
          params.set("query", value);
        } else {
          params.delete("query");
        }
        params.set("page", "1"); // Reset page on new search
        startTransition(() => {
          router.replace(`${pathname}?${params.toString()}`);
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [value, pathname, router, searchParams, defaultValue]);

  return (
    <div className="relative w-full md:w-72">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        placeholder="Search transactions..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-700 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
