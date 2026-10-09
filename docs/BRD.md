# Business Requirements Document (BRD)
## Project: CBT Web Application - Administrator Frontend

**Version:** 1.0.0  
**Date:** 24 Mei 2024  
**Status:** Draft  
**Target Handoff:** AI Gemini Studio (Context & Execution)

---

## 1. Executive Summary
Bisnis pendidikan dan lembaga pelatihan saat ini membutuhkan transisi dari ujian berbasis kertas (Paper-Based Test) ke ujian berbasis komputer (Computer Based Test / CBT) untuk menekan biaya operasional, mempercepat proses penilaian, dan meningkatkan integritas ujian. 

Proyek ini bertujuan untuk membangun **Frontend Administrator** dari platform CBT. Panel ini akan menjadi "ruang kendali" bagi institusi (Sekolah, Cabang, Yayasan) untuk mengelola seluruh siklus ujian secara digital. Fase pertama ini berfokus pada penyediaan antarmuka manajemen yang efisien, terstruktur, dan mudah diadopsi oleh operator sekolah maupun panitia pusat.

## 2. Business Objectives & Goals
### 2.1. Business Objectives
1. **Digitalisasi & Efisiensi Operasional**: Menghilangkan ketergantungan pada kertas, pencetakan soal, dan koreksi manual, sehingga menghemat biaya operasional institusi hingga 40-60%.
2. **Skalabilitas Multi-Tenant**: Memungkinkan satu platform digunakan oleh banyak Sekolah dan Cabang dengan isolasi data yang ketat.
3. **Sentralisasi Bank Soal**: Membangun repositori soal digital yang dapat digunakan kembali (reusable) untuk berbagai Event ujian, mengurangi beban guru dalam membuat soal dari nol setiap periode.

### 2.2. Business Goals (Fase Frontend Admin)
1. Menyediakan prototipe UI/UX yang interaktif untuk divalidasi oleh stakeholder (operator sekolah & panitia) sebelum masuk ke tahap integrasi backend.
2. Memastikan alur kerja (workflow) pembuatan Event dan pemetaan Soal (Soal Event) secara logis dan mudah dipahami oleh user non-teknis.
3. Mendefinisikan dan memvalidasi model hak akses (RBAC & ACL) secara visual melalui menu "Menu".

## 3. Stakeholders
| Peran | Kepentingan / Interest |
| :--- | :--- |
| **Yayasan / Pemilik Sekolah** | Memantau efektivitas biaya, melihat laporan makro (Report), memastikan keamanan data institusi. |
| **Kepala Sekolah / Admin Cabang** | Mengelola data peserta (siswa) dan pegawai di wilayahnya, memastikan jadwal ujian (Event) berjalan sesuai kalender akademik. |
| **Guru / Panitia Ujian** | Kemudahan dalam input Bank Soal, mapping soal ke Event, dan melihat analisis hasil ujian. |
| **Tim Developer / AI Studio** | Memahami konteks bisnis untuk menghasilkan kode frontend yang sesuai dengan alur kerja nyata pengguna. |

## 4. Business Rules & Constraints
Aturan bisnis utama yang harus direfleksikan dalam desain fitur dan alur data (meskipun saat ini masih menggunakan dummy data):

### 4.1. Hierarki & Multi-Tenancy (ACL)
- Sistem harus mendukung hierarki: **Super Admin (Platform) -> Admin Cabang -> Admin Sekolah -> Guru**.
- **Data Isolation**: Admin Sekolah A *hanya* boleh melihat dan mengelola data Peserta, Pegawai, dan Event milik Sekolah A. Admin Cabang dapat melihat data gabungan dari semua Sekolah di bawah cabangnya.

### 4.2. Manajemen Siklus Ujian
- **Bank Soal vs Soal Event**: Bank Soal adalah repositori permanen. "Soal Event" adalah *snapshot* atau *mapping* soal dari Bank Soal yang dikunci (locked) untuk Event tertentu. Jika soal di Bank Soal diubah setelah Event dimulai, nilai peserta yang sudah mengerjakan tidak boleh berubah.
- **Passing Grade & Bobot**: Kelulusan dan pembobotan nilai dapat diatur secara global (Master) atau di-*override* per Event spesifik.

