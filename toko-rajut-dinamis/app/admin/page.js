'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import {
  LayoutDashboard,
  Package,
  FolderPlus,
  ShoppingCart,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  X,
  Search,
  TrendingUp,
  Lock,
  Mail,
  AlertCircle,
  Eye
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import ProductFormModal from '@/components/ProductFormModal';
import ProductModal from '@/components/ProductModal';
import ReceiptModal from '@/components/ReceiptModal';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const {
    products,
    categories,
    setCategories,
    transactions,
    adminSession,
    loginAdmin,
    logoutAdmin,
    refreshData,
    loading,
    deleteProductState,
    addCategoryState,
    updateCategoryState,
    deleteCategoryState,
    deleteTransactionState,
  } = useCart();

  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState('overview'); // 'overview' | 'products' | 'categories' | 'sales'
  const [adminSearch, setAdminSearch] = useState('');

  // Admin Login Local Form State
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Modals State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [catLoading, setCatLoading] = useState(false);

  const formatRupiah = (num) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleAdminLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    if (
      (emailInput.trim() === 'admin@lyffa.com' || emailInput.trim() === 'admin') &&
      passwordInput === 'admin123'
    ) {
      loginAdmin({ email: 'admin@lyffa.com' });
      setEmailInput('');
      setPasswordInput('');
    } else {
      setLoginError('Email atau password admin salah. (Petunjuk: admin@lyffa.com / admin123)');
    }
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

  // Transaction Delete Handler
  const handleDeleteTransaction = (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) return;
    deleteTransactionState(id);
  };

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
  const totalOmzet = transactions.reduce((sum, t) => sum + (t.total || 0), 0);

  // LOGIN SCREEN (If Admin session not active)
  if (!adminSession) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-2xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-slate-100 text-slate-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Login</h2>
            <p className="text-xs text-slate-500 font-medium">
              Masuk untuk mengakses dashboard manajemen toko rajut
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Masukan email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Masuk</span>
            </button>
          </form>

        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD MAIN INTERFACE
  return (
    <div className="min-h-[85vh] flex bg-slate-100 font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 shadow-xl hidden md:flex border-r border-slate-800">
        <div>
          <div className="p-6 border-b border-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center text-white font-black shadow-md">
              Ly
            </div>
            <div>
              <h2 className="text-base font-black text-white leading-tight">Lyffa Admin</h2>
            </div>
          </div>

          <nav className="p-4 space-y-1.5">
            <button
              onClick={() => setActiveMenu('overview')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'overview'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveMenu('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'products'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>Kelola Produk & Stok</span>
            </button>

            <button
              onClick={() => setActiveMenu('categories')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'categories'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <FolderPlus className="w-4 h-4" />
              <span>Kelola Kategori</span>
            </button>

            <button
              onClick={() => setActiveMenu('sales')}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold transition-all ${
                activeMenu === 'sales'
                  ? 'bg-slate-800 text-white shadow-md'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Laporan Penjualan</span>
            </button>
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <button
            onClick={() => {
              logoutAdmin();
              router.push('/katalog');
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-xl border border-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 h-16 px-6 flex items-center justify-between gap-4 sticky top-16 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-sm sm:text-base font-black text-slate-900 capitalize">
              {activeMenu === 'overview' && 'Dashboard Lyffa Rajut'}
              {activeMenu === 'products' && 'Manajemen Produk & Stok'}
              {activeMenu === 'categories' && 'Manajemen Kategori'}
              {activeMenu === 'sales' && 'Laporan Penjualan & Transaksi'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Mobile Dropdown */}
            <div className="md:hidden">
              <select
                value={activeMenu}
                onChange={(e) => setActiveMenu(e.target.value)}
                className="text-xs bg-slate-100 font-bold p-2 rounded-xl border border-slate-200"
              >
                <option value="overview">Overview</option> 
                <option value="products">Kelola Produk & Stok</option>
                <option value="categories">Kelola Kategori</option>
                <option value="sales">Laporan Penjualan</option>
              </select>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Produk</p>
                <h3 className="text-2xl font-black text-slate-900">{products.length}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
                <FolderPlus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Kategori</p>
                <h3 className="text-2xl font-black text-slate-900">{categories.length}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</p>
                <h3 className="text-2xl font-black text-slate-900">{transactions.length}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Omzet</p>
                <h3 className="text-lg font-black text-slate-900">{formatRupiah(totalOmzet)}</h3>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeMenu === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Produk Terdaftar</h3>
                  <button
                    onClick={() => setActiveMenu('products')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    Kelola Produk →
                  </button>
                </div>
                <div className="space-y-3">
                  {products.slice(0, 4).map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 object-cover rounded-lg bg-white border" />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{p.name}</p>
                          <span className="text-[10px] text-slate-700 bg-slate-200 px-2 py-0.5 rounded font-bold">
                            Stok: {p.stok}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-black text-slate-900">{formatRupiah(p.price)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-900 text-sm">Kategori Produk</h3>
                  <button
                    onClick={() => setActiveMenu('categories')}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 hover:underline"
                  >
                    Kelola Kategori →
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((c) => (
                    <span key={c.id} className="px-3.5 py-2 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold rounded-xl">
                      {c.nama_kategori}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCTS CRUD TABLE */}
          {activeMenu === 'products' && (
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
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Produk Baru</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Produk</th>
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
                              <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                                p.stok > 0
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
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                  title="Lihat Detail Produk"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setProductToEdit(p);
                                    setIsProductModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                  title="Edit Produk"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id)}
                                  className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
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
            </div>
          )}

          {/* TAB 3: CATEGORIES CRUD */}
          {activeMenu === 'categories' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 max-w-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="font-bold text-slate-900 text-sm">Daftar Kategori Rajut</h3>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryInput('');
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kategori</span>
                </button>
              </div>

              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">ID</th>
                    <th className="p-3">Nama Kategori</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono text-slate-400">{c.id}</td>
                      <td className="p-3 font-bold text-slate-900">{c.nama_kategori}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingCategory(c);
                              setCategoryInput(c.nama_kategori);
                              setShowCategoryModal(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 4: SALES REPORT */}
          {activeMenu === 'sales' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
              <h3 className="font-bold text-slate-900 text-sm">Laporan Pesanan & Transaksi</h3>

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
                    {transactions.map((t, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
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
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setSelectedReceipt(t)}
                              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Pratinjau Struk"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(t.id)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Transaksi"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Detail Modal */}
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAdminView={true}
      />

      {/* Transaction Receipt Modal */}
      <ReceiptModal
        receiptData={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        productToEdit={productToEdit}
        categories={categories}
        onSuccess={refreshData}
      />

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
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
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
                  className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={catLoading}
                  className="px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm"
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
