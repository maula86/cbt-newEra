'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar as CalendarIcon,
  Clock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Filter,
  Users,
  Building,
  ArrowRight,
  Copy,
  Check,
  CalendarDays,
  Flame,
  Layers,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useExamStore } from '@/store/useExamStore';
import { cn } from '@/lib/utils';

export type EventCategory = 'ujian_utama' | 'simulasi' | 'remedial' | 'operasional';

export interface CalendarEventItem {
  id: string;
  title: string;
  category: EventCategory;
  categoryLabel: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  durationMinutes: number;
  token?: string;
  participantCount?: number;
  location?: string;
  description?: string;
  status: 'active' | 'upcoming' | 'completed';
  actionHref?: string;
}

export interface CalendarDayInfo {
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  dayName: string; // Sen, Sel, Rab, ...
  fullDayName: string; // Senin, Selasa, ...
  monthLabel: string; // Sep, Okt, Nov
  fullMonthName: string; // September, Oktober, November
  year: number;
  period: 'prev' | 'current' | 'next';
  periodLabel: string;
  isToday: boolean;
  events: CalendarEventItem[];
}

export function OperationalCalendar() {
  const { events: storeEvents } = useExamStore();

  // Selected date state (defaults to today: 2026-10-03)
  const todayDateString = '2026-10-03';
  const [selectedDateString, setSelectedDateString] = React.useState<string>(todayDateString);
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [copiedToken, setCopiedToken] = React.useState<string | null>(null);

  // Generate the exact 50 days:
  // - 10 hari bulan kemarin (September 2026: 21 s/d 30)
  // - 30 hari bulan ini (Oktober 2026: 1 s/d 30)
  // - 10 hari bulan depan (November 2026: 1 s/d 10)
  const daysList: CalendarDayInfo[] = React.useMemo(() => {
    const days: CalendarDayInfo[] = [];

    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const fullDayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const monthNames = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const shortMonthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
      'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
    ];

    // Reference base: Year 2026, Month October (monthIndex = 9)
    const baseYear = 2026;
    const currentMonthIndex = 9; // October (0-indexed)

    // 1. 10 hari bulan kemarin: September 21 s/d 30 (10 hari)
    const prevMonthIndex = 8; // September
    for (let day = 21; day <= 30; day++) {
      const d = new Date(baseYear, prevMonthIndex, day);
      const dateString = `${baseYear}-09-${String(day).padStart(2, '0')}`;
      days.push({
        dateString,
        dayNumber: day,
        dayName: dayNames[d.getDay()],
        fullDayName: fullDayNames[d.getDay()],
        monthLabel: shortMonthNames[prevMonthIndex],
        fullMonthName: monthNames[prevMonthIndex],
        year: baseYear,
        period: 'prev',
        periodLabel: 'Bulan Kemarin',
        isToday: dateString === todayDateString,
        events: [],
      });
    }

    // 2. 30 hari bulan ini: Oktober 1 s/d 30 (30 hari)
    for (let day = 1; day <= 30; day++) {
      const d = new Date(baseYear, currentMonthIndex, day);
      const dateString = `${baseYear}-10-${String(day).padStart(2, '0')}`;
      days.push({
        dateString,
        dayNumber: day,
        dayName: dayNames[d.getDay()],
        fullDayName: fullDayNames[d.getDay()],
        monthLabel: shortMonthNames[currentMonthIndex],
        fullMonthName: monthNames[currentMonthIndex],
        year: baseYear,
        period: 'current',
        periodLabel: 'Bulan Ini',
        isToday: dateString === todayDateString,
        events: [],
      });
    }

    // 3. 10 hari bulan depan: November 1 s/d 10 (10 hari)
    const nextMonthIndex = 10; // November
    for (let day = 1; day <= 10; day++) {
      const d = new Date(baseYear, nextMonthIndex, day);
      const dateString = `${baseYear}-11-${String(day).padStart(2, '0')}`;
      days.push({
        dateString,
        dayNumber: day,
        dayName: dayNames[d.getDay()],
        fullDayName: fullDayNames[d.getDay()],
        monthLabel: shortMonthNames[nextMonthIndex],
        fullMonthName: monthNames[nextMonthIndex],
        year: baseYear,
        period: 'next',
        periodLabel: 'Bulan Depan',
        isToday: dateString === todayDateString,
        events: [],
      });
    }

    return days;
  }, [todayDateString]);

  // Comprehensive static agenda dataset spanning the 50 days
  const baseCalendarEvents: CalendarEventItem[] = React.useMemo(() => {
    return [
      // --- BULAN KEMARIN (21 - 30 September 2026) ---
      {
        id: 'cal-1',
        title: 'Rapat Koordinasi & Finalisasi Bank Soal Semester',
        category: 'operasional',
        categoryLabel: 'Koordinasi Panitia',
        date: '2026-09-21',
        startTime: '09:00',
        endTime: '11:30',
        durationMinutes: 150,
        location: 'Ruang Rapat Utama & Daring',
        description: 'Penyelarasan kisi-kisi dan validasi instrumen butir soal standar kurikulum nasional.',
        status: 'completed',
        actionHref: '/bank-soal',
      },
      {
        id: 'cal-2',
        title: 'Verifikasi Akun & Sinkronisasi NISN Peserta CBT',
        category: 'operasional',
        categoryLabel: 'Validasi Data',
        date: '2026-09-23',
        startTime: '13:00',
        endTime: '15:00',
        durationMinutes: 120,
        participantCount: 42,
        location: 'Pusat Data Administrasi',
        description: 'Pemeriksaan status akun aktif dan kelengkapan data peserta didik sebelum pelaksanaan ujian.',
        status: 'completed',
        actionHref: '/peserta',
      },
      {
        id: 'cal-3',
        title: 'Gladi Bersih Server CBT & Stress Test Beban Jaringan',
        category: 'simulasi',
        categoryLabel: 'Uji Teknis Lab',
        date: '2026-09-25',
        startTime: '08:30',
        endTime: '11:00',
        durationMinutes: 150,
        location: 'Laboratorium Komputer CBT',
        description: 'Uji coba ketahanan throughput server lokal dengan 100 sesi bersamaan tanpa hambatan.',
        status: 'completed',
        actionHref: '/config',
      },
      {
        id: 'cal-4',
        title: 'Batas Akhir Penyerahan Naskah Soal Terstandarisasi',
        category: 'operasional',
        categoryLabel: 'Batas Akhir',
        date: '2026-09-28',
        startTime: '15:00',
        endTime: '17:00',
        durationMinutes: 120,
        location: 'Portal Bank Soal Terpadu',
        description: 'Penguncian modul pembuatan soal sebelum diapprove oleh tim telaah kurikulum.',
        status: 'completed',
        actionHref: '/bank-soal',
      },
      {
        id: 'cal-5',
        title: 'Simulasi Mandiri Seleksi Masuk PTN / UTBK Tingkat Cabang',
        category: 'simulasi',
        categoryLabel: 'Simulasi Mandiri',
        date: '2026-09-30',
        startTime: '08:00',
        endTime: '10:30',
        durationMinutes: 150,
        token: 'TRY26A',
        participantCount: 38,
        location: 'Lab CBT 1 & 2',
        description: 'Latihan soal skolastik dan penalaran umum adaptif bagi siswa tingkat akhir.',
        status: 'completed',
        actionHref: '/event',
      },

      // --- BULAN INI (1 - 30 Oktober 2026) ---
      {
        id: 'cal-6',
        title: 'Rilis Jadwal Resmi Ujian Tengah Semester (PTS) Genap',
        category: 'operasional',
        categoryLabel: 'Pengumuman Resmi',
        date: '2026-10-01',
        startTime: '08:00',
        endTime: '09:00',
        durationMinutes: 60,
        location: 'Portal Pengumuman Siswa',
        description: 'Publikasi jadwal resmi sesi ujian dan pembagian nomor meja peserta di lab sekolah.',
        status: 'completed',
        actionHref: '/event',
      },
      {
        id: 'cal-7',
        title: 'Simulasi Akbar CBT & Uji Coba Token Dinamis (Hari Ini)',
        category: 'simulasi',
        categoryLabel: 'Simulasi Live',
        date: '2026-10-03',
        startTime: '09:00',
        endTime: '11:00',
        durationMinutes: 120,
        token: 'PAS25A',
        participantCount: 42,
        location: 'Seluruh Laboratorium Komputer',
        description: 'Uji coba mekanisme aktivasi token otomatis, deteksi kecurangan, dan navigasi butir soal.',
        status: 'active',
        actionHref: '/event',
      },
      {
        id: 'cal-8',
        title: 'PTS Matematika Wajib & Penalaran Geometri',
        category: 'ujian_utama',
        categoryLabel: 'Ujian Utama',
        date: '2026-10-05',
        startTime: '07:30',
        endTime: '09:30',
        durationMinutes: 120,
        token: 'MAT05A',
        participantCount: 42,
        location: 'Lab CBT SMAN 1 Jakarta',
        description: 'Ujian formal kurikulum materi dimensi tiga, aljabar, dan fungsi eksponen.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-9',
        title: 'PTS Bahasa Indonesia & Literasi Membaca Kritis',
        category: 'ujian_utama',
        categoryLabel: 'Ujian Utama',
        date: '2026-10-07',
        startTime: '08:00',
        endTime: '10:00',
        durationMinutes: 120,
        token: 'BIN07B',
        participantCount: 42,
        location: 'Lab CBT SMAN 1 Jakarta',
        description: 'Asesmen pemahaman teks tajuk rencana, kaidah PUEBI, dan analisis kebahasaan modern.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-10',
        title: 'PTS Fisika Terapan & Dinamika Rotasi Benda Tegar',
        category: 'ujian_utama',
        categoryLabel: 'Ujian Utama',
        date: '2026-10-09',
        startTime: '08:00',
        endTime: '10:00',
        durationMinutes: 120,
        token: 'FIS09C',
        participantCount: 36,
        location: 'Lab Multimedia 1 & 2',
        description: 'Soal komputasi mekanika, momen inersia, dan hukum kekekalan momentum sudut.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-11',
        title: 'Aktivasi Token Ujian Susulan & Remedial Gelombang I',
        category: 'remedial',
        categoryLabel: 'Sesi Remedial',
        date: '2026-10-12',
        startTime: '13:00',
        endTime: '15:00',
        durationMinutes: 120,
        token: 'REM12A',
        participantCount: 14,
        location: 'Ruang Laboratorium 3',
        description: 'Sesi perbaikan nilai khusus bagi siswa dengan nilai di bawah passing grade KKM.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-12',
        title: 'Uji Coba Tipe Soal Kompleks (Pernyataan & Penjodohan)',
        category: 'simulasi',
        categoryLabel: 'Eksperimen Bank Soal',
        date: '2026-10-14',
        startTime: '10:00',
        endTime: '11:30',
        durationMinutes: 90,
        token: 'KOMP14',
        participantCount: 25,
        location: 'Lab CBT Terpadu',
        description: 'Pengujian format baru matriks Benar/Salah, Multi Choice, dan Penjodohan di antarmuka siswa.',
        status: 'upcoming',
        actionHref: '/bank-soal',
      },
      {
        id: 'cal-13',
        title: 'Rekapitulasi Nilai PTS & Verifikasi Passing Grade',
        category: 'operasional',
        categoryLabel: 'Pengolahan Nilai',
        date: '2026-10-17',
        startTime: '14:00',
        endTime: '16:30',
        durationMinutes: 150,
        location: 'Ruang Rapat Kurikulum',
        description: 'Penghitungan statistik rata-rata capaian, standar deviasi, dan penetapan kuota remedial.',
        status: 'upcoming',
        actionHref: '/report',
      },
      {
        id: 'cal-14',
        title: 'Simulasi Akbar UTBK SNBT Seri I (Serentak Cabang)',
        category: 'simulasi',
        categoryLabel: 'Simulasi Terjadwal',
        date: '2026-10-20',
        startTime: '08:30',
        endTime: '11:30',
        durationMinutes: 180,
        token: 'UTBK26',
        participantCount: 45,
        location: 'Seluruh Unit Sekolah Wilayah I',
        description: 'Ujian simulasi gabungan Tes Potensi Skolastik (TPS) dan Penalaran Matematika.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-15',
        title: 'Evaluasi Server & Pemeliharaan Database Hasil Ujian',
        category: 'operasional',
        categoryLabel: 'Maintenance Server',
        date: '2026-10-22',
        startTime: '16:00',
        endTime: '18:00',
        durationMinutes: 120,
        location: 'Server Room NOC',
        description: 'Pembersihan cache, archiving log sesi peserta, dan backup terenkripsi data ujian.',
        status: 'upcoming',
        actionHref: '/config',
      },
      {
        id: 'cal-16',
        title: 'Briefing Pengawas & Proktor CBT Sekolah Wilayah',
        category: 'operasional',
        categoryLabel: 'Briefing Pengawas',
        date: '2026-10-26',
        startTime: '09:00',
        endTime: '10:30',
        durationMinutes: 90,
        location: 'Aula Graha Pendidik',
        description: 'Sosialisasi SOP pengawasan ujian berbasis gawai, penanganan force majeure, dan integritas token.',
        status: 'upcoming',
        actionHref: '/pegawai',
      },
      {
        id: 'cal-17',
        title: 'Simulasi Akhir Penilaian Akhir Semester (PAS) Daring',
        category: 'simulasi',
        categoryLabel: 'Simulasi Akhir',
        date: '2026-10-28',
        startTime: '08:00',
        endTime: '10:00',
        durationMinutes: 120,
        token: 'SIM28B',
        participantCount: 42,
        location: 'Lab CBT 1 & 2',
        description: 'Uji coba penutupan dengan sistem pengacakan opsi dan soal adaptif otomatis.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-18',
        title: 'Batas Akhir Remedial & Penguncian Nilai PTS',
        category: 'remedial',
        categoryLabel: 'Penguncian Nilai',
        date: '2026-10-30',
        startTime: '17:00',
        endTime: '18:00',
        durationMinutes: 60,
        location: 'Sistem Rapor Digital',
        description: 'Batas akhir unggah nilai remedi sebelum data ditransfer ke e-Rapor kementerian.',
        status: 'upcoming',
        actionHref: '/report',
      },

      // --- BULAN DEPAN (1 - 10 November 2026) ---
      {
        id: 'cal-19',
        title: 'Pembukaan Pendaftaran Ujian Mandiri Seleksi Masuk PTN Seri II',
        category: 'operasional',
        categoryLabel: 'Pendaftaran Peserta',
        date: '2026-11-02',
        startTime: '08:00',
        endTime: '10:00',
        durationMinutes: 120,
        participantCount: 50,
        location: 'Portal Pendaftaran CBT',
        description: 'Pembukaan registrasi batch 2 untuk tryout skolastik dan peminatan jurusan.',
        status: 'upcoming',
        actionHref: '/pendaftaran',
      },
      {
        id: 'cal-20',
        title: 'Gladi Resik PAS Genap 2026/2027 Wilayah I Jakarta',
        category: 'simulasi',
        categoryLabel: 'Gladi Resik',
        date: '2026-11-04',
        startTime: '08:00',
        endTime: '11:00',
        durationMinutes: 180,
        token: 'GLD04A',
        participantCount: 42,
        location: 'Laboratorium CBT 1 - 4',
        description: 'Pengecekan kesiapan perangkat tablet, laptop, dan koneksi internet cadangan 4G.',
        status: 'upcoming',
        actionHref: '/event',
      },
      {
        id: 'cal-21',
        title: 'Sinkronisasi Data Siswa Kelas XII & Cetak Kartu Peserta',
        category: 'operasional',
        categoryLabel: 'Administrasi Kartu',
        date: '2026-11-06',
        startTime: '10:00',
        endTime: '12:00',
        durationMinutes: 120,
        participantCount: 42,
        location: 'Sekretariat CBT',
        description: 'Pencetakan kartu peserta ujian ber-barcode untuk scan presensi ruang secara otomatis.',
        status: 'upcoming',
        actionHref: '/peserta',
      },
      {
        id: 'cal-22',
        title: 'Uji Coba Bank Soal Tipe Pernyataan & Matching Nasional',
        category: 'simulasi',
        categoryLabel: 'Uji Coba Format',
        date: '2026-11-08',
        startTime: '08:30',
        endTime: '10:30',
        durationMinutes: 120,
        token: 'NAS08X',
        participantCount: 30,
        location: 'Lab CBT 2',
        description: 'Pelatihan model asesmen kompetensi minimum (AKM) dengan sub-item pembobotan dinamis.',
        status: 'upcoming',
        actionHref: '/bank-soal',
      },
      {
        id: 'cal-23',
        title: 'Pelaksanaan Hari Pertama Penilaian Akhir Semester (PAS)',
        category: 'ujian_utama',
        categoryLabel: 'Ujian Utama',
        date: '2026-11-10',
        startTime: '07:30',
        endTime: '10:00',
        durationMinutes: 150,
        token: 'PAS26G',
        participantCount: 42,
        location: 'Seluruh Laboratorium CBT',
        description: 'Hari perdana PAS terpusat mata pelajaran Matematika dan Pendidikan Agama.',
        status: 'upcoming',
        actionHref: '/event',
      },
    ];
  }, []);

  // Map events to their respective days
  const populatedDays = React.useMemo(() => {
    return daysList.map((day) => {
      // Find events for this date
      const matchedEvents = baseCalendarEvents.filter((ev) => ev.date === day.dateString);
      return {
        ...day,
        events: matchedEvents,
      };
    });
  }, [daysList, baseCalendarEvents]);

  // Selected Day Information
  const selectedDayInfo = React.useMemo(() => {
    return (
      populatedDays.find((d) => d.dateString === selectedDateString) ||
      populatedDays.find((d) => d.isToday) ||
      populatedDays[0]
    );
  }, [populatedDays, selectedDateString]);

  // Filtered events of the selected day
  const displayedSelectedEvents = React.useMemo(() => {
    if (!selectedDayInfo) return [];
    if (categoryFilter === 'all') return selectedDayInfo.events;
    return selectedDayInfo.events.filter((e) => e.category === categoryFilter);
  }, [selectedDayInfo, categoryFilter]);

  // Quick summary counts over the 50 days
  const totalEventsIn50Days = React.useMemo(() => {
    return baseCalendarEvents.length;
  }, [baseCalendarEvents]);

  const activeEventsCount = React.useMemo(() => {
    return baseCalendarEvents.filter((e) => e.status === 'active').length;
  }, [baseCalendarEvents]);

  const upcomingEventsCount = React.useMemo(() => {
    return baseCalendarEvents.filter((e) => e.status === 'upcoming').length;
  }, [baseCalendarEvents]);

  const handleCopyToken = (tokenText: string) => {
    navigator.clipboard.writeText(tokenText);
    setCopiedToken(tokenText);
    setTimeout(() => {
      setCopiedToken(null);
    }, 2000);
  };

  const getCategoryBadgeClass = (category: EventCategory) => {
    switch (category) {
      case 'ujian_utama':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25';
      case 'simulasi':
        return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
      case 'remedial':
        return 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25';
      case 'operasional':
      default:
        return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
    }
  };

  return (
    <Card className="border-border bg-card shadow-2xs overflow-hidden">
      {/* Header Bar */}
      <CardHeader className="p-5 border-b border-border/70 bg-card">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-primary shrink-0" />
                <CardTitle className="text-base font-bold text-foreground tracking-tight">
                  Kalender Operasional Ujian (Rentang 50 Hari)
                </CardTitle>
              </div>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                21 Sep – 10 Nov 2026
              </span>
            </div>
            <CardDescription className="text-xs text-muted-foreground">
              Pelacakan jadwal ujian, simulasi lab, aktivasi token, dan agenda remedial terpadu selama 50 hari beruntun.
            </CardDescription>

            {/* Exact 50-day breakdown badges */}
            <div className="flex items-center gap-2 pt-1 flex-wrap text-[11px]">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium bg-slate-500/10 text-slate-700 dark:text-slate-300 border border-slate-500/20">
                <span className="w-1.5 h-1.5 rounded-xs bg-slate-500" />
                10 Hari Bulan Kemarin (Sep)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-semibold bg-primary/10 text-primary border border-primary/30">
                <span className="w-1.5 h-1.5 rounded-xs bg-primary" />
                30 Hari Bulan Ini (Okt)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-xs bg-emerald-500" />
                10 Hari Bulan Depan (Nov)
              </span>
            </div>
          </div>

          {/* Quick Metrics & Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Quick KPI badges */}
            <div className="hidden sm:flex items-center gap-3 pr-2 border-r border-border/70 text-xs">
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Total Agenda</span>
                <span className="font-bold text-foreground">{totalEventsIn50Days} Event</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-muted-foreground block">Hari Ini</span>
                <span className="font-bold text-primary">1 Live Event</span>
              </div>
            </div>

            {/* Jump to Today Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDateString(todayDateString)}
              className={cn(
                'h-8 text-xs font-semibold gap-1.5 transition-colors',
                selectedDateString === todayDateString
                  ? 'border-primary text-primary bg-primary/5'
                  : 'text-foreground'
              )}
            >
              <Flame className="h-3.5 w-3.5 text-primary" />
              <span>Hari Ini (03 Okt)</span>
            </Button>

            {/* Category Filter */}
            <div className="w-40 sm:w-44">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full h-8 text-xs font-semibold rounded-lg border border-border bg-card px-2.5 text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
                title="Filter kategori agenda"
              >
                <option value="all">Semua Kategori ({totalEventsIn50Days})</option>
                <option value="ujian_utama">Ujian Utama (PTS/PAS)</option>
                <option value="simulasi">Simulasi & Gladi</option>
                <option value="remedial">Sesi Remedial</option>
                <option value="operasional">Koordinasi & Batas Akhir</option>
              </select>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Main Content Area: 50-Day Grid (Left) + Selected Day Agenda Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-border">
        {/* LEFT: 50-DAY CALENDAR GRID (7 Cols on LG) */}
        <div className="lg:col-span-8 p-4 sm:p-5 space-y-4">
          {/* Calendar Grid Header (Legend & Month transitions) */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
            <span className="font-medium text-foreground">
              Menampilkan 50 Tanggal Berurutan:
            </span>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-primary" />
                <span>Ada Agenda</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-xs bg-primary/20 border border-primary" />
                <span>Hari Ini</span>
              </span>
            </div>
          </div>

          {/* 50-Day Grid Container */}
          <div className="grid grid-cols-5 sm:grid-cols-7 gap-1.5 sm:gap-2 select-none">
            {populatedDays.map((day) => {
              const isSelected = day.dateString === selectedDateString;
              const hasEvents = day.events.length > 0;
              const hasActiveEvent = day.events.some((e) => e.status === 'active');

              return (
                <button
                  key={day.dateString}
                  type="button"
                  onClick={() => setSelectedDateString(day.dateString)}
                  className={cn(
                    'flex flex-col items-start p-2 rounded-lg border text-left transition-all cursor-pointer relative min-h-[74px] sm:min-h-[82px]',
                    isSelected
                      ? 'border-primary ring-2 ring-primary/30 bg-primary/5 shadow-2xs z-10'
                      : day.isToday
                      ? 'border-primary/60 bg-primary/10 hover:border-primary'
                      : day.period === 'current'
                      ? 'border-border bg-card hover:border-foreground/30 hover:bg-muted/40'
                      : 'border-border/60 bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50'
                  )}
                >
                  {/* Top Bar: Day Name + Date Number */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={cn(
                        'text-[10px] font-mono',
                        day.isToday ? 'text-primary font-bold' : 'text-muted-foreground'
                      )}
                    >
                      {day.dayName}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-bold font-mono px-1 rounded',
                        day.isToday
                          ? 'bg-primary text-primary-foreground font-black'
                          : isSelected
                          ? 'text-primary'
                          : day.period === 'current'
                          ? 'text-foreground'
                          : 'text-muted-foreground'
                      )}
                    >
                      {day.dayNumber}
                    </span>
                  </div>

                  {/* Month Label Tag on first day of month or first day in grid */}
                  {(day.dayNumber === 1 || day.dayNumber === 21) && (
                    <span
                      className={cn(
                        'text-[9px] font-mono font-bold tracking-tight px-1 py-0.2 rounded mt-0.5',
                        day.period === 'prev'
                          ? 'bg-slate-500/15 text-slate-700 dark:text-slate-300'
                          : day.period === 'current'
                          ? 'bg-primary/20 text-primary font-semibold'
                          : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                      )}
                    >
                      {day.monthLabel}
                    </span>
                  )}

                  {/* Event indicators / Mini chips */}
                  <div className="mt-auto pt-1 w-full space-y-1">
                    {hasEvents ? (
                      <div className="space-y-0.5">
                        {day.events.slice(0, 1).map((ev) => (
                          <div
                            key={ev.id}
                            className={cn(
                              'truncate text-[9px] font-medium px-1 py-0.5 rounded leading-none border',
                              getCategoryBadgeClass(ev.category)
                            )}
                            title={ev.title}
                          >
                            {ev.title}
                          </div>
                        ))}
                        {day.events.length > 1 && (
                          <span className="text-[9px] font-semibold text-primary block leading-none pl-0.5">
                            +{day.events.length - 1} lagi
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="h-1" />
                    )}
                  </div>

                  {/* Active event pulsing indicator */}
                  {hasActiveEvent && (
                    <span className="absolute top-1 right-1 flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Month Range Bar Legend */}
          <div className="p-3 rounded-lg border border-border/70 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Rentang Terkover:</span>
              <span className="font-mono text-primary font-medium">50 Hari Utuh</span>
              <span className="text-border">|</span>
              <span>September (10 Hari)</span>
              <span className="text-border">→</span>
              <span>Oktober (30 Hari)</span>
              <span className="text-border">→</span>
              <span>November (10 Hari)</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Klik tanggal untuk memeriksa agenda & token ujian
            </span>
          </div>
        </div>

        {/* RIGHT: SELECTED DAY AGENDA DETAILS PANEL */}
        <div className="lg:col-span-4 p-4 sm:p-5 flex flex-col bg-card/60">
          {/* Panel Header */}
          <div className="pb-3 border-b border-border space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Rincian Tanggal Terpilih
              </span>
              <span
                className={cn(
                  'text-[10px] font-mono font-semibold px-2 py-0.5 rounded border',
                  selectedDayInfo.isToday
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-muted text-muted-foreground border-border'
                )}
              >
                {selectedDayInfo.isToday ? 'Hari Ini (Active)' : selectedDayInfo.periodLabel}
              </span>
            </div>

            <h3 className="text-base font-bold text-foreground">
              {selectedDayInfo.fullDayName}, {selectedDayInfo.dayNumber} {selectedDayInfo.fullMonthName} {selectedDayInfo.year}
            </h3>
            <p className="text-xs text-muted-foreground">
              {displayedSelectedEvents.length} agenda/event terjadwal pada hari ini.
            </p>
          </div>

          {/* Event Cards List for Selected Day */}
          <div className="flex-1 overflow-y-auto py-3 space-y-3 min-h-[300px] max-h-[460px] pr-0.5">
            {displayedSelectedEvents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 rounded-xl border border-dashed border-border text-muted-foreground space-y-2">
                <CalendarDays className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs font-semibold text-foreground">
                  Tidak Ada Event Terjadwal
                </p>
                <p className="text-[11px] text-muted-foreground max-w-xs">
                  Tidak ada agenda ujian atau simulasi pada {selectedDayInfo.dayNumber} {selectedDayInfo.fullMonthName} {selectedDayInfo.year}.
                </p>
                <Link href="/event" className="pt-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                    <span>Jadwalkan Event</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            ) : (
              displayedSelectedEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={cn(
                    'p-3.5 rounded-xl border space-y-2.5 transition-all shadow-2xs',
                    ev.status === 'active'
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-card hover:border-foreground/20'
                  )}
                >
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'text-[10px] font-semibold px-2 py-0.5 rounded border',
                        getCategoryBadgeClass(ev.category)
                      )}
                    >
                      {ev.categoryLabel}
                    </span>

                    {ev.status === 'active' ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-primary">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        Sedang Berlangsung
                      </span>
                    ) : ev.status === 'completed' ? (
                      <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                        Selesai
                      </span>
                    ) : (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Terjadwal
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-bold text-foreground leading-snug">
                    {ev.title}
                  </h4>

                  {/* Description */}
                  {ev.description && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  {/* Meta: Time, Location, Participants */}
                  <div className="space-y-1 pt-1 text-[11px] text-muted-foreground border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>{ev.startTime} - {ev.endTime} WIB</span>
                      </span>
                      <span className="font-medium text-foreground">
                        {ev.durationMinutes} Menit
                      </span>
                    </div>

                    {ev.participantCount && (
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span>{ev.participantCount} Peserta Terdaftar</span>
                      </div>
                    )}

                    {ev.location && (
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Token Box (If available) */}
                  {ev.token && (
                    <div className="p-2 rounded-lg bg-muted/60 border border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <KeyRound className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground text-[11px]">Token Sesi:</span>
                        <span className="font-mono font-bold text-foreground tracking-wider">
                          {ev.token}
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyToken(ev.token || '')}
                        className="h-6 px-1.5 text-[10px] gap-1 text-primary hover:text-primary hover:bg-primary/10"
                        title="Salin token sesi"
                      >
                        {copiedToken === ev.token ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            <span>Salin</span>
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {/* Action Link */}
                  {ev.actionHref && (
                    <div className="pt-1">
                      <Link href={ev.actionHref}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-7 text-xs font-semibold justify-between"
                        >
                          <span>Buka Manajemen Event</span>
                          <ChevronRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Bottom Quick Action */}
          <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
            <Link href="/event">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-primary font-semibold p-0 gap-1">
                <span>Kelola Semua Event CBT</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
            <Link href="/soal-event">
              <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground p-0 gap-1">
                <span>Mapping Soal</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  );
}