### 4.3. Role-Based Access Control (RBAC)
- Tidak ada hak akses *default* yang bersifat *hardcoded*. Semua akses menu dan fitur harus dikonfigurasi melalui modul "Menu" (RBAC).
- Setiap Role harus memiliki definisi hak akses yang jelas (Create, Read, Update, Delete - CRUD) per modul.

## 5. Business Scope
### 5.1. In-Scope (Proses Bisnis yang Dikelola)
- Konfigurasi Master Data Institusi (Sekolah, Cabang, Tahun Pelajaran, Jenjang).
- Manajemen SDM (Pegawai/Guru dan Peserta/Siswa).
- Penyusunan dan Pengelompokan Bank Soal.
- Penjadwalan dan Konfigurasi Event Ujian.
- Registrasi/Pendaftaran Peserta ke dalam Event.
- Pemetaan (Mapping) Bank Soal ke dalam Event (Soal Event).
- Pelaporan (Report) hasil ujian dan analisis.
- Manajemen Hak Akses (RBAC & ACL).

### 5.2. Out-of-Scope (Untuk Fase Saat Ini)
- Proses bisnis di sisi Siswa (mengerjakan ujian, submit jawaban, melihat nilai pribadi).
- Transaksi keuangan (pembayaran pendaftaran ujian).
- Integrasi dengan sistem eksternal (misal: Dapodik, Sistem Informasi Akademik kampus).

## 6. Success Criteria & ROI (Return on Investment)
Bagaimana bisnis mengukur keberhasilan proyek ini setelah diluncurkan?

### 6.1. Key Performance Indicators (KPIs)
1. **Time-to-Market**: Fase Frontend selesai dan siap di-handoff ke backend dalam waktu yang ditentukan.
2. **User Adoption Rate**: Minimal 90% operator sekolah dan guru dapat menggunakan panel admin tanpa memerlukan pelatihan intensif (diukur dari UI yang intuitif).
3. **Operational Efficiency**: Waktu yang dibutuhkan guru untuk menyiapkan satu Event ujian berkurang dari rata-rata 3 jam (manual) menjadi < 30 menit (digital).

### 6.2. Expected ROI
- Penghematan biaya cetak soal dan kertas jawaban hingga 80% per semester.
- Pengurangan waktu koreksi ujian dari berhari-hari menjadi *real-time* (saat backend siap).

## 7. Risks & Mitigation (Business Perspective)
| Risiko Bisnis | Dampak | Strategi Mitigasi |
| :--- | :--- | :--- |
| **Resistensi Pengguna** (Guru/Operator gaptek sulit menggunakan sistem) | Tinggi | Fase FE ini wajib mengutamakan UX yang sederhana, *anti-sloppy*, dan familiar. Gunakan *wizard* atau *step-by-step* untuk proses kompleks. |
| **Kebocoran Data Soal** (Soal ujian bocor sebelum waktu Event) | Kritis | Meskipun ini ranah backend, FE harus mendesain alur "Soal Event" yang secara visual mengonfirmasi status *draft* vs *published/locked*. |
| **Scope Creep** (Permintaan fitur terus bertambah di luar BRD) | Sedang | Tegas membatasi *In-Scope*. Fitur di luar BRD akan dimasukkan ke *backlog* untuk fase 2. |

## 8. Assumptions & Dependencies
- **Asumsi**: Stakeholder telah menyetujui struktur menu dan hierarki RBAC/ACL yang didefinisikan dalam PRD.
- **Asumsi**: Infrastruktur server dan database akan disiapkan secara paralel oleh tim backend, sehingga FE yang dibangun saat ini tidak akan terhambat.
- **Ketergantungan**: Dokumen BRD ini menjadi dasar untuk penyusunan FRD (Functional) dan TRD (Technical).