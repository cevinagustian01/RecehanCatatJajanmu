"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="h-screen w-full flex overflow-hidden">
      <div className="hidden md:flex md:w-1/2 flex-col justify-between bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 p-8 text-white">
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-3xl bg-white/10 text-2xl font-black shadow-lg shadow-black/10">
            F
          </div>
        </div>

        <div className="space-y-6 pb-12">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/80">FinFlow</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-white">
              Your finance command center.
            </h1>
          </div>
          <p className="max-w-xl text-base text-white/85">
            Get access to your personal financial hub for clarity and productivity. Track wallets, review cashflow, and stay in control of your money with confidence.
          </p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center bg-white dark:bg-slate-950 p-6">
        <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:bg-slate-950/95 dark:border dark:border-white/10">
          <SignUp
            path="/sign-up"
            routing="path"
            signInUrl="/sign-in"
            appearance={{
              elements: {
                formButtonPrimary: "bg-indigo-600 hover:bg-indigo-700 text-sm normal-case shadow-none",
                card: "shadow-none w-full bg-transparent",
                headerTitle: "text-2xl font-bold text-slate-900 dark:text-white",
                headerSubtitle: "text-slate-500 dark:text-slate-400",
                socialButtonsBlockButton: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
                formFieldInput: "rounded-md border border-slate-200 bg-white text-slate-900 shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100",
                footer: "hidden",
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
