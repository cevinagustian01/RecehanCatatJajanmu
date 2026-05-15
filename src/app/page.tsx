import Link from "next/link";
import prisma from "@/lib/prisma";
import { cache } from "react";
import {
  ChartBar,
  Target,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  MessageCircle,
  Star,
  ChevronDown,
  Quote,
} from "lucide-react";

const getContent = cache(async function (section: string) {
  const data = await prisma.landingPageContent.findUnique({
    where: { section },
  });
  return data;
});

export default async function LandingPage() {
  const [hero, features, testimonials, faq, cta] = await Promise.all([
    getContent("hero"),
    getContent("features"),
    getContent("testimonials"),
    getContent("faq"),
    getContent("cta"),
  ]);

  const heroContent = hero?.content as { cta_text?: string; cta_link?: string } | null;

  return (
    <main className="min-h-screen w-full bg-white dark:bg-black overflow-x-hidden">
      {/* ═══════════════════════════════════════════════
          STICKY NAVBAR — Attention
      ═══════════════════════════════════════════════ */}
      <header className="sticky top-0 inset-x-0 z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gray-900 dark:bg-white flex items-center justify-center">
              <span className="text-white dark:text-black text-xs font-black">D</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              Domptt
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/sign-up"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all hover:bg-black active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              Daftar Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════
          HERO SECTION — Attention
      ═══════════════════════════════════════════════ */}
      {hero?.isActive !== false && <section className="relative flex flex-col items-center justify-center px-5 pt-20 pb-32 md:pt-32 md:pb-44 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[900px] rounded-full bg-gradient-to-br from-emerald-100/60 via-sky-100/40 to-violet-100/50 dark:from-emerald-900/20 dark:via-sky-900/15 dark:to-violet-900/20 blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[300px] w-[600px] rounded-full bg-gradient-to-t from-amber-50/50 to-transparent dark:from-amber-900/10 blur-3xl animate-pulse" style={{ animationDuration: "12s" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-8 inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 shadow-sm">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            <span>Gratis untuk selamanya</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-gray-900 dark:text-white mt-6 leading-[0.95]">
            {hero?.title ?? "Kelola keuangan"}
            <br />
            <span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent">
              {hero?.subtitle ?? "dengan tenang"}
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-xl text-lg md:text-xl text-[#86868b] leading-relaxed">
            {typeof hero?.content === "object" && heroContent?.cta_text
              ? heroContent.cta_text
              : "Domptt membantu Anda melacak semua transaksi, anggaran, dan tabungan. Semua dalam satu platform yang minimalis dan mudah digunakan."}
          </p>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={heroContent?.cta_link ?? "/sign-up"}
              className="inline-flex items-center justify-center rounded-full bg-gray-900 px-8 py-4 text-base md:text-lg font-medium text-white shadow-sm transition-all hover:bg-black hover:shadow-md active:scale-95 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
            >
              {heroContent?.cta_text ?? "Mulai Sekarang"}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-white/5 backdrop-blur-md px-8 py-4 text-base font-semibold text-gray-700 dark:text-gray-300 transition-all hover:bg-gray-50 dark:hover:bg-white/10 active:scale-95"
            >
              Lihat Demo
            </Link>
          </div>
        </div>

        <div className="relative z-10 mt-20 w-full max-w-[calc(100vw-32px)] sm:max-w-3xl mx-auto overflow-hidden">
          <div className="rounded-[28px] border border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-[#1C1C1E]/60 backdrop-blur-2xl shadow-2xl shadow-gray-900/5 dark:shadow-black/30 p-2">
            <div className="rounded-[22px] bg-[#FBFBFD] dark:bg-[#1C1C1E] p-6 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[#86868b] uppercase tracking-wider">Total Saldo</p>
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mt-1">Rp 12.450.000</p>
                </div>
                <div className="flex flex-wrap gap-2 md:gap-3">
                  <div className="flex-shrink-0 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1.5 md:px-4 md:py-2">
                    <p className="text-[10px] md:text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Pemasukan</p>
                    <p className="text-xs md:text-sm font-bold text-emerald-700 dark:text-emerald-300">+Rp 8.2jt</p>
                  </div>
                  <div className="flex-shrink-0 rounded-2xl bg-rose-50 dark:bg-rose-500/10 px-3 py-1.5 md:px-4 md:py-2">
                    <p className="text-[10px] md:text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">Pengeluaran</p>
                    <p className="text-xs md:text-sm font-bold text-rose-700 dark:text-rose-300">-Rp 3.7jt</p>
                  </div>
                </div>
              </div>
              <div className="flex items-end gap-2 h-24">
                {[40, 65, 50, 80, 55, 70, 90, 60, 75, 85, 45, 95].map((h, i) => (
                  <div key={i} className="flex-1 rounded-lg bg-gradient-to-t from-emerald-200 to-emerald-100 dark:from-emerald-800 dark:to-emerald-700 transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>}

      {/* ═══════════════════════════════════════════════
          BENTO BOX FEATURES — Interest
      ═══════════════════════════════════════════════ */}
      {features?.isActive !== false && <section className="py-24 px-5 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Fitur Unggulan</p>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              {features?.title ?? "Bagaimana Domptt Membantumu?"}
            </h2>
          </div>

          {(() => {
            const items = (features?.content as { items?: { title: string; description: string }[] } | null)?.items;
            if (items && items.length > 0) {
              const icons = [ChartBar, Target, Sparkles];
              const colors = ["bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400"];
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items.map((item, i) => {
                    const Icon = icons[i % icons.length];
                    return (
                      <div key={i} className="group bg-gray-50/50 dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/5">
                        <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${colors[i % colors.length]}`}>
                          <Icon className="h-7 w-7" />
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">{item.title}</h3>
                        <p className="text-[#86868b] leading-relaxed">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              );
            }
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="group bg-gray-50/50 dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/5">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-500/10">
                    <ChartBar className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">Visual Cashflow</h3>
                  <p className="text-[#86868b] leading-relaxed">
                    Lihat arus masuk dan keluar uangmu dalam bentuk grafik interaktif yang cantik. Satu pandangan untuk memahami kondisi keuanganmu.
                  </p>
                </div>
                <div className="group bg-gray-50/50 dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/5">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 dark:bg-emerald-500/10">
                    <Target className="h-7 w-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">Budget Tanpa Ribet</h3>
                  <p className="text-[#86868b] leading-relaxed">
                    Atur batas pengeluaran per kategori. Domptt akan memantau dan memberi notifikasi sebelum kamu melewati batas.
                  </p>
                </div>
                <div className="group bg-gray-50/50 dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-gray-900/5 md:col-span-2 lg:col-span-1">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 dark:bg-violet-500/10">
                    <Sparkles className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3">Konsultasi AI</h3>
                  <p className="text-[#86868b] leading-relaxed">
                    Tanyakan apa saja tentang keuanganmu. AI kami siap memberikan analisis dan saran yang dipersonalisasi untukmu.
                  </p>
                </div>
              </div>
            );
          })()}
        </div>
      </section>}

      {/* ═══════════════════════════════════════════════
          AI SHOWCASE — Desire (Dark Section)
      ═══════════════════════════════════════════════ */}
      <section className="w-full bg-black text-white py-24 md:py-32 px-5 md:px-12 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-400 mb-8">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              Didukung AI
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 leading-tight">
              Asisten Keuangan Pintar.{" "}
              <span className="bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Selalu Aktif.
              </span>
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
              Bukan sekadar mencatat. Tanyakan kondisi dompetmu seperti mengobrol dengan teman. Dapatkan insight dan rekomendasi yang cerdas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link
                href="/sign-up"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-gray-900 transition-all hover:bg-gray-100 active:scale-95"
              >
                Coba AI Chat
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
          <div className="flex-1 w-full max-w-md">
            <div className="rounded-[28px] border border-white/10 bg-[#1C1C1E] p-6 shadow-2xl">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Domptt AI</p>
                  <p className="text-[10px] text-gray-500">Selalu aktif</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-white">Berapa total pengeluaran makan bulan ini?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md bg-white/10 px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-gray-200">
                      Total pengeluaran makan bulan ini <span className="font-bold text-rose-400">Rp 1.850.000</span> — naik 12% dari bulan lalu. Saya sarankan untuk memasak di rumah 2-3x seminggu untuk menghemat sekitar Rp 500rb.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <div className="rounded-2xl rounded-br-md bg-blue-600 px-4 py-3 max-w-[80%]">
                    <p className="text-sm text-white">Kasih tips menabung dong</p>
                  </div>
                </div>
                <div className="flex gap-1.5 px-2">
                  <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-2 w-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          TESTIMONIALS — Interest
      ═══════════════════════════════════════════════ */}
      {testimonials?.isActive !== false && (() => {
        const items = (testimonials?.content as { items?: { name: string; role: string; text: string; avatar?: string }[] } | null)?.items;
        if (items && items.length > 0) {
          return (
            <section className="py-24 px-5 md:px-12">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">Testimonial</p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {testimonials?.title ?? "Apa Kata Pengguna?"}
                  </h2>
                  {testimonials?.subtitle && <p className="mt-4 text-lg text-[#86868b] max-w-xl mx-auto">{testimonials.subtitle}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {items.map((item, i) => (
                    <div key={i} className="bg-gray-50/50 dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-[32px] p-8 flex flex-col">
                      <Quote className="h-6 w-6 text-gray-300 dark:text-gray-600 mb-4" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed flex-1 mb-6">&ldquo;{item.text}&rdquo;</p>
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <img src={item.avatar} alt={item.name} loading="lazy" decoding="async" fetchPriority="low" className="h-10 w-10 rounded-full object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.name}</p>
                          {item.role && <p className="text-xs text-gray-400">{item.role}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          );
        }
        return null;
      })()}

      {/* ═══════════════════════════════════════════════
          FAQ — Interest
      ═══════════════════════════════════════════════ */}
      {faq?.isActive !== false && (() => {
        const items = (faq?.content as { items?: { question: string; answer: string }[] } | null)?.items;
        if (items && items.length > 0) {
          return (
            <section className="py-24 px-5 md:px-12 bg-gray-50/30 dark:bg-[#1C1C1E]/30">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-16">
                  <p className="text-sm font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">FAQ</p>
                  <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    {faq?.title ?? "Pertanyaan Umum"}
                  </h2>
                  {faq?.subtitle && <p className="mt-4 text-lg text-[#86868b] max-w-xl mx-auto">{faq.subtitle}</p>}
                </div>
                <div className="space-y-4">
                  {items.map((item, i) => (
                    <details key={i} className="group bg-white dark:bg-[#1C1C1E] border border-gray-100 dark:border-white/5 rounded-2xl overflow-hidden">
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none text-base font-semibold text-gray-900 dark:text-white hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                        {item.question}
                        <ChevronDown className="h-5 w-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                      </summary>
                      <div className="px-6 pb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          );
        }
        return null;
      })()}

      {/* ═══════════════════════════════════════════════
          TRUST STRIP
      ═══════════════════════════════════════════════ */}
      <section className="py-16 px-5 border-b border-gray-100 dark:border-white/5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16 text-center">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-emerald-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Enkripsi End-to-End</span>
          </div>
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Respons Instan</span>
          </div>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Integrasi Telegram</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FINAL CTA — Action
      ═══════════════════════════════════════════════ */}
      {cta?.isActive !== false && <section className="py-32 px-5 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-gray-900 dark:text-white mb-6 leading-[0.95]">
            {cta?.title ?? "Siap merapikan"}
            <br />
            {cta?.subtitle ?? "keuanganmu?"}
          </h2>
          <p className="text-lg text-[#86868b] max-w-xl mx-auto mb-12">
            {(() => {
              const ctaContent = cta?.content as { button_text?: string } | null;
              return ctaContent?.button_text || "Bergabung sekarang — gratis, tanpa kartu kredit. Mulai kelola keuanganmu dengan cara yang lebih tenang.";
            })()}
          </p>
          <Link
            href="/sign-up"
            className="group inline-flex items-center justify-center gap-2.5 rounded-full bg-gray-900 px-10 py-5 text-lg font-semibold text-white shadow-lg shadow-gray-900/10 transition-all hover:bg-black hover:shadow-xl hover:shadow-gray-900/20 active:scale-95 dark:bg-white dark:text-gray-900 dark:shadow-white/10 dark:hover:bg-gray-100"
          >
            Mulai Sekarang — Gratis
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>}

      {/* ═══════════════════════════════════════════════
          FOOTER — Apple Style
      ═══════════════════════════════════════════════ */}
      <footer className="border-t border-gray-100 dark:border-white/5 py-8 px-5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#86868b]">
            © {new Date().getFullYear()} Domptt.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-[#86868b] hover:text-gray-900 dark:hover:text-white transition-colors">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-xs text-[#86868b] hover:text-gray-900 dark:hover:text-white transition-colors">
              Syarat & Ketentuan
            </Link>
            <Link href="#" className="text-xs text-[#86868b] hover:text-gray-900 dark:hover:text-white transition-colors">
              Kontak
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
