import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F7] p-6 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out">
        {/* Compact Logo Area */}
        <div className="flex flex-col items-center mb-8">
          <img 
            src="/logo-icon.png" 
            alt="Domptt Logo" 
            className="w-12 h-12 object-contain mb-4"
          />
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight mb-1">
            Masuk ke Domptt
          </h1>
          <p className="text-sm text-slate-500 font-normal">
            Catat Keuanganmu, Kendalikan Masa Depanmu.
          </p>
        </div>

        {/* Clerk SignIn with Apple HIG styling */}
        <div className="rounded-[32px] bg-white/70 backdrop-blur-xl p-10 shadow-[0_8px_32px_0_rgba(31,38,135,0.04)] border border-white/20">
          <SignIn 
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

        <div className="mt-8 flex flex-col items-center gap-2">
          <a href="/sign-up" className="text-[13px] text-slate-500 hover:text-emerald-600 underline transition-colors">
            Daftar Akun Baru
          </a>
          <a href="#" className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
            Lupa kata sandi?
          </a>
        </div>
      </div>
    </div>
  );
}