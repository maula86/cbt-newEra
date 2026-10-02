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
import { PassingGradeConfig } from '@/types';

export default function PassingGradePage() {
  const { passingGrades, educationalLevels, addPassingGrade, updatePassingGrade, deletePassingGrade } =
    useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedPG, setSelectedPG] = React.useState<PassingGradeConfig | null>(null);

  const [formData, setFormData] = React.useState({
    subject: '',
    levelId: '',
    minimumScore: 75,
    maximumScore: 100,
    remedialThreshold: 65,
  });

  const handleOpenAdd = () => {
    setSelectedPG(null);
    setFormData({
      subject: '',
      levelId: educationalLevels[0]?.id || '',
      minimumScore: 75,
      maximumScore: 100,
      remedialThreshold: 65,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (pg: PassingGradeConfig) => {
    setSelectedPG(pg);
    setFormData({
      subject: pg.subject,
      levelId: pg.levelId,
      minimumScore: pg.minimumScore,
      maximumScore: pg.maximumScore,
      remedialThreshold: pg.remedialThreshold,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) return;

    const level = educationalLevels.find((l) => l.id === formData.levelId);
    const payload = {
      ...formData,
      levelName: level?.code || 'Umum',
    };

    if (selectedPG) {
      updatePassingGrade(selectedPG.id, payload);
    } else {
      addPassingGrade(payload);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<PassingGradeConfig>[] = [
    {
      header: 'Mata Pelajaran',
      accessorKey: 'subject',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">{row.subject}</span>,
    },
    {
      header: 'Jenjang Sasaran',
      accessorKey: 'levelName',
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">
          {row.levelName}
        </span>
      ),
    },
    {
      header: 'Nilai Ambang Lulus (KKM)',
      accessorKey: 'minimumScore',
      sortable: true,
      cell: (row) => (
        <span className="font-semibold text-emerald-700 dark:text-emerald-400">
          ≥ {row.minimumScore} poin
        </span>
      ),
    },
    {
      header: 'Ambang Remedial',
      accessorKey: 'remedialThreshold',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          &lt; {row.remedialThreshold} (Wajib Remedial)
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
              setSelectedPG(row);
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
        title="Master Passing Grade (KKM)"
        description="Pengaturan nilai kelulusan ambang batas per mata pelajaran dan jenjang untuk otomasi status kelulusan di laporan."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Passing Grade</span>
        </Button>
      </PageHeader>

      <DataTable
        data={passingGrades}
        columns={columns}
        searchKey="subject"
        searchPlaceholder="Cari mata pelajaran..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedPG ? 'Edit Passing Grade' : 'Tambah Passing Grade'}
              </DialogTitle>
              <DialogDescription>
                Tentukan nilai batas minimal kelulusan dan ambang remedial.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Mata Pelajaran *</label>
                <Input
                  required
                  placeholder="Contoh: Matematika Wajib"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Jenjang *</label>
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

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">KKM Minimal</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.minimumScore}
                    onChange={(e) =>
                      setFormData({ ...formData, minimumScore: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Ambang Remedial</label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={formData.remedialThreshold}
                    onChange={(e) =>
                      setFormData({ ...formData, remedialThreshold: Number(e.target.value) })
                    }
                  />
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
        title="Hapus Passing Grade"
        description={`Apakah Anda yakin ingin menghapus konfigurasi KKM "${selectedPG?.subject}"?`}
        onConfirm={() => {
          if (selectedPG) {
            deletePassingGrade(selectedPG.id);
          }
        }}
      />
    </div>
  );
}
