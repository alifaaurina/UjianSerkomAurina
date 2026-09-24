'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import { supabase } from '@/lib/supabase';
import {
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';

export default function AdminKategoriPage() {
  const {
    products,
    categories,
    setCategories,
    deleteCategoryState
  } = useCart();

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('kategori')
      .select('*')
      .order('id');

    if (error) {
      console.error('Gagal fetch kategori:', error);
      return;
    }
    setCategories(data);
    if (typeof window !== 'undefined') {
      localStorage.setItem('lyffa_categories', JSON.stringify(data));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryInput.trim()) return;

    const catName = categoryInput.trim();

    const isCatDuplicate = categories.some(
      (c) =>
        c.nama_kategori.toLowerCase().trim() === catName.toLowerCase().trim() &&
        (!editingCategory || c.id !== editingCategory.id)
    );
    if (isCatDuplicate) {
      alert(`Gagal: Kategori "${catName}" sudah ada! Mohon gunakan nama kategori lain.`);
      return;
    }

    setCatLoading(true);

    if (editingCategory) {
      // EDIT — pakai id asli atau fallback nama_kategori jika id lokal
      let query = supabase.from('kategori').update({ nama_kategori: catName });
      if (typeof editingCategory.id === 'number' && editingCategory.id < 1000000) {
        query = query.eq('id', editingCategory.id);
      } else {
        query = query.eq('nama_kategori', editingCategory.nama_kategori);
      }
      const { data, error } = await query.select();

      if (error) {
        alert('Gagal update kategori: ' + error.message);
        setCatLoading(false);
        return;
      }
    } else {
      // TAMBAH — biarkan Supabase yang generate id
      const { data, error } = await supabase
        .from('kategori')
        .insert({ nama_kategori: catName })
        .select()
        .single();

      if (error) {
        alert('Gagal menambah kategori: ' + error.message);
        setCatLoading(false);
        return;
      }
    }

    await fetchCategories();
    setCategoryInput('');
    setEditingCategory(null);
    setShowCategoryModal(false);
    setCatLoading(false);
  };

  const handleDeleteCategory = async (id) => {
    const targetCat = categories.find((c) => c.id === id);
    if (!targetCat) return;

    // Cek apakah ada produk yang masih menggunakan kategori ini (baik via ID maupun Nama Kategori)
    const hasProductsLocal = products.some(
      (p) => p.category?.toLowerCase().trim() === targetCat.nama_kategori?.toLowerCase().trim()
    );

    if (hasProductsLocal) {
      alert(`Gagal Hapus: Kategori "${targetCat.nama_kategori}" tidak dapat dihapus karena masih digunakan oleh produk di dalam katalog!`);
      return;
    }

    // Cek juga ke Supabase langsung jika id_kategori tersambung
    if (typeof id === 'number' && id < 1000000) {
      const { data: produkTerkait } = await supabase
        .from('produk')
        .select('id')
        .eq('id_kategori', id)
        .limit(1);

      if (produkTerkait && produkTerkait.length > 0) {
        alert(`Gagal Hapus: Kategori "${targetCat.nama_kategori}" tidak dapat dihapus karena masih digunakan oleh produk di dalam katalog!`);
        return;
      }
    }

    if (!confirm(`Apakah Anda yakin menghapus kategori "${targetCat.nama_kategori}"?`)) return;

    // Hapus dari database Supabase (Support hapus via id atau nama_kategori)
    let deleteQuery = supabase.from('kategori').delete();
    if (typeof id === 'number' && id < 1000000) {
      deleteQuery = deleteQuery.eq('id', id);
    } else {
      deleteQuery = deleteQuery.eq('nama_kategori', targetCat.nama_kategori);
    }

    const { error } = await deleteQuery;

    if (error) {
      console.error('Gagal hapus kategori di Supabase:', error);
      if (error.code === '23503') {
        alert('Kategori tidak dapat dihapus karena masih dipakai oleh produk.');
      } else {
        alert('Gagal menghapus kategori: ' + error.message);
      }
      return;
    }

    // Update Context state & localStorage secara sinkron
    deleteCategoryState(id);
    await fetchCategories();
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 max-w-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h3 className="font-bold text-slate-900 text-sm">Daftar Kategori Rajut</h3>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryInput('');
            setShowCategoryModal(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      <table className="w-full text-left text-xs sm:text-sm">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
          <tr>
            <th className="p-3">No</th>
            <th className="p-3">Nama Kategori</th>
            <th className="p-3">Total Produk</th>
            <th className="p-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {categories.map((c) => {
            const prodCount = products.filter(
              (p) => p.category?.toLowerCase().trim() === c.nama_kategori?.toLowerCase().trim()
            ).length;

            return (
              <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-3 font-mono text-slate-400">{c.id}</td>
                <td className="p-3 font-bold text-slate-900">{c.nama_kategori}</td>
                <td className="p-3">
                  <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-lg">
                    {prodCount} produk
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setEditingCategory(c);
                        setCategoryInput(c.nama_kategori);
                        setShowCategoryModal(true);
                      }}
                      className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                      title="Edit Kategori"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Taplak, Accessories"
                  value={categoryInput}
                  onChange={(e) => setCategoryInput(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={catLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm cursor-pointer"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
