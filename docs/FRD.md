# Functional Requirements Document (FRD)
## Project: CBT Web Application - Administrator Frontend

**Version:** 1.0.0  
**Date:** 24 Mei 2024  
**Status:** Draft  
**Target Handoff:** AI Gemini Studio (Context & Execution)

---

## 1. Introduction
Dokumen ini mendefinisikan persyaratan fungsional spesifik untuk Frontend Administrator. Fokus utama adalah pada interaksi pengguna (UI), validasi input, manajemen state (Zustand), dan perilaku komponen saat menggunakan *dummy data*. Dokumen ini tidak membahas logika backend atau database.

## 2. Global Functional Requirements
### 2.1. Layout & Navigation (Sidebar-07)
- **Sidebar**: Menggunakan pola `shadcn/ui blocks/sidebar#sidebar-07`.
- **Nested Menu**: Grup "Master" harus berupa *collapsible nested menu*.
- **Active State**: Menu yang sedang aktif harus memiliki indikator visual yang jelas (background highlight, border kiri, atau teks bold).
- **Responsive**: Sidebar harus dapat di-*collapse* menjadi mode *icon-only* atau *drawer* (slide dari kiri) pada layar mobile/tablet.

### 2.2. Data Table (Global Component)
Hampir semua modul menggunakan tabel data. Komponen `DataTable` global harus mendukung:
- **Pagination**: Navigasi halaman (Previous, Next, Page Numbers).
- **Search/Filter**: Input pencarian global dan filter berbasis kolom (dropdown).
- **Sorting**: Klik header kolom untuk mengurutkan data (Ascending/Descending).
- **Row Actions**: Tombol aksi per baris (Edit, Delete, View) yang memunculkan *Dialog/Drawer*.
- **Empty State**: Tampilan visual jika data kosong (menggunakan ilustrasi atau teks informatif).

### 2.3. Form & Validation (Global Component)
- **Library**: Menggunakan `react-hook-form` + `zod` untuk validasi skema.
- **Feedback**: Pesan error validasi harus muncul langsung di bawah input field saat user blur atau submit.
- **Loading State**: Tombol submit harus menampilkan *spinner* dan di-*disable* saat proses simulasi penyimpanan (delay 500ms - 1000ms).
- **Toast Notification**: Menampilkan notifikasi sukses/gagal di pojok kanan atas menggunakan komponen `Sonner` atau `shadcn Toast`.

---

## 3. Module-Specific Functional Requirements

### 3.1. Master Data (10 Sub-Menu)
*Berlaku untuk: Config Bobot, Tahun Pelajaran, Jenjang, Tipe Ujian, Sekolah, Cabang, Role User, Passing Grade, Tipe Soal, Tipe Tes.*

**Fungsionalitas:**
- **List View**: Menampilkan data dalam bentuk tabel.
- **Create/Update**: Membuka *Dialog* atau *Sheet (Side Drawer)* berisi form input.
- **Delete**: Memunculkan *Confirmation Dialog* ("Apakah Anda yakin ingin menghapus data ini?").
- **Fields (Contoh untuk Sekolah)**:
  - Nama Sekolah (Text, Required)
  - NPSN (Number, Required, Unique)
  - Alamat (Textarea)
  - Cabang (Dropdown, Required)
  - Jenjang (Dropdown, Required)

### 3.2. Pegawai & Peserta
**Fungsionalitas Tambahan:**
- **Bulk Action**: Checkbox di header tabel untuk memilih banyak baris.
- **Import Data**: Tombol "Import Excel/CSV". Membuka dialog upload file. Saat di-submit, data dummy dari file akan di-parse dan ditambahkan ke Zustand store.
- **Export Data**: Tombol "Export" yang mengekspor data saat ini di Zustand ke format CSV/JSON (menggunakan library frontend seperti `papaparse` atau logika native).
- **Fields Peserta**: NISN, Nama Lengkap, Kelas, Sekolah (Dropdown), Status Aktif (Toggle).

### 3.3. Bank Soal
**Fungsionalitas:**
- **Filter Kompleks**: Filter berdasarkan Mata Pelajaran, Tipe Soal, Tingkat Kesulitan.
- **Form Soal Dinamis**:
  - Jika Tipe Soal = "Pilihan Ganda": Form menampilkan input pertanyaan + 4-5 input opsi (A, B, C, D, E) + radio button untuk kunci jawaban.
  - Jika Tipe Soal = "Esai": Form menampilkan input pertanyaan + textarea untuk rubrik penilaian.
- **Rich Text Editor**: Input pertanyaan dan opsi harus mendukung format teks dasar (Bold, Italic, Math Formula/Katex dummy).

### 3.4. Event (Sebelumnya: Jadwal)
**Fungsionalitas:**
- **Status Event**: Menampilkan badge status (Draft, Aktif, Selesai, Dibatalkan).
- **Form Event**:
  - Nama Event (Text)
  - Tanggal Mulai & Selesai (Date Range Picker)
  - Durasi Pengerjaan (Number dalam menit)
  - Token Ujian (Text, Auto-generate button)
  - Aturan Ujian (Checkboxes: Acak Soal, Acak Opsi, Boleh Pindah Soal, Disable Right Click).

