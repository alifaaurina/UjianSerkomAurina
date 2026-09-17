-- =======================================================
-- SKRIP MIGRASI SQL - LYFFA RAJUT STORE (SUPABASE / MYSQL)
-- Jalankan skrip ini di SQL Editor Supabase Anda
-- =======================================================

-- 1. Tambahkan Kolom stok ke Tabel produk (Jika Belum Ada)
ALTER TABLE produk ADD COLUMN IF NOT EXISTS stok INTEGER DEFAULT 10;

-- 2. Buat Tabel kategori (Jika Belum Ada)
CREATE TABLE IF NOT EXISTS kategori (
    id SERIAL PRIMARY KEY,
    nama_kategori VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Buat Tabel produk (Jika Belum Ada)
CREATE TABLE IF NOT EXISTS produk (
    id SERIAL PRIMARY KEY,
    id_kategori INTEGER REFERENCES kategori(id) ON DELETE SET NULL,
    nama_produk VARCHAR(255) NOT NULL,
    harga NUMERIC(12, 2) NOT NULL DEFAULT 0,
    stok INTEGER NOT NULL DEFAULT 10,
    gambar TEXT,
    deskripsi TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Buat Tabel transaksi (Jika Belum Ada)
CREATE TABLE IF NOT EXISTS transaksi (
    id VARCHAR(100) PRIMARY KEY,
    nama_pembeli VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50) NOT NULL,
    alamat TEXT NOT NULL,
    metode_pembayaran VARCHAR(50) NOT NULL,
    total_harga NUMERIC(12, 2) NOT NULL,
    items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Data Dummy Kategori (Opsional)
INSERT INTO kategori (id, nama_kategori) VALUES 
(1, 'Syal'),
(2, 'Topi'),
(3, 'Tas'),
(4, 'Atasan'),
(5, 'Aksesoris')
ON CONFLICT (id) DO NOTHING;

-- 6. Data Dummy Produk (Opsional)
INSERT INTO produk (id, id_kategori, nama_produk, harga, stok, gambar, deskripsi) VALUES
(1, 4, 'Sweater Rajut Wool Modern', 185000, 12, 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&q=80&w=800', 'Sweater rajut wanita wol premium lembut dan hangat.'),
(2, 4, 'Cardigan Rajut Ribbon Cream', 165000, 8, 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&q=80&w=800', 'Cardigan rajut dengan aksen pita merah kontras.'),
(3, 1, 'Syal Rajut Musim Dingin Sky Blue', 75000, 20, 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=800', 'Syal rajutan tangan rajut tebal nan lembut.'),
(4, 2, 'Topi Kupluk Rajut Beanie Classic', 55000, 15, 'https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&q=80&w=800', 'Beanie hat rajutan elastis super soft.'),
(5, 3, 'Tas Rajut Tote Shoulder Floral', 125000, 6, 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&q=80&w=800', 'Tas bahu rajut rajutan gaya bohemian estetik.'),
(6, 5, 'Gantungan Kunci Amigurumi Boneka', 35000, 25, 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&q=80&w=800', 'Gantungan kunci kerajinan amigurumi bentuk boneka lucu.')
ON CONFLICT (id) DO NOTHING;
