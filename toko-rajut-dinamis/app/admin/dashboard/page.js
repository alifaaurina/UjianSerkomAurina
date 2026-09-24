'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import {
  Package,
  FolderPlus,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Flame
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { products, categories, transactions } = useCart();

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalOmzet = transactions.reduce((sum, t) => sum + (t.total || 0), 0);

  // Prepare data for monthly sales bar chart (last 6 months)
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      monthLabel: d.toLocaleString('id-ID', { month: 'short' }),
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      omzet: 0,
      count: 0,
    });
  }

  transactions.forEach((t) => {
    const txDate = new Date(t.date);
    months.forEach((m) => {
      if (txDate.getMonth() === m.monthIndex && txDate.getFullYear() === m.year) {
        m.omzet += t.total || 0;
        m.count += 1;
      }
    });
  });

  const maxOmzet = Math.max(...months.map((m) => m.omzet), 100000);

  // Calculate category sales distribution
  const categoryStats = {};
  categories.forEach((c) => {
    categoryStats[c.nama_kategori] = 0;
  });

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const matchedProd = products.find(
        (p) => p.id === item.id || p.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
      );
      const catName = matchedProd?.category || item.category || 'Lainnya';
      categoryStats[catName] = (categoryStats[catName] || 0) + (item.price * item.quantity);
    });
  });

  const totalCategoryOmzet = Object.values(categoryStats).reduce((a, b) => a + b, 0) || 1;

  // Calculate Top Selling Products (Produk Terlaris)
  const productSalesMap = {};
  products.forEach((p) => {
    productSalesMap[p.id] = {
      id: p.id,
      name: p.name,
      image: p.image,
      category: p.category,
      price: p.price,
      stok: p.stok,
      totalSold: 0,
      totalRevenue: 0,
    };
  });

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const targetId = item.id;
      let prodEntry = productSalesMap[targetId];

      if (!prodEntry) {
        const matchedByName = products.find(
          (p) => p.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        if (matchedByName) {
          prodEntry = productSalesMap[matchedByName.id];
        }
      }

      if (prodEntry) {
        prodEntry.totalSold += item.quantity || 1;
        prodEntry.totalRevenue += (item.price * item.quantity) || 0;
      }
    });
  });

  const bestSellingProducts = Object.values(productSalesMap)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5);

  const maxSoldQty = Math.max(...bestSellingProducts.map((p) => p.totalSold), 1);

  return (
    <div className="space-y-6">
      
      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Produk</p>
            <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kategori</p>
            <h3 className="text-2xl font-black text-slate-900">{categories.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
            <h3 className="text-2xl font-black text-slate-900">{transactions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Omzet</p>
            <h3 className="text-lg font-black text-slate-900">{formatRupiah(totalOmzet)}</h3>
          </div>
        </div>
      </div>

      {/* CHARTS ROW 1: Monthly Sales Bar Chart & Top Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Monthly Sales Bar Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-slate-900" />
                <span>Grafik Penjualan & Omzet Bulanan</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Statistik omzet 6 bulan terakhir
              </p>
            </div>
            <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl shadow-xs">
              Total: {formatRupiah(totalOmzet)}
            </span>
          </div>

          {/* Bar Chart Visualization */}
          <div className="pt-4 pb-2">
            <div className="h-56 flex items-end justify-between gap-3 sm:gap-6 px-2 sm:px-4 border-b border-slate-200">
              {months.map((m, idx) => {
                const heightPercent = Math.min(100, Math.max(12, Math.round((m.omzet / maxOmzet) * 100)));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    
                    {/* Hover Tooltip */}
                    <div className="absolute -top-12 bg-slate-900 text-white text-[10px] font-bold py-1.5 px-2.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-md z-10 whitespace-nowrap">
                      <p>{m.monthLabel} {m.year}</p>
                      <p className="text-emerald-400 font-mono">{formatRupiah(m.omzet)}</p>
                      <p className="text-slate-300 font-normal">{m.count} transaksi</p>
                    </div>

                    {/* Value Label Top */}
                    <span className="text-[10px] font-bold text-slate-600 mb-1">
                      {m.omzet > 0 ? (m.omzet >= 1000000 ? `${(m.omzet / 1000000).toFixed(1)}M` : `${Math.round(m.omzet / 1000)}k`) : '0'}
                    </span>

                    {/* Animated Bar */}
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full max-w-[44px] rounded-t-xl transition-all duration-500 ${
                        m.omzet > 0
                          ? 'bg-slate-900 group-hover:bg-slate-800 shadow-sm'
                          : 'bg-slate-100'
                      }`}
                    ></div>
                  </div>
                );
              })}
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between gap-3 sm:gap-6 px-2 sm:px-4 pt-3 text-xs font-bold text-slate-600">
              {months.map((m, idx) => (
                <div key={idx} className="flex-1 text-center">
                  {m.monthLabel}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Produk Penjualan Terlaris (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-slate-900" />
                <span>Produk Penjualan Terlaris</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Peringkat produk berdasarkan total terjual</p>
            </div>
          </div>

          <div className="space-y-3">
            {bestSellingProducts.map((prod, idx) => {
              const barWidthPercent = Math.min(100, Math.max(15, Math.round((prod.totalSold / maxSoldQty) * 100)));
              return (
                <div key={prod.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center shrink-0 ${
                        idx === 0
                          ? 'bg-slate-900 text-white'
                          : idx === 1
                          ? 'bg-slate-700 text-white'
                          : idx === 2
                          ? 'bg-slate-500 text-white'
                          : 'bg-slate-200 text-slate-800'
                      }`}>
                        {idx + 1}
                      </span>
                      <img src={prod.image} alt={prod.name} className="w-8 h-8 object-cover rounded-lg bg-white border shrink-0" />
                      <span className="text-xs font-bold text-slate-900 truncate">{prod.name}</span>
                    </div>
                    <span className="text-xs font-black text-slate-900 shrink-0">
                      {prod.totalSold} pcs
                    </span>
                  </div>

                  {/* Terjual Progress Bar */}
                  <div className="w-full bg-slate-200/70 h-2 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${barWidthPercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        idx === 0 ? 'bg-slate-900' : 'bg-slate-700'
                      }`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CHARTS ROW 2 & TABLES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Omzet Distribution Breakdown */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Distribusi Kategori Produk</h3>
            <p className="text-[11px] text-slate-500 font-medium">Persentase omzet per kategori produk</p>
          </div>

          <div className="space-y-3.5">
            {Object.entries(categoryStats).map(([catName, omzet], idx) => {
              const percent = Math.round((omzet / totalCategoryOmzet) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{catName}</span>
                    <span className="font-mono text-slate-600">{formatRupiah(omzet)} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-slate-900 h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kategori Ringkasan */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Kategori Produk Rajut</h3>
            <Link
              href="/admin/kategori"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline"
            >
              Kelola Kategori →
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {categories.map((c) => (
              <span key={c.id} className="px-4 py-2.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-2xl">
                {c.nama_kategori}
              </span>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
