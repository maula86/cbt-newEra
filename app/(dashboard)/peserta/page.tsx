'use client';

import * as React from 'react';
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
import { Participant } from '@/types';

export default function PesertaPage() {
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

  const [formOpen, setFormOpen] = React.useState(false);
  const [importOpen, setImportOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [bulkDeleteOpen, setBulkDeleteOpen] = React.useState(false);

  const [selectedParticipant, setSelectedParticipant] = React.useState<Participant | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [schoolFilter, setSchoolFilter] = React.useState<string>('all');

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

  const filteredParticipants = React.useMemo(() => {
    if (schoolFilter === 'all') return participants;
    return participants.filter((p) => p.schoolId === schoolFilter);
  }, [participants, schoolFilter]);

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
    const headers = ['ID', 'NISN', 'Nama Lengkap', 'Gender', 'Kelas', 'Sekolah', 'Email', 'Status'];
    const rows = filteredParticipants.map((p) => [
      p.id,
      p.nisn,
      `"${p.fullName}"`,
      p.gender,
      p.className,
      `"${p.schoolName}"`,
      p.email,
      p.status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `peserta-cbt-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<Participant>[] = [
    {
      header: 'NISN',
      accessorKey: 'nisn',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.nisn}</span>,
    },
    {
      header: 'Nama Lengkap Siswa',
      accessorKey: 'fullName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.fullName}</div>
          <div className="text-xs text-muted-foreground">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'L/P',
      accessorKey: 'gender',
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
        </span>
      ),
    },
    {
      header: 'Kelas',
      accessorKey: 'className',
      sortable: true,
      cell: (row) => <span className="text-xs font-medium">{row.className}</span>,
    },
    {
      header: 'Asal Sekolah',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{row.schoolName}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => (
        <button
          type="button"
          onClick={() => toggleParticipantStatus(row.id)}
          className="cursor-pointer"
          title="Klik untuk mengubah status aktif/nonaktif"
        >
          <StatusBadge status={row.status} />
        </button>
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
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedParticipant(row);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
        title="Manajemen Peserta Ujian"
        description="Kelola basis data siswa peserta ujian, nomor induk (NISN), rombongan belajar, serta operasi import/export massal."
      >
        <Button variant="outline" onClick={handleExportCSV} className="gap-1.5 text-xs">
          <Download className="h-3.5 w-3.5" />
          <span>Export CSV</span>
        </Button>
        <Button variant="outline" onClick={() => setImportOpen(true)} className="gap-1.5 text-xs">
          <Upload className="h-3.5 w-3.5" />
          <span>Import Excel/CSV</span>
        </Button>
        <Button onClick={handleOpenAdd} className="gap-2 text-xs">
          <Plus className="h-4 w-4" />
          <span>Tambah Peserta</span>
        </Button>
      </PageHeader>

      <DataTable
        data={filteredParticipants}
        columns={columns}
        searchKey="fullName"
        searchPlaceholder="Cari siswa berdasarkan nama atau NISN..."
        selectable={true}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        filterComponent={
          <div className="w-48 shrink-0">
            <Select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="text-xs h-9"
            >
              <option value="all">Semua Sekolah</option>
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </Select>
          </div>
        }
        toolbarActions={
          selectedIds.length > 0 ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="h-9 gap-1 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Hapus ({selectedIds.length})</span>
            </Button>
          ) : null
        }
      />

      {/* Form Add / Edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedParticipant ? 'Edit Data Peserta' : 'Tambah Peserta Baru'}
              </DialogTitle>
              <DialogDescription>
                Informasi identitas siswa untuk penempatan akun ujian digital.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Nama Lengkap Siswa *</label>
                <Input
                  required
                  placeholder="Contoh: Ahmad Faiz Fadhlurrahman"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">NISN (10 Digit) *</label>
                <Input
                  required
                  placeholder="0061234567"
                  value={formData.nisn}
                  onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Jenis Kelamin</label>
                <Select
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })
                  }
                >
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Asal Sekolah *</label>
                <Select
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
                <label className="font-medium text-foreground">Kelas / Rombel *</label>
                <Input
                  required
                  placeholder="Contoh: XII MIPA 1"
                  value={formData.className}
                  onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Email Siswa</label>
                <Input
                  type="email"
                  placeholder="siswa@student.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Status Akun</label>
                <Select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                  }
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
              <Button type="submit">
                {selectedParticipant ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent maxWidth="max-w-lg">
          <div className="space-y-4 text-xs">
            <DialogHeader>
              <DialogTitle>Import Data Peserta (CSV / Salin Teks)</DialogTitle>
              <DialogDescription>
                Tempelkan baris data format: NISN, Nama Lengkap, Gender (L/P), Kelas, Email
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Pilih Sekolah Tujuan</label>
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
                <label className="font-medium text-foreground">Data Siswa (1 Baris per Siswa)</label>
                <Textarea
                  rows={5}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  className="font-mono text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setImportOpen(false)}>
                Batal
              </Button>
              <Button type="button" onClick={handleProcessImport}>
                Proses & Simpan ke Sistem
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Single */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Data Siswa"
        description={`Apakah Anda yakin ingin menghapus data peserta "${selectedParticipant?.fullName}"?`}
        onConfirm={() => {
          if (selectedParticipant) {
            deleteParticipant(selectedParticipant.id);
          }
        }}
      />

      {/* Bulk Delete */}
      <ConfirmationDialog
        open={bulkDeleteOpen}
        onOpenChange={setBulkDeleteOpen}
        title="Hapus Banyak Siswa"
        description={`Apakah Anda yakin ingin menghapus ${selectedIds.length} data siswa terpilih?`}
        onConfirm={() => {
          deleteMultipleParticipants(selectedIds);
          setSelectedIds([]);
        }}
      />
    </div>
  );
}
