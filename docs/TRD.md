```markdown
# Technical Requirements Document (TRD)
## Project: CBT Web Application - Administrator Frontend

**Version:** 1.0.0  
**Date:** 24 Mei 2024  
**Status:** Final Draft  
**Target Handoff:** AI Gemini Studio (Execution & Code Generation)

---

## 1. Executive Summary
Dokumen ini menetapkan standar teknis, arsitektur, struktur folder, dan aturan pengkodean (coding standards) untuk pengembangan Frontend Administrator Aplikasi CBT. Dokumen ini bersifat mengikat (prescriptive) untuk memastikan kode yang dihasilkan oleh AI Gemini Studio bersih, modular, type-safe, dan sesuai dengan prinsip "Anti-Slop".

## 2. Technology Stack
- **Framework**: Next.js 14+ (App Router).
- **Language**: TypeScript (Strict Mode: `strict: true`, `noImplicitAny: true`).
- **Styling Engine**: Tailwind CSS v4 (menggunakan sintaks `@import "tailwindcss"` dan `@theme inline`).
- **UI Components**: `shadcn/ui` (base) + `tweakcn` (extensions/variations).
- **Icons**: `lucide-react`.
- **State Management**: `zustand` (dengan middleware `persist` untuk dummy data).
- **Form Handling**: `react-hook-form` + `zod` (untuk validasi skema).
- **Charts**: `recharts` (untuk modul Report).
- **Utilities**: `clsx`, `tailwind-merge` (untuk fungsi `cn()`).

---

## 3. Project Directory Structure
Struktur folder harus mengikuti pola modular dan separation of concerns. AI wajib menghasilkan struktur seperti ini:

```text
cbt-admin-frontend/
├── app/
│   ├── (auth)/                 # Route group untuk login (jika ada simulasi)
│   ├── (dashboard)/            # Route group utama admin
│   │   ├── layout.tsx          # Layout utama dengan Sidebar-07
│   │   ├── page.tsx            # Dashboard Home
│   │   ├── master/
│   │   │   ├── sekolah/
│   │   │   │   ├── page.tsx    # UI Halaman Sekolah
│   │   │   │   └── components/ # Komponen spesifik halaman ini
│   │   │   └── ... (sub-menu master lainnya)
│   │   ├── event/
│   │   ├── soal-event/
│   │   ├── menu/               # RBAC/ACL Management
│   │   └── ... (menu lainnya sesuai FRD)
│   ├── globals.css             # WAJIB menggunakan tuning CSS di bawah
│   ├── layout.tsx              # WAJIB menggunakan konfigurasi font di bawah
│   └── providers.tsx           # Wrapper untuk ThemeProvider, Toast, dll
├── components/
│   ├── ui/                     # Komponen dasar shadcn/ui (button, table, dialog, dll)
│   ├── layout/                 # Sidebar-07, Header, AppShell
│   └── shared/                 # Komponen reusable (DataTable, PageHeader, StatusBadge)
├── lib/
│   ├── utils.ts                # Fungsi cn()
│   ├── mock-data.ts            # SUMBER DUMMY DATA TERPUSAT
│   └── constants.ts            # Konstanta aplikasi (enum, config default)
├── store/                      # Zustand stores
│   ├── useMasterStore.ts
│   ├── useExamStore.ts
│   └── useConfigStore.ts
├── types/                      # Definisi TypeScript global
│   ├── index.ts
│   ├── master.ts
│   └── exam.ts
└── hooks/                      # Custom hooks (misal: useDataTable, useRBAC)
```

---

## 4. Design System & Styling Configuration
AI **WAJIB** menggunakan konfigurasi berikut tanpa modifikasi pada variabel inti, untuk menjamin konsistensi tema dan dukungan Dark Mode.

### 4.1. Global Styles (`app/globals.css`)
Gunakan konfigurasi Tailwind v4 berikut. Pastikan file ini menggantikan isi default `globals.css`.

```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

