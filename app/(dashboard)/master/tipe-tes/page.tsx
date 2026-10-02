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
import { TestType } from '@/types';

export default function TipeTesPage() {
  const { testTypes, addTestType, updateTestType, deleteTestType } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedTT, setSelectedTT] = React.useState<TestType | null>(null);

  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    purpose: '',
    scoringModel: 'Standard 0-100' as 'Standard 0-100' | 'Skala 1-5' | 'IRT / Bobot Dinamis',
  });

  const handleOpenAdd = () => {
    setSelectedTT(null);
    setFormData({
      code: '',
      name: '',
      purpose: '',
      scoringModel: 'Standard 0-100',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (tt: TestType) => {
    setSelectedTT(tt);
    setFormData({
      code: tt.code,
      name: tt.name,
      purpose: tt.purpose,
      scoringModel: tt.scoringModel,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (selectedTT) {
      updateTestType(selectedTT.id, formData);
    } else {
      addTestType(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<TestType>[] = [
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
      header: 'Nama Tipe Tes',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.name}</div>
          <div className="text-xs text-muted-foreground">{row.purpose}</div>
        </div>
      ),
    },
    {
      header: 'Model Penilaian (Scoring)',
      accessorKey: 'scoringModel',
      sortable: true,
      cell: (row) => (
        <span className="inline-block px-2 py-0.5 text-xs font-medium rounded-md border border-border bg-card">
          {row.scoringModel}
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
              setSelectedTT(row);
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
        title="Master Tipe Tes"
        description="Klasifikasi instrumen evaluasi (Tes Kompetensi Akademik, Psikotes Skolastik, atau Survei Karakter)."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Tipe Tes</span>
        </Button>
      </PageHeader>

      <DataTable
        data={testTypes}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari tipe tes..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{selectedTT ? 'Edit Tipe Tes' : 'Tambah Tipe Tes'}</DialogTitle>
              <DialogDescription>
                Tentukan instrumen tes dan algoritma pembobotan nilai.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Tes *</label>
                <Input
                  required
                  placeholder="Contoh: AKADEMIK, PSIKOTES"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Tipe Tes *</label>
                <Input
                  required
                  placeholder="Tes Kemampuan Akademik (TKA)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tujuan Evaluasi</label>
                <Textarea
                  rows={2}
                  placeholder="Tujuan instrumen"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Model Skoring</label>
                <Select
                  value={formData.scoringModel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      scoringModel: e.target.value as
                        | 'Standard 0-100'
                        | 'Skala 1-5'
                        | 'IRT / Bobot Dinamis',
                    })
                  }
                >
                  <option value="Standard 0-100">Standard 0-100</option>
                  <option value="Skala 1-5">Skala 1-5 (Likert)</option>
                  <option value="IRT / Bobot Dinamis">IRT / Bobot Dinamis</option>
                </Select>
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
        title="Hapus Tipe Tes"
        description={`Apakah Anda yakin ingin menghapus tipe tes "${selectedTT?.name}"?`}
        onConfirm={() => {
          if (selectedTT) {
            deleteTestType(selectedTT.id);
          }
        }}
      />
    </div>
  );
}
