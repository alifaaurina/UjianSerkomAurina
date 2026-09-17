'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, ShieldCheck, Home, Grid, UserCheck } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { cartItems, adminSession } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Distinct item count badge per user prompt
  const distinctCartCount = cartItems ? cartItems.length : 0;

  const isActive = (path) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 group-hover:bg-slate-800 text-white font-black text-sm sm:text-lg rounded-xl flex items-center justify-center shadow-sm transition-all">
            Ly
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 group-hover:text-slate-600 transition-colors">
              Lyffa Rajut
            </span>
          </div>
        </Link>

        {/* Center/Right Main Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          
          {/* 1. Beranda */}
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              isActive('/')
                ? 'bg-slate-100 sm:bg-white text-slate-900 shadow-xs sm:shadow-sm border border-slate-300'
                : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Beranda</span>
          </Link>

          {/* 2. Katalog Produk */}
          <Link
            href="/katalog"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              isActive('/katalog')
                ? 'bg-slate-100 sm:bg-white text-slate-900 shadow-xs sm:shadow-sm border border-slate-300'
                : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Grid className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Katalog Produk</span>
            <span className="inline sm:hidden">Katalog</span>
          </Link>

          {/* 3. Keranjang (with item count bubble badge) */}
          <Link
            href="/keranjang"
            className={`relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              isActive('/keranjang')
                ? 'bg-slate-100 sm:bg-white text-slate-900 shadow-xs sm:shadow-sm border border-slate-300'
                : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Keranjang</span>
            {mounted && distinctCartCount > 0 && (
              <span className="bg-slate-900 text-white font-black text-[10px] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center border sm:border-2 border-white shadow-xs">
                {distinctCartCount}
              </span>
            )}
          </Link>

          {/* 4. Login Admin / Admin Dashboard */}
          {mounted && adminSession ? (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                isActive('/admin')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4 text-slate-300 shrink-0" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="inline sm:hidden">Admin</span>
            </Link>
          ) : (
            <Link
              href="/admin"
              className={`flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
                isActive('/admin')
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-slate-300 shrink-0" />
              <span>Login</span>
            </Link>
          )}

        </nav>

      </div>
    </header>
  );
}