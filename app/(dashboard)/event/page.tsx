'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  KeyRound,
  RefreshCw,
  FileSpreadsheet,
  UserCheck,
  Clock,
  Calendar as CalendarIcon,
  ShieldAlert,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useExamStore } from '@/store/useExamStore';
import { useMasterStore } from '@/store/useMasterStore';
import { ExamEvent, ExamStatus } from '@/types';

export default function EventPage() {
  const { events, addEvent, updateEvent, deleteEvent, generateToken } = useExamStore();
  const { examTypes, academicYears, schools } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<ExamEvent | null>(null);

  const [formData, setFormData] = React.useState({
    title: '',
    examTypeCode: 'PAS',
    academicYear: '2024/2025',
    startDate: '2025-06-02T08:00',
    endDate: '2025-06-09T16:00',
    durationMinutes: 90,
    token: 'PAS25A',
    status: 'draft' as ExamStatus,
    schoolId: '',
    rules: {
      shuffleQuestions: true,
      shuffleOptions: true,
      allowNavigateBack: true,
      disableRightClick: true,
      showScoreImmediately: false,
      enforceFullscreen: true,
    },
  });

  const handleOpenAdd = () => {
    setSelectedEvent(null);
    setFormData({
      title: '',
      examTypeCode: examTypes[0]?.code || 'PTS',
      academicYear: academicYears.find((y) => y.isActive)?.year || '2024/2025',
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
      durationMinutes: 90,
      token: generateToken(),
      status: 'draft',
      schoolId: schools[0]?.id || '',
      rules: {
        shuffleQuestions: true,
        shuffleOptions: true,
        allowNavigateBack: true,
        disableRightClick: true,
        showScoreImmediately: false,
        enforceFullscreen: true,
      },
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (ev: ExamEvent) => {
    setSelectedEvent(ev);
    setFormData({
      title: ev.title,
      examTypeCode: ev.examTypeCode,
      academicYear: ev.academicYear,
      startDate: ev.startDate,
      endDate: ev.endDate,
      durationMinutes: ev.durationMinutes,
      token: ev.token,
      status: ev.status,
      schoolId: ev.schoolId || '',
      rules: { ...ev.rules },
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const school = schools.find((s) => s.id === formData.schoolId);

    const payload = {
      ...formData,
      schoolName: school?.name || undefined,
    };

    if (selectedEvent) {
      updateEvent(selectedEvent.id, payload);
    } else {
      addEvent(payload);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<ExamEvent>[] = [
    {
      header: 'Nama Event Ujian',
      accessorKey: 'title',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.title}</div>
          <div className="text-xs text-muted-foreground">
            {row.academicYear} • Tipe: {row.examTypeCode}
          </div>
        </div>
      ),
    },
    {
      header: 'Waktu Pelaksanaan',
      accessorKey: 'startDate',
      sortable: true,
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="text-foreground">{row.startDate.replace('T', ' ')}</div>
          <div className="text-muted-foreground">s.d. {row.endDate.replace('T', ' ')}</div>
        </div>
      ),
    },
    {
      header: 'Durasi & Token',
      cell: (row) => (
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-1 font-mono font-bold text-foreground">
            <KeyRound className="h-3 w-3 text-primary" />
            <span>{row.token}</span>
          </div>
          <div className="text-muted-foreground">{row.durationMinutes} Menit</div>
        </div>
      ),
    },
    {
      header: 'Kesiapan',
      cell: (row) => (
        <div className="text-xs space-y-1">
          <div className="font-medium text-foreground">
            {row.assignedQuestionCount} Soal terpetakan
          </div>
          <div className="text-muted-foreground">
            {row.registeredParticipantCount} Peserta terdaftar
          </div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Navigasi Cepat',
      cell: (row) => (
        <div className="flex items-center gap-1.5">
          <Link href={`/soal-event?eventId=${row.id}`}>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <FileSpreadsheet className="h-3 w-3 text-primary" />
              <span>Soal</span>
            </Button>
          </Link>
          <Link href={`/pendaftaran?eventId=${row.id}`}>
            <Button variant="secondary" size="sm" className="h-7 text-xs gap-1">
              <UserCheck className="h-3 w-3" />
              <span>Peserta</span>
            </Button>
          </Link>
        </div>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 w-8 p-0"
            title="Edit event"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEvent(row);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus event"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Event & Jadwal Ujian"
        description="Kelola jadwal pelaksanaan asesmen, alokasi waktu pengerjaan, token aktivasi peserta, dan parameter integritas ujian."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Buat Event Baru</span>
        </Button>
      </PageHeader>

      <DataTable
        data={events}
        columns={columns}
        searchKey="title"
        searchPlaceholder="Cari jadwal event ujian..."
      />

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <DialogHeader>
              <DialogTitle>
                {selectedEvent ? 'Edit Konfigurasi Event' : 'Jadwalkan Event Ujian Baru'}
              </DialogTitle>
              <DialogDescription>
                Tentukan jendela waktu, token masuk ujian, dan aturan teknis pengerjaan siswa.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Nama Event Ujian *</label>
                <Input
                  required
                  placeholder="Contoh: Penilaian Akhir Semester (PAS) Genap 2024/2025"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tipe Ujian</label>
                <Select
                  value={formData.examTypeCode}
                  onChange={(e) => setFormData({ ...formData, examTypeCode: e.target.value })}
                >
                  {examTypes.map((et) => (
                    <option key={et.id} value={et.code}>
                      {et.code} - {et.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tahun Pelajaran</label>
                <Select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.year}>
                      {ay.year} ({ay.semester})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tanggal & Waktu Mulai *</label>
                <Input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tanggal & Waktu Selesai *</label>
                <Input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Durasi Pengerjaan (Menit)</label>
                <Input
                  type="number"
                  min={10}
                  max={300}
                  value={formData.durationMinutes}
                  onChange={(e) =>
                    setFormData({ ...formData, durationMinutes: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Token Masuk Ujian</label>
                <div className="flex items-center gap-1.5">
                  <Input
                    required
                    value={formData.token}
                    onChange={(e) =>
                      setFormData({ ...formData, token: e.target.value.toUpperCase() })
                    }
                    className="font-mono font-bold tracking-wider"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({ ...formData, token: generateToken() })}
                    className="shrink-0 h-9 px-2.5 text-xs"
                    title="Buat token acak baru"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Status Pelaksanaan</label>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ExamStatus })
                  }
                >
                  <option value="draft">Draft (Persiapan)</option>
                  <option value="active">Aktif (Sedang Berjalan)</option>
                  <option value="completed">Selesai</option>
                  <option value="cancelled">Dibatalkan</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Lingkup Sekolah (Opsional)</label>
                <Select
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                >
                  <option value="">Semua Sekolah / Nasional</option>
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name}
                    </option>
                  ))}
                </Select>
              </div>

              {/* Exam Security Rules Checkboxes */}
              <div className="sm:col-span-2 space-y-2 pt-3 border-t border-border/60">
                <span className="font-semibold text-foreground block">
                  Pengaturan Integritas & Keamanan Ujian:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.shuffleQuestions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: { ...formData.rules, shuffleQuestions: e.target.checked },
                        })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Acak Urutan Soal (Shuffle Questions)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.shuffleOptions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: { ...formData.rules, shuffleOptions: e.target.checked },
                        })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Acak Opsi Pilihan (A - E)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.allowNavigateBack}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: { ...formData.rules, allowNavigateBack: e.target.checked },
                        })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Boleh Kembali ke Soal Sebelumnya</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.disableRightClick}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: { ...formData.rules, disableRightClick: e.target.checked },
                        })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Nonaktifkan Klik Kanan & Salin Teks</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.showScoreImmediately}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: { ...formData.rules, showScoreImmediately: e.target.checked },
                        })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Tampilkan Nilai Langsung Saat Selesai</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.rules.enforceFullscreen}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          rules: { ...formData.rules, enforceFullscreen: e.target.checked },
                        })
                      }
                      className="rounded border-border text-primary focus:ring-primary"
                    />
                    <span>Wajib Layar Penuh (Kunci Tab Browser)</span>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {selectedEvent ? 'Simpan Perubahan' : 'Jadwalkan Event'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Event Ujian"
        description={`Apakah Anda yakin ingin menghapus jadwal ujian "${selectedEvent?.title}"? Seluruh mapping soal dan pendaftaran pada event ini akan dibersihkan.`}
        onConfirm={() => {
          if (selectedEvent) {
            deleteEvent(selectedEvent.id);
          }
        }}
      />
    </div>
  );
}
