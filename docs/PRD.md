# Product Requirements Document (PRD)
## Project: CBT Web Application - Administrator Frontend

**Version:** 1.0.0  
**Date:** 24 Mei 2024  
**Status:** Draft  
**Target Handoff:** AI Gemini Studio (Context & Execution)

---

## 1. Executive Summary
Dokumen ini mendefinisikan persyaratan produk untuk **Frontend Administrator** dari aplikasi Computer Based Test (CBT). Produk ini adalah panel manajemen terpusat yang digunakan oleh administrator, panitia, dan operator sekolah untuk mengelola seluruh siklus ujian: mulai dari konfigurasi master data, manajemen peserta, penyusunan bank soal, penjadwalan event, hingga pelaporan. 

Fase saat ini berfokus murni pada **pengembangan Frontend (FE)** menggunakan data dummy (mock data) untuk memvalidasi UI/UX, arsitektur state, dan struktur navigasi sebelum diintegrasikan dengan Backend API.

## 2. Problem Statement
- Aplikasi CBT yang ada saat ini seringkali menggabungkan panel admin dan halaman ujian siswa dalam satu monolith, menyebabkan performa menurun dan risiko keamanan tinggi.
- Kurangnya standarisasi UI/UX pada panel admin yang membuat proses input data kompleks (seperti bank soal dan RBAC) menjadi lambat dan rawan *human error*.
- Kode frontend yang tidak terstruktur (*sloppy code*) menyulitkan *maintenance* dan *scaling* di masa depan.

## 3. Goals & Success Metrics
### Goals
1. Membangun Frontend Admin yang terpisah (standalone) dengan arsitektur yang bersih, modular, dan *scalable*.
2. Mengimplementasikan desain sistem yang konsisten, modern, dan *accessible* menggunakan `shadcn/ui` dan `tweakcn`.
3. Menyediakan simulasi CRUD yang interaktif menggunakan *state management* dan *dummy data* tanpa ketergantungan pada backend.

### Success Metrics (untuk Fase FE ini)
- 100% menu dan sub-menu yang disepakati dapat diakses dan memiliki halaman UI yang fungsional.
- Navigasi sidebar (Sidebar-07) berjalan mulus dengan *nested collapsible menu*.
- Tidak ada *boilerplate code* yang tidak perlu (mengadopsi prinsip *anti-slop*).
- State management (Zustand) berhasil menyimpan, memperbarui, dan menghapus *dummy data* secara reaktif di UI.

## 4. Target Personas
1. **Super Admin / Platform Owner**: Mengelola konfigurasi global, RBAC/ACL, master data (sekolah, jenjang, tahun pelajaran).
2. **Operator Sekolah / Cabang**: Mengelola data peserta (siswa) dan pegawai di wilayahnya masing-masing.
3. **Panitia Ujian / Guru**: Mengelola Bank Soal, membuat Event ujian, memetakan soal ke event, dan melihat laporan.

## 5. Scope
### In-Scope (Fase Saat Ini)
- Pengembangan UI/UX Frontend Administrator menggunakan Next.js (App Router).
- Implementasi Design System (`shadcn/ui` + `tweakcn`).
- Implementasi Layout utama menggunakan pola `Sidebar-07`.
- Pembuatan halaman untuk semua menu yang terdaftar.
- Implementasi State Management (Zustand) dengan *Dummy Data* untuk simulasi interaktivitas (Tabel, Form, Modal).

### Out-of-Scope (Fase Saat Ini)
- Frontend untuk Siswa (Web Tryout/Ujian).
- Koneksi ke Database nyata atau Backend API (REST/GraphQL).
- Autentikasi nyata (Login/Logout dengan JWT/Session).
- Fitur *real-time* (WebSocket) untuk monitoring ujian.

## 6. Features & Information Architecture
Struktur navigasi dan fitur utama di panel admin:

### 6.1. Master Data (Collapsible Nested Menu)
Kelompok menu untuk konfigurasi dasar sistem.
- **Config Bobot**: Pengaturan pembobotan nilai per mata pelajaran/tipe soal.
- **Tahun Pelajaran**: Manajemen periode akademik.
- **Jenjang**: SD, SMP, SMA, SMK, dll.
- **Tipe Ujian**: Ujian Sekolah, UTBK, Mandiri, dll.
- **Sekolah**: Data institusi.
- **Cabang**: Wilayah atau grup sekolah.
- **Role User**: Definisi peran (Super Admin, Operator, Guru).
- **Passing Grade**: Konfigurasi nilai kelulusan ambang batas.
- **Tipe Soal**: Pilihan Ganda, Esai, Menjodohkan, dll.
- **Tipe Tes**: Psikotes, Akademik, Kepribadian.

