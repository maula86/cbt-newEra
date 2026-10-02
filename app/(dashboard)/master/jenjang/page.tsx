'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { EducationalLevel } from '@/types';

export default function JenjangPage() {
  const { educationalLevels, addEducationalLevel, updateEducationalLevel, deleteEducationalLevel } =
    useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedLevel, setSelectedLevel] = React.useState<EducationalLevel | null>(null);

  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    description: '',
    defaultPassingGrade: 75,
  });

  const handleOpenAdd = () => {
    setSelectedLevel(null);
    setFormData({ code: '', name: '', description: '', defaultPassingGrade: 75 });
    setFormOpen(true);
  };

  const handleOpenEdit = (lvl: EducationalLevel) => {
    setSelectedLevel(lvl);
    setFormData({
      code: lvl.code,
      name: lvl.name,
      description: lvl.description,
      defaultPassingGrade: lvl.defaultPassingGrade,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (selectedLevel) {
      updateEducationalLevel(selectedLevel.id, formData);
    } else {
      addEducationalLevel(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<EducationalLevel>[] = [
    {
      header: 'Kode Jenjang',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-primary font-mono text-xs px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Nama Jenjang',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Standar KKM Acuan',
      accessorKey: 'defaultPassingGrade',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-semibold">{row.defaultPassingGrade} / 100</span>
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
              setSelectedLevel(row);
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
        title="Master Jenjang Pendidikan"
        description="Klasifikasi tingkatan sekolah seperti SD, SMP, SMA, dan SMK dengan konfigurasi passing grade awal."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Jenjang</span>
        </Button>
      </PageHeader>

      <DataTable
        data={educationalLevels}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari kode atau nama jenjang..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedLevel ? 'Edit Jenjang Pendidikan' : 'Tambah Jenjang Baru'}
              </DialogTitle>
              <DialogDescription>
                Tentukan kode singkatan dan nilai ketuntasan minimal standar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Jenjang *</label>
                <Input
                  required
                  placeholder="Contoh: SMA"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Lengkap *</label>
                <Input
                  required
                  placeholder="Sekolah Menengah Atas"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">KKM Standar Acuan</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={formData.defaultPassingGrade}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultPassingGrade: Number(e.target.value) })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Deskripsi</label>
                <Textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Jenjang Pendidikan"
        description={`Apakah Anda yakin ingin menghapus jenjang "${selectedLevel?.name}"?`}
        onConfirm={() => {
          if (selectedLevel) {
            deleteEducationalLevel(selectedLevel.id);
          }
        }}
      />
    </div>
  );
}
