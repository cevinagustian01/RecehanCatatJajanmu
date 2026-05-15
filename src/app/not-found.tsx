import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#FBFBFD] px-5">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mx-auto mb-6">
          <span className="text-white text-xl font-black">D</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">404</h1>
        <p className="text-[#86868b] mb-8">Halaman tidak ditemukan</p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </main>
  );
}
