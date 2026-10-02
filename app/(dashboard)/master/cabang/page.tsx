'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
import { useMasterStore } from '@/store/useMasterStore';
import { Branch } from '@/types';

export default function CabangPage() {
  const { branches, addBranch, updateBranch, deleteBranch } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedBranch, setSelectedBranch] = React.useState<Branch | null>(null);

  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    city: '',
    province: '',
    manager: '',
    phone: '',
    status: 'active' as 'active' | 'inactive',
  });

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setFormData({
      code: '',
      name: '',
      city: '',
      province: '',
      manager: '',
      phone: '',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      city: branch.city,
      province: branch.province,
      manager: branch.manager,
      phone: branch.phone,
      status: branch.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    if (selectedBranch) {
      updateBranch(selectedBranch.id, formData);
    } else {
      addBranch(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<Branch>[] = [
    {
      header: 'Kode Cabang',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => <span className="font-mono text-xs font-semibold">{row.code}</span>,
    },
    {
      header: 'Nama Cabang Wilayah',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.city}, {row.province}</div>
        </div>
      ),
    },
    {
      header: 'Pimpinan Wilayah',
      accessorKey: 'manager',
      cell: (row) => <span className="text-xs">{row.manager || '-'}</span>,
    },
    {
      header: 'Kontak',
      accessorKey: 'phone',
      cell: (row) => <span className="text-xs font-mono text-muted-foreground">{row.phone || '-'}</span>,
    },
    {
      header: 'Total Sekolah',
      accessorKey: 'schoolCount',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium">
          {row.schoolCount} Unit
        </span>
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
            title="Edit cabang"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedBranch(row);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus cabang"
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
        title="Master Cabang Wilayah"
        description="Pengelompokan wilayah koordinasi yayasan atau dinas daerah yang membawahi beberapa unit sekolah."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Cabang</span>
        </Button>
      </PageHeader>

      <DataTable
        data={branches}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari berdasarkan nama cabang atau kota..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedBranch ? 'Edit Cabang Wilayah' : 'Tambah Cabang Baru'}
              </DialogTitle>
              <DialogDescription>
                Konfigurasi wilayah administratif pengelola sekolah.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Cabang *</label>
                <Input
                  required
                  placeholder="Contoh: CAB-JKT-01"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Cabang *</label>
                <Input
                  required
                  placeholder="Contoh: Cabang Wilayah I DKI"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Kota / Kabupaten</label>
                <Input
                  placeholder="Kota kedudukan"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Provinsi</label>
                <Input
                  placeholder="Provinsi"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Pimpinan Cabang</label>
                <Input
                  placeholder="Nama manager/kepala cabang"
                  value={formData.manager}
                  onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nomor Telepon</label>
                <Input
                  placeholder="Nomor kontak kantor"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Status</label>
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
                {selectedBranch ? 'Simpan Perubahan' : 'Tambahkan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Cabang Wilayah"
        description={`Apakah Anda yakin ingin menghapus data cabang "${selectedBranch?.name}"?`}
        onConfirm={() => {
          if (selectedBranch) {
            deleteBranch(selectedBranch.id);
          }
        }}
      />
    </div>
  );
}
