'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
import { useMasterStore } from '@/store/useMasterStore';
import { ExamType } from '@/types';

export default function TipeUjianPage() {
  const { examTypes, addExamType, updateExamType, deleteExamType } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<ExamType | null>(null);

  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    category: 'Sumatif' as 'Formatif' | 'Sumatif' | 'Seleksi' | 'Simulasi',
    description: '',
  });

  const handleOpenAdd = () => {
    setSelectedType(null);
    setFormData({ code: '', name: '', category: 'Sumatif', description: '' });
    setFormOpen(true);
  };

  const handleOpenEdit = (et: ExamType) => {
    setSelectedType(et);
    setFormData({
      code: et.code,
      name: et.name,
      category: et.category,
      description: et.description,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (selectedType) {
      updateExamType(selectedType.id, formData);
    } else {
      addExamType(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<ExamType>[] = [
    {
      header: 'Kode',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Nama Tipe Ujian',
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
      header: 'Kategori Asesmen',
      accessorKey: 'category',
      sortable: true,
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md border border-border bg-card">
          {row.category}
        </span>
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
              setSelectedType(row);
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
        title="Master Tipe Ujian"
        description="Pengelompokan jenis penilaian seperti PTS, PAS, Asesmen Sekolah, dan Simulasi Masuk Perguruan Tinggi."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Tipe Ujian</span>
        </Button>
      </PageHeader>

      <DataTable
        data={examTypes}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari tipe ujian..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedType ? 'Edit Tipe Ujian' : 'Tambah Tipe Ujian'}
              </DialogTitle>
              <DialogDescription>
                Tentukan kode singkatan dan kategori fungsi evaluasi.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Tipe *</label>
                <Input
                  required
                  placeholder="Contoh: UTBK, PAS, PTS"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Lengkap *</label>
                <Input
                  required
                  placeholder="Penilaian Akhir Semester"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Kategori Asesmen</label>
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category: e.target.value as 'Formatif' | 'Sumatif' | 'Seleksi' | 'Simulasi',
                    })
                  }
                >
                  <option value="Formatif">Formatif</option>
                  <option value="Sumatif">Sumatif</option>
                  <option value="Seleksi">Seleksi</option>
                  <option value="Simulasi">Simulasi</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Deskripsi Penjelasan</label>
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
        title="Hapus Tipe Ujian"
        description={`Apakah Anda yakin ingin menghapus tipe ujian "${selectedType?.name}"?`}
        onConfirm={() => {
          if (selectedType) {
            deleteExamType(selectedType.id);
          }
        }}
      />
    </div>
  );
}
