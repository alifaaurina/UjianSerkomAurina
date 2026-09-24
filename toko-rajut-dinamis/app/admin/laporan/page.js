'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import ReceiptModal from '@/components/ReceiptModal';
import {
  Trash2,
  Printer,
  Filter
} from 'lucide-react';

export default function AdminLaporanPage() {
  const {
    products,
    categories,
    transactions,
    deleteTransactionState
  } = useCart();

  // Sales Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'year'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleDeleteTransaction = (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    deleteTransactionState(id);
  };

  // Filter transactions based on date, period, and category
  const filteredTransactions = transactions.filter((t) => {
    const txDate = new Date(t.date);

    // 1. Date Range Filter
    if (startDate) {
      const sDate = new Date(startDate);
      sDate.setHours(0, 0, 0, 0);
      if (txDate < sDate) return false;
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      if (txDate > eDate) return false;
    }

    // 2. Quick Period Filter
    if (periodFilter !== 'all') {
      const now = new Date();
      if (periodFilter === 'today') {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (txDate < todayStart) return false;
      } else if (periodFilter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (txDate < weekAgo) return false;
      } else if (periodFilter === 'month') {
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        if (txDate < monthAgo) return false;
      } else if (periodFilter === 'year') {
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        if (txDate < yearAgo) return false;
      }
    }

    // 3. Category Filter
    if (categoryFilter !== 'all') {
      const hasCategoryItem = t.items?.some((item) => {
        const matchingProd = products.find(
          (p) => p.id === item.id || p.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        return (
          matchingProd?.category?.toLowerCase() === categoryFilter.toLowerCase() ||
          item.category?.toLowerCase() === categoryFilter.toLowerCase()
        );
      });
      if (!hasCategoryItem) return false;
    }

    return true;
  });

  const filteredOmzet = filteredTransactions.reduce((sum, t) => sum + (t.total || 0), 0);

  const handlePrintReport = (itemsToPrint, titleSuffix = '') => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Gagal membuka jendela cetak. Pastikan pop-up dibolehkan di browser Anda.');
      return;
    }

    const rowsHtml = itemsToPrint.length === 0
      ? `<tr><td colspan="7" style="text-align: center; padding: 20px; color: #888;">Tidak ada data transaksi.</td></tr>`
      : itemsToPrint.map((t) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-family: monospace;">${t.id}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${new Date(t.date).toLocaleString('id-ID')}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold;">${t.nama}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.whatsapp}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd;">${t.metode}</td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-size: 11px;">
              ${(t.items || []).map(i => `${i.name} (${i.quantity}x)`).join(', ')}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; text-align: right;">
              ${formatRupiah(t.total)}
            </td>
          </tr>
        `).join('');

    const totalOmzetPrint = itemsToPrint.reduce((sum, t) => sum + (t.total || 0), 0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Penjualan - Lyffa Rajut</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            h1 { font-size: 20px; margin-bottom: 5px; color: #111; }
            p { font-size: 12px; color: #666; margin-top: 0; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th { background: #1e293b; color: #fff; padding: 10px 8px; text-align: left; }
            .total-box { margin-top: 20px; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; font-weight: bold; font-size: 14px; text-align: right; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>Laporan Penjualan Lyffa Rajut ${titleSuffix}</h1>
          <p>Tanggal Cetak: ${new Date().toLocaleString('id-ID')} | Total Transaksi: ${itemsToPrint.length}</p>
          <table>
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Waktu</th>
                <th>Pembeli</th>
                <th>WhatsApp</th>
                <th>Metode</th>
                <th>Rincian Barang</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
          <div class="total-box">
            Total Omzet Penjualan: ${formatRupiah(totalOmzetPrint)}
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* Header & Print Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Laporan Pesanan & Transaksi</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola dan cetak rekapitulasi laporan penjualan toko rajut
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePrintReport(filteredTransactions, '(Sesuai Filter)')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan Filter PDF</span>
          </button>

          <button
            onClick={() => handlePrintReport(transactions, '(Semua Data)')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-slate-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Cetak Semua Laporan PDF</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <Filter className="w-4 h-4 text-slate-500" />
          <span>Filter Laporan Penjualan</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          
          {/* 1. Filter Rentang Tanggal Mulai */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal Mulai</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* 2. Filter Rentang Tanggal Akhir */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Tanggal Sampai</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* 3. Filter Periode Cepat */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Periode Waktu</label>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Semua Periode</option>
              <option value="today">Hari Ini</option>
              <option value="week">7 Hari Terakhir</option>
              <option value="month">30 Hari Terakhir</option>
              <option value="year">1 Tahun Terakhir</option>
            </select>
          </div>

          {/* 4. Filter Kategori Produk */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Kategori Produk</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-slate-900"
            >
              <option value="all">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.nama_kategori}>
                  {c.nama_kategori}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Reset Filters */}
        {(startDate || endDate || periodFilter !== 'all' || categoryFilter !== 'all') && (
          <div className="pt-1 flex items-center justify-between border-t border-slate-200/60">
            <span className="text-[11px] font-semibold text-slate-500">
              Menampilkan <strong className="text-slate-900">{filteredTransactions.length}</strong> dari {transactions.length} transaksi (Total Omzet Filter: <strong className="text-slate-900">{formatRupiah(filteredOmzet)}</strong>)
            </span>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setPeriodFilter('all');
                setCategoryFilter('all');
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[11px] sm:text-xs">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
            <tr>
              <th className="p-2.5">No. Transaksi</th>
              <th className="p-2.5">Waktu</th>
              <th className="p-2.5">Pembeli</th>
              <th className="p-2.5">WhatsApp</th>
              <th className="p-2.5">Metode</th>
              <th className="p-2.5">Total</th>
              <th className="p-2.5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                  Tidak ada data transaksi yang cocok dengan filter yang dipilih.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2.5 font-mono text-slate-900 font-bold">{t.id}</td>
                  <td className="p-2.5 text-slate-500">
                    {new Date(t.date).toLocaleString('id-ID')}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900">{t.nama}</td>
                  <td className="p-2.5 text-slate-600">{t.whatsapp}</td>
                  <td className="p-2.5">
                    <span className="bg-slate-100 text-slate-800 border border-slate-200 text-[10px] px-2 py-0.5 rounded-md font-bold">
                      {t.metode}
                    </span>
                  </td>
                  <td className="p-2.5 font-black text-slate-900">
                    {formatRupiah(t.total)}
                  </td>
                  <td className="p-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setSelectedReceipt(t)}
                        className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 font-bold text-[11px] cursor-pointer"
                        title="Cetak & Pratinjau Struk"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Cetak Struk</span>
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(t.id)}
                        className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Transaction Receipt Modal */}
      <ReceiptModal
        receiptData={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        isAdmin={true}
      />

    </div>
  );
}
