'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Upload,
  Download,
  GraduationCap,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Eye,
  Info,
  Calendar,
  Layers,
  Award,
  Clock,
  School,
  Mail,
  UserCheck,
  Search,
  Filter,
  RotateCcw,
  Check,
  X,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
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
import { useUserStore } from '@/store/useUserStore';
import { useMasterStore } from '@/store/useMasterStore';
import { useExamStore } from '@/store/useExamStore';
import { Participant } from '@/types';
import { cn } from '@/lib/utils';

export function SeluruhPesertaView() {
  const {
    participants,
    addParticipant,
    updateParticipant,
    deleteParticipant,
    deleteMultipleParticipants,
    toggleParticipantStatus,
    importParticipants,
  } = useUserStore();

  const { schools } = useMasterStore();
  const { events, registrations, examResults } = useExamStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const [selectedParticipant, setSelectedParticipant] = React.useState<Participant | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Form State
  const [formData, setFormData] = React.useState({
    nisn: '',
    fullName: '',
    gender: 'L' as 'L' | 'P',
    schoolId: '',
    className: '',
    email: '',
    status: 'active' as 'active' | 'inactive',
  });

  // Import State
  const [importText, setImportText] = React.useState(
    '0068891234, Bintang Ramadhan, L, XII MIPA 2, bintang.r@student.sch.id\n0068895678, Tiara Andini, P, XII MIPA 2, tiara.a@student.sch.id\n0071122334, Rizky Febian, L, XI IPS 1, rizky.f@student.sch.id'
  );
  const [importSchoolId, setImportSchoolId] = React.useState(schools[0]?.id || '');

  // Filtered participants list
  const filteredParticipants = React.useMemo(() => {
    return participants.filter((p) => {
      const matchSchool = schoolFilter === 'all' || p.schoolId === schoolFilter;
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchSchool && matchStatus;
    });
  }, [participants, schoolFilter, statusFilter]);

  // Events followed by selectedParticipant for Detail Modal
  const participantEvents = React.useMemo(() => {
    if (!selectedParticipant) return [];

    const userRegs = registrations.filter((r) => r.participantId === selectedParticipant.id);

    return userRegs.map((reg) => {
      const event = events.find((e) => e.id === reg.eventId);
      const result = examResults.find(
        (res) => res.participantId === selectedParticipant.id && res.eventId === reg.eventId
      );

      return {
        registration: reg,
        event: event || {
          id: reg.eventId,
          title: 'Event Tidak Dikenal',
          examTypeCode: 'UJIAN',
          academicYear: '2024/2025',
          startDate: '-',
          endDate: '-',
          durationMinutes: 60,
          token: '-',
          status: 'draft' as const,
          rules: {} as any,
          assignedQuestionCount: 0,
          registeredParticipantCount: 0,
          createdAt: '-',
        },
        result,
      };
    });
  }, [selectedParticipant, registrations, events, examResults]);

  const handleOpenAdd = () => {
    setSelectedParticipant(null);
    setFormData({
      nisn: '',
      fullName: '',
      gender: 'L',
      schoolId: schools[0]?.id || '',
      className: 'XII MIPA 1',
      email: '',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (p: Participant) => {
    setSelectedParticipant(p);
    setFormData({
      nisn: p.nisn,
      fullName: p.fullName,
      gender: p.gender,
      schoolId: p.schoolId,
      className: p.className,
      email: p.email,
      status: p.status,
    });
    setFormOpen(true);
  };

  const handleOpenDetail = (p: Participant) => {
    setSelectedParticipant(p);
    setDetailOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.nisn.trim()) return;

    const school = schools.find((s) => s.id === formData.schoolId);
    const payload = {
      ...formData,
      schoolName: school?.name || 'Sekolah Terpilih',
    };

    if (selectedParticipant) {
      updateParticipant(selectedParticipant.id, payload);
    } else {
      addParticipant(payload);
    }
    setFormOpen(false);
  };

  const handleProcessImport = () => {
    const school = schools.find((s) => s.id === importSchoolId);
    const schoolName = school?.name || 'Sekolah Terkait';

    const lines = importText.split('\n').filter((l) => l.trim().length > 0);
    const parsed: Omit<Participant, 'id'>[] = lines.map((line) => {
      const parts = line.split(',').map((p) => p.trim());
      return {
        nisn: parts[0] || `00${Math.floor(10000000 + Math.random() * 90000000)}`,
        fullName: parts[1] || 'Siswa Baru',
        gender: (parts[2]?.toUpperCase() === 'P' ? 'P' : 'L') as 'L' | 'P',
        className: parts[3] || 'Kelas X',
        email: parts[4] || `${parts[1]?.toLowerCase().replace(/\s+/g, '.') || 'siswa'}@student.sch.id`,
        schoolId: importSchoolId,
        schoolName,
        status: 'active',
      };
    });

    if (parsed.length > 0) {
      importParticipants(parsed);
    }
    setImportOpen(false);
  };

  const handleExportCSV = () => {
    const headers = [
      'No',
      'NISN',
      'Nama Lengkap',
      'Gender',
      'Kelas',
      'Sekolah',
      'Email',
      'Status Akun',
      'Total Event',
    ];
    const rows = filteredParticipants.map((p, idx) => {
      const eventCount = registrations.filter((r) => r.participantId === p.id).length;
      return [
        idx + 1,
        p.nisn,
        `"${p.fullName}"`,
        p.gender === 'L' ? 'Laki-laki' : 'Perempuan',
        p.className,
        `"${p.schoolName}"`,
        p.email,
        p.status,
        eventCount,
      ];
    });

    const csvContent =
      '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Seluruh_Peserta_CBT_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Participant>[] = [
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
      header: 'NISN',
      accessorKey: 'nisn',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.nisn}
        </span>
      ),
    },
    {
      header: 'Nama Lengkap Siswa',
      accessorKey: 'fullName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-bold text-xs text-foreground">{row.fullName}</div>
          <div className="text-[11px] text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'L/P',
      accessorKey: 'gender',
      cell: (row) => (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.gender === 'L' ? 'L' : 'P'}
        </span>
      ),
    },
    {
      header: 'Kelas',
      accessorKey: 'className',
      sortable: true,
      cell: (row) => <span className="text-xs font-semibold text-foreground">{row.className}</span>,
    },
    {
      header: 'Asal Sekolah',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground truncate max-w-[160px] block">{row.schoolName}</span>,
    },
    {
      header: 'Status Akun',
      accessorKey: 'status',
      cell: (row) => (
        <button
          type="button"
          onClick={() => toggleParticipantStatus(row.id)}
          className="focus:outline-hidden"
          title="Klik untuk mengubah status aktif/nonaktif"
        >
          <StatusBadge status={row.status} />
        </button>
      ),
    },
    {
      header: 'Event Diikuti',
      cell: (row) => {
        const count = registrations.filter((r) => r.participantId === row.id).length;
        return (
          <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
            {count} Event
          </span>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          {/* Button Detail */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDetail(row)}
            className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
            title="Lihat detail data siswa dan seluruh event yang diikuti"
          >
            <Info className="h-3.5 w-3.5" />
          </Button>

          {/* Button Edit */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 w-8 p-0 text-foreground hover:bg-muted"
            title="Edit data peserta"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>

          {/* Button Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedParticipant(row);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus peserta"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <PageHeader
        title="Seluruh Data Peserta"
        description="Kelola seluruh direktori data personal peserta ujian CBT, status keaktifan akun, serta riwayat partisipasi event ujian yang diikuti."
      >
        <Link href="/peserta/per-event">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            <span>Lihat Peserta PerEvent</span>
          </Button>
        </Link>
        <Button
          variant="outline"
          onClick={() => setImportOpen(true)}
          className="gap-2 font-semibold shadow-2xs"
        >
          <Upload className="h-4 w-4" />
          <span>Import CSV</span>
        </Button>
        <Button
          variant="outline"
          onClick={handleExportCSV}
          className="gap-2 font-semibold shadow-2xs"
        >
          <Download className="h-4 w-4" />
          <span>Export Data</span>
        </Button>
        <Button onClick={handleOpenAdd} className="gap-2 font-semibold shadow-2xs">
          <Plus className="h-4 w-4" />
          <span>Tambah Peserta</span>
        </Button>
      </PageHeader>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Seluruh Siswa</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">{participants.length} Siswa</div>
          <p className="text-[11px] text-muted-foreground">Terdaftar di master data CBT</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Akun Aktif</span>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {participants.filter((p) => p.status === 'active').length} Siswa
          </div>
          <p className="text-[11px] text-muted-foreground">Siap mengikuti ujian</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Siswa Laki-laki</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {participants.filter((p) => p.gender === 'L').length} Siswa
          </div>
          <p className="text-[11px] text-muted-foreground">Komposisi gender siswa</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Siswa Perempuan</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {participants.filter((p) => p.gender === 'P').length} Siswa
          </div>
          <p className="text-[11px] text-muted-foreground">Komposisi gender siswi</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs shadow-2xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter:</span>
        </span>

        {/* Filter Sekolah */}
        <div className="w-56">
          <Select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
            <option value="all">Semua Unit Sekolah</option>
            {schools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Filter Status */}
        <div className="w-36">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Select>
        </div>

        {(schoolFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSchoolFilter('all');
              setStatusFilter('all');
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Bulk action banner */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between rounded-xl bg-muted/60 p-3 text-xs border border-border shadow-2xs">
          <span className="font-semibold text-foreground">
            {selectedIds.length} peserta terpilih
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setBulkDeleteOpen(true)}
            className="gap-2 font-semibold h-8 text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Hapus Terpilih</span>
          </Button>
        </div>
      )}

      {/* Participants DataTable */}
      <DataTable
        data={filteredParticipants}
        columns={columns}
        searchKey="fullName"
        searchPlaceholder="Cari nama siswa, NISN, atau kelas..."
        selectable
        onSelectionChange={setSelectedIds}
      />

      {/* MODAL DETAIL PESERTA & RIWAYAT EVENT (Requested by user) */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent maxWidth="max-w-2xl">
          {selectedParticipant && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between gap-3">
                  <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    <span>Detail Data Siswa & Riwayat Event Ujian</span>
                  </DialogTitle>
                </div>
                <DialogDescription>
                  Informasi personal siswa dan rekapitulasi seluruh event ujian yang terdaftar.
                </DialogDescription>
              </DialogHeader>

              {/* Data Personal Siswa */}
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="space-y-0.5">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      NISN: {selectedParticipant.nisn}
                    </span>
                    <h3 className="text-sm font-bold text-foreground pt-1">
                      {selectedParticipant.fullName}
                    </h3>
                  </div>
                  <span
                    className={cn(
                      'text-xs font-semibold px-2 py-0.5 rounded border',
                      selectedParticipant.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
                        : 'bg-muted text-muted-foreground border-border'
                    )}
                  >
                    {selectedParticipant.status === 'active' ? 'Akun Aktif' : 'Nonaktif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Jenis Kelamin:</span>
                    <span className="font-semibold text-foreground">
                      {selectedParticipant.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Kelas:</span>
                    <span className="font-semibold text-foreground">
                      {selectedParticipant.className}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Asal Sekolah:</span>
                    <span className="font-semibold text-foreground truncate block">
                      {selectedParticipant.schoolName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground block">Email Siswa:</span>
                    <span className="font-semibold text-foreground truncate block">
                      {selectedParticipant.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rekapitulasi Event yang Diikuti */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>Daftar Seluruh Event yang Diikuti ({participantEvents.length})</span>
                  </h4>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Sinkronisasi otomatis CBT
                  </span>
                </div>

                {participantEvents.length === 0 ? (
                  <div className="p-8 text-center border border-border rounded-xl bg-card space-y-2">
                    <Calendar className="h-6 w-6 text-muted-foreground/40 mx-auto" />
                    <p className="font-semibold text-foreground">
                      Siswa ini belum mengikuti event ujian apapun
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Siswa dapat didaftarkan melalui menu Pendaftaran Ujian atau tombol Data Peserta pada menu Peserta PerEvent.
                    </p>
                    <Link href="/pendaftaran">
                      <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 mt-2">
                        <UserCheck className="h-3.5 w-3.5 text-primary" />
                        <span>Ke Menu Pendaftaran</span>
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="border border-border rounded-xl overflow-hidden bg-card">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-muted/50 text-[11px] font-semibold text-muted-foreground border-b border-border">
                        <tr>
                          <th className="p-2.5 w-8 text-center">No</th>
                          <th className="p-2.5">Event Ujian</th>
                          <th className="p-2.5">Waktu Terdaftar</th>
                          <th className="p-2.5">Status Kehadiran</th>
                          <th className="p-2.5 text-right">Nilai Ujian</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {participantEvents.map((item, idx) => {
                          const { registration, event, result } = item;
                          return (
                            <tr key={registration.id} className="hover:bg-muted/30 transition-colors">
                              <td className="p-2.5 text-center font-mono text-muted-foreground text-[11px]">
                                {idx + 1}
                              </td>
                              <td className="p-2.5">
                                <div className="font-bold text-foreground">{event.title}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">
                                  Token: {event.token} • {event.examTypeCode} • {event.academicYear}
                                </div>
                              </td>
                              <td className="p-2.5 text-[11px] text-muted-foreground">
                                {registration.registeredAt}
                              </td>
                              <td className="p-2.5">
                                <span
                                  className={cn(
                                    'px-2 py-0.5 rounded text-[10px] font-semibold border',
                                    registration.attendanceStatus === 'Selesai' &&
                                      'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25',
                                    registration.attendanceStatus === 'Hadir' &&
                                      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25',
                                    registration.attendanceStatus === 'Belum Hadir' &&
                                      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25'
                                  )}
                                >
                                  {registration.attendanceStatus}
                                </span>
                              </td>
                              <td className="p-2.5 text-right">
                                {result ? (
                                  <div className="space-y-0.5">
                                    <span className="font-mono font-bold text-primary">
                                      {result.finalScore}
                                    </span>
                                    <div
                                      className={cn(
                                        'text-[10px] font-semibold',
                                        result.status === 'Lulus'
                                          ? 'text-emerald-600 dark:text-emerald-400'
                                          : 'text-rose-600 dark:text-rose-400'
                                      )}
                                    >
                                      {result.status}
                                    </div>
                                  </div>
                                ) : registration.score !== undefined ? (
                                  <span className="font-mono font-bold text-primary">
                                    {registration.score}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-[11px]">Belum Ada</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDetailOpen(false)}>
                  Tutup Detail
                </Button>
                <Button
                  onClick={() => {
                    setDetailOpen(false);
                    handleOpenEdit(selectedParticipant);
                  }}
                  className="gap-1.5 font-semibold"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  <span>Edit Data Siswa</span>
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FORM MODAL ADD / EDIT */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>{selectedParticipant ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}</span>
              </DialogTitle>
              <DialogDescription>
                Lengkapi rincian data personal siswa dan penempatan sekolah/kelas.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nomor Induk Siswa Nasional (NISN) *</label>
                <Input
                  required
                  placeholder="0061234567"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jenis Kelamin *</label>
                <Select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-foreground">Nama Lengkap Siswa *</label>
                <Input
                  required
                  placeholder="Nama lengkap sesuai data Dapodik"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Unit Sekolah *</label>
                <Select
                  required
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                >
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kelas / Rombel *</label>
                <Input
                  required
                  placeholder="XII MIPA 1"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Email Siswa</label>
                <Input
                  type="email"
                  placeholder="siswa@student.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Status Akun</label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="font-semibold">
                {selectedParticipant ? 'Simpan Perubahan' : 'Tambahkan Peserta'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* IMPORT MODAL */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent maxWidth="max-w-xl">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Upload className="h-5 w-5 text-primary" />
                <span>Import Data Peserta Massal</span>
              </DialogTitle>
              <DialogDescription>
                Masukkan data peserta dalam format baris CSV (NISN, Nama, Gender L/P, Kelas, Email).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Pilih Unit Sekolah Tujuan</label>
              <Select
                value={importSchoolId}
                onChange={(e) => setImportSchoolId(e.target.value)}
              >
                {schools.map((sch) => (
                  <option key={sch.id} value={sch.id}>
                    {sch.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Data Baris Siswa (CSV)</label>
              <Textarea
                rows={8}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="font-mono text-xs"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setImportOpen(false)}>
                Batal
              </Button>
              <Button onClick={handleProcessImport} className="font-semibold">
                Proses Import Data
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* DELETE SINGLE CONFIRMATION */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Data Peserta"
        description={`Apakah Anda yakin ingin menghapus peserta "${selectedParticipant?.fullName}"? Seluruh riwayat ujian terkait peserta ini akan terhapus.`}
        onConfirm={() => {
          if (selectedParticipant) {
            deleteParticipant(selectedParticipant.id);
          }
        }}
      />

      {/* DELETE MULTIPLE CONFIRMATION */}
      <ConfirmationDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Hapus Peserta Terpilih"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} peserta terpilih sekaligus? Tindakan ini tidak dapat dibatalkan.`}
        onConfirm={() => {
          deleteMultipleParticipants(selectedIds);
          setSelectedIds([]);
        }}
      />
    </div>
  );
}
