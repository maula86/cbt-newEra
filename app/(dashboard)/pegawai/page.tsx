'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, Users, School as SchoolIcon } from 'lucide-react';
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
import { useUserStore } from '@/store/useUserStore';
import { useMasterStore } from '@/store/useMasterStore';
import { Staff } from '@/types';

export default function PegawaiPage() {
  const { staff, addStaff, updateStaff, deleteStaff } = useUserStore();
  const { schools } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedStaff, setSelectedStaff] = React.useState<Staff | null>(null);
  const [schoolFilter, setSchoolFilter] = React.useState<string>('all');

  const [formData, setFormData] = React.useState({
    nip: '',
    fullName: '',
    role: 'Guru Penyusun Soal',
    schoolId: '',
    subjectSpecialization: '',
    email: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });

  const filteredStaff = React.useMemo(() => {
    if (schoolFilter === 'all') return staff;
    return staff.filter((s) => s.schoolId === schoolFilter);
  }, [staff, schoolFilter]);

  const handleOpenAdd = () => {
    setSelectedStaff(null);
    setFormData({
      nip: '',
      fullName: '',
      role: 'Guru Penyusun Soal',
      schoolId: schools[0]?.id || '',
      subjectSpecialization: 'Matematika',
      email: '',
      phone: '',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (item: Staff) => {
    setSelectedStaff(item);
    setFormData({
      nip: item.nip,
      fullName: item.fullName,
      role: item.role,
      schoolId: item.schoolId,
      subjectSpecialization: item.subjectSpecialization,
      email: item.email,
      phone: item.phone,
      status: item.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const school = schools.find((s) => s.id === formData.schoolId);
    const payload = {
      ...formData,
      schoolName: school?.name || 'Unit Belum Ditentukan',
    };

    if (selectedStaff) {
      updateStaff(selectedStaff.id, payload);
    } else {
      addStaff(payload);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<Staff>[] = [
    {
      header: 'Nama Pegawai & NIP',
      accessorKey: 'fullName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.fullName}</div>
          <div className="text-xs text-muted-foreground font-mono">NIP. {row.nip || '-'}</div>
        </div>
      ),
    },
    {
      header: 'Peran / Penugasan',
      accessorKey: 'role',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.role}
        </span>
      ),
    },
    {
      header: 'Spesialisasi Mapel',
      accessorKey: 'subjectSpecialization',
      sortable: true,
      cell: (row) => <span className="text-xs">{row.subjectSpecialization || '-'}</span>,
    },
    {
      header: 'Sekolah Penugasan',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{row.schoolName}</span>,
    },
    {
      header: 'Kontak',
      accessorKey: 'email',
      cell: (row) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>{row.email}</div>
          <div className="font-mono text-[11px]">{row.phone}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
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
              setSelectedStaff(row);
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
        title="Manajemen Pegawai & Guru"
        description="Kelola tenaga pendidik, panitia pelaksana, pengawas ruang, dan teknisi lab komputer ujian."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Pegawai</span>
        </Button>
      </PageHeader>

      <DataTable
        data={filteredStaff}
        columns={columns}
        searchKey="fullName"
        searchPlaceholder="Cari pegawai berdasarkan nama..."
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
      />

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedStaff ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
              </DialogTitle>
              <DialogDescription>
                Isi data profil guru, panitia, atau staf pengawas ujian.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Nama Lengkap & Gelar *</label>
                <Input
                  required
                  placeholder="Drs. Hendro Wibowo, M.Pd."
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">NIP / NUPTK</label>
                <Input
                  placeholder="18 digit NIP"
                  value={formData.nip}
                  onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Peran Penugasan</label>
                <Select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                >
                  <option value="Guru Penyusun Soal">Guru Penyusun Soal</option>
                  <option value="Koordinator Ujian">Koordinator Ujian</option>
                  <option value="Pengawas Ruang">Pengawas Ruang</option>
                  <option value="Teknisi Lab / Operator CBT">Teknisi Lab / Operator CBT</option>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Unit Sekolah Penugasan *</label>
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

              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Mata Pelajaran Spesialisasi</label>
                <Input
                  placeholder="Contoh: Matematika, Bahasa Indonesia"
                  value={formData.subjectSpecialization}
                  onChange={(e) =>
                    setFormData({ ...formData, subjectSpecialization: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  placeholder="guru@sekolah.sch.id"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nomor Telepon / WhatsApp</label>
                <Input
                  placeholder="0812..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Status Aktif</label>
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
                {selectedStaff ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Data Pegawai"
        description={`Apakah Anda yakin ingin menghapus data pegawai "${selectedStaff?.fullName}"?`}
        onConfirm={() => {
          if (selectedStaff) {
            deleteStaff(selectedStaff.id);
          }
        }}
      />
    </div>
  );
}
