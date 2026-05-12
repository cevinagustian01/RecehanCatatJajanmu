import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#F5F5F7] p-6 selection:bg-emerald-100 selection:text-emerald-900">
      <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] mb-6 p-4">
          <img 
            src="/logo-icon.png" 
            alt="Domptt Logo" 
            className="h-full w-full object-contain"
          />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 text-center max-w-sm leading-[1.1]">
          Daftar ke Domptt
        </h1>
        <p className="mt-2 text-center text-sm text-[#86868b] font-medium tracking-tight">
          Catat Keuanganmu, Kendalikan Masa Depanmu.
        </p>
      </div>

      <div className="w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
        <div className="rounded-[40px] bg-white/70 backdrop-blur-xl p-1 shadow-[0_20px_50px_rgba(0,0,0,0.04)] border border-white/40">
          <SignUp 
            appearance={{
              elements: {
                rootBox: "w-full flex justify-center",
                cardBox: "shadow-none",
                card: "bg-transparent shadow-none w-full max-w-sm p-8 m-0",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "rounded-full border border-gray-200 dark:border-white/10 text-sm font-medium h-12 mb-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-900 dark:text-white",
                socialButtonsBlockButtonText: "font-semibold",
                dividerLine: "bg-gray-200 dark:bg-white/10",
                dividerText: "text-xs text-gray-400 font-medium tracking-wide",
                formFieldInput: "rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 px-4 py-3 text-sm focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all text-gray-900 dark:text-white",
                formFieldLabel: "text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2",
                formButtonPrimary: "rounded-full bg-gray-900 text-white h-12 font-medium mt-4 hover:bg-black active:scale-95 transition-all dark:bg-white dark:text-gray-900",
                footerActionText: "hidden",
                footerActionLink: "hidden",
              }
            }}
          />
        </div>
        <p className="mt-8 text-center text-[15px] text-[#86868b] font-medium tracking-tight">
          Sudah punya akun?{" "}
          <a href="/sign-in" className="font-bold text-emerald-600 hover:text-emerald-700 transition-colors">Masuk</a>
        </p>
      </div>
    </div>
  );
}