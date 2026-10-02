'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
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
import { AcademicYear } from '@/types';

export default function TahunPelajaranPage() {
  const { academicYears, addAcademicYear, updateAcademicYear, deleteAcademicYear } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedTapel, setSelectedTapel] = React.useState<AcademicYear | null>(null);

  const [formData, setFormData] = React.useState({
    year: '2025/2026',
    semester: 'Ganjil' as 'Ganjil' | 'Genap',
    startDate: '2025-07-15',
    endDate: '2025-12-20',
    isActive: false,
  });

  const handleOpenAdd = () => {
    setSelectedTapel(null);
    setFormData({
      year: '2025/2026',
      semester: 'Ganjil',
      startDate: '2025-07-15',
      endDate: '2025-12-20',
      isActive: false,
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (tapel: AcademicYear) => {
    setSelectedTapel(tapel);
    setFormData({
      year: tapel.year,
      semester: tapel.semester,
      startDate: tapel.startDate,
      endDate: tapel.endDate,
      isActive: tapel.isActive,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.year.trim()) return;

    if (formData.isActive) {
      academicYears.forEach((item) => {
        if (item.id !== selectedTapel?.id && item.isActive) {
          updateAcademicYear(item.id, { isActive: false });
        }
      });
    }

    if (selectedTapel) {
      updateAcademicYear(selectedTapel.id, formData);
    } else {
      addAcademicYear(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<AcademicYear>[] = [
    {
      header: 'Tahun Pelajaran',
      accessorKey: 'year',
      sortable: true,
      cell: (row) => <span className="font-semibold text-foreground">{row.year}</span>,
    },
    {
      header: 'Semester',
      accessorKey: 'semester',
      sortable: true,
      cell: (row) => <span>Semester {row.semester}</span>,
    },
    {
      header: 'Periode Berjalan',
      cell: (row) => (
        <span className="text-xs text-muted-foreground">
          {row.startDate} s.d. {row.endDate}
        </span>
      ),
    },
    {
      header: 'Status Aktif',
      accessorKey: 'isActive',
      cell: (row) =>
        row.isActive ? (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-semibold rounded-md border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3" /> Periode Aktif
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Arsip</span>
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
              setSelectedTapel(row);
              setDeleteOpen(true);
            }}
            disabled={row.isActive}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
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
        title="Master Tahun Pelajaran"
        description="Atur kalender periode akademik semester ganjil/genap untuk pengelompokan riwayat ujian."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Tahun Pelajaran</span>
        </Button>
      </PageHeader>

      <DataTable
        data={academicYears}
        columns={columns}
        searchKey="year"
        searchPlaceholder="Cari tahun ajaran..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>
                {selectedTapel ? 'Edit Tahun Pelajaran' : 'Tambah Tahun Pelajaran'}
              </DialogTitle>
              <DialogDescription>
                Tentukan format tahun (misal: 2024/2025) dan semester aktif.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Tahun Pelajaran *</label>
                <Input
                  required
                  placeholder="2024/2025"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Semester *</label>
                <Select
                  value={formData.semester}
                  onChange={(e) =>
                    setFormData({ ...formData, semester: e.target.value as 'Ganjil' | 'Genap' })
                  }
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Tanggal Mulai</label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-medium text-foreground">Tanggal Selesai</label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="font-medium text-foreground cursor-pointer">
                  Jadikan periode aktif saat ini
                </label>
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
        title="Hapus Tahun Pelajaran"
        description={`Apakah Anda yakin ingin menghapus data tahun ajaran "${selectedTapel?.year} ${selectedTapel?.semester}"?`}
        onConfirm={() => {
          if (selectedTapel) {
            deleteAcademicYear(selectedTapel.id);
          }
        }}
      />
    </div>
  );
}
