'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import ReceiptModal from '@/components/ReceiptModal';
import handlePrintReport from './PrintLaporan';
import {
  Printer,
  Filter,
  Eye,
  X,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';

export default function AdminLaporanPage() {
  const {
    products,
    categories,
    transactions
  } = useCart();

  // Sales Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [periodFilter, setPeriodFilter] = useState('all'); // 'all' | 'today' | 'week' | 'month' | 'year'
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Receipt & Detail Modal States
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [selectedDetailTx, setSelectedDetailTx] = useState(null);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
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

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-6">
      
      {/* Header & Print Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Laporan Pesanan & Transaksi</h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Kelola dan cetak rekapitulasi laporan penjualan toko rajut (Permanen)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePrintReport(filteredTransactions, true, { startDate, endDate, periodFilter, categoryFilter })}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Laporan Filter PDF</span>
          </button>

          <button
            onClick={() => handlePrintReport(transactions, false, { startDate: '', endDate: '', periodFilter: 'all', categoryFilter: 'all' })}
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
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
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
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedDetailTx(t)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer shadow-2xs"
                        title="Lihat Detail Transaksi"
                      >
                        <Eye className="w-4 h-4 text-slate-700" />
                      </button>

                      <button
                        onClick={() => setSelectedReceipt(t)}
                        className="p-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-xs cursor-pointer"
                        title="Cetak Struk Resmi"
                      >
                        <Printer className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Transaksi Modal */}
      {selectedDetailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 my-8 relative">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 text-slate-800 rounded-xl flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Detail Transaksi
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    {selectedDetailTx.id}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDetailTx(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="space-y-4 text-xs">
              
              {/* Info Pembeli */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2.5">
                <h4 className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">
                  Informasi Pembeli
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-900">{selectedDetailTx.nama}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedDetailTx.whatsapp}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(selectedDetailTx.date).toLocaleString('id-ID')}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {selectedDetailTx.metode}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-start gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{selectedDetailTx.alamat}</span>
                </div>
              </div>

              {/* Rincian Pesanan */}
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 text-[11px] uppercase tracking-wider text-slate-500">
                  Rincian Barang Dipesan
                </h4>

                <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {selectedDetailTx.items?.map((item, idx) => {
                    const qty = Number(item.quantity || item.jumlah || 1);
                    const price = Number(item.price || item.harga || 0);
                    return (
                      <div key={idx} className="p-3 flex justify-between items-center bg-white">
                        <div>
                          <p className="font-bold text-slate-900">{item.name || item.nama_produk}</p>
                          <p className="text-[11px] text-slate-500">
                            {qty} x {formatRupiah(price)}
                          </p>
                        </div>
                        <span className="font-extrabold text-slate-900">
                          {formatRupiah(price * qty)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Payment */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex justify-between items-center">
                <span className="font-bold text-xs">Total Pembayaran:</span>
                <span className="font-black text-base">{formatRupiah(selectedDetailTx.total)}</span>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setSelectedDetailTx(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Tutup
              </button>
              
              <button
                onClick={() => {
                  setSelectedReceipt(selectedDetailTx);
                  setSelectedDetailTx(null);
                }}
                className="px-4 py-2.5 text-xs font-extrabold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk Resmi</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Transaction Receipt Modal */}
      <ReceiptModal
        receiptData={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        isAdmin={true}
      />

    </div>
  );
}
