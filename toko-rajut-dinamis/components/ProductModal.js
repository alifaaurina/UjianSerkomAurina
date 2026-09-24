'use client';

import { useState, useEffect } from 'react';
import { X, ShoppingCart, Plus, Minus, CheckCircle, Package } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import { useRouter } from 'next/navigation';

export default function ProductModal({ product, onClose, isAdminView = false }) {
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const { addToCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    setQuantity(1);
    setAddedToast(false);
  }, [product]);

  if (!product) return null;

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isOutOfStock = product.stok !== undefined && product.stok <= 0;
  const maxStock = product.stok || 99;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      onClose();
    }, 800);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(
        'direct_buy_items',
        JSON.stringify([
          {
            id: product.id,
            name: product.name,
            price: product.price,
            stok: product.stok,
            image: product.image,
            category: product.category,
            quantity: quantity,
          },
        ])
      );
    }
    onClose();
    router.push('/checkout?direct=true');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">

      <div className="relative bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col md:flex-row">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 backdrop-blur-md text-slate-500 hover:text-slate-900 rounded-full transition-colors shadow-md border border-slate-200"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT: Product Image */}
        <div className="w-full md:w-1/2 bg-slate-100 relative min-h-[260px] md:min-h-[380px] flex items-center justify-center overflow-hidden">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-400 text-sm font-semibold">Tidak ada gambar</div>
          )}

          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-bold text-slate-800 border border-slate-200/50 shadow-sm">
            {product.category}
          </div>
        </div>

        {/* RIGHT: Product Information */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-4">

          <div className="space-y-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>

              {!isAdminView && (
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-2xl font-bold text-medium-500">
                    {formatRupiah(product.price)}
                  </span>

                  <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${isOutOfStock
                      ? 'bg-rose-50 text-rose-500 border-rose-200'
                      : 'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                    <Package className="w-3.5 h-3.5 inline-block mr-1 -mt-0.5" />
                    {isOutOfStock ? 'Stok Habis' : `Stok: ${product.stok}`}
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <h4 className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Deskripsi Produk
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-h-48 overflow-y-auto font-medium">
                {product.description || 'Belum ada deskripsi untuk produk ini.'}
              </p>
            </div>

            {/* Quantity Selector (- qty +) - Only for customer view */}
            {!isAdminView && !isOutOfStock && (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-700">Jumlah Pesanan:</span>
                <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-black text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(maxStock, q + 1))}
                    className="w-7 h-7 flex items-center justify-center bg-white hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-bold shadow-sm transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100">
            {isAdminView ? (
              <button
                onClick={onClose}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md"
              >
                Tutup Pratinjau
              </button>
            ) : addedToast ? (
              <div className="py-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Berhasil Masuk Keranjang!</span>
              </div>
            ) : isOutOfStock ? (
              <div className="py-3 bg-slate-100 text-slate-500 text-xs font-bold rounded-xl text-center border border-slate-200">
                Produk saat ini sedang habis
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={handleAddToCart}
                  className="p-3.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl flex items-center justify-center border border-slate-300 active:scale-95 transition-all"
                  title="Masukan Keranjang"
                >
                  <ShoppingCart className="w-5 h-5" />
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-2xl transition-all shadow-md active:scale-95 text-center"
                >
                  Pesan Sekarang
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
