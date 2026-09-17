-- ===================================================
-- MIGRASI KHUSUS: TRANSAKSI & DETAIL TRANSAKSI
-- Aman dijalankan di Supabase tanpa merusak/menimpa 
-- tabel produk dan kategori yang sudah ada.
-- ===================================================

-- 1. TABEL TRANSAKSI (Header Pesanan)
CREATE TABLE IF NOT EXISTS transaksi (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  no_transaksi TEXT NOT NULL UNIQUE,
  nama_pembeli TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  alamat TEXT NOT NULL,
  metode_pembayaran TEXT NOT NULL,
  total_harga INTEGER NOT NULL CHECK (total_harga >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL DETAIL TRANSAKSI (Rincian Item Pesanan)
CREATE TABLE IF NOT EXISTS detail_transaksi (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_transaksi BIGINT NOT NULL REFERENCES transaksi(id) ON DELETE CASCADE,
  id_produk BIGINT REFERENCES produk(id) ON DELETE SET NULL,
  nama_produk TEXT NOT NULL,
  harga_satuan INTEGER NOT NULL CHECK (harga_satuan >= 0),
  jumlah INTEGER NOT NULL CHECK (jumlah > 0),
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ===================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================
ALTER TABLE transaksi ENABLE ROW LEVEL SECURITY;
ALTER TABLE detail_transaksi ENABLE ROW LEVEL SECURITY;

-- Policy Akses Publik Transaksi
DROP POLICY IF EXISTS "Publik boleh baca transaksi" ON transaksi;
DROP POLICY IF EXISTS "Publik boleh kelola transaksi" ON transaksi;
CREATE POLICY "Publik boleh baca transaksi" ON transaksi FOR SELECT USING (true);
CREATE POLICY "Publik boleh kelola transaksi" ON transaksi FOR ALL USING (true) WITH CHECK (true);

-- Policy Akses Publik Detail Transaksi
DROP POLICY IF EXISTS "Publik boleh baca detail_transaksi" ON detail_transaksi;
DROP POLICY IF EXISTS "Publik boleh kelola detail_transaksi" ON detail_transaksi;
CREATE POLICY "Publik boleh baca detail_transaksi" ON detail_transaksi FOR SELECT USING (true);
CREATE POLICY "Publik boleh kelola detail_transaksi" ON detail_transaksi FOR ALL USING (true) WITH CHECK (true);
