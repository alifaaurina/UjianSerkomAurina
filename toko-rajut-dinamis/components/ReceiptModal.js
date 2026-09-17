'use client';

import { CheckCircle2, ShoppingBag, Printer, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReceiptModal({ receiptData, onClose, redirectOnClose = false }) {
  const router = useRouter();

  if (!receiptData) return null;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleBack = () => {
    onClose();
    if (redirectOnClose) {
      router.push('/katalog');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6 relative">
        
        {/* Success Header */}
        <div className="text-center space-y-2 pb-4 border-b border-dashed border-slate-200">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Transaksi Berhasil!</h2>
          <p className="text-xs text-slate-500 font-medium">
            Struk Resmi Bukti Pemesanan Lyffa Rajut
          </p>
        </div>

        {/* Receipt Details Ticket */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4 font-mono text-xs">
          
          <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
            <span>No. Transaksi:</span>
            <span className="font-bold text-slate-900">{receiptData.id}</span>
          </div>

          <div className="flex justify-between text-slate-600 pb-2 border-b border-slate-200">
            <span>Waktu:</span>
            <span className="font-medium text-slate-800">
              {new Date(receiptData.date).toLocaleString('id-ID')}
            </span>
          </div>

          {/* Customer Info */}
          <div className="space-y-1 text-slate-700 pb-2 border-b border-slate-200 font-sans">
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Nama Pembeli</span>
              <span className="font-bold text-slate-900 text-xs">{receiptData.nama}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">WhatsApp</span>
              <span className="font-medium text-slate-800 text-xs">{receiptData.whatsapp}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Alamat</span>
              <span className="font-medium text-slate-800 text-xs text-right max-w-[200px] truncate">
                {receiptData.alamat}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 text-[11px]">Metode Pembayaran</span>
              <span className="font-medium text-slate-800 text-xs text-right max-w-[200px] truncate">{receiptData.metode}</span>
            </div>
          </div>

          {/* Purchased Items List */}
          <div className="space-y-2 pt-1 font-sans">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Rincian Pesanan
            </span>
            {receiptData.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between text-xs">
                <span className="text-slate-800 font-semibold truncate max-w-[220px]">
                  {item.name} <span className="text-slate-500 text-[11px]">({item.quantity}x)</span>
                </span>
                <span className="font-bold text-slate-900">
                  {formatRupiah(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300 font-sans">
            <span className="text-sm font-extrabold text-slate-900">Total Pembayaran</span>
            <span className="text-lg font-black text-slate-900">
              {formatRupiah(receiptData.total)}
            </span>
          </div>

        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleBack}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Kembali</span>
          </button>
        </div>

      </div>
    </div>
  );
}
