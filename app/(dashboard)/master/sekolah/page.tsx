'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, School as SchoolIcon } from 'lucide-react';
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
import { useMasterStore } from '@/store/useMasterStore';
import { School } from '@/types';

export default function SekolahPage() {
  const { schools, branches, educationalLevels, addSchool, updateSchool, deleteSchool } =
    useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedSchool, setSelectedSchool] = React.useState<School | null>(null);

  // Form State
  const [formData, setFormData] = React.useState({
    name: '',
    npsn: '',
    branchId: '',
    levelId: '',
    address: '',
    phone: '',
    principal: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleOpenAdd = () => {
    setSelectedSchool(null);
    setFormData({
      name: '',
      npsn: '',
      branchId: branches[0]?.id || '',
      levelId: educationalLevels[0]?.id || '',
      address: '',
      phone: '',
      principal: '',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (school: School) => {
    setSelectedSchool(school);
    setFormData({
      name: school.name,
      npsn: school.npsn,
      branchId: school.branchId,
      levelId: school.levelId,
      address: school.address,
      phone: school.phone,
      principal: school.principal,
      status: school.status,
    });
    setFormOpen(true);
  };

  const handleOpenDelete = (school: School) => {
    setSelectedSchool(school);
    setDeleteOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.npsn.trim()) return;

    const branch = branches.find((b) => b.id === formData.branchId);
    const level = educationalLevels.find((l) => l.id === formData.levelId);

    const payload = {
      ...formData,
      branchName: branch?.name || 'Cabang Belum Ditentukan',
      levelName: level?.code || 'Umum',
    };

    if (selectedSchool) {
      updateSchool(selectedSchool.id, payload);
    } else {
      addSchool(payload);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<School>[] = [
    {
      header: 'Nama Sekolah',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.address}</div>
        </div>
      ),
    },
    {
      header: 'NPSN',
      accessorKey: 'npsn',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.npsn}</span>,
    },
    {
      header: 'Jenjang',
      accessorKey: 'levelName',
      sortable: true,
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded bg-muted/80 text-foreground border border-border/60">
          {row.levelName}
        </span>
      ),
    },
    {
      header: 'Cabang Wilayah',
      accessorKey: 'branchName',
      sortable: true,
      cell: (row) => <span className="text-xs text-muted-foreground">{row.branchName}</span>,
    },
    {
      header: 'Kepala Sekolah',
      accessorKey: 'principal',
      cell: (row) => <span className="text-xs">{row.principal || '-'}</span>,
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
            title="Edit data sekolah"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenDelete(row)}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus data sekolah"
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
        title="Master Sekolah"
        description="Kelola data unit sekolah pelaksana ujian, jenjang pendidikan, dan penempatan cabang administratif."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Sekolah</span>
        </Button>
      </PageHeader>

      <DataTable
        data={schools}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari sekolah berdasarkan nama atau NPSN..."
      />

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedSchool ? 'Edit Data Sekolah' : 'Tambah Sekolah Baru'}
              </DialogTitle>
              <DialogDescription>
                Isi data profil dan afiliasi sekolah untuk keperluan administrasi ujian.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Nama Sekolah *</label>
                <Input
                  required
                  placeholder="Contoh: SMA Negeri 1 Jakarta"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">NPSN (Nomor Pokok) *</label>
                <Input
                  required
                  placeholder="8 digit nomor"
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Jenjang Pendidikan *</label>
                <Select
                  value={formData.levelId}
                  onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
                >
                  {educationalLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.code} - {lvl.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Cabang Wilayah *</label>
                <Select
                  value={formData.branchId}
                  onChange={(e) => setFormData({ ...formData, branchId: e.target.value })}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Kepala Sekolah</label>
                <Input
                  placeholder="Nama beserta gelar"
                  value={formData.principal}
                  onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nomor Telepon</label>
                <Input
                  placeholder="021-..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-medium text-foreground">Alamat Lengkap</label>
                <Textarea
                  rows={2}
                  placeholder="Alamat jalan, kelurahan, kecamatan, kota"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Status Institusi</label>
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
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                {selectedSchool ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Data Sekolah"
        description={`Apakah Anda yakin ingin menghapus data "${selectedSchool?.name}"? Tindakan ini akan menghapus referensi sekolah dari daftar.`}
        onConfirm={() => {
          if (selectedSchool) {
            deleteSchool(selectedSchool.id);
          }
        }}
      />
    </div>
  );
}
