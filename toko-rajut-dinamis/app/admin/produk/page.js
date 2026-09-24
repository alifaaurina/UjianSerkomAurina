'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { supabase } from '@/lib/supabase';
import ProductFormModal from '@/components/ProductFormModal';
import ProductModal from '@/components/ProductModal';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Eye
} from 'lucide-react';

export default function AdminProdukPage() {
  const {
    products,
    categories,
    transactions,
    refreshData,
    deleteProductState
  } = useCart();

  const [adminSearch, setAdminSearch] = useState('');

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Product Delete Handler (Blocks deletion if product exists in transactions)
  const handleDeleteProduct = async (id) => {
    const targetProd = products.find((p) => p.id === id);
    if (!targetProd) return;

    const hasTransaction = transactions.some((t) =>
      t.items?.some(
        (item) =>
          item.id === targetProd.id ||
          item.name?.toLowerCase().trim() === targetProd.name?.toLowerCase().trim()
      )
    );

    if (hasTransaction) {
      alert(`Gagal Hapus: Produk "${targetProd.name}" tidak dapat dihapus karena sudah memiliki riwayat transaksi pesanan!`);
      return;
    }

    if (!confirm(`Apakah Anda yakin ingin menghapus produk "${targetProd.name}"?`)) return;
    deleteProductState(id);
    try {
      if (typeof id === 'number' && id < 1000000) {
        await supabase.from('produk').delete().eq('id', id);
      } else {
        await supabase.from('produk').delete().eq('nama_produk', targetProd.name);
      }
    } catch (e) {
      console.log('Supabase delete skipped:', e);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari produk..."
            value={adminSearch}
            onChange={(e) => setAdminSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>

        <button
          onClick={() => {
            setProductToEdit(null);
            setIsProductModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Baru</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-   uppercase tracking-wider">
            <tr>
              <th className="p-3">Nama Produk</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.filter(p => p.name.toLowerCase().includes(adminSearch.toLowerCase())).length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400 text-xs">
                  Belum ada data produk.
                </td>
              </tr>
            ) : (
              products
                .filter(p => p.name.toLowerCase().includes(adminSearch.toLowerCase()))
                .map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 flex items-center gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 object-cover rounded-lg border bg-slate-50"
                      />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{p.name}</p>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-md font-bold">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-slate-900">
                      {formatRupiah(p.price)}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${p.stok > 0
                          ? 'bg-slate-100 text-slate-800 border-slate-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                        }`}>
                        {p.stok} pcs
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedProduct(p)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Lihat Detail Produk"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setProductToEdit(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                          title="Edit Produk"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                          title="Hapus Produk"
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

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAdminView={true}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSuccess={refreshData}
      />

    </div>
  );
}