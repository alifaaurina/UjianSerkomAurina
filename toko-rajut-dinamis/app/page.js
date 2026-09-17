'use client';

import Link from 'next/link';
import { Tag, HeartHandshake, ShieldCheck, ArrowRight, Sparkles, Award, MapPin, PhoneCall, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="space-y-12 py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. HERO PROMO BANNER (Clean white version) */}
      <section className="relative rounded-3xl bg-white text-slate-900 p-8 sm:p-14 overflow-hidden shadow-xl border border-slate-200">
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content */}
          <div className="lg:col-span-7 space-y-6">

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-slate-900">
              Sentuhan Hangat dalam Setiap Rajutan
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Hadirkan sentuhan hangat dalam setiap momen melalui koleksi rajutan handmade yang modern, nyaman, dan dibuat dengan sepenuh hati.
            </p>

            {/* Checked Promo Highlights Badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>100% Buatan Tangan</span>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>Jaminan Bahan Premium</span>
              </div>
            </div>

           <div className="pt-4">
              <Link
                href="/katalog"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95"
              >
                <span>Jelajahi Katalog Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          {/* Right Card Offer Showcase */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-3xl space-y-4 shadow-lg">
              <div className="w-full h-48 rounded-2xl overflow-hidden relative border border-slate-200">
                <img
                  src="https://i.pinimg.com/1200x/c3/0d/6a/c30d6ac3fc255d952451a1402b25ffa9.jpg"
                  alt="Koleksi Rajut"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Dari Benang Menjadi Karya</h3>
              <p className="text-xs text-slate-600">
                Koleksi terfavorit minggu ini dengan bahan super lembut dan tahan lama.
              </p>
            </div>
          </div>

        </div>
      </section>
      {/* 2. TENTANG TOKO (About Store Section) */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm space-y-8">
        
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Tentang Toko
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
            Toko kerajinan tangan independen yang berdedikasi menciptakan pakaian, aksesoris, dan karya rajutan estetik berkualitas tinggi secara konsisten.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center font-bold">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pengrajin Lokal Berbakat</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Setiap helai rajutan diproduksi secara teliti oleh para pengrajin lokal untuk memberdayakan ekonomi kreatif sekitar.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Bahan Wol Premium</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Menggunakan benang wol dan acrylic pilihan yang tidak mudah brudul, lembut di kulit, dan aman untuk pemakaian sehari-hari.
            </p>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-3 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Pesanan Cepat & Terjamin</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Sistem manajemen toko terintegrasi memproses pesanan langsung dengan pilihan metode pembayaran QRIS maupun Tunai.
            </p>
          </div>

        </div>

        {/* Store Info Footer Banner */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Alamat Lyffa Rajut</h4>
              <p className="text-xs text-slate-400">Jl. Gandhinia No. 12, Surabaya, Jawa Timur</p>
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
