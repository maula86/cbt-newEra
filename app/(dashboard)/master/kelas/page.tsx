'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  DoorOpen,
  Plus,
  Edit2,
  Trash2,
  Layers,
  School,
  Users,
  Search,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  GraduationCap,
  CalendarDays,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';
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
import { ClassRoom } from '@/types';
import { cn } from '@/lib/utils';

function KelasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramLevelId = searchParams.get('levelId');
  const paramLevelCode = searchParams.get('levelCode');

  const {
    classes,
    educationalLevels,
    schools,
    academicYears,
    addClass,
    updateClass,
    deleteClass,
  } = useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<ClassRoom | null>(null);

  // Initial level filter from query params
  const initialJenjang = React.useMemo(() => {
    if (paramLevelId) return paramLevelId;
    if (paramLevelCode) {
      const matched = educationalLevels.find(
        (l) => l.code.toLowerCase() === paramLevelCode.toLowerCase()
      );
      if (matched) return matched.id;
    }
    return 'all';
  }, [paramLevelId, paramLevelCode, educationalLevels]);

  // Filters
  const [jenjangFilter, setJenjangFilter] = React.useState<string>(initialJenjang);
  const [schoolFilter, setSchoolFilter] = React.useState<string>('all');
  const [gradeFilter, setGradeFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Form State
  const [formData, setFormData] = React.useState<{
    code: string;
    name: string;
    grade: number;
    levelId: string;
    schoolId: string;
    major: string;
    capacity: number;
    studentCount: number;
    homeroomTeacher: string;
    academicYear: string;
    status: 'active' | 'inactive';
  }>({
    code: '',
    name: '',
    grade: 10,
    levelId: '',
    schoolId: '',
    major: 'Umum',
    capacity: 36,
    studentCount: 30,
    homeroomTeacher: '',
    academicYear: '2024/2025',
    status: 'active',
  });

  // Current active level object if filtered by specific level
  const activeLevelObj = React.useMemo(() => {
    if (jenjangFilter === 'all') return null;
    return educationalLevels.find((l) => l.id === jenjangFilter) || null;
  }, [jenjangFilter, educationalLevels]);

  // Filtered dataset
  const filteredClasses = React.useMemo(() => {
    return classes.filter((c) => {
      const matchLevel = jenjangFilter === 'all' || c.levelId === jenjangFilter;
      const matchSchool = schoolFilter === 'all' || c.schoolId === schoolFilter;
      const matchGrade = gradeFilter === 'all' || String(c.grade) === gradeFilter;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      return matchLevel && matchSchool && matchGrade && matchStatus;
    });
  }, [classes, jenjangFilter, schoolFilter, gradeFilter, statusFilter]);

  const handleOpenAdd = () => {
    setSelectedClass(null);
    const defaultLevel =
      jenjangFilter !== 'all'
        ? educationalLevels.find((l) => l.id === jenjangFilter)
        : educationalLevels[0];
    const defaultSchool = schools[0];
    const defaultYear = academicYears.find((y) => y.isActive) || academicYears[0];

    setFormData({
      code: `KLS-${Date.now().toString().slice(-4)}`,
      name: '',
      grade: defaultLevel?.code === 'SD' ? 6 : defaultLevel?.code === 'SMP' ? 9 : 12,
      levelId: defaultLevel?.id || educationalLevels[0]?.id || '',
      schoolId: defaultSchool?.id || '',
      major: defaultLevel?.code === 'SMK' ? 'Teknik Komputer & Jaringan' : defaultLevel?.code === 'SMA' ? 'MIPA' : 'Umum',
      capacity: 36,
      studentCount: 30,
      homeroomTeacher: '',
      academicYear: defaultYear?.year || '2024/2025',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (c: ClassRoom) => {
    setSelectedClass(c);
    setFormData({
      code: c.code,
      name: c.name,
      grade: c.grade,
      levelId: c.levelId,
      schoolId: c.schoolId,
      major: c.major || 'Umum',
      capacity: c.capacity,
      studentCount: c.studentCount,
      homeroomTeacher: c.homeroomTeacher,
      academicYear: c.academicYear,
      status: c.status,
    });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) return;

    const matchedLevel = educationalLevels.find((l) => l.id === formData.levelId);
    const matchedSchool = schools.find((s) => s.id === formData.schoolId);

    const payload: Omit<ClassRoom, 'id'> = {
      code: formData.code,
      name: formData.name,
      grade: Number(formData.grade) || 10,
      levelId: formData.levelId,
      levelCode: matchedLevel?.code || 'SMA',
      levelName: matchedLevel?.name || 'Sekolah Menengah Atas',
      schoolId: formData.schoolId,
      schoolName: matchedSchool?.name || 'Sekolah Terdaftar',
      major: formData.major,
      capacity: Number(formData.capacity) || 36,
      studentCount: Number(formData.studentCount) || 0,
      homeroomTeacher: formData.homeroomTeacher || 'Belum Ditentukan',
      academicYear: formData.academicYear,
      status: formData.status,
    };

    if (selectedClass) {
      updateClass(selectedClass.id, payload);
    } else {
      addClass(payload);
    }

    setFormOpen(false);
  };

  const handleResetJenjangFilter = () => {
    setJenjangFilter('all');
    // Clear URL search params without reload
    router.push('/master/kelas');
  };

  const columns: ColumnDef<ClassRoom>[] = [
    {
      header: 'Kode & Tingkat',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
            {row.code}
          </span>
          <div className="text-[11px] text-muted-foreground font-medium">
            Tingkat Kelas {row.grade}
          </div>
        </div>
      ),
    },
    {
      header: 'Nama Rombel & Jurusan',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-foreground">{row.name}</div>
          {row.major && (
            <span className="text-[11px] text-muted-foreground">
              Peminatan: {row.major}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Jenjang Pendidikan',
      accessorKey: 'levelCode',
      sortable: true,
      cell: (row) => {
        let badgeColor = 'bg-primary/10 text-primary border-primary/20';
        if (row.levelCode === 'SD') badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20';
        if (row.levelCode === 'SMP') badgeColor = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
        if (row.levelCode === 'SMA') badgeColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
        if (row.levelCode === 'SMK') badgeColor = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';

        return (
          <div className="space-y-0.5">
            <span className={cn('px-2 py-0.5 rounded text-xs font-bold border', badgeColor)}>
              {row.levelCode}
            </span>
            <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {row.levelName}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Unit Sekolah',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (row) => (
        <div className="text-xs font-medium text-foreground max-w-[200px] truncate">
          {row.schoolName}
        </div>
      ),
    },
    {
      header: 'Wali Kelas',
      accessorKey: 'homeroomTeacher',
      sortable: true,
      cell: (row) => (
        <div className="text-xs text-foreground">
          {row.homeroomTeacher || '-'}
        </div>
      ),
    },
    {
      header: 'Kapasitas & Siswa',
      accessorKey: 'studentCount',
      sortable: true,
      cell: (row) => {
        const count = Number(row.studentCount) || 0;
        const cap = Number(row.capacity) || 36;
        const percentage = Math.min(100, Math.round((count / cap) * 100));
        return (
          <div className="space-y-1 w-28">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground">{count}</span>
              <span className="text-[10px] text-muted-foreground">/ {cap}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={cn(
                  'h-full transition-all',
                  percentage >= 90 ? 'bg-amber-500' : 'bg-primary'
                )}
                style={{ width: `${isNaN(percentage) ? 0 : percentage}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      header: 'Status',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => (
        <span
          className={cn(
            'px-2 py-0.5 rounded text-[11px] font-semibold border',
            row.status === 'active'
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
              : 'bg-muted text-muted-foreground border-border'
          )}
        >
          {row.status === 'active' ? 'Aktif' : 'Nonaktif'}
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
            title="Edit data kelas"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedClass(row);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus kelas"
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
        title="Master Rombongan Belajar (Kelas)"
        description="Kelola data kelas, pembagian jenjang pendidikan, tingkat kelas, jurusan peminatan, serta wali kelas untuk pemetaan peserta ujian CBT."
      >
        <Link href="/master/jenjang">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Ke Master Jenjang</span>
          </Button>
        </Link>
        <Button onClick={handleOpenAdd} className="gap-2 font-semibold shadow-2xs">
          <Plus className="h-4 w-4" />
          <span>Tambah Kelas Baru</span>
        </Button>
      </PageHeader>

      {/* Active Jenjang Filter Banner (When navigating from Jenjang menu) */}
      {activeLevelObj && (
        <div className="p-3.5 rounded-xl border border-primary/40 bg-primary/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <Layers className="h-4 w-4 text-primary shrink-0" />
            <div className="text-xs">
              <span className="text-muted-foreground">Filter Otomatis Berdasarkan Jenjang: </span>
              <strong className="text-foreground font-bold font-mono">
                {activeLevelObj.name} ({activeLevelObj.code})
              </strong>
              <span className="text-muted-foreground ml-1.5">
                • Ditemukan {filteredClasses.length} rombel kelas
              </span>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetJenjangFilter}
            className="h-7 text-xs font-semibold gap-1 self-start sm:self-auto hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-3 w-3" />
            <span>Hapus Filter Jenjang (Tampilkan Semua)</span>
          </Button>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs shadow-2xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter:</span>
        </span>

        {/* Jenjang Filter */}
        <div className="w-48">
          <Select value={jenjangFilter} onChange={(e) => setJenjangFilter(e.target.value)}>
            <option value="all">Semua Jenjang Pendidikan</option>
            {educationalLevels.map((lvl) => (
              <option key={lvl.id} value={lvl.id}>
                {lvl.code} - {lvl.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Sekolah Filter */}
        <div className="w-56">
          <Select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
            <option value="all">Semua Unit Sekolah</option>
            {schools.map((sch) => (
              <option key={sch.id} value={sch.id}>
                {sch.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Tingkat / Grade Filter */}
        <div className="w-32">
          <Select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)}>
            <option value="all">Semua Tingkat</option>
            {[6, 7, 8, 9, 10, 11, 12].map((g) => (
              <option key={g} value={String(g)}>
                Tingkat {g}
              </option>
            ))}
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-32">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="inactive">Nonaktif</option>
          </Select>
        </div>

        {/* Reset All */}
        {(jenjangFilter !== 'all' || schoolFilter !== 'all' || gradeFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setJenjangFilter('all');
              setSchoolFilter('all');
              setGradeFilter('all');
              setStatusFilter('all');
              router.push('/master/kelas');
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Semua</span>
          </Button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredClasses}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari nama rombel kelas, kode, wali kelas, atau sekolah..."
      />

      {/* Form Dialog for Add / Edit */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <DoorOpen className="h-5 w-5 text-primary" />
                <span>{selectedClass ? 'Edit Data Kelas' : 'Tambah Rombel Kelas Baru'}</span>
              </DialogTitle>
              <DialogDescription>
                Lengkapi rincian rombongan belajar, keterikatan jenjang, dan wali kelas pendamping.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kode Kelas *</label>
                <Input
                  required
                  placeholder="XII-MIPA-1"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Nama Kelas *</label>
                <Input
                  required
                  placeholder="XII MIPA 1"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jenjang Pendidikan *</label>
                <Select
                  required
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

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tingkat Kelas (Grade) *</label>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={isNaN(formData.grade) ? '' : formData.grade}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFormData({ ...formData, grade: isNaN(v) ? 10 : v });
                  }}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-foreground">Unit Sekolah *</label>
                <Select
                  required
                  value={formData.schoolId}
                  onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                >
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name} ({sch.levelName})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jurusan / Peminatan</label>
                <Input
                  placeholder="MIPA, IPS, TKJ, Umum"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Wali Kelas</label>
                <Input
                  placeholder="Nama guru wali kelas"
                  value={formData.homeroomTeacher}
                  onChange={(e) => setFormData({ ...formData, homeroomTeacher: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kapasitas Maksimal</label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={isNaN(formData.capacity) ? '' : formData.capacity}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFormData({ ...formData, capacity: isNaN(v) ? 0 : v });
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jumlah Siswa Saat Ini</label>
                <Input
                  type="number"
                  min={0}
                  max={50}
                  value={isNaN(formData.studentCount) ? '' : formData.studentCount}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setFormData({ ...formData, studentCount: isNaN(v) ? 0 : v });
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tahun Pelajaran</label>
                <Select
                  value={formData.academicYear}
                  onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                >
                  {academicYears.map((ay) => (
                    <option key={ay.id} value={ay.year}>
                      {ay.year} ({ay.semester})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Status</label>
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
              <Button type="submit" className="font-semibold">
                {selectedClass ? 'Simpan Perubahan' : 'Tambahkan Kelas'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Rombel Kelas"
        description={`Apakah Anda yakin ingin menghapus kelas "${selectedClass?.name}"? Peserta ujian yang terdaftar pada kelas ini mungkin perlu dialihkan.`}
        onConfirm={() => {
          if (selectedClass) {
            deleteClass(selectedClass.id);
          }
        }}
      />
    </div>
  );
}

function KelasPageWrapper() {
  const searchParams = useSearchParams();
  const levelKey = `${searchParams.get('levelId') || ''}_${searchParams.get('levelCode') || ''}`;

  return <KelasContent key={levelKey} />;
}

export default function KelasPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Memuat data rombongan belajar kelas...
        </div>
      }
    >
      <KelasPageWrapper />
    </React.Suspense>
  );
}