### 6.2. Pegawai
Manajemen data guru, staf, dan panitia ujian.

### 6.3. Peserta
Manajemen data siswa/peserta ujian, termasuk import data dan penempatan ke sekolah/ruang.

### 6.4. Bank Soal
Manajemen repositori soal. Pengelompokan soal berdasarkan mata pelajaran, tingkat kesulitan, dan topik.

### 6.5. Event (Sebelumnya: Jadwal)
Manajemen jadwal pelaksanaan ujian. Berisi detail waktu, durasi, aturan ujian, dan peserta yang mengikuti event tersebut.

### 6.6. Pendaftaran
Manajemen alur registrasi peserta ke dalam sebuah Event.

### 6.7. Soal Event (Sebelumnya: Zona Soal)
**Fitur Kunci**: Halaman ini menampilkan **List Event**, dan ketika sebuah Event dipilih/diklik, akan menampilkan **List Soal** yang di-assign/digunakan khusus untuk Event tersebut (Mapping Event to Bank Soal).

### 6.8. Report
Dashboard dan halaman laporan. Rekap nilai, analisis butir soal, dan laporan kehadiran peserta.

### 6.9. Menu (RBAC & ACL Management)
Manajemen hak akses dinamis.
- **RBAC (Role-Based Access Control)**: Menentukan Role mana yang boleh mengakses Menu/Fitur apa.
- **ACL (Access Control List)**: Menentukan hak akses tingkat data (misal: Operator Sekolah A hanya bisa melihat data Sekolah A).

### 6.10. Config
Pengaturan sistem global (Logo aplikasi, nama aplikasi, konfigurasi email/SMTP, dll).

## 7. Non-Functional Requirements (Technical & Design)
### 7.1. Tech Stack
- **Framework**: Next.js 14+ (App Router).
- **Language**: TypeScript (Strict Mode).
- **State Management**: Zustand (untuk mengelola dummy data dan UI state).
- **Styling**: Tailwind CSS.

### 7.2. Design System & UI Components
- **Base UI**: `shadcn/ui` (untuk komponen inti seperti Button, Input, Table, Dialog).
- **Theming/Extensions**: `tweakcn` (untuk kustomisasi tema dan variasi komponen).
- **Layout**: Wajib menggunakan struktur dan pola dari `shadcn/ui blocks/sidebar#sidebar-07`.
  - *Catatan*: Menu "Master" harus diimplementasikan sebagai *collapsible nested menu* di dalam sidebar agar tidak memakan tempat (space-efficient).

### 7.3. Code Quality Principles ("Anti-Slop")
- **No Unnecessary Boilerplate**: Hindari abstraksi yang tidak perlu. Jangan membuat wrapper komponen jika tidak menambah nilai.
- **Separation of Concerns**: Pisahkan logika state (Zustand stores), tipe data (TypeScript interfaces), dan UI (React components).
- **Meaningful Naming**: Nama variabel, fungsi, dan komponen harus deskriptif dan mencerminkan tujuannya.
- **Type Safety**: Gunakan TypeScript secara maksimal. Hindari penggunaan `any`.

## 8. High-Level User Flows
### Flow 1: Membuat Event Ujian dan Menambahkan Soal
1. Admin login (simulasi) -> Masuk ke Dashboard.
2. Admin navigasi ke **Event** -> Klik "Buat Event Baru".
3. Admin mengisi form detail Event (Nama, Tanggal, Durasi) -> Simpan (State Zustand terupdate).
4. Admin navigasi ke **Soal Event** -> Memilih Event yang baru dibuat.
5. Sistem menampilkan daftar soal kosong untuk event tersebut. Admin klik "Tambah Soal".
6. Admin memilih soal dari **Bank Soal** (via Dialog/Modal) -> Soal ter-assign ke Event.

### Flow 2: Mengatur Hak Akses (RBAC)
1. Admin navigasi ke **Menu** -> Tab "Role & Permission".
2. Admin memilih Role (misal: "Operator Sekolah").
3. Admin mencentang/menghilangkan centang pada pohon menu (Tree view) untuk menentukan akses.
4. Admin menyimpan -> State diperbarui, simulasi UI menyesuaikan menu yang terlihat.

## 9. Assumptions & Dependencies
- **Asumsi**: AI Gemini Studio akan menggunakan dokumen ini sebagai *single source of truth* untuk menghasilkan kode frontend.
- **Ketergantungan**: Dokumen BRD, FRD, dan TRD akan dibuat setelah PRD ini disetujui untuk memberikan detail teknis dan bisnis yang lebih dalam.
- **Dummy Data**: Data dummy akan disimpan dalam file terpisah (misal: `lib/mock-data.ts`) dan di-inisialisasi ke dalam Zustand store saat aplikasi pertama kali dimuat.