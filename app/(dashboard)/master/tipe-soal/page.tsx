'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
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
import { QuestionType } from '@/types';

export default function TipeSoalPage() {
  const { questionTypes, addQuestionType, updateQuestionType, deleteQuestionType } =
    useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedQT, setSelectedQT] = React.useState<QuestionType | null>(null);

  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    description: '',
    hasOptions: true,
    isAutoGraded: true,
  });

  const handleOpenAdd = () => {
    setSelectedQT(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      hasOptions: true,
      isAutoGraded: true,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (qt: QuestionType) => {
    setSelectedQT(qt);
    setFormData({
      code: qt.code,
      name: qt.name,
      description: qt.description,
      hasOptions: qt.hasOptions,
      isAutoGraded: qt.isAutoGraded,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (selectedQT) {
      updateQuestionType(selectedQT.id, formData);
    } else {
      addQuestionType(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<QuestionType>[] = [
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
      header: 'Nama Tipe Soal',
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
      header: 'Struktur Opsi',
      accessorKey: 'hasOptions',
      cell: (row) => (
        <span className="text-xs font-medium">
          {row.hasOptions ? 'Pilihan A - E' : 'Teks Bebas / Essay'}
        </span>
      ),
    },
    {
      header: 'Metode Koreksi',
      accessorKey: 'isAutoGraded',
      cell: (row) => (
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border ${
            row.isAutoGraded
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
              : 'border-border bg-muted/60 text-muted-foreground'
          }`}
        >
          {row.isAutoGraded ? 'Koreksi Otomatis Mesin' : 'Koreksi Manual Guru'}
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
              setSelectedQT(row);
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
        title="Master Tipe Soal"
        description="Format butir pertanyaan yang didukung CBT (Pilihan Ganda, Esai, dsb.) beserta karakteristik koreksinya."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Tipe Soal</span>
        </Button>
      </PageHeader>

      <DataTable
        data={questionTypes}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari tipe soal..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{selectedQT ? 'Edit Tipe Soal' : 'Tambah Tipe Soal'}</DialogTitle>
              <DialogDescription>
                Konfigurasi tipe item pertanyaan dan perilaku skoring.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Tipe *</label>
                <Input
                  required
                  placeholder="Contoh: PG, ESAI, PGK"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Tipe *</label>
                <Input
                  required
                  placeholder="Pilihan Ganda Biasa"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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

              <div className="space-y-2 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasOptions"
                    checked={formData.hasOptions}
                    onChange={(e) => setFormData({ ...formData, hasOptions: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="hasOptions" className="font-medium text-foreground cursor-pointer">
                    Memerlukan opsi jawaban (A, B, C, D, E)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isAutoGraded"
                    checked={formData.isAutoGraded}
                    onChange={(e) => setFormData({ ...formData, isAutoGraded: e.target.checked })}
                    className="rounded border-border text-primary focus:ring-primary"
                  />
                  <label htmlFor="isAutoGraded" className="font-medium text-foreground cursor-pointer">
                    Dapat dinilai otomatis oleh sistem (Auto-Graded)
                  </label>
                </div>
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
        title="Hapus Tipe Soal"
        description={`Apakah Anda yakin ingin menghapus tipe soal "${selectedQT?.name}"?`}
        onConfirm={() => {
          if (selectedQT) {
            deleteQuestionType(selectedQT.id);
          }
        }}
      />
    </div>
  );
}
