'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
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
import { WeightConfig } from '@/types';

export default function ConfigBobotPage() {
  const { weightConfigs, examTypes, addWeightConfig, updateWeightConfig, deleteWeightConfig } =
    useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedWC, setSelectedWC] = React.useState<WeightConfig | null>(null);

  const [formData, setFormData] = React.useState({
    examTypeId: '',
    multipleChoiceWeight: 70,
    essayWeight: 30,
    penaltyWrongAnswer: 0,
    scorePerQuestion: 2.5,
  });

  const handleOpenAdd = () => {
    setSelectedWC(null);
    setFormData({
      examTypeId: examTypes[0]?.id || '',
      multipleChoiceWeight: 70,
      essayWeight: 30,
      penaltyWrongAnswer: 0,
      scorePerQuestion: 2.5,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (wc: WeightConfig) => {
    setSelectedWC(wc);
    setFormData({
      examTypeId: wc.examTypeId,
      multipleChoiceWeight: wc.multipleChoiceWeight,
      essayWeight: wc.essayWeight,
      penaltyWrongAnswer: wc.penaltyWrongAnswer,
      scorePerQuestion: wc.scorePerQuestion,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const examType = examTypes.find((et) => et.id === formData.examTypeId);
    const payload = {
      ...formData,
      examTypeName: examType?.name || 'Ujian Terkait',
    };

    if (selectedWC) {
      updateWeightConfig(selectedWC.id, payload);
    } else {
      addWeightConfig(payload);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<WeightConfig>[] = [
    {
      header: 'Tipe Ujian Sasaran',
      accessorKey: 'examTypeName',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">{row.examTypeName}</span>,
    },
    {
      header: 'Bobot Pilihan Ganda (PG)',
      accessorKey: 'multipleChoiceWeight',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.multipleChoiceWeight}%
        </span>
      ),
    },
    {
      header: 'Bobot Esai',
      accessorKey: 'essayWeight',
      sortable: true,
      cell: (row) => (
        <span className="font-medium text-xs px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.essayWeight}%
        </span>
      ),
    },
    {
      header: 'Poin / Soal PG',
      accessorKey: 'scorePerQuestion',
      cell: (row) => <span className="text-xs font-mono">{row.scorePerQuestion} Poin</span>,
    },
    {
      header: 'Penalti Salah',
      accessorKey: 'penaltyWrongAnswer',
      cell: (row) => (
        <span
          className={`text-xs font-medium ${
            row.penaltyWrongAnswer < 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'
          }`}
        >
          {row.penaltyWrongAnswer === 0 ? 'Tanpa Pengurangan (0)' : `${row.penaltyWrongAnswer} Poin`}
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
              setSelectedWC(row);
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
        title="Master Config Bobot Nilai"
        description="Atur proporsi persentase nilai antara soal pilihan ganda, esai, serta aturan minus nilai salah per tipe ujian."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Config Bobot</span>
        </Button>
      </PageHeader>

      <DataTable
        data={weightConfigs}
        columns={columns}
        searchKey="examTypeName"
        searchPlaceholder="Cari tipe ujian..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedWC ? 'Edit Konfigurasi Bobot' : 'Tambah Konfigurasi Bobot'}
              </DialogTitle>
              <DialogDescription>
                Tentukan pembagian porsi nilai PG dan Esai (Total disarankan 100%).
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Tipe Ujian *</label>
                <Select
                  value={formData.examTypeId}
                  onChange={(e) => setFormData({ ...formData, examTypeId: e.target.value })}
                >
                  {examTypes.map((et) => (
                    <option key={et.id} value={et.id}>
                      {et.code} - {et.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Bobot PG (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.multipleChoiceWeight}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        multipleChoiceWeight: Number(e.target.value),
                        essayWeight: 100 - Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Bobot Esai (%)</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.essayWeight}
                    onChange={(e) =>
                      setFormData({ ...formData, essayWeight: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Skor per Soal PG</label>
                  <Input
                    type="number"
                    step="0.5"
                    value={formData.scorePerQuestion}
                    onChange={(e) =>
                      setFormData({ ...formData, scorePerQuestion: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Penalti Jawaban Salah</label>
                  <Select
                    value={formData.penaltyWrongAnswer}
                    onChange={(e) =>
                      setFormData({ ...formData, penaltyWrongAnswer: Number(e.target.value) })
                    }
                  >
                    <option value={0}>0 (Tidak ada minus)</option>
                    <option value={-1}>-1 Poin (Format UTBK lama)</option>
                    <option value={-0.5}>-0.5 Poin</option>
                  </Select>
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
        title="Hapus Konfigurasi Bobot"
        description={`Apakah Anda yakin ingin menghapus konfigurasi bobot untuk "${selectedWC?.examTypeName}"?`}
        onConfirm={() => {
          if (selectedWC) {
            deleteWeightConfig(selectedWC.id);
          }
        }}
      />
    </div>
  );
}
