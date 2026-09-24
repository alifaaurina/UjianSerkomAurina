'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import {
  Package,
  FolderPlus,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';

const SLICE_COLORS = [
  '#0f172a', // Slate 900
  '#2563eb', // Blue 600
  '#059669', // Emerald 600
  '#7c3aed', // Violet 600
  '#ea580c', // Orange 600
  '#e11d48', // Rose 600
  '#0284c7', // Sky 600
  '#d97706', // Amber 600
  '#475569', // Slate 600
];

function getCoordinatesForPercent(cx, cy, radius, degree) {
  const rad = ((degree - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

function getDonutSlicePath(cx, cy, radius, innerRadius, startAngle, endAngle) {
  const angle = Math.min(359.99, endAngle - startAngle);
  const effectiveEndAngle = startAngle + angle;

  const startOuter = getCoordinatesForPercent(cx, cy, radius, startAngle);
  const endOuter = getCoordinatesForPercent(cx, cy, radius, effectiveEndAngle);
  const startInner = getCoordinatesForPercent(cx, cy, innerRadius, startAngle);
  const endInner = getCoordinatesForPercent(cx, cy, innerRadius, effectiveEndAngle);

  const largeArcFlag = angle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    'Z',
  ].join(' ');
}

function InteractiveDonutChart({ data, totalValue, unitLabel = 'pcs', isCurrency = false }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  if (!data || data.length === 0 || totalValue === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 space-y-2">
        <PieIcon className="w-10 h-10 stroke-[1.5] text-slate-300" />
        <p className="text-xs font-semibold">Belum ada data transaksi</p>
      </div>
    );
  }

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Calculate angles for each slice
  let currentAngle = 0;
  const slices = data.map((item, idx) => {
    const value = item.value || 0;
    const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;
    const angle = (percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      ...item,
      color: SLICE_COLORS[idx % SLICE_COLORS.length],
      percentage,
      startAngle,
      endAngle,
      path: getDonutSlicePath(100, 100, 85, 52, startAngle, endAngle),
    };
  });

  const activeSlice = hoveredIndex !== null ? slices[hoveredIndex] : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
      
      {/* Donut Chart Canvas */}
      <div className="relative w-48 h-48 shrink-0">
        <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90 drop-shadow-sm">
          {slices.map((slice, idx) => (
            <path
              key={idx}
              d={slice.path}
              fill={slice.color}
              className="transition-all duration-300 cursor-pointer origin-center hover:opacity-90"
              style={{
                transform: hoveredIndex === idx ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: '100px 100px',
              }}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
            />
          ))}
        </svg>

        {/* Center Badge / Hover Details */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
          {activeSlice ? (
            <>
              <span className="text-[10px] font-bold text-slate-500 truncate max-w-[100px]">
                {activeSlice.name}
              </span>
              <span className="text-sm font-black text-slate-900 leading-tight">
                {activeSlice.percentage.toFixed(1)}%
              </span>
              <span className="text-[10px] font-semibold text-slate-600">
                {isCurrency ? formatRupiah(activeSlice.value) : `${activeSlice.value} ${unitLabel}`}
              </span>
            </>
          ) : (
            <>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
              <span className="text-base font-black text-slate-900">
                {isCurrency ? formatRupiah(totalValue) : `${totalValue}`}
              </span>
              <span className="text-[10px] font-semibold text-slate-500">
                {isCurrency ? 'Omzet' : unitLabel}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Legend List */}
      <div className="flex-1 space-y-2 w-full max-h-52 overflow-y-auto pr-1 text-xs">
        {slices.map((slice, idx) => (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIndex(idx)}
            onMouseLeave={() => setHoveredIndex(null)}
            className={`p-2 rounded-xl border transition-all flex items-center justify-between gap-2 cursor-pointer ${
              hoveredIndex === idx
                ? 'bg-slate-100 border-slate-300 shadow-xs'
                : 'bg-slate-50/70 border-slate-100 hover:bg-slate-100/80'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: slice.color }}
              ></span>
              <span className="font-bold text-slate-800 truncate text-[11px]">{slice.name}</span>
            </div>

            <div className="text-right shrink-0 flex items-center gap-2">
              <span className="font-mono text-slate-600 text-[11px]">
                {isCurrency ? formatRupiah(slice.value) : `${slice.value} ${unitLabel}`}
              </span>
              <span className="font-black text-slate-900 bg-white px-2 py-0.5 rounded-md text-[10px] border border-slate-200 shadow-2xs">
                {slice.percentage.toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

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

  // Calculate Product Sales Breakdown (Pie Chart 1 - Kiri)
  const productSalesMap = {};
  products.forEach((p) => {
    productSalesMap[p.id] = {
      id: p.id,
      name: p.name,
      value: 0, // total sold pcs
      revenue: 0,
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
        if (matchedByName) prodEntry = productSalesMap[matchedByName.id];
      }
      if (prodEntry) {
        prodEntry.value += item.quantity || 1;
        prodEntry.revenue += (item.price * item.quantity) || 0;
      }
    });
  });

  const productChartData = Object.values(productSalesMap)
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalProductsSold = productChartData.reduce((sum, p) => sum + p.value, 0);

  // Calculate Category Sales Breakdown (Pie Chart 2 - Kanan)
  const categorySalesMap = {};
  categories.forEach((c) => {
    categorySalesMap[c.nama_kategori] = {
      name: c.nama_kategori,
      value: 0, // total sold pcs
      revenue: 0,
    };
  });

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const matchedProd = products.find(
        (p) => p.id === item.id || p.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
      );
      const catName = matchedProd?.category || item.category || 'Lainnya';
      if (!categorySalesMap[catName]) {
        categorySalesMap[catName] = { name: catName, value: 0, revenue: 0 };
      }
      categorySalesMap[catName].value += item.quantity || 1;
      categorySalesMap[catName].revenue += (item.price * item.quantity) || 0;
    });
  });

  const categoryChartData = Object.values(categorySalesMap)
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);

  const totalCategoryItemsSold = categoryChartData.reduce((sum, c) => sum + c.value, 0);

  // Calculate Category Omzet Stats for bottom breakdown bar
  const categoryOmzetStats = {};
  categories.forEach((c) => {
    categoryOmzetStats[c.nama_kategori] = 0;
  });

  transactions.forEach((t) => {
    (t.items || []).forEach((item) => {
      const matchedProd = products.find(
        (p) => p.id === item.id || p.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
      );
      const catName = matchedProd?.category || item.category || 'Lainnya';
      categoryOmzetStats[catName] = (categoryOmzetStats[catName] || 0) + (item.price * item.quantity);
    });
  });

  const totalCategoryOmzet = Object.values(categoryOmzetStats).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-6">
      
      {/* 1. STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Produk</p>
            <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <FolderPlus className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kategori</p>
            <h3 className="text-2xl font-black text-slate-900">{categories.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
            <h3 className="text-2xl font-black text-slate-900">{transactions.length}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Omzet</p>
            <h3 className="text-lg font-black text-slate-900">{formatRupiah(totalOmzet)}</h3>
          </div>
        </div>
      </div>

      {/* 2. FULL WIDTH: MONTHLY SALES & REVENUE BAR CHART */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-900" />
              <span>Grafik Penjualan & Omzet Bulanan</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Statistik perbandingan omzet dan total transaksi selama 6 bulan terakhir
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black bg-slate-900 text-white px-3.5 py-1.5 rounded-xl shadow-xs">
              Total Omzet: {formatRupiah(totalOmzet)}
            </span>
          </div>
        </div>

        {/* Bar Chart Extended Full Width */}
        <div className="pt-4 pb-2">
          <div className="h-64 flex items-end justify-between gap-4 sm:gap-8 px-4 border-b border-slate-200 relative">
            
            {/* Horizontal Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-40 px-4">
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
              <div className="border-b border-dashed border-slate-200 w-full"></div>
            </div>

            {months.map((m, idx) => {
              const heightPercent = Math.min(100, Math.max(10, Math.round((m.omzet / maxOmzet) * 100)));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative z-10">
                  
                  {/* Tooltip Hover */}
                  <div className="absolute -top-14 bg-slate-900 text-white text-[11px] font-bold py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none shadow-xl z-20 whitespace-nowrap text-center">
                    <p className="text-slate-300 font-medium">{m.monthLabel} {m.year}</p>
                    <p className="text-emerald-400 font-mono font-extrabold">{formatRupiah(m.omzet)}</p>
                    <p className="text-slate-400 text-[10px]">{m.count} Transaksi</p>
                  </div>

                  {/* Top Label */}
                  <span className="text-xs font-extrabold text-slate-700 mb-2 font-mono">
                    {m.omzet > 0 ? (m.omzet >= 1000000 ? `${(m.omzet / 1000000).toFixed(1)}M` : `${Math.round(m.omzet / 1000)}k`) : '0'}
                  </span>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[56px] rounded-t-2xl transition-all duration-500 shadow-sm ${
                      m.omzet > 0
                        ? 'bg-slate-900 group-hover:bg-slate-800 group-hover:scale-105'
                        : 'bg-slate-100'
                    }`}
                  ></div>
                </div>
              );
            })}
          </div>

          {/* X-Axis Month Labels */}
          <div className="flex justify-between gap-4 sm:gap-8 px-4 pt-3 text-xs font-bold text-slate-700">
            {months.map((m, idx) => (
              <div key={idx} className="flex-1 text-center">
                {m.monthLabel}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. DIAGRAM PIE ROW (KIRI: PRODUK, KANAN: KATEGORI) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* KIRI: Diagram Penjualan Produk Terbanyak */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-slate-900" />
                <span>Diagram Penjualan Produk Terbanyak</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Proporsi total unit (pcs) produk yang berhasil terjual
              </p>
            </div>
            <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl">
              {totalProductsSold} pcs
            </span>
          </div>

          <InteractiveDonutChart
            data={productChartData}
            totalValue={totalProductsSold}
            unitLabel="pcs"
          />
        </div>

        {/* KANAN: Diagram Penjualan Kategori Terbanyak */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <Layers className="w-4 h-4 text-slate-900" />
                <span>Diagram Penjualan Kategori Terbanyak</span>
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                Proporsi total unit (pcs) terjual berdasarkan kategori produk
              </p>
            </div>
            <span className="text-xs font-black bg-slate-900 text-white px-3 py-1 rounded-xl">
              {totalCategoryItemsSold} pcs
            </span>
          </div>

          <InteractiveDonutChart
            data={categoryChartData}
            totalValue={totalCategoryItemsSold}
            unitLabel="pcs"
          />
        </div>

      </div>

      {/* 4. TABEL & RINGKASAN KATEGORI DI BAWAH DIAGRAM PIE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Category Omzet Distribution Breakdown */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm">Distribusi Omzet Kategori Produk</h3>
            <p className="text-[11px] text-slate-500 font-medium">Persentase omzet per kategori produk</p>
          </div>

          <div className="space-y-3.5">
            {Object.entries(categoryOmzetStats).map(([catName, omzet], idx) => {
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