:root {
  --background: #ffffff;
  --foreground: #001a3d;
  --card: #f8f9fa;
  --card-foreground: #001a3d;
  --popover: #ffffff;
  --popover-foreground: #001a3d;
  --primary: #ff810a;
  --primary-foreground: #ffffff;
  --secondary: #e0f0ff;
  --secondary-foreground: #001a3d;
  --muted: #f5faff;
  --muted-foreground: #355179;
  --accent: #e0f0ff;
  --accent-foreground: #001a3d;
  --destructive: #ef4444;
  --destructive-foreground: #f8fafc;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #001a3d;
  --chart-1: #5f92f7;
  --chart-2: #ff791a;
  --chart-3: #334155;
  --chart-4: #f9ba71;
  --chart-5: #d0e3fb;
  --sidebar: #ffffff;
  --sidebar-foreground: #001a3d;
  --sidebar-primary: #ff810a;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #e0f0ff;
  --sidebar-accent-foreground: #001a3d;
  --sidebar-border: #e2e8f0;
  --sidebar-ring: #001a3d;
  --font-sans: Poppins, ui-sans-serif, sans-serif, system-ui;
  --font-serif: Lora, ui-serif, serif;
  --font-mono: Space Mono, ui-monospace, monospace;
  --radius: 0.75rem;
  --shadow-x: 0px;
  --shadow-y: 4px;
  --shadow-blur: 10px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.05;
  --shadow-color: #000000;
  --shadow-2xs: 0px 4px 10px 0px hsl(0 0% 0% / 0.03);
  --shadow-xs: 0px 4px 10px 0px hsl(0 0% 0% / 0.03);
  --shadow-sm: 0px 4px 10px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05);
  --shadow: 0px 4px 10px 0px hsl(0 0% 0% / 0.05), 0px 1px 2px -1px hsl(0 0% 0% / 0.05);
  --shadow-md: 0px 4px 10px 0px hsl(0 0% 0% / 0.05), 0px 2px 4px -1px hsl(0 0% 0% / 0.05);
  --shadow-lg: 0px 4px 10px 0px hsl(0 0% 0% / 0.05), 0px 4px 6px -1px hsl(0 0% 0% / 0.05);
  --shadow-xl: 0px 4px 10px 0px hsl(0 0% 0% / 0.05), 0px 8px 10px -1px hsl(0 0% 0% / 0.05);
  --shadow-2xl: 0px 4px 10px 0px hsl(0 0% 0% / 0.13);
  --tracking-normal: -0.01em;
  --spacing: 0.25rem;
}

.dark {
  --background: #0a0c10;
  --foreground: #f8f9fa;
  --card: #14171d;
  --card-foreground: #f8f9fa;
  --popover: #0a0c10;
  --popover-foreground: #f8f9fa;
  --primary: #ff791a;
  --primary-foreground: #ffffff;
  --secondary: #1e293b;
  --secondary-foreground: #f8f9fa;
  --muted: #1e293b;
  --muted-foreground: #94a3b8;
  --accent: #001a3d;
  --accent-foreground: #ffffff;
  --destructive: #7f1d1d;
  --destructive-foreground: #f8fafc;
  --border: #1e293b;
  --input: #1e293b;
  --ring: #ff791a;
  --chart-1: #ff791a;
  --chart-2: #3b82f6;
  --chart-3: #10b981;
  --chart-4: #f59e0b;
  --chart-5: #6366f1;
  --sidebar: #0a0c10;
  --sidebar-foreground: #f8f9fa;
  --sidebar-primary: #ff791a;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #ffffff;
  --sidebar-accent-foreground: #2d3b49;
  --sidebar-border: #1e293b;
  --sidebar-ring: #ff791a;
  --font-sans: Poppins, ui-sans-serif, sans-serif, system-ui;
  --font-serif: Lora, ui-serif, serif;
  --font-mono: Space Mono, ui-monospace, monospace;
  --radius: 0.75rem;
  --shadow-x: 0px;
  --shadow-y: 4px;
  --shadow-blur: 15px;
  --shadow-spread: 0px;
  --shadow-opacity: 0.4;
  --shadow-color: #000000;
  --shadow-2xs: 0px 4px 15px 0px hsl(0 0% 0% / 0.20);
  --shadow-xs: 0px 4px 15px 0px hsl(0 0% 0% / 0.20);
  --shadow-sm: 0px 4px 15px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow: 0px 4px 15px 0px hsl(0 0% 0% / 0.40), 0px 1px 2px -1px hsl(0 0% 0% / 0.40);
  --shadow-md: 0px 4px 15px 0px hsl(0 0% 0% / 0.40), 0px 2px 4px -1px hsl(0 0% 0% / 0.40);
  --shadow-lg: 0px 4px 15px 0px hsl(0 0% 0% / 0.40), 0px 4px 6px -1px hsl(0 0% 0% / 0.40);
  --shadow-xl: 0px 4px 15px 0px hsl(0 0% 0% / 0.40), 0px 8px 10px -1px hsl(0 0% 0% / 0.40);
  --shadow-2xl: 0px 4px 15px 0px hsl(0 0% 0% / 1.00);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);
  --font-serif: var(--font-serif);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --shadow-2xs: var(--shadow-2xs);
  --shadow-xs: var(--shadow-xs);
  --shadow-sm: var(--shadow-sm);
  --shadow: var(--shadow);
  --shadow-md: var(--shadow-md);
  --shadow-lg: var(--shadow-lg);
  --shadow-xl: var(--shadow-xl);
  --shadow-2xl: var(--shadow-2xl);

  --tracking-tighter: calc(var(--tracking-normal) - 0.05em);
  --tracking-tight: calc(var(--tracking-normal) - 0.025em);
  --tracking-normal: var(--tracking-normal);
  --tracking-wide: calc(var(--tracking-normal) + 0.025em);
  --tracking-wider: calc(var(--tracking-normal) + 0.05em);
  --tracking-widest: calc(var(--tracking-normal) + 0.1em);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    letter-spacing: var(--tracking-normal);
  }
}
```

### 4.2. Root Layout (`app/layout.tsx`)
Gunakan konfigurasi font berikut untuk mengikat variabel CSS dengan font yang di-load dari `next/font/google`.

```tsx
import type { Metadata } from "next";
import { Poppins, Lora, Space_Mono } from "next/font/google";
import "./globals.css";

