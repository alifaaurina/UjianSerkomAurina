-- ===================================================
-- MIGRASI 01: KATEGORI & PRODUK (REFERENSI)
-- ===================================================

-- 1. TABEL KATEGORI
CREATE TABLE IF NOT EXISTS kategori (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nama_kategori TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. TABEL PRODUK
CREATE TABLE IF NOT EXISTS produk (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_kategori BIGINT REFERENCES kategori(id) ON DELETE SET NULL,
  nama_produk TEXT NOT NULL,
  harga INTEGER NOT NULL CHECK (harga >= 0),
  stok INTEGER DEFAULT 10 CHECK (stok >= 0),
  gambar TEXT,
  deskripsi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS POLICIES
ALTER TABLE kategori ENABLE ROW LEVEL SECURITY;
ALTER TABLE produk ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Publik boleh baca kategori" ON kategori;
DROP POLICY IF EXISTS "Publik boleh kelola kategori" ON kategori;
CREATE POLICY "Publik boleh baca kategori" ON kategori FOR SELECT USING (true);
CREATE POLICY "Publik boleh kelola kategori" ON kategori FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Publik boleh baca produk" ON produk;
DROP POLICY IF EXISTS "Publik boleh kelola produk" ON produk;
CREATE POLICY "Publik boleh baca produk" ON produk FOR SELECT USING (true);
CREATE POLICY "Publik boleh kelola produk" ON produk FOR ALL USING (true) WITH CHECK (true);