### 3.5. Pendaftaran
**Fungsionalitas:**
- **Mapping Peserta ke Event**:
  - Halaman menampilkan List Event di sebelah kiri (atau sebagai filter).
  - Tabel di sebelah kanan menampilkan Peserta yang *belum* terdaftar di Event tersebut.
  - Tombol "Daftarkan" (Single) atau "Daftarkan Semua" (Bulk).
  - Tab terpisah atau filter untuk melihat peserta yang *sudah* terdaftar.

### 3.6. Soal Event (Sebelumnya: Zona Soal)
**Fungsionalitas Kunci:**
- **Step 1**: Memilih Event dari dropdown/list.
- **Step 2**: Menampilkan tabel soal yang sudah di-assign ke Event tersebut (diurutkan berdasarkan nomor urut).
- **Add Soal**: Tombol "Tambah Soal" membuka *Dialog* berisi daftar soal dari **Bank Soal** (dengan filter). User mencentang soal yang diinginkan -> Klik "Tambahkan".
- **Reorder Soal**: Fitur *drag-and-drop* atau tombol panah (Up/Down) untuk mengubah urutan nomor soal di dalam Event.
- **Remove Soal**: Menghapus soal dari Event (tidak menghapus soal dari Bank Soal).

### 3.7. Report
**Fungsionalitas:**
- **Dashboard Charts**: Menampilkan grafik dummy (menggunakan `recharts` atau `chart.js`).
  - Grafik Batang: Jumlah peserta per Event.
  - Grafik Lingkaran: Distribusi nilai (Lulus/Tidak Lulus).
- **Tabel Rekap Nilai**:
  - Kolom: Nama Peserta, Sekolah, Nilai Mentah, Nilai Akhir, Status (Lulus/Tidak).
  - Fitur filter berdasarkan Event dan Sekolah.

### 3.8. Menu (RBAC & ACL Management)
**Fungsionalitas:**
- **Tree View Permission**: Menampilkan struktur menu dalam bentuk *Tree* (pohon).
- **Checkbox Matrix**:
  - Setiap node menu memiliki 4 checkbox: **Create, Read, Update, Delete**.
  - Jika checkbox "Read" di-uncheck, checkbox C, U, D otomatis di-disable dan di-uncheck.
  - Jika checkbox parent di-centang, semua child otomatis ter-centang (cascading).
- **Role Selector**: Dropdown di bagian atas untuk memilih Role yang sedang diedit hak aksesnya.
- **ACL Scope (Opsional UI)**: Jika Role adalah "Admin Sekolah", muncul dropdown tambahan "Scope Sekolah" untuk membatasi akses data hanya ke sekolah tertentu.

### 3.9. Config
**Fungsionalitas:**
- **Tabbed Form**: Form dibagi menjadi beberapa tab (General, Email/SMTP, Tampilan).
- **General**: Nama Aplikasi, Logo (Upload image preview), Favicon.
- **Tampilan**: Color picker untuk Primary Color (mengubah tema tweakcn secara dinamis), Toggle Dark/Light Mode default.

---

## 4. State Management Requirements (Zustand)
Untuk mendukung fungsionalitas di atas tanpa backend, Zustand store harus dirancang sebagai berikut:

### 4.1. Store Structure
- **`useMasterStore`**: Menyimpan data Master (Sekolah, Cabang, dll).
- **`useUserStore`**: Menyimpan data Pegawai, Peserta, dan Role.
- **`useExamStore`**: Menyimpan data Bank Soal, Event, Soal Event, dan Pendaftaran.
- **`useConfigStore`**: Menyimpan konfigurasi aplikasi dan state RBAC.

### 4.2. Actions & Mutations
Setiap store harus memiliki fungsi CRUD standar:
- `fetch[Entity]s()`: Menginisialisasi data dari file `mock-data.ts`.
- `add[Entity](data)`: Menambahkan item baru ke array state.
- `update[Entity](id, data)`: Memperbarui item berdasarkan ID.
- `delete[Entity](id)`: Menghapus item berdasarkan ID.

### 4.3. Persistence
- Menggunakan `zustand/middleware` `persist` agar data dummy yang diutak-atik user tidak hilang saat halaman di-*refresh* (menyimpan ke `localStorage`).

---

## 5. UI/UX & Design System Guidelines
### 5.1. Shadcn & Tweakcn
- Gunakan komponen dasar shadcn (Button, Input, Table, Dialog, Sheet, DropdownMenu).
- Gunakan `tweakcn` untuk memperkaya variasi komponen (misal: tabel dengan *sticky header*, form dengan *multi-step*, atau button dengan variasi ikon).
- Konsistensi warna: Gunakan CSS variables dari Tailwind (`bg-primary`, `text-muted-foreground`) agar mendukung Dark Mode secara native.

### 5.2. Anti-Slop UI Rules
- **No Fake Loading**: Jangan gunakan `setTimeout` untuk simulasi loading jika tidak ada proses asinkron nyata. Gunakan loading state hanya untuk validasi form atau animasi transisi.
- **No Dead Ends**: Setiap tombol harus memiliki aksi. Jangan ada tombol "Lihat Detail" yang tidak membuka halaman atau dialog.
- **Clear Hierarchy**: Gunakan Heading (h1, h2, h3) secara hierarkis. Jangan gunakan font size besar hanya untuk estetika jika bukan heading.