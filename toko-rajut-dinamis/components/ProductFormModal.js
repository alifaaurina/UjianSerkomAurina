'use client';

import { useState, useEffect } from 'react';
import { X, Check, Upload, Image as ImageIcon, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cartContext';

export default function ProductFormModal({
  isOpen,
  onClose,
  productToEdit,
  categories,
  onSuccess,
}) {
  const { products, addProductState, updateProductState } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    categoryName: '',
    price: '',
    stok: 10,
    image: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        categoryName: productToEdit.category || (categories[0]?.nama_kategori || 'Atasan'),
        price: productToEdit.price || '',
        stok: productToEdit.stok !== undefined ? productToEdit.stok : 10,
        image: productToEdit.image || '',
        description: productToEdit.description || '',
      });
    } else {
      setFormData({
        name: '',
        categoryName: categories[0]?.nama_kategori || 'Atasan',
        price: '',
        stok: 10,
        image: '',
        description: '',
      });
    }
  }, [isOpen, productToEdit]);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `produk/${fileName}`;

      // Upload file directly to Supabase Storage bucket 'produk-images'
      const { data, error: uploadError } = await supabase.storage
        .from('produk-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload Error:', uploadError);
        alert('Gagal mengunggah gambar ke Supabase Storage: ' + uploadError.message + '\n\nPastikan bucket "produk-images" sudah dibuat dan diset Public di Supabase Dashboard.');
        setUploading(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('produk-images')
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        setFormData((prev) => ({ ...prev, image: urlData.publicUrl }));
      }
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Terjadi kesalahan saat mengunggah gambar.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) {
      alert('Mohon tunggu hingga proses unggah gambar selesai.');
      return;
    }
    if (!formData.name || !formData.price) {
      alert('Mohon isi nama dan harga produk.');
      return;
    }

    // Check duplicate product name
    const isDuplicate = products.some(
      (p) =>
        p.name.trim().toLowerCase() === formData.name.trim().toLowerCase() &&
        (!productToEdit || p.id !== productToEdit.id)
    );
    if (isDuplicate) {
      alert(`Gagal: Produk dengan nama "${formData.name.trim()}" sudah ada! Mohon gunakan nama produk lain.`);
      return;
    }

    setLoading(true);

    const categoryObj = categories.find(
      (c) => c.nama_kategori === formData.categoryName
    );
    let realCatId = categoryObj ? categoryObj.id : null;
    const finalImage = formData.image || '/img/produk/sweater-wool.jpg';

    // Try fetching real Supabase category ID if needed
    try {
      const { data: dbCat } = await supabase
        .from('kategori')
        .select('id')
        .eq('nama_kategori', formData.categoryName)
        .maybeSingle();

      if (dbCat && dbCat.id) {
        realCatId = dbCat.id;
      }
    } catch (e) {}

    if (productToEdit) {
      // 1. Update Context Local State (Instant persistent update)
      updateProductState(productToEdit.id, {
        name: formData.name.trim(),
        category: formData.categoryName,
        price: Number(formData.price),
        stok: Number(formData.stok),
        image: finalImage,
        description: formData.description.trim(),
      });

      // 2. Try Supabase Update or Insert
      try {
        const payload = {
          nama_produk: formData.name.trim(),
          harga: Number(formData.price),
          stok: Number(formData.stok),
          gambar: finalImage,
          deskripsi: formData.description.trim(),
        };
        if (realCatId) payload.id_kategori = realCatId;

        // Only attempt .update() if id is a standard DB auto-increment ID (< 1000000)
        const isDbId = typeof productToEdit.id === 'number' && productToEdit.id < 1000000;

        if (isDbId) {
          let { error } = await supabase
            .from('produk')
            .update(payload)
            .eq('id', productToEdit.id);

          if (error && (error.code === 'PGRST204' || error.message?.includes('stok'))) {
            delete payload.stok;
            payload.stock = Number(formData.stok);
            const res = await supabase.from('produk').update(payload).eq('id', productToEdit.id);
            error = res.error;
          }

          if (error) {
            console.log('Supabase update product note:', error.message);
          }
        } else {
          // If it was a local timestamp ID, insert into Supabase as a new DB row
          let { data: insData, error: insErr } = await supabase
            .from('produk')
            .insert(payload)
            .select();

          if (insErr && (insErr.code === 'PGRST204' || insErr.message?.includes('stok'))) {
            delete payload.stok;
            payload.stock = Number(formData.stok);
            const res = await supabase.from('produk').insert(payload).select();
            insData = res.data;
            insErr = res.error;
          }

          if (!insErr && insData && insData[0]) {
            updateProductState(productToEdit.id, { id: insData[0].id });
          }
        }
      } catch (err) {
        console.log('Supabase sync skipped:', err);
      }
    } else {
      // 1. Add to Context Local State (Instant persistent update)
      const newProductObj = {
        id: Date.now(),
        name: formData.name.trim(),
        category: formData.categoryName,
        price: Number(formData.price),
        stok: Number(formData.stok),
        image: finalImage,
        description: formData.description.trim(),
      };
      addProductState(newProductObj);

      // 2. Try Supabase Insert
      try {
        const insertPayload = {
          nama_produk: formData.name.trim(),
          stok: Number(formData.stok),
          harga: Number(formData.price),
          gambar: finalImage,
          deskripsi: formData.description.trim(),
        };
        if (realCatId) insertPayload.id_kategori = realCatId;

        let { data: insertedData, error: insertError } = await supabase
          .from('produk')
          .insert(insertPayload)
          .select();

        // Fallback for column name mismatch (stok vs stock)
        if (insertError && (insertError.code === 'PGRST204' || insertError.message?.includes('stok'))) {
          delete insertPayload.stok;
          insertPayload.stock = Number(formData.stok);
          const res = await supabase.from('produk').insert(insertPayload).select();
          insertedData = res.data;
          insertError = res.error;
        }

        if (insertError) {
          console.error('Supabase product insert error:', insertError);
        } else if (insertedData && insertedData[0]) {
          // Sync real DB ID to local state if available
          updateProductState(newProductObj.id, { id: insertedData[0].id });
        }
      } catch (err) {
        console.log('Supabase product insert skipped:', err);
      }
    }

    setLoading(false);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8">
        
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
          <h3 className="text-xl font-bold text-slate-900">
            {productToEdit ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nama Produk <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Sweater Rajut Wool"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Kategori <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.categoryName}
                onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.nama_kategori}>
                    {cat.nama_kategori}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Harga (Rp) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="185000"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Jumlah Stok <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                placeholder="10"
                value={formData.stok}
                onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800 font-bold text-slate-900"
                min="0"
                required
              />
            </div>
          </div>

          {/* UPLOAD FILE GAMBAR ASLI (SUPABASE STORAGE NATIVE) */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Upload Foto Produk (Supabase Storage) <span className="text-rose-500">*</span>
            </label>
            <div className="relative border-2 border-dashed border-slate-200 hover:border-slate-400 rounded-2xl p-4 text-center bg-slate-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-slate-800 animate-spin" />
                    <span className="text-xs font-bold text-slate-800">Mengunggah ke Supabase Storage...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">Pilih & Upload File Gambar</span>
                    <span className="text-[10px] text-slate-400">File fisik otomatis diunggah ke Bucket "produk-images"</span>
                  </>
                )}
              </div>
            </div>

            {/* Pratinjau Gambar */}
            {formData.image && (
              <div className="mt-3 flex items-center gap-3 bg-slate-100 p-2.5 rounded-xl border border-slate-200">
                <img
                  src={formData.image}
                  alt="Pratinjau"
                  className="w-12 h-12 object-cover rounded-lg border bg-white"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/img/produk/sweater-wool.jpg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">Foto Produk Terpilih</p>
                  <p className="text-[10px] text-slate-500 font-mono truncate">{formData.image}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Deskripsi Produk
            </label>
            <textarea
              rows="3"
              placeholder="Deskripsi detail mengenai produk rajutan..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-400/20 focus:border-slate-800"
            ></textarea>
          </div>

          <div className="flex gap-3 justify-end pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 rounded-xl shadow-md transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading || uploading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              <span>
                {uploading
                  ? 'Mengunggah Gambar...'
                  : loading
                  ? 'Menyimpan...'
                  : productToEdit
                  ? 'Simpan Perubahan'
                  : 'Tambah Produk'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
