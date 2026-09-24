'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { ShieldCheck, ArrowLeft, CreditCard, QrCode, Banknote, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ReceiptModal from '@/components/ReceiptModal';

export default function CheckoutPage() {
  const { cartItems, completeOrder } = useCart();
  const router = useRouter();

  const [directItems] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('direct_buy_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {}
      }
    }
    return null;
  });

  const isDirectBuy = Boolean(directItems && directItems.length > 0);
  const activeCheckoutItems = isDirectBuy ? directItems : cartItems;

  const [formData, setFormData] = useState({
    nama: '',
    whatsapp: '',
    alamat: '',
    metode: 'QRIS',
  });
  const [errors, setErrors] = useState({});
  const [receiptData, setReceiptData] = useState(null);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalPrice = activeCheckoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const validate = () => {
    let err = {};
    if (!formData.nama.trim()) err.nama = 'Nama lengkap wajib diisi';
    if (!formData.whatsapp.trim()) {
      err.whatsapp = 'Nomor WhatsApp wajib diisi';
    } else if (!/^[0-9+]{9,15}$/.test(formData.whatsapp.trim())) {
      err.whatsapp = 'Format nomor WhatsApp tidak valid (misal: 08123456789)';
    }
    if (!formData.alamat.trim()) err.alamat = 'Alamat pengiriman wajib diisi';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmitOrder = (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (activeCheckoutItems.length === 0) {
      alert('Pesanan Anda kosong.');
      return;
    }

    const transactionId = `TRX-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderData = {
      id: transactionId,
      date: new Date().toISOString(),
      nama: formData.nama.trim(),
      whatsapp: formData.whatsapp.trim(),
      alamat: formData.alamat.trim(),
      metode: formData.metode,
      total: totalPrice,
      items: [...activeCheckoutItems],
      isDirectBuy: isDirectBuy,
    };

    // Trigger completeOrder in Context (reduces stock & saves transaction)
    completeOrder(newOrderData);

    // Clean direct buy items from sessionStorage
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('direct_buy_items');
    }

    // Show Receipt Modal
    setReceiptData(newOrderData);
  };

  if (activeCheckoutItems.length === 0 && !receiptData) {
    return (
      <div className="max-w-lg mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-sm">
        <h2 className="text-xl font-black text-slate-900">Pesanan Masih Kosong</h2>
        <p className="text-xs text-slate-500">Silakan pilih barang di katalog terlebih dahulu.</p>
        <button
          onClick={() => router.push('/katalog')}
          className="px-6 py-3 bg-slate-900 text-white font-bold text-xs rounded-xl hover:bg-slate-800 transition-colors"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Checkout Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Lengkapi data pengiriman dan pilih metode pembayaran
          </p>
        </div>

        <button
          onClick={() => router.push('/keranjang')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left: Shipping & Payment Form */}
        <form onSubmit={handleSubmitOrder} className="md:col-span-7 space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
          
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
            Informasi Pembeli & Pengiriman
          </h3>

          {/* Nama Lengkap */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border ${
                errors.nama ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'
              } rounded-xl focus:outline-none focus:ring-2`}
            />
            {errors.nama && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.nama}</p>}
          </div>

          {/* No WhatsApp */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nomor WhatsApp / Telepon <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: 08123456789"
              value={formData.whatsapp}
              onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border ${
                errors.whatsapp ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'
              } rounded-xl focus:outline-none focus:ring-2`}
            />
            {errors.whatsapp && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.whatsapp}</p>}
          </div>

          {/* Alamat Pengiriman */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Lengkap Pengiriman <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Jalan, Nomor Rumah, RT/RW, Kecamatan, Kota/Kabupaten"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className={`w-full px-4 py-2.5 text-xs sm:text-sm bg-slate-50 border ${
                errors.alamat ? 'border-rose-500 focus:ring-rose-500/20' : 'border-slate-200 focus:ring-blue-500/20'
              } rounded-xl focus:outline-none focus:ring-2`}
            ></textarea>
            {errors.alamat && <p className="text-[11px] text-rose-500 mt-1 font-semibold">{errors.alamat}</p>}
          </div>

                 {/* Metode Pembayaran */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, metode: 'QRIS' })}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  formData.metode === 'QRIS'
                    ? 'border-slate-900 bg-slate-50 text-slate-900 font-extrabold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50'
                }`}
              >
                <QrCode className="w-5 h-5 text-slate-700" />
                <span className="text-xs">QRIS</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, metode: 'Transfer Bank' })}
                className={`p-3.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                  formData.metode === 'Transfer Bank'
                    ? 'border-slate-900 bg-slate-50 text-slate-900 font-extrabold shadow-sm'
                    : 'border-slate-200 bg-white text-slate-600 font-semibold hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-5 h-5 text-slate-700" />
                <span className="text-xs">Transfer Bank</span>
              </button>
            </div>
            
            <button
              type="submit"
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Pesan Sekarang</span>
            </button>
          </div>

        </form>

        {/* Right: Order Summary Breakdown */}
        <div className="md:col-span-5">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4 sticky top-24">
            <h3 className="text-base font-black text-slate-900 border-b border-slate-100 pb-3">
              Rincian Pesanan
            </h3>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {activeCheckoutItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900 line-clamp-1">{item.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-extrabold text-slate-900 shrink-0">
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t-2 border-slate-200 flex justify-between items-center">
              <span className="text-sm font-black text-slate-900">Total Bayar :</span>
              <span className="text-xl font-black text-slate-900">
                {formatRupiah(totalPrice)}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* RECEIPT MODAL */}
      <ReceiptModal
        receiptData={receiptData}
        onClose={() => setReceiptData(null)}
        redirectOnClose={true}
      />

    </div>
  );
}