'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import {
  LayoutDashboard,
  Package,
  FolderPlus,
  ShoppingCart,
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const { adminSession, logoutAdmin, refreshData, loading, products, categories, transactions } = useCart();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!adminSession && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else if (adminSession && (pathname === '/admin/login' || pathname === '/admin')) {
        router.push('/admin/dashboard');
      }
    }
  }, [mounted, adminSession, pathname, router]);

  if (!mounted) {
    return null;
  }

  // Render children directly without sidebar/header on login page or when unauthenticated
  if (pathname === '/admin/login' || !adminSession) {
    return <>{children}</>;
  }

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalOmzet = transactions.reduce((sum, t) => sum + (t.total || 0), 0);

  const getPageTitle = () => {
    if (pathname.includes('/admin/produk')) return 'Manajemen Produk & Stok';
    if (pathname.includes('/admin/kategori')) return 'Manajemen Kategori';
    if (pathname.includes('/admin/laporan')) return 'Laporan Penjualan & Transaksi';
    return 'Dashboard';
  };

  return (
    <div className="min-h-[85vh] flex bg-slate-100 font-sans">

      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 shadow-xl hidden md:flex border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-white font-black shadow-md">
              Ly
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Admin</h2>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <Link
              href="/admin/dashboard"
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${pathname === '/admin/dashboard' || pathname === '/admin'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/admin/produk"
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${pathname.includes('/admin/produk')
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
            >
              <Package className="w-4 h-4" />
              <span>Produk</span>
            </Link>

            <Link
              href="/admin/kategori"
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${pathname.includes('/admin/kategori')
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Kategori</span>
            </Link>

            <Link
              href="/admin/laporan"
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${pathname.includes('/admin/laporan')
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Laporan Penjualan</span>
            </Link>
          </nav>
        </div>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => {
              logoutAdmin();
              router.push('/katalog');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between gap-4 sticky top-16 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-black text-slate-900 capitalize">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Mobile Dropdown Menu */}
            <div className="md:hidden">
              <select
                value={pathname}
                onChange={(e) => router.push(e.target.value)}
                className="text-xs bg-slate-100 font-bold p-2 rounded-xl border border-slate-200"
              >
                <option value="/admin/dashboard">Overview</option>
                <option value="/admin/produk">Produk</option>
                <option value="/admin/kategori">Kategori</option>
                <option value="/admin/laporan">Laporan Penjualan</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}