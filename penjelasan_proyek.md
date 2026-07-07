# Penjelasan Proyek Ratu Motor

Berdasarkan analisis struktur direktori dan *source code* (khususnya *routing* pada backend Laravel dan frontend React), proyek yang sedang Anda bangun adalah **Sistem Informasi Manajemen Bengkel & Showroom Motor (Ratu Motor)**. 

Proyek ini dibangun menggunakan arsitektur modern:
- **Backend:** Laravel (sebagai RESTful API).
- **Frontend:** React.js dengan Vite.
- **Database:** MySQL / MariaDB.

## Fitur-Fitur Utama yang Sudah Dibuat

1. **Sistem Autentikasi (Auth)**
   - Fitur Login, Register, Logout, dan pengambilan profil pengguna (Me).
   - Menggunakan Laravel Sanctum untuk manajemen token API.
   - Implementasi Role-Based Access Control (RBAC) dengan *middleware* khusus.

2. **Dashboard & Laporan (Analytics)**
   - Menampilkan statistik umum (jumlah motor, total transaksi, dll).
   - Menampilkan data untuk grafik (*charts*).
   - Menampilkan daftar motor yang belum terjual (stok tersedia).

3. **Manajemen Stok Motor & Supplier (Inventory)**
   - **Motor:** Menambahkan, mengedit, menghapus, mengubah status motor, serta mengelola galeri foto motor (upload, set foto utama, hapus foto).
   - **Supplier:** Mengelola data pemasok motor/sparepart (tambah, edit, hapus, lihat detail).

4. **Manajemen Transaksi (Point of Sales)**
   - Fitur untuk mencatat transaksi penjualan motor/jasa.
   - Fitur pembuatan (cetak) *Invoice* / Faktur pembelian.

5. **Manajemen Keuangan (Finance)**
   - Laporan Laba-Rugi perusahaan.
   - Ekspor laporan keuangan ke format **PDF** dan **Excel**.
   - Pencatatan pemasukan dan pengeluaran secara manual.

6. **Booking / Manajemen Servis (Services)**
   - Fitur untuk mengelola pemesanan servis motor pelanggan.

7. **Manajemen Pengguna (User Management)**
   - CRUD data pengguna (staff/pegawai) beserta hak akses (role) mereka.

---

## Analisis Kekurangan pada Role (Hak Akses)

Saat ini, sistem membagi hak akses menjadi 4: **Super Admin, Admin, Teknisi, dan Kasir**. Berdasarkan alur *routing* yang ada, berikut adalah penjelasan detail mengenai apa yang **kurang** atau **kurang tepat** pada role tersebut:

### 1. Role Admin
- **Tugas Ideal:** Mengelola operasional harian (stok, supplier, laporan, customer).
- **Kondisi Saat Ini:** Sudah cukup baik karena bisa mengakses hampir semua fitur operasional kecuali *User Management*.
- **Kekurangan:** 
  - **Manajemen Customer belum aktif:** Di dalam kode, *route* untuk `customers` masih di-*comment* (`// Route::apiResource('customers', CustomerController::class);`). Admin sangat butuh fitur untuk mengelola *database* pelanggan.
  - **Keterbatasan Validasi Keuangan:** Admin bisa mencatat pengeluaran/pemasukan, namun mungkin perlu alur persetujuan (*approval*) dari Super Admin untuk pengeluaran di atas nominal tertentu.

### 2. Role Teknisi
- **Tugas Ideal:** Mengelola data servis, mengubah status motor (misal: selesai diperbaiki), dan meminta jadwal servis.
- **Kondisi Saat Ini:** Teknisi memiliki akses ke modul Servis, namun **juga memiliki hak akses untuk Create, Update, dan Delete data Motor dan Supplier**.
- **Kekurangan & Risiko:**
  - **Terlalu Banyak Hak Akses (Over-privileged):** Teknisi tidak seharusnya memiliki hak untuk menambah stok motor baru, menghapus motor, atau menghapus data supplier. Hal ini berisiko menyebabkan kebocoran atau kerusakan data inventaris. Hak akses modifikasi (POST/PUT/DELETE) untuk `motors` dan `suppliers` sebaiknya hanya untuk Admin/Super Admin.
  - **Kekurangan Fitur Sparepart:** Belum terlihat adanya modul inventaris khusus *sparepart* (suku cadang). Teknisi seharusnya memiliki fitur untuk "memasukkan/meminta *sparepart*" ke dalam nota servis yang nantinya akan ditagihkan ke Kasir.

### 3. Role Kasir
- **Tugas Ideal:** Memproses pembayaran transaksi dan mencetak *invoice*/*struk*.
- **Kondisi Saat Ini:** Kasir memiliki akses melihat (Read-only) stok motor dan mengelola transaksi, yang mana ini sudah benar. Namun, Kasir juga memiliki akses penuh ke modul **Keuangan**.
- **Kekurangan & Risiko:**
  - **Akses Laporan Laba Rugi:** Kasir saat ini bisa mengakses rute `/keuangan/laba-rugi` dan melakukan ekspor PDF/Excel. Umumnya, kasir *tidak boleh* melihat total keuntungan kotor, laba rugi, dan seluruh perputaran uang perusahaan. Fitur analitik ini seharusnya dibatasi hanya untuk Super Admin dan Manajer/Admin Keuangan.
  - **Kekurangan Fitur *Shift* / Tutup Kasir:** Modul kasir belum memiliki sistem *Shift* (Buka Kasir & Tutup Kasir) untuk mencocokkan jumlah uang fisik di laci dengan data transaksi harian.

## Kesimpulan / Rekomendasi
1. Batasi hak akses **Teknisi** agar tidak bisa menambah/menghapus master data Motor dan Supplier. Cukup berikan hak untuk mengedit *status* motor saja.
2. Batasi hak akses **Kasir** agar tidak bisa melihat Laba/Rugi. Pisahkan fitur *Point of Sales* dengan fitur *Akuntansi/Keuangan Global*.
3. Aktifkan segera modul **Customer** agar data pelanggan dapat dikelola dengan baik.
4. (Opsional) Tambahkan fitur inventaris khusus **Sparepart**, bukan hanya Motor.