const fontSans = Poppins({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Space_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "CBT Admin | Platform Ujian Digital",
  description: "Panel Administrasi Computer Based Test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
```
*Catatan: Tambahkan `suppressHydrationWarning` pada `<html>` untuk mencegah error hidrasi saat menggunakan tema dark/light mode.*

---

## 5. State Management & Dummy Data Strategy
### 5.1. Pola Zustand Store
Setiap store harus menggunakan middleware `persist` agar data dummy tetap ada setelah refresh halaman.

```typescript
// Contoh: store/useMasterStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockSchools } from '@/lib/mock-data';
import { School } from '@/types/master';

interface MasterState {
  schools: School[];
  addSchool: (school: School) => void;
  updateSchool: (id: string, data: Partial<School>) => void;
  deleteSchool: (id: string) => void;
}

export const useMasterStore = create<MasterState>()(
  persist(
    (set) => ({
      schools: mockSchools, // Inisialisasi dari dummy data
      addSchool: (school) => set((state) => ({ schools: [...state.schools, school] })),
      updateSchool: (id, data) => set((state) => ({
        schools: state.schools.map((s) => (s.id === id ? { ...s, ...data } : s))
      })),
      deleteSchool: (id) => set((state) => ({
        schools: state.schools.filter((s) => s.id !== id)
      })),
    }),
    { name: 'cbt-master-storage' } // Kunci unik untuk localStorage
  )
);
```

### 5.2. Pusat Dummy Data (`lib/mock-data.ts`)
Semua data awal harus didefinisikan di sini dengan tipe yang ketat. Jangan hardcode data di dalam komponen UI.

---

## 6. Coding Standards: "Anti-Slop" Protocol
AI Gemini Studio **WAJIB** mematuhi aturan berikut. Pelanggaran terhadap aturan ini dianggap sebagai output yang gagal.

1. **Strict TypeScript**: 
   - Dilarang menggunakan `any`. Gunakan `unknown` jika tipe benar-benar dinamis, lalu lakukan type narrowing.
   - Semua props komponen harus memiliki interface/type yang didefinisikan.
2. **Meaningful Naming**:
   - Komponen: `PascalCase` (e.g., `SchoolDataTable`, `EventFormDialog`).
   - Variabel/Fungsi: `camelCase` (e.g., `handleDeleteSchool`, `isFormValid`).
   - File: Sesuaikan dengan komponen atau fitur (e.g., `school-data-table.tsx`).
3. **Separation of Concerns**:
   - Jangan mencampur logika bisnis yang kompleks di dalam file komponen UI. Ekstrak ke `hooks/` atau `lib/`.
   - Maksimal 200-250 baris per file komponen. Jika lebih, pecah menjadi sub-komponen.
4. **UI/UX Consistency**:
   - Selalu gunakan fungsi `cn()` dari `lib/utils.ts` untuk menggabungkan class Tailwind.
   - Gunakan komponen `shadcn/ui` yang sudah ada, jangan membuat ulang komponen dasar (seperti Button atau Input) dari nol kecuali sangat diperlukan.
   - Setiap aksi destruktif (Delete) **wajib** memiliki `Confirmation Dialog`.
5. **No Dead Code**: Jangan meninggalkan `console.log` (kecuali untuk debugging error yang jelas), kode yang di-comment out, atau import yang tidak digunakan.

---

## 7. Routing & Layout Strategy
- Gunakan **Route Groups** `(dashboard)` untuk membungkus semua halaman yang memerlukan Sidebar dan Header.
- File `app/(dashboard)/layout.tsx` harus mengimpor dan merender komponen `Sidebar-07` di sebelah kiri, dan area `children` di sebelah kanan.
- Menu "Master" di Sidebar harus dirender sebagai *collapsible nested menu* sesuai spesifikasi `shadcn/ui blocks/sidebar#sidebar-07`.

---

## 8. Execution Instructions for AI Gemini Studio
Ketika Anda (Gemini Studio) menerima dokumen ini bersama PRD, BRD, dan FRD, ikuti langkah eksekusi berikut:
1. **Setup**: Inisialisasi proyek Next.js, instal dependensi (Tailwind v4, shadcn, tweakcn, zustand, react-hook-form, zod, lucide-react).
2. **Config**: Terapkan `globals.css` dan `layout.tsx` persis seperti yang ditentukan di Bab 4.
3. **Types & Mock**: Buat file di folder `types/` dan `lib/mock-data.ts` terlebih dahulu sebagai fondasi.
4. **Stores**: Buat Zustand stores di folder `store/`.
5. **Components**: Buat komponen shared (DataTable, PageHeader) sebelum membuat halaman spesifik.
6. **Pages**: Implementasikan halaman sesuai urutan prioritas FRD (Mulai dari Dashboard -> Master Data -> Event -> Soal Event).
7. **Review**: Pastikan tidak ada error TypeScript dan semua interaksi UI (tambah, edit, hapus) memperbarui Zustand store dan memantul (reflect) di UI secara real-time.
```