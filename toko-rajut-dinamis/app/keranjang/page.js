'use client';

import Link from 'next/link';
import { useCart } from '@/lib/cartContext';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function KeranjangPage() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const router = useRouter();

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[80vh]">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Keranjang Belanja
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Kelola daftar pesanan rajut Anda sebelum melakukan pemesanan
          </p>
        </div>

        {cartItems.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100"
          >
            Kosongkan Keranjang
          </button>
        )}
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Keranjang Belanja Masih Kosong</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Anda belum memasukkan produk rajut ke dalam keranjang. Silakan pilih produk menarik di katalog kami.
          </p>
          <Link
            href="/katalog"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Lihat Katalog Produk</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="bg-white p-4 sm:p-5 border border-slate-200 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-100 border shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {item.category}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Harga Satuan: {formatRupiah(item.price)}
                    </p>
                  </div>
                </div>

                {/* Subtotal & Quantity Actions */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold shadow-sm"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-black text-slate-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal preview: jumlah x harga */}
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-semibold block">Subtotal</span>
                    <span className="text-sm sm:text-base font-extrabold text-slate-900">
                      {formatRupiah(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Delete Item */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Hapus dari Keranjang"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}
          </div>

          {/* Cart Summary & Checkout Trigger */}
          <div className="lg:col-span-4">
            <div className="bg-white p-6 border border-slate-200 rounded-3xl shadow-md space-y-6 sticky top-24">
              <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">
                Ringkasan Belanja
              </h3>

              <div className="space-y-3 text-xs sm:text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Jumlah Jenis Produk:</span>
                  <span className="font-bold text-slate-900">{cartItems.length} produk</span>
                </div>

                <div className="flex justify-between">
                  <span>Total Kuantitas:</span>
                  <span className="font-bold text-slate-900">
                    {cartItems.reduce((sum, i) => sum + i.quantity, 0)} pcs
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-base font-black text-slate-900">Total Harga:</span>
                  <span className="text-xl font-black text-slate-900">
                    {formatRupiah(totalPrice)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    sessionStorage.removeItem('direct_buy_items');
                  }
                  router.push('/checkout');
                }}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-black text-sm rounded-2xl transition-all shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Lanjut ke Checkout</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}