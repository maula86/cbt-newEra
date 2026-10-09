'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  CalendarCheck,
  Users,
  Search,
  Plus,
  Upload,
  Download,
  X,
  GripVertical,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Trash2,
  UserPlus,
  Filter,
  RotateCcw,
  GraduationCap,
  Calendar,
  Layers,
  ChevronRight,
  School,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useExamStore } from '@/store/useExamStore';
import { useUserStore } from '@/store/useUserStore';
import { useMasterStore } from '@/store/useMasterStore';
import { ExamEvent, Participant, EventRegistration } from '@/types';
import { cn } from '@/lib/utils';

export default function PesertaPerEventPage() {
  const {
    events,
    registrations,
    examResults,
    registerParticipantToEvent,
    bulkRegisterParticipants,
    unregisterParticipantFromEvent,
    updateRegistrationStatus,
  } = useExamStore();

  const { participants, addParticipant, importParticipants } = useUserStore();
  const { schools } = useMasterStore();

  // Selected event for Right Panel
  const [selectedEvent, setSelectedEvent] = React.useState<ExamEvent | null>(null);

  // Resizable Right Panel width state
  const [panelWidth, setPanelWidth] = React.useState<number>(640);
  const isResizingRef = React.useRef(false);

  // Filters for Main Event List
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  // Filters inside Right Panel
  const [panelSearch, setPanelSearch] = React.useState<string>('');
  const [panelAttendanceFilter, setPanelAttendanceFilter] = React.useState<string>('all');

  // Modals inside Right Panel
  const [importModalOpen, setImportModalOpen] = React.useState(false);
  const [importTab, setImportTab] = React.useState<'select' | 'csv'>('select');
  const [selectedAvailableIds, setSelectedAvailableIds] = React.useState<string[]>([]);
  const [csvText, setCsvText] = React.useState('');
  const [unregisterConfirmOpen, setUnregisterConfirmOpen] = React.useState(false);
  const [targetParticipantToUnregister, setTargetParticipantToUnregister] = React.useState<Participant | null>(null);

  // Resizing logic for Right Panel
  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - mouseEvent.clientX;
      const minWidth = 420;
      const maxWidth = Math.min(1150, window.innerWidth - 60);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Filtered Events list
  const filteredEvents = React.useMemo(() => {
    return events.filter((ev) => {
      const matchStatus = statusFilter === 'all' || ev.status === statusFilter;
      const matchType = typeFilter === 'all' || ev.examTypeCode === typeFilter;
      return matchStatus && matchType;
    });
  }, [events, statusFilter, typeFilter]);

  // Unique exam types for filter
  const uniqueExamTypes = React.useMemo(() => {
    return Array.from(new Set(events.map((e) => e.examTypeCode))).filter(Boolean);
  }, [events]);

  // Registrations & participants for selected event in Right Panel
  const eventParticipantsData = React.useMemo(() => {
    if (!selectedEvent) return [];
    const eventRegs = registrations.filter((r) => r.eventId === selectedEvent.id);

    return eventRegs
      .map((reg) => {
        const participant = participants.find((p) => p.id === reg.participantId);
        const result = examResults.find(
          (res) => res.participantId === reg.participantId && res.eventId === selectedEvent.id
        );
        return {
          registration: reg,
          participant: participant || {
            id: reg.participantId,
            nisn: '0000000000',
            fullName: 'Peserta Tidak Ditemukan',
            gender: 'L' as const,
            schoolId: '',
            schoolName: '-',
            className: '-',
            email: '-',
            status: 'inactive' as const,
          },
          result,
        };
      })
      .filter((item) => {
        if (!panelSearch.trim()) return true;
        const q = panelSearch.toLowerCase();
        return (
          item.participant.fullName.toLowerCase().includes(q) ||
          item.participant.nisn.includes(q) ||
          item.participant.className.toLowerCase().includes(q) ||
          item.participant.schoolName.toLowerCase().includes(q)
        );
      })
      .filter((item) => {
        if (panelAttendanceFilter === 'all') return true;
        return item.registration.attendanceStatus === panelAttendanceFilter;
      });
  }, [selectedEvent, registrations, participants, examResults, panelSearch, panelAttendanceFilter]);

  // Candidates for adding to event (students not yet registered)
  const availableCandidates = React.useMemo(() => {
    if (!selectedEvent) return [];
    const currentRegParticipantIds = new Set(
      registrations.filter((r) => r.eventId === selectedEvent.id).map((r) => r.participantId)
    );
    return participants.filter((p) => !currentRegParticipantIds.has(p.id) && p.status === 'active');
  }, [selectedEvent, registrations, participants]);

  // Export event participants to CSV
  const handleExportEventCSV = () => {
    if (!selectedEvent) return;

    const eventRegs = registrations.filter((r) => r.eventId === selectedEvent.id);
    const headers = [
      'No',
      'NISN',
      'Nama Peserta',
      'Jenis Kelamin',
      'Asal Sekolah',
      'Kelas',
      'Email',
      'Waktu Terdaftar',
      'Status Kehadiran',
      'Nilai Ujian',
      'Status Kelulusan',
    ];

    const rows = eventRegs.map((reg, idx) => {
      const p = participants.find((part) => part.id === reg.participantId);
      const res = examResults.find(
        (r) => r.participantId === reg.participantId && r.eventId === selectedEvent.id
      );

      return [
        idx + 1,
        p?.nisn || '-',
        `"${p?.fullName || '-'}"`,
        p?.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        `"${p?.schoolName || '-'}"`,
        p?.className || '-',
        p?.email || '-',
        reg.registeredAt,
        reg.attendanceStatus,
        res ? res.finalScore : reg.score !== undefined ? reg.score : '-',
        res ? res.status : reg.isPassed ? 'Lulus' : '-',
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Peserta_Event_${selectedEvent.token || selectedEvent.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process bulk registration from existing participants
  const handleConfirmSelectCandidates = () => {
    if (!selectedEvent || selectedAvailableIds.length === 0) return;
    bulkRegisterParticipants(selectedEvent.id, selectedAvailableIds);
    setSelectedAvailableIds([]);
    setImportModalOpen(false);
  };

  // Process CSV text import into event
  const handleProcessCsvImport = () => {
    if (!selectedEvent || !csvText.trim()) return;

    const lines = csvText.split('\n').filter((l) => l.trim().length > 0);
    const newStudents: Omit<Participant, 'id'>[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        newStudents.push({
          nisn: parts[0] || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
          fullName: parts[1] || 'Siswa Baru',
          gender: (parts[2]?.toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P',
          className: parts[3] || 'XII MIPA 1',
          schoolId: schools[0]?.id || 'sch-1',
          schoolName: schools[0]?.name || 'SMA Negeri 1 Jakarta',
          email: parts[4] || `${parts[1]?.toLowerCase().replace(/\s+/g, '.') || 'siswa'}@student.cbt.id`,
          status: 'active',
          registeredEventsCount: 1,
        });
      }
    });

    if (newStudents.length > 0) {
      // Add participants to userStore
      const now = Date.now();
      const generatedParticipants: Participant[] = newStudents.map((item, idx) => ({
        ...item,
        id: `par-imp-${now}-${idx}`,
      }));

      // Import to store
      importParticipants(newStudents);

      // Register them directly to this event
      const pids = generatedParticipants.map((p) => p.id);
      bulkRegisterParticipants(selectedEvent.id, pids);
    }

    setCsvText('');
    setImportModalOpen(false);
  };

  // Columns for the Main Events DataTable
  const eventColumns: ColumnDef<ExamEvent>[] = [
    {
      header: 'No',
      cell: (_row, idx) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground w-6 text-center block">
          {(idx ?? 0) + 1}
        </span>
      ),
      className: 'w-12 text-center',
    },
    {
      header: 'Token & Tipe',
      accessorKey: 'token',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            {row.token}
          </span>
          <div className="text-[10px] text-muted-foreground font-semibold">
            {row.examTypeCode}
          </div>
        </div>
      ),
    },
    {
      header: 'Judul Event Ujian',
      accessorKey: 'title',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-md">
          <div className="font-bold text-xs text-foreground leading-snug">{row.title}</div>
          <div className="text-[11px] text-muted-foreground">
            Tahun Ajaran: {row.academicYear} • Durasi: {row.durationMinutes} Menit
          </div>
          {row.schoolName && (
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <School className="h-3 w-3" />
              <span>{row.schoolName}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Jadwal Pelaksanaan',
      accessorKey: 'startDate',
      sortable: true,
      cell: (row) => (
        <div className="text-xs space-y-0.5 text-foreground">
          <div>Mulai: {row.startDate.replace('T', ' ')}</div>
          <div className="text-muted-foreground text-[11px]">Selesai: {row.endDate.replace('T', ' ')}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => {
        let badgeStyle = 'bg-muted text-muted-foreground border-border';
        let label = 'Draft';
        if (row.status === 'active') {
          badgeStyle = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
          label = 'Aktif (Sedang Berjalan)';
        } else if (row.status === 'completed') {
          badgeStyle = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25';
          label = 'Selesai';
        }
        return (
          <span className={cn('px-2 py-0.5 rounded text-[11px] font-semibold border', badgeStyle)}>
            {label}
          </span>
        );
      },
    },
    {
      header: 'Total Peserta',
      cell: (row) => {
        const count = registrations.filter((r) => r.eventId === row.id).length;
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-foreground flex items-center gap-1">
              <Users className="h-3.5 w-3.5 text-primary" />
              <span>{count} Siswa</span>
            </span>
            <div className="text-[10px] text-muted-foreground">Terdaftar di event</div>
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => {
        const count = registrations.filter((r) => r.eventId === row.id).length;
        const isSelected = selectedEvent?.id === row.id;

        return (
          <div className="flex items-center justify-end">
            <Button
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedEvent(row)}
              className={cn(
                'h-8 text-xs font-semibold gap-1.5 transition-colors',
                isSelected && 'shadow-xs'
              )}
              title="Buka panel data peserta event ini"
            >
              <Users className="h-3.5 w-3.5" />
              <span>Data Peserta ({count})</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="relative space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Peserta PerEvent"
        description="Kelola dan pantau peserta ujian per event pelaksanaan. Buka Right Panel yang dapat disesuaikan lebarnya untuk melihat, mengimpor, serta mengekspor data peserta."
      >
        <Link href="/peserta/seluruh">
          <Button variant="outline" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            <span>Lihat Seluruh Peserta</span>
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Event Ujian</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">{events.length} Event</div>
          <p className="text-[11px] text-muted-foreground">Terdaftar di sistem CBT</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Event Berstatus Aktif</span>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {events.filter((e) => e.status === 'active').length} Event
          </div>
          <p className="text-[11px] text-muted-foreground">Dapat diakses peserta saat ini</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Pendaftaran Event</span>
          <div className="text-2xl font-bold tracking-tight text-primary">
            {registrations.length} Siswa
          </div>
          <p className="text-[11px] text-muted-foreground">Akumulasi seluruh event</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Status Kehadiran Selesai</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {registrations.filter((r) => r.attendanceStatus === 'Selesai').length} Siswa
          </div>
          <p className="text-[11px] text-muted-foreground">Telah menyelesaikan ujian</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs shadow-2xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter Event:</span>
        </span>

        {/* Filter Status */}
        <div className="w-44">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status Event</option>
            <option value="active">Aktif (Sedang Berjalan)</option>
            <option value="draft">Draft</option>
            <option value="completed">Selesai</option>
          </Select>
        </div>

        {/* Filter Tipe */}
        <div className="w-44">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Semua Tipe Ujian</option>
            {uniqueExamTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </div>

        {(statusFilter !== 'all' || typeFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setStatusFilter('all');
              setTypeFilter('all');
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Events DataTable */}
      <DataTable
        data={filteredEvents}
        columns={eventColumns}
        searchKey="title"
        searchPlaceholder="Cari nama event, kode token, atau tipe ujian..."
      />

      {/* RESIZABLE RIGHT PANEL FOR EVENT PARTICIPANTS */}
      {selectedEvent && (
        <>
          {/* Backdrop on mobile */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setSelectedEvent(null)}
          />

          {/* Right Panel Surface */}
          <aside
            style={{ width: `${panelWidth}px` }}
            className={cn(
              'fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-card border-l border-border shadow-2xl transition-transform duration-200 ease-out',
              'max-w-[95vw]'
            )}
          >
            {/* Draggable Resizer Handle on Left Edge */}
            <div
              onMouseDown={startResizing}
              className="absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-ew-resize hover:bg-primary/40 active:bg-primary z-50 flex items-center justify-center group select-none transition-colors"
              title="Tahan dan geser ke kiri/kanan untuk menyesuaikan lebar panel"
            >
              <div className="h-10 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary group-active:bg-primary transition-colors" />
            </div>

            {/* Panel Header */}
            <div className="p-4 border-b border-border bg-muted/40 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      Token: {selectedEvent.token}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                      {selectedEvent.examTypeCode}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {selectedEvent.academicYear}
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-foreground leading-snug truncate" title={selectedEvent.title}>
                    {selectedEvent.title}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Lebar panel dapat diseret (Drag tepi kiri). Saat ini:{' '}
                    <span className="font-mono font-semibold">{panelWidth}px</span>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="h-8 w-8 p-0 shrink-0 hover:bg-muted"
                  title="Tutup panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Attendance Quick Metric Pills */}
              <div className="grid grid-cols-4 gap-2 pt-3 mt-3 border-t border-border/60 text-center text-xs">
                <div className="p-2 rounded-lg bg-card border border-border space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Total Terdaftar</span>
                  <span className="font-bold text-foreground text-sm">
                    {registrations.filter((r) => r.eventId === selectedEvent.id).length}
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 space-y-0.5">
                  <span className="text-[10px] block opacity-80">Hadir</span>
                  <span className="font-bold text-sm">
                    {
                      registrations.filter(
                        (r) => r.eventId === selectedEvent.id && r.attendanceStatus === 'Hadir'
                      ).length
                    }
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 space-y-0.5">
                  <span className="text-[10px] block opacity-80">Selesai</span>
                  <span className="font-bold text-sm">
                    {
                      registrations.filter(
                        (r) => r.eventId === selectedEvent.id && r.attendanceStatus === 'Selesai'
                      ).length
                    }
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 space-y-0.5">
                  <span className="text-[10px] block opacity-80">Belum Hadir</span>
                  <span className="font-bold text-sm">
                    {
                      registrations.filter(
                        (r) => r.eventId === selectedEvent.id && r.attendanceStatus === 'Belum Hadir'
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Action Toolbar */}
            <div className="p-3 border-b border-border bg-card space-y-2 shrink-0">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Button Import Peserta */}
                  <Button
                    size="sm"
                    onClick={() => {
                      setImportTab('select');
                      setImportModalOpen(true);
                    }}
                    className="h-8 text-xs font-semibold gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Import Peserta</span>
                  </Button>

                  {/* Button Export Peserta */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportEventCSV}
                    className="h-8 text-xs font-semibold gap-1.5"
                    title="Export daftar peserta event ini ke file CSV"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export Data</span>
                  </Button>
                </div>

                <span className="text-[11px] text-muted-foreground font-medium">
                  {eventParticipantsData.length} data tampil
                </span>
              </div>

              {/* In-panel Filter & Search */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama siswa, NISN, atau kelas..."
                    value={panelSearch}
                    onChange={(e) => setPanelSearch(e.target.value)}
                    className="h-8 pl-8 text-xs"
                  />
                </div>

                <div className="w-36">
                  <Select
                    value={panelAttendanceFilter}
                    onChange={(e) => setPanelAttendanceFilter(e.target.value)}
                    className="h-8 text-xs"
                  >
                    <option value="all">Semua Status</option>
                    <option value="Hadir">Hadir</option>
                    <option value="Belum Hadir">Belum Hadir</option>
                    <option value="Selesai">Selesai</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Panel Scrollable Participant Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 text-xs">
              {eventParticipantsData.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Users className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="font-semibold text-foreground">Belum ada peserta di event ini</p>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    Gunakan tombol Import Peserta di atas untuk mendaftarkan siswa dari database atau upload CSV.
                  </p>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setImportTab('select');
                      setImportModalOpen(true);
                    }}
                    className="gap-1.5 text-xs font-semibold mt-2"
                  >
                    <UserPlus className="h-3.5 w-3.5 text-primary" />
                    <span>Daftarkan Siswa Sekarang</span>
                  </Button>
                </div>
              ) : (
                <div className="border border-border rounded-lg overflow-hidden bg-card">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground border-b border-border">
                      <tr>
                        <th className="p-2.5 w-10 text-center">No</th>
                        <th className="p-2.5">Peserta</th>
                        <th className="p-2.5">Kelas & Sekolah</th>
                        <th className="p-2.5">Kehadiran</th>
                        <th className="p-2.5">Nilai</th>
                        <th className="p-2.5 text-right w-16">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {eventParticipantsData.map((item, idx) => {
                        const { registration, participant, result } = item;
                        return (
                          <tr key={registration.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-2.5 text-center font-mono text-muted-foreground text-[11px]">
                              {idx + 1}
                            </td>
                            <td className="p-2.5">
                              <div className="font-bold text-foreground">{participant.fullName}</div>
                              <div className="font-mono text-[10px] text-muted-foreground">
                                {participant.nisn} • {participant.gender === 'L' ? 'L' : 'P'}
                              </div>
                            </td>
                            <td className="p-2.5">
                              <div className="font-semibold text-foreground">{participant.className}</div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                                {participant.schoolName}
                              </div>
                            </td>
                            <td className="p-2.5">
                              <select
                                value={registration.attendanceStatus}
                                onChange={(e) =>
                                  updateRegistrationStatus(
                                    selectedEvent.id,
                                    participant.id,
                                    e.target.value as 'Hadir' | 'Belum Hadir' | 'Selesai'
                                  )
                                }
                                className={cn(
                                  'text-[11px] font-semibold px-2 py-0.5 rounded border bg-card cursor-pointer',
                                  registration.attendanceStatus === 'Hadir' &&
                                    'border-emerald-500/40 text-emerald-700 dark:text-emerald-300',
                                  registration.attendanceStatus === 'Selesai' &&
                                    'border-blue-500/40 text-blue-700 dark:text-blue-300',
                                  registration.attendanceStatus === 'Belum Hadir' &&
                                    'border-amber-500/40 text-amber-700 dark:text-amber-300'
                                )}
                              >
                                <option value="Hadir">Hadir</option>
                                <option value="Belum Hadir">Belum Hadir</option>
                                <option value="Selesai">Selesai</option>
                              </select>
                            </td>
                            <td className="p-2.5">
                              {result ? (
                                <div className="space-y-0.5">
                                  <span className="font-bold font-mono text-primary">
                                    {result.finalScore}
                                  </span>
                                  <div className="text-[10px] text-muted-foreground">{result.status}</div>
                                </div>
                              ) : registration.score !== undefined ? (
                                <span className="font-bold font-mono text-primary">
                                  {registration.score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-[11px]">-</span>
                              )}
                            </td>
                            <td className="p-2.5 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setTargetParticipantToUnregister(participant);
                                  setUnregisterConfirmOpen(true);
                                }}
                                className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                title="Keluarkan siswa dari event ini"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-muted-foreground">
                Terkoneksi dengan database event CBT
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEvent(null)}
                className="text-xs font-semibold"
              >
                Tutup Panel
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* MODAL IMPORT PESERTA KE EVENT */}
      <Dialog open={importModalOpen} onOpenChange={setImportModalOpen}>
        <DialogContent maxWidth="max-w-2xl">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                <Upload className="h-4 w-4 text-primary" />
                <span>Import Peserta ke Event: {selectedEvent?.title}</span>
              </DialogTitle>
              <DialogDescription>
                Pilih siswa terdaftar dari database atau impor data baru melalui format teks/CSV.
              </DialogDescription>
            </DialogHeader>

            {/* Tabs */}
            <div className="flex border-b border-border gap-2">
              <button
                type="button"
                onClick={() => setImportTab('select')}
                className={cn(
                  'pb-2 px-3 text-xs font-semibold border-b-2 transition-colors',
                  importTab === 'select'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                Pilih dari Database ({availableCandidates.length} Belum Terdaftar)
              </button>
              <button
                type="button"
                onClick={() => setImportTab('csv')}
                className={cn(
                  'pb-2 px-3 text-xs font-semibold border-b-2 transition-colors',
                  importTab === 'csv'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                Paste Format Teks / CSV
              </button>
            </div>

            {/* Tab 1: Select Candidates */}
            {importTab === 'select' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Pilih siswa aktif untuk langsung didaftarkan ke event ini:
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (selectedAvailableIds.length === availableCandidates.length) {
                        setSelectedAvailableIds([]);
                      } else {
                        setSelectedAvailableIds(availableCandidates.map((c) => c.id));
                      }
                    }}
                    className="h-7 text-xs text-primary"
                  >
                    {selectedAvailableIds.length === availableCandidates.length
                      ? 'Batalkan Semua'
                      : 'Pilih Semua'}
                  </Button>
                </div>

                <div className="max-h-60 overflow-y-auto border border-border rounded-lg divide-y divide-border bg-card">
                  {availableCandidates.length === 0 ? (
                    <div className="p-6 text-center text-muted-foreground text-xs">
                      Semua siswa aktif sudah terdaftar pada event ini.
                    </div>
                  ) : (
                    availableCandidates.map((cand) => {
                      const isChecked = selectedAvailableIds.includes(cand.id);
                      return (
                        <label
                          key={cand.id}
                          className="flex items-center justify-between p-2.5 hover:bg-muted/40 cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedAvailableIds([...selectedAvailableIds, cand.id]);
                                } else {
                                  setSelectedAvailableIds(
                                    selectedAvailableIds.filter((id) => id !== cand.id)
                                  );
                                }
                              }}
                              className="accent-primary h-4 w-4"
                            />
                            <div>
                              <div className="font-semibold text-foreground">{cand.fullName}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                {cand.nisn} • {cand.className} • {cand.schoolName}
                              </div>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                            {cand.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportModalOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleConfirmSelectCandidates}
                    disabled={selectedAvailableIds.length === 0}
                    className="font-semibold"
                  >
                    Daftarkan {selectedAvailableIds.length} Siswa Terpilih
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Tab 2: CSV / Text */}
            {importTab === 'csv' && (
              <div className="space-y-3">
                <div className="p-2.5 rounded-lg border border-border bg-muted/30 text-[11px] space-y-1">
                  <div className="font-bold text-foreground">Format Baris CSV:</div>
                  <code className="text-primary font-mono text-[10px] block">
                    NISN, Nama Lengkap, Gender (L/P), Kelas, Email
                  </code>
                  <p className="text-muted-foreground">
                    Contoh: 0068891234, Rizky Pratama, L, XII MIPA 1, rizky.p@student.sch.id
                  </p>
                </div>

                <Textarea
                  rows={6}
                  placeholder={`0061234991, Fauzan Al-Ghifari, L, XII MIPA 2, fauzan@student.sch.id\n0061234992, Sarah Melinda, P, XII MIPA 2, sarah@student.sch.id`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="font-mono text-xs"
                />

                <DialogFooter>
                  <Button variant="outline" onClick={() => setImportModalOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    onClick={handleProcessCsvImport}
                    disabled={!csvText.trim()}
                    className="font-semibold"
                  >
                    Proses & Daftarkan ke Event
                  </Button>
                </DialogFooter>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* DIALOG KONFIRMASI UNREGISTER */}
      <ConfirmationDialog
        open={unregisterConfirmOpen}
        onOpenChange={setUnregisterConfirmOpen}
        title="Keluarkan Peserta dari Event"
        description={`Apakah Anda yakin ingin mengeluarkan "${targetParticipantToUnregister?.fullName}" dari event "${selectedEvent?.title}"?`}
        onConfirm={() => {
          if (selectedEvent && targetParticipantToUnregister) {
            unregisterParticipantFromEvent(selectedEvent.id, targetParticipantToUnregister.id);
            setTargetParticipantToUnregister(null);
          }
        }}
      />
    </div>
  );
}
