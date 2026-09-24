'use client';

import { Eye, ShoppingCart, AlertCircle } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function ProductCard({ product, onSelect }) {
  const { addToCart } = useCart();

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const isOutOfStock = product.stok !== undefined && product.stok <= 0;

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-slate-300 transition-all duration-300 flex flex-col justify-between">

      <div>
        {/* Image Box */}
        <div
          onClick={() => onSelect(product)}
          className="relative aspect-square w-full bg-slate-100 overflow-hidden cursor-pointer"
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isOutOfStock ? 'grayscale opacity-60' : ''
                }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium text-xs">
              Tanpa Gambar
            </div>
          )}

          {/* Hover View Detail */}
          <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="bg-white/90 backdrop-blur-md text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-slate-700" /> Detail Produk
            </span>
          </div>

          {/* Out of Stock Badge (only shows when relevant) */}
          {isOutOfStock && (
            <div className="absolute top-3 right-3">
              <span className="bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-lg shadow flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Stok Habis
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-1.5">
          <h3
            onClick={() => onSelect(product)}
            className="font-bold text-slate-900 text-sm sm:text-base line-clamp-1 hover:text-slate-600 transition-colors cursor-pointer"
          >
            {product.name}
          </h3>
          <p className="text-xs text-slate-500 line-clamp-2 min-h-[32px] leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer: Stock above Price, then Add Button */}
      <div className="p-4 pt-2 flex items-end justify-between gap-2 border-t border-slate-100 mt-2">
        <div className="space-y-1">
          <span className="text-[11px] text-slate-400 font-semibold">
            {isOutOfStock ? 'Stok habis' : `Stok: ${product.stok}`}
          </span>
          <p className="text-base sm:text-lg font-black text-slate-900">
            {formatRupiah(product.price)}
          </p>
        </div>

        <button
          onClick={() => {
            if (!isOutOfStock) addToCart(product, 1);
          }}
          disabled={isOutOfStock}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${isOutOfStock
              ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 text-white border-slate-900 active:scale-95'
            }`}
          title={isOutOfStock ? 'Stok produk habis' : 'Tambah ke Keranjang'}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Keranjang</span>
        </button>
      </div>

    </div>
  );
}