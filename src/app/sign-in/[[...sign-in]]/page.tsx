"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
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
          <SignIn
            path="/sign-in"
            routing="path"
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                card: "bg-transparent shadow-none p-0 m-0 w-full", 
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                footer: "hidden",
                socialButtonsBlockButton: "rounded-full border border-gray-200 bg-white px-4 py-3 text-sm font-medium hover:bg-gray-50 transition-all shadow-sm",
                formFieldInput: "rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm focus:ring-1 focus:ring-black transition-all",
                formButtonPrimary: "rounded-full bg-black hover:bg-gray-800 text-white h-12 text-sm font-medium transition-all active:scale-95",
                dividerLine: "bg-gray-200",
                dividerText: "text-xs font-medium text-gray-400",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
