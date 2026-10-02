'use client';

import * as React from 'react';
import { Plus, Edit2, Trash2, Shield, Lock } from 'lucide-react';
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
import { UserRole } from '@/types';
import Link from 'next/link';

export default function RoleUserPage() {
  const { userRoles, addUserRole, updateUserRole, deleteUserRole } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<UserRole | null>(null);

  const [formData, setFormData] = React.useState({
    code: '',
    name: '',
    description: '',
  });

  const handleOpenAdd = () => {
    setSelectedRole(null);
    setFormData({ code: '', name: '', description: '' });
    setFormOpen(true);
  };

  const handleOpenEdit = (role: UserRole) => {
    setSelectedRole(role);
    setFormData({
      code: role.code,
      name: role.name,
      description: role.description,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.name.trim()) return;

    if (selectedRole) {
      updateUserRole(selectedRole.id, formData);
    } else {
      addUserRole(formData);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<UserRole>[] = [
    {
      header: 'Kode Peran',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Nama Peran (Role)',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <span>{row.name}</span>
            {row.isSystem && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                Sistem
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{row.description}</div>
        </div>
      ),
    },
    {
      header: 'Pengguna Terkait',
      accessorKey: 'userCount',
      sortable: true,
      cell: (row) => <span className="text-xs font-medium">{row.userCount} Akun</span>,
    },
    {
      header: 'Matriks Izin',
      cell: (row) => (
        <Link href={`/menu?role=${row.id}`}>
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
            <Shield className="h-3 w-3 text-primary" />
            <span>Atur Izin Menu</span>
          </Button>
        </Link>
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
          {row.isSystem ? (
            <span
              className="h-8 w-8 flex items-center justify-center text-muted-foreground/40"
              title="Peran bawaan sistem terkunci"
            >
              <Lock className="h-3.5 w-3.5" />
            </span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedRole(row);
                setDeleteOpen(true);
              }}
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Master Role Pengguna"
        description="Definisi peran operasional sistem (Super Admin, Admin Cabang, Admin Sekolah, Guru/Panitia) yang menjadi dasar RBAC."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Role</span>
        </Button>
      </PageHeader>

      <DataTable
        data={userRoles}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari peran pengguna..."
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{selectedRole ? 'Edit Peran' : 'Tambah Peran Baru'}</DialogTitle>
              <DialogDescription>
                Tentukan kode identifikasi peran dan deskripsi wewenangnya.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Peran *</label>
                <Input
                  required
                  disabled={selectedRole?.isSystem}
                  placeholder="Contoh: PENGAWAS_UJIAN"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Nama Peran *</label>
                <Input
                  required
                  placeholder="Contoh: Pengawas Ujian Ruang"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Deskripsi Tugas</label>
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
        title="Hapus Role User"
        description={`Apakah Anda yakin ingin menghapus role "${selectedRole?.name}"?`}
        onConfirm={() => {
          if (selectedRole) {
            deleteUserRole(selectedRole.id);
          }
        }}
      />
    </div>
  );
}
