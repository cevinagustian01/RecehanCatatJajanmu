import { Shield, AlertCircle } from "lucide-react";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const errorMsg = searchParams?.error === "invalid"
    ? "Email atau password salah"
    : searchParams?.error === "required"
    ? "Email dan password wajib diisi"
    : null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FBFBFD] p-4">
      <div className="w-full max-w-sm">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-[20px] bg-black mb-4">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Admin CMS</h1>
          <p className="text-sm text-[#86868b] mt-1">Panel administrasi Domptt</p>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="mb-6 flex items-center gap-2 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
            <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            <p className="text-xs font-medium text-rose-600">{errorMsg}</p>
          </div>
        )}

        {/* Login Form */}
        <form action="/api/admin/login" method="POST" className="space-y-5">
          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              placeholder="admin@domptt.com"
              required
              autoFocus
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest block mb-1.5">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              required
              className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-300 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full h-11 bg-black text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition-all"
          >
            Masuk ke Admin
          </button>
        </form>

        <p className="text-center mt-8">
          <a href="/sign-in" className="text-xs font-medium text-gray-400 hover:text-gray-600 transition-colors">
            Kembali ke halaman login user
          </a>
        </p>
      </div>
    </div>
  );
}
