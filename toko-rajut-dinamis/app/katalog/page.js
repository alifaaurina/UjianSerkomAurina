'use client';

import { useState } from 'react';
import { Search, ShoppingBag, Grid, Tag, Sparkles } from 'lucide-react';
import { useCart } from '@/lib/cartContext';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';

export default function KatalogPage() {
  const { products, categories, loading } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchCategory =
      activeCategory === 'Semua' || p.category === activeCategory;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-[80vh]">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Katalog Produk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Jelajahi berbagai pilihan pakaian, aksesoris, dan hasil karya rajutan tangan estetik
        </p>
      </div>

      {/* FULL-WIDTH SEARCH BAR (Per requirement: "ada pencarian di bawah jangan di navbar, pencarian full") */}
      <div className="relative w-full">
        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Cari produk.."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 text-sm sm:text-base bg-white border border-slate-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 px-2 py-1 rounded-md"
          >
            Bersihkan
          </button>
        )}
      </div>

      {/* CATEGORY FILTER BUTTONS (Below Search Bar: "bawahe ada kategori") */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveCategory('Semua')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeCategory === 'Semua'
              ? 'bg-white text-900 border border-blue-500'
              : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Semua Produk
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.nama_kategori)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeCategory === cat.nama_kategori
               ? 'bg-white text-600 border border-blue-500'
              : 'border border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {cat.nama_kategori}
          </button>
        ))}
      </div>

      {/* PRODUCT GRID SECTION */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white border border-slate-200 rounded-2xl p-4 h-72 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3 shadow-sm">
          <h3 className="text-base font-bold text-slate-800">Produk Tidak Ada</h3>
          <p className="text-xs text-slate-500">
            Coba ubah kata kunci pencarian atau pilih kategori produk yang lain.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={setSelectedProduct}
            />
          ))}
        </div>
      )}

      {/* PRODUCT DETAIL MODAL */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

    </div>
  );
}
