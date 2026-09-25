'use client';

import { CheckCircle2, ShoppingBag, Printer, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ReceiptModal({ receiptData, onClose, redirectOnClose = false, isAdmin = false }) {
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

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <>
      {/* Print Specific CSS for Admin Print */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-official-receipt, #printable-official-receipt * {
            visibility: visible;
          }
          #printable-official-receipt {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            box-shadow: none !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
        <div id="printable-official-receipt" className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 space-y-6 relative">
          
          {/* Close Button for Admin */}
          {isAdmin && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors no-print"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Header */}
          <div className="text-center space-y-2 pb-4 border-b border-dashed border-slate-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner no-print">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">
              {isAdmin ? 'Struk Resmi Transaksi' : 'Transaksi Berhasil!'}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              {isAdmin ? 'Struk Resmi Bukti Pemesanan Lyffa Rajut' : 'Bukti Konfirmasi Pemesanan Lyffa Rajut'}
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
            <div className="space-y-1.5 text-slate-700 pb-2 border-b border-slate-200 font-sans">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px] shrink-0">Nama Pembeli</span>
                <span className="font-bold text-slate-900 text-xs text-right">{receiptData.nama}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px] shrink-0">WhatsApp</span>
                <span className="font-medium text-slate-800 text-xs text-right">{receiptData.whatsapp}</span>
              </div>
              <div className="flex justify-between items-start gap-4">
                <span className="text-slate-500 text-[11px] shrink-0">Alamat</span>
                <span className="font-medium text-slate-800 text-xs text-right whitespace-normal break-words">
                  {receiptData.alamat}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 text-[11px] shrink-0">Metode Pembayaran</span>
                <span className="font-medium text-slate-800 text-xs text-right">{receiptData.metode}</span>
              </div>
            </div>

            {/* Purchased Items List */}
            <div className="space-y-2 pt-1 font-sans">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Rincian Pesanan
              </span>
              {receiptData.items?.map((item, idx) => {
                const qty = Number(item.quantity || item.jumlah || 1);
                const price = Number(item.price || item.harga || 0);
                return (
                  <div key={idx} className="flex justify-between items-center text-xs gap-2">
                    <span className="text-slate-800 font-semibold whitespace-normal break-words flex-1">
                      {item.name || item.nama_produk} <span className="text-slate-500 text-[11px]">({qty}x)</span>
                    </span>
                    <span className="font-bold text-slate-900 shrink-0">
                      {formatRupiah(price * qty)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Total Amount */}
            <div className="flex justify-between items-center pt-3 border-t-2 border-slate-300 font-sans">
              <span className="text-sm font-extrabold text-slate-900">Total Pembayaran</span>
              <span className="text-lg font-black text-slate-900">
                {formatRupiah(receiptData.total)}
              </span>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="no-print">
            {isAdmin ? (
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handlePrint}
                  className="w-full sm:w-1/2 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 border border-slate-800"
                >
                  <Printer className="w-4 h-4 text-slate-300" />
                  <span>Cetak Struk Resmi</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-1/2 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm rounded-2xl transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 border border-slate-200"
                >
                  <span>Tutup</span>
                </button>
              </div>
            ) : (
              <button
                onClick={handleBack}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4 text-slate-300" />
                <span>Kembali ke Katalog</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </>
  );
}




