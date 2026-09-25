'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from './supabase';

const CartContext = createContext();

const INITIAL_MOCK_PRODUCTS = [];
const INITIAL_CATEGORIES = [];

export function CartProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adminSession, setAdminSession] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('lyffa_cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {}
      }
    }
  }, []);

  // Helper to ensure clean sequential category IDs (1, 2, 3, 4, 5...)
  const normalizeCategoryIds = (catList) => {
    if (!Array.isArray(catList) || catList.length === 0) return INITIAL_CATEGORIES;
    return catList.map((c, idx) => ({
      ...c,
      id: idx + 1,
    }));
  };

  // Sync Data from Supabase & LocalStorage
  const refreshData = async (isInitial = false) => {
    if (isInitial) {
      setLoading(true);
    }
    try {
      // 1. Categories: Fetch from Supabase first if available, fallback to LocalStorage
      const { data: catData, error: catErr } = await supabase
        .from('kategori')
        .select('*')
        .order('id', { ascending: false });

      if (!catErr && catData && catData.length > 0) {
        setCategories(catData);
        localStorage.setItem('lyffa_categories', JSON.stringify(catData));
      } else {
        const localCats = localStorage.getItem('lyffa_categories');
        if (localCats) {
          try {
            setCategories(JSON.parse(localCats));
          } catch (e) {
            setCategories(INITIAL_CATEGORIES);
          }
        }
      }

      // 2. Products: Fetch from Supabase FIRST so stock changes from other buyers/laptops are always synced in real-time!
      const { data: prodData, error: prodErr } = await supabase
        .from('produk')
        .select('*, kategori(nama_kategori)')
        .order('id', { ascending: false });

      if (!prodErr && prodData && prodData.length > 0) {
        const mapped = prodData.map((p) => ({
          id: p.id,
          name: p.nama_produk,
          category: p.kategori ? p.kategori.nama_kategori : 'Umum',
          price: p.harga,
          stok: p.stok !== undefined && p.stok !== null ? p.stok : (p.stock !== undefined ? p.stock : 10),
          image: p.gambar || '/img/produk/sweater-wool.jpg',
          description: p.deskripsi || 'Produk rajutan handmade berkualitas tinggi.',
        }));
        setProducts(mapped);
        localStorage.setItem('lyffa_products', JSON.stringify(mapped));
      } else {
        const localProds = localStorage.getItem('lyffa_products');
        if (localProds) {
          try {
            setProducts(JSON.parse(localProds));
          } catch (e) {
            setProducts(INITIAL_MOCK_PRODUCTS);
          }
        }
      }

      // Helper to normalize payment method (Migrates old COD/Tunai to QRIS)
      const normalizePaymentMethod = (methodStr) => {
        if (!methodStr) return 'QRIS';
        const lower = methodStr.toLowerCase();
        if (lower.includes('cod') || lower.includes('tunai') || lower.includes('cash') || lower.includes('tempat')) {
          return 'QRIS';
        }
        if (lower.includes('transfer')) {
          return 'Transfer Bank';
        }
        return methodStr;
      };

      // Auto-update database rows in Supabase asynchronously
      try {
        supabase
          .from('transaksi')
          .update({ metode_pembayaran: 'QRIS' })
          .or('metode_pembayaran.ilike.%cod%,metode_pembayaran.ilike.%tunai%,metode_pembayaran.ilike.%cash%,metode_pembayaran.ilike.%tempat%')
          .then(({ error }) => {
            if (error) console.log('Supabase auto update skipped:', error.message);
          });
      } catch (e) {}

      // 3. Transactions History (Always sync from Supabase first to keep DB & Website 100% synchronized)
      const { data: dbTx, error: txErr } = await supabase
        .from('transaksi')
        .select('*, detail_transaksi(*)')
        .order('id', { ascending: false });

      if (!txErr && dbTx && dbTx.length > 0) {
        const mappedTx = dbTx.map((t) => ({
          id: t.no_transaksi,
          date: t.created_at,
          nama: t.nama_pembeli,
          whatsapp: t.whatsapp,
          alamat: t.alamat,
          metode: normalizePaymentMethod(t.metode_pembayaran),
          total: t.total_harga,
          items: (t.detail_transaksi || []).map((d) => ({
            id: d.id_produk,
            name: d.nama_produk,
            price: d.harga_satuan,
            jumlah: d.jumlah,
          })),
        }));
        setTransactions(mappedTx);
        localStorage.setItem('sales_transactions', JSON.stringify(mappedTx));
      } else {
        const storedTx = localStorage.getItem('sales_transactions');
        if (storedTx) {
          try {
            const parsed = JSON.parse(storedTx);
            const updatedTx = parsed.map((t) => ({
              ...t,
              metode: normalizePaymentMethod(t.metode),
            }));
            setTransactions(updatedTx);
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('Data sync error:', err);
      const localProds = localStorage.getItem('lyffa_products');
      if (localProds) setProducts(JSON.parse(localProds));
      const localCats = localStorage.getItem('lyffa_categories');
      if (localCats) setCategories(JSON.parse(localCats));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('lyffa_cart');
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {}
      }
      const savedProds = localStorage.getItem('lyffa_products');
      if (savedProds) {
        try {
          const parsed = JSON.parse(savedProds);
          if (parsed && parsed.length > 0) {
            setProducts(parsed);
            setLoading(false);
          }
        } catch (e) {}
      }
      const savedCats = localStorage.getItem('lyffa_categories');
      if (savedCats) {
        try {
          const parsedCat = JSON.parse(savedCats);
          if (parsedCat && parsedCat.length > 0) setCategories(parsedCat);
        } catch (e) {}
      }
    }

    refreshData(false);

    const session = localStorage.getItem('admin_session');
    if (session) setAdminSession(JSON.parse(session));

    // Auto-sync every 8 seconds so multi-device/multi-laptop stock & sales transactions stay 100% fresh!
    const interval = setInterval(() => {
      refreshData(false);
    }, 8000);

    const handleFocus = () => {
      refreshData(false);
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Save Cart to LocalStorage
  useEffect(() => {
    localStorage.setItem('lyffa_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Product CRUD Helpers
  const addProductState = (newProduct) => {
    setProducts((prev) => {
      const updated = [newProduct, ...prev];
      localStorage.setItem('lyffa_products', JSON.stringify(updated));
      return updated;
    });
  };

  const updateProductState = (id, updatedData) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updatedData } : p));
      localStorage.setItem('lyffa_products', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteProductState = (id) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      localStorage.setItem('lyffa_products', JSON.stringify(updated));
      return updated;
    });
  };

  // Category CRUD Helpers
  const addCategoryState = (newCat) => {
    setCategories((prev) => {
      const updated = [newCat, ...prev];
      localStorage.setItem('lyffa_categories', JSON.stringify(updated));
      return updated;
    });
  };

  const updateCategoryState = (id, newName) => {
    setCategories((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, nama_kategori: newName } : c));
      const normalized = normalizeCategoryIds(updated);
      localStorage.setItem('lyffa_categories', JSON.stringify(normalized));
      return normalized;
    });
  };

  const deleteCategoryState = (id) => {
    setCategories((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      const normalized = normalizeCategoryIds(updated);
      localStorage.setItem('lyffa_categories', JSON.stringify(normalized));
      return normalized;
    });
  };

  // Cart Operations
  const addToCart = (product, quantityToAdd = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prev];
        const newQty = updated[existingIndex].quantity + quantityToAdd;
        const maxQty = Math.min(newQty, product.stok !== undefined ? product.stok : 99);
        updated[existingIndex] = { ...updated[existingIndex], quantity: maxQty };
        return updated;
      }
      return [...prev, { ...product, quantity: Math.min(quantityToAdd, product.stok !== undefined ? product.stok : 99) }];
    });
  };

  const updateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const maxQty = Math.min(newQty, item.stok !== undefined ? item.stok : 99);
          return { ...item, quantity: maxQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Complete Order & Stock Reduction
  const completeOrder = async (orderData) => {
    const updatedProducts = [...products];

    if (orderData.items?.length > 0) {
      for (const item of orderData.items) {
        const prodIndex = updatedProducts.findIndex(
          (p) => p.id === item.id || p.name?.toLowerCase().trim() === item.name?.toLowerCase().trim()
        );
        if (prodIndex > -1) {
          const targetProd = updatedProducts[prodIndex];
          const newStock = Math.max(0, (targetProd.stok !== undefined ? targetProd.stok : 10) - item.quantity);
          updatedProducts[prodIndex] = { ...targetProd, stok: newStock };

          // Sync stock reduction to Supabase database
          try {
            let updateQuery = supabase.from('produk').update({ stok: newStock });
            if (typeof targetProd.id === 'number' && targetProd.id < 1000000) {
              updateQuery = updateQuery.eq('id', targetProd.id);
            } else {
              updateQuery = updateQuery.eq('nama_produk', targetProd.name);
            }
            await updateQuery;
          } catch (e) {
            console.error('Failed to update stock in Supabase:', e);
          }
        }
      }
    }

    setProducts(updatedProducts);
    localStorage.setItem('lyffa_products', JSON.stringify(updatedProducts));

    const newTxList = [orderData, ...transactions];
    setTransactions(newTxList);
    localStorage.setItem('sales_transactions', JSON.stringify(newTxList));

    // Sync to Supabase `transaksi` & `detail_transaksi`
    try {
      const { data: txRow, error: txErr } = await supabase
        .from('transaksi')
        .insert({
          no_transaksi: orderData.id,
          nama_pembeli: orderData.nama,
          whatsapp: orderData.whatsapp,
          alamat: orderData.alamat,
          metode_pembayaran: orderData.metode,
          total_harga: orderData.total,
        })
        .select()
        .single();

      if (!txErr && txRow && orderData.items?.length > 0) {
        const detailsPayload = orderData.items.map((item) => ({
          id_transaksi: txRow.id,
          id_produk: typeof item.id === 'number' && item.id < 1000000 ? item.id : null,
          nama_produk: item.name,
          harga_satuan: item.price,
          jumlah: item.quantity,
          subtotal: item.price * item.quantity,
        }));
        await supabase.from('detail_transaksi').insert(detailsPayload);
      }
    } catch (err) {
      console.log('Supabase transaction sync skipped:', err);
    }

    // Remove ONLY the checked-out items from cart (so un-checked-out items remain in cart, and checked-out items are deleted from cart)
    setCartItems((prev) => {
      const checkedOutIds = new Set(orderData.items?.map((item) => item.id));
      const remainingCart = prev.filter((item) => !checkedOutIds.has(item.id));
      localStorage.setItem('lyffa_cart', JSON.stringify(remainingCart));
      return remainingCart;
    });

    // Trigger immediate refreshData to sync all states
    setTimeout(() => {
      refreshData();
    }, 300);
  };

  // Admin Auth Helpers
  const loginAdmin = (credentials) => {
    const sessionObj = {
      role: 'admin',
      email: credentials.email || 'admin@lyffa.com',
      loginTime: new Date().toISOString(),
    };
    localStorage.setItem('admin_session', JSON.stringify(sessionObj));
    setAdminSession(sessionObj);
  };

  const logoutAdmin = () => {
    localStorage.removeItem('admin_session');
    setAdminSession(null);
  };

  const deleteTransactionState = async (id) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      localStorage.setItem('sales_transactions', JSON.stringify(updated));
      return updated;
    });

    try {
      await supabase.from('transaksi').delete().eq('no_transaksi', id);
    } catch (e) {
      console.log('Supabase transaction delete skipped:', e);
    }
  };

  return (
    <CartContext.Provider
      value={{
        products,
        setProducts,
        categories,
        setCategories,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        transactions,
        completeOrder,
        loading,
        refreshData,
        adminSession,
        loginAdmin,
        logoutAdmin,
        addProductState,
        updateProductState,
        deleteProductState,
        addCategoryState,
        updateCategoryState,
        deleteCategoryState,
        deleteTransactionState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
