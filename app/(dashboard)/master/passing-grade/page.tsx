'use client';

import * as React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Award,
  Filter,
  RotateCcw,
  Calculator,
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
import { useMasterStore, normalizePassingGrade } from '@/store/useMasterStore';
import { PassingGradeConfig, ClusterType } from '@/types';
import { cn } from '@/lib/utils';

export default function PassingGradePage() {
  const { passingGrades, addPassingGrade, updatePassingGrade, deletePassingGrade } =
    useMasterStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [simulasiOpen, setSimulasiOpen] = React.useState(false);
  const [selectedPG, setSelectedPG] = React.useState<PassingGradeConfig | null>(null);

  // Filters
  const [clusterFilter, setClusterFilter] = React.useState<string>('all');
  const [degreeFilter, setDegreeFilter] = React.useState<string>('all');
  const [ptnFilter, setPtnFilter] = React.useState<string>('all');

  // Simulation score tester state (guaranteed valid finite number)
  const [testScore, setTestScore] = React.useState<number>(680);

  // Form State (guaranteed finite numeric values)
  const [formData, setFormData] = React.useState<{
    majorCode: string;
    cluster: ClusterType;
    ptnName: string;
    majorName: string;
    score: number;
    capacity: number;
    applicantCount: number;
    degreeLevel: 'S1' | 'D4' | 'D3';
    accreditation: 'Unggul' | 'A' | 'Baik Sekali' | 'Baik';
    province: string;
    status: 'active' | 'inactive';
  }>({
    majorCode: '',
    cluster: 'Saintek',
    ptnName: '',
    majorName: '',
    score: 650,
    capacity: 60,
    applicantCount: 1200,
    degreeLevel: 'S1',
    accreditation: 'Unggul',
    province: 'DKI Jakarta',
    status: 'active',
  });

  // Unique PTNs for filter dropdown
  const uniquePTNs = React.useMemo(() => {
    return Array.from(new Set(passingGrades.map((pg) => pg.ptnName))).filter(Boolean);
  }, [passingGrades]);

  // Clean, normalized list of passing grades
  const normalizedList = React.useMemo(() => {
    return passingGrades.map(normalizePassingGrade);
  }, [passingGrades]);

  // Filtered dataset
  const filteredPassingGrades = React.useMemo(() => {
    return normalizedList.filter((pg) => {
      const matchCluster = clusterFilter === 'all' || pg.cluster === clusterFilter;
      const matchDegree = degreeFilter === 'all' || pg.degreeLevel === degreeFilter;
      const matchPtn = ptnFilter === 'all' || pg.ptnName === ptnFilter;
      return matchCluster && matchDegree && matchPtn;
    });
  }, [normalizedList, clusterFilter, degreeFilter, ptnFilter]);

  // Statistics KPIs (strictly guarded against NaN)
  const stats = React.useMemo(() => {
    if (normalizedList.length === 0) {
      return { total: 0, highest: 0, average: 0, totalCapacity: 0 };
    }
    const scores = normalizedList
      .map((p) => (typeof p.score === 'number' && !isNaN(p.score) ? p.score : 650))
      .filter((s) => s > 0);

    const capacities = normalizedList.map((p) =>
      typeof p.capacity === 'number' && !isNaN(p.capacity) ? p.capacity : 60
    );

    const highest = scores.length > 0 ? Math.max(...scores) : 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    const average = scores.length > 0 ? Math.round((sum / scores.length) * 10) / 10 : 0;
    const totalCapacity = capacities.reduce((a, b) => a + b, 0);

    return { total: normalizedList.length, highest, average, totalCapacity };
  }, [normalizedList]);

  const handleOpenAdd = () => {
    setSelectedPG(null);
    setFormData({
      majorCode: `3${Math.floor(10000 + Math.random() * 90000)}`,
      cluster: 'Saintek',
      ptnName: uniquePTNs[0] || 'Universitas Indonesia',
      majorName: '',
      score: 675.0,
      capacity: 80,
      applicantCount: 1500,
      degreeLevel: 'S1',
      accreditation: 'Unggul',
      province: 'DKI Jakarta',
      status: 'active',
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (pg: PassingGradeConfig) => {
    const safeItem = normalizePassingGrade(pg);
    setSelectedPG(safeItem);
    setFormData({
      majorCode: safeItem.majorCode,
      cluster: safeItem.cluster,
      ptnName: safeItem.ptnName,
      majorName: safeItem.majorName,
      score: safeItem.score,
      capacity: safeItem.capacity,
      applicantCount: safeItem.applicantCount || 1000,
      degreeLevel: safeItem.degreeLevel || 'S1',
      accreditation: safeItem.accreditation || 'Unggul',
      province: safeItem.province || 'DKI Jakarta',
      status: safeItem.status || 'active',
    });
    setFormOpen(true);
  };

  const handleOpenSimulasi = (pg: PassingGradeConfig) => {
    const safeItem = normalizePassingGrade(pg);
    setSelectedPG(safeItem);
    const safeScore = !isNaN(safeItem.score) && safeItem.score > 0 ? safeItem.score : 650;
    setTestScore(Math.round(safeScore));
    setSimulasiOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.majorCode.trim() || !formData.ptnName.trim() || !formData.majorName.trim()) {
      return;
    }

    const safeCapacity = !isNaN(formData.capacity) && formData.capacity > 0 ? formData.capacity : 60;
    const safeApplicants = !isNaN(formData.applicantCount) && formData.applicantCount > 0 ? formData.applicantCount : 1200;
    const safeScore = !isNaN(formData.score) && formData.score > 0 ? formData.score : 650;

    const calculatedRate = `${((safeCapacity / safeApplicants) * 100).toFixed(2)}%`;

    const payload: Omit<PassingGradeConfig, 'id'> = {
      majorCode: formData.majorCode,
      cluster: formData.cluster,
      ptnName: formData.ptnName,
      majorName: formData.majorName,
      score: safeScore,
      capacity: safeCapacity,
      applicantCount: safeApplicants,
      competitionRate: calculatedRate,
      degreeLevel: formData.degreeLevel,
      accreditation: formData.accreditation,
      province: formData.province,
      status: formData.status,
      // Backward compatibility fields
      subject: `${formData.majorName} - ${formData.ptnName}`,
      levelId: 'lvl-3',
      levelName: 'SMA',
      minimumScore: safeScore,
      maximumScore: 1000,
      remedialThreshold: Math.max(0, safeScore - 40),
    };

    if (selectedPG) {
      updatePassingGrade(selectedPG.id, payload);
    } else {
      addPassingGrade(payload);
    }
    setFormOpen(false);
  };

  const safeTargetScore =
    selectedPG && typeof selectedPG.score === 'number' && !isNaN(selectedPG.score)
      ? selectedPG.score
      : 650;
  const safeTestScore = typeof testScore === 'number' && !isNaN(testScore) ? testScore : 650;
  const diff = safeTestScore - safeTargetScore;

  const columns: ColumnDef<PassingGradeConfig>[] = [
    {
      header: 'No',
      cell: (_row, index) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground w-6 text-center block">
          {(index ?? 0) + 1}
        </span>
      ),
      className: 'w-12 text-center',
    },
    {
      header: 'Kode Jurusan',
      accessorKey: 'majorCode',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
          {row.majorCode || '-'}
        </span>
      ),
    },
    {
      header: 'Kelompok',
      accessorKey: 'cluster',
      sortable: true,
      cell: (row) => {
        const cluster = row.cluster || 'Saintek';
        let badgeStyle =
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25';
        if (cluster === 'Soshum') {
          badgeStyle = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/25';
        } else if (cluster === 'Campuran') {
          badgeStyle = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25';
        } else if (cluster === 'Vokasi') {
          badgeStyle = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/25';
        }

        return (
          <span className={cn('px-2 py-0.5 rounded text-[11px] font-semibold border', badgeStyle)}>
            {cluster}
          </span>
        );
      },
    },
    {
      header: 'PTN - Jurusan',
      accessorKey: 'majorName',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-sm">
          <div className="text-xs font-bold text-foreground leading-snug">
            {row.ptnName || 'Perguruan Tinggi Negeri'}
          </div>
          <div className="text-xs font-semibold text-primary">
            {row.majorName || row.subject || '-'}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span className="font-medium px-1 rounded bg-muted border border-border">
              {row.degreeLevel || 'S1'}
            </span>
            {row.province && <span>{row.province}</span>}
          </div>
        </div>
      ),
    },
    {
      header: 'Nilai (Ambang Skor)',
      accessorKey: 'score',
      sortable: true,
      cell: (row) => {
        const rawScore = Number(row.score ?? row.minimumScore);
        const score = !isNaN(rawScore) && rawScore > 0 ? rawScore : 650;
        return (
          <div className="space-y-0.5">
            <span className="text-xs font-bold font-mono text-foreground px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
              {score.toFixed(2)}
            </span>
            <div className="text-[10px] text-muted-foreground">Skor UTBK Aman</div>
          </div>
        );
      },
    },
    {
      header: 'Daya Tampung',
      accessorKey: 'capacity',
      sortable: true,
      cell: (row) => {
        const cap = Number(row.capacity);
        const capacity = !isNaN(cap) && cap > 0 ? cap : 60;
        return (
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground">
              {capacity} <span className="font-normal text-[11px] text-muted-foreground">Kursi</span>
            </span>
            <div className="text-[10px] text-muted-foreground">Kuota Seleksi</div>
          </div>
        );
      },
    },
    {
      header: 'Peminat & Keketatan (Real Case)',
      accessorKey: 'applicantCount',
      sortable: true,
      cell: (row) => {
        const cap = Number(row.capacity) || 60;
        const app = Number(row.applicantCount) || 1200;
        const rate =
          row.competitionRate ||
          (app > 0 ? `${((cap / app) * 100).toFixed(2)}%` : '5.00%');
        const numRate = parseFloat(rate);
        const isVeryTight = !isNaN(numRate) && numRate <= 5.0;

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-bold text-foreground">{app.toLocaleString('id-ID')}</span>
              <span className="text-[11px] text-muted-foreground">Peminat</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.2 rounded border',
                  isVeryTight
                    ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                    : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                )}
                title="Persentase peluang diterima (Keketatan)"
              >
                Keketatan: {rate}
              </span>
              {row.accreditation && (
                <span className="text-[10px] font-medium px-1 rounded bg-muted text-muted-foreground border border-border">
                  {row.accreditation}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenSimulasi(row)}
            className="h-8 w-8 p-0 text-primary hover:bg-primary/10"
            title="Cek simulasi kelulusan nilai"
          >
            <Calculator className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenEdit(row)}
            className="h-8 w-8 p-0"
            title="Edit passing grade"
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
            title="Hapus passing grade"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header with Prominent Button Tambah Passing Grade */}
      <PageHeader
        title="Passing Grade Jurusan PTN"
        description="Ambang batas nilai skor aman UTBK/SNBT, kuota daya tampung, serta rasio keketatan persaingan seleksi masuk Perguruan Tinggi Negeri."
      >
        <Button onClick={handleOpenAdd} className="gap-2 font-semibold shadow-2xs">
          <Plus className="h-4 w-4" />
          <span>Tambah Passing Grade</span>
        </Button>
      </PageHeader>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Jurusan PTN</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.total} <span className="text-xs font-normal text-muted-foreground">Prodi</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Tersebar di berbagai PTN favorit</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Passing Grade Tertinggi</span>
          <div className="text-2xl font-bold tracking-tight text-primary font-mono">
            {stats.highest.toFixed(2)}
          </div>
          <p className="text-[11px] text-muted-foreground">Pendidikan Dokter UI</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Rata-rata Skor Aman</span>
          <div className="text-2xl font-bold tracking-tight text-foreground font-mono">
            {stats.average.toFixed(2)}
          </div>
          <p className="text-[11px] text-muted-foreground">Standar acuan evaluasi simulasi UTBK</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Daya Tampung</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.totalCapacity.toLocaleString('id-ID')}{' '}
            <span className="text-xs font-normal text-muted-foreground">Kursi</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Akumulasi kuota prodi terdaftar</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs shadow-2xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter:</span>
        </span>

        {/* Filter Kelompok */}
        <div className="w-44">
          <Select value={clusterFilter} onChange={(e) => setClusterFilter(e.target.value)}>
            <option value="all">Semua Kelompok</option>
            <option value="Saintek">Saintek (IPA/Teknologi)</option>
            <option value="Soshum">Soshum (IPS/Sosial)</option>
            <option value="Campuran">Campuran</option>
            <option value="Vokasi">Vokasi (D4/D3)</option>
          </Select>
        </div>

        {/* Filter PTN */}
        <div className="w-56">
          <Select value={ptnFilter} onChange={(e) => setPtnFilter(e.target.value)}>
            <option value="all">Semua Universitas PTN</option>
            {uniquePTNs.map((ptn) => (
              <option key={ptn} value={ptn}>
                {ptn}
              </option>
            ))}
          </Select>
        </div>

        {/* Filter Jenjang */}
        <div className="w-32">
          <Select value={degreeFilter} onChange={(e) => setDegreeFilter(e.target.value)}>
            <option value="all">Semua Jenjang</option>
            <option value="S1">Jenjang S1</option>
            <option value="D4">Jenjang D4</option>
            <option value="D3">Jenjang D3</option>
          </Select>
        </div>

        {/* Reset Filter */}
        {(clusterFilter !== 'all' || degreeFilter !== 'all' || ptnFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setClusterFilter('all');
              setDegreeFilter('all');
              setPtnFilter('all');
            }}
            className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </Button>
        )}
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredPassingGrades}
        columns={columns}
        searchKey="majorName"
        searchPlaceholder="Cari nama jurusan, universitas PTN, atau kode jurusan..."
      />

      {/* MODAL FORM TAMBAH / EDIT PASSING GRADE */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Award className="h-5 w-5 text-primary" />
                <span>
                  {selectedPG ? 'Edit Passing Grade Jurusan' : 'Tambah Passing Grade Jurusan Baru'}
                </span>
              </DialogTitle>
              <DialogDescription>
                Tentukan kode prodi, kelompok bidang, skor passing grade aman, serta kuota daya tampung.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kode Jurusan / Prodi *</label>
                <Input
                  required
                  placeholder="311101"
                  value={formData.majorCode}
                  onChange={(e) => setFormData({ ...formData, majorCode: e.target.value })}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kelompok Bidang *</label>
                <Select
                  value={formData.cluster}
                  onChange={(e) =>
                    setFormData({ ...formData, cluster: e.target.value as ClusterType })
                  }
                >
                  <option value="Saintek">Saintek (Sains & Teknologi)</option>
                  <option value="Soshum">Soshum (Sosial & Humaniora)</option>
                  <option value="Campuran">Campuran</option>
                  <option value="Vokasi">Vokasi (Terapan)</option>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Perguruan Tinggi Negeri (PTN) *
                </label>
                <Input
                  required
                  placeholder="Universitas Indonesia, Institut Teknologi Bandung, dll."
                  value={formData.ptnName}
                  onChange={(e) => setFormData({ ...formData, ptnName: e.target.value })}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Program Studi / Jurusan *
                </label>
                <Input
                  required
                  placeholder="Pendidikan Dokter, Teknik Informatika, Ilmu Hukum, dll."
                  value={formData.majorName}
                  onChange={(e) => setFormData({ ...formData, majorName: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Skor Passing Grade (Ambang Aman) *
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min={100}
                  max={1000}
                  required
                  value={isNaN(formData.score) ? '' : formData.score}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setFormData({ ...formData, score: isNaN(val) ? 0 : val });
                  }}
                  className="font-mono font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Daya Tampung (Kuota) *</label>
                <Input
                  type="number"
                  min={1}
                  max={2000}
                  required
                  value={isNaN(formData.capacity) ? '' : formData.capacity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFormData({ ...formData, capacity: isNaN(val) ? 0 : val });
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jumlah Peminat Tahun Lalu</label>
                <Input
                  type="number"
                  min={0}
                  max={50000}
                  value={isNaN(formData.applicantCount) ? '' : formData.applicantCount}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setFormData({ ...formData, applicantCount: isNaN(val) ? 0 : val });
                  }}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jenjang Program</label>
                <Select
                  value={formData.degreeLevel}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      degreeLevel: e.target.value as 'S1' | 'D4' | 'D3',
                    })
                  }
                >
                  <option value="S1">Sarjana (S1)</option>
                  <option value="D4">Sarjana Terapan (D4)</option>
                  <option value="D3">Diploma 3 (D3)</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Akreditasi Prodi</label>
                <Select
                  value={formData.accreditation}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      accreditation: e.target.value as 'Unggul' | 'A' | 'Baik Sekali' | 'Baik',
                    })
                  }
                >
                  <option value="Unggul">Unggul</option>
                  <option value="A">A</option>
                  <option value="Baik Sekali">Baik Sekali</option>
                  <option value="Baik">Baik</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Provinsi / Wilayah</label>
                <Input
                  placeholder="DKI Jakarta, Jawa Barat, Jawa Timur, dll."
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="font-semibold">
                {selectedPG ? 'Simpan Perubahan' : 'Tambahkan Passing Grade'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* SIMULASI NILAI DIALOG */}
      <Dialog open={simulasiOpen} onOpenChange={setSimulasiOpen}>
        <DialogContent maxWidth="max-w-md">
          {selectedPG && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span>Simulasi Peluang Lolos UTBK / SNBT</span>
                </DialogTitle>
                <DialogDescription>
                  Uji skor hasil tryout siswa terhadap ambang passing grade jurusan target.
                </DialogDescription>
              </DialogHeader>

              <div className="p-3.5 rounded-xl border border-border bg-card space-y-2">
                <div className="font-mono text-[11px] font-semibold text-primary">
                  Kode: {selectedPG.majorCode} • {selectedPG.cluster}
                </div>
                <div className="text-sm font-bold text-foreground">{selectedPG.majorName}</div>
                <div className="text-xs text-muted-foreground">{selectedPG.ptnName}</div>

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="text-muted-foreground">Passing Grade Acuan:</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {safeTargetScore.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Keketatan Seleksi:</span>
                  <span className="font-semibold text-foreground">
                    {selectedPG.competitionRate || '4.08%'} ({selectedPG.capacity} kursi dari{' '}
                    {(selectedPG.applicantCount || 1000).toLocaleString('id-ID')} peminat)
                  </span>
                </div>
              </div>

              {/* Input Score Slider / Number */}
              <div className="space-y-2">
                <label className="font-semibold text-foreground flex items-center justify-between">
                  <span>Masukkan Skor Hasil Ujian Siswa:</span>
                  <span className="font-mono font-bold text-primary text-sm">{safeTestScore}</span>
                </label>
                <input
                  type="range"
                  min={400}
                  max={900}
                  step={5}
                  value={safeTestScore}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTestScore(isNaN(val) ? 650 : val);
                  }}
                  className="w-full accent-primary cursor-pointer"
                />
              </div>

              {/* Result Status */}
              <div
                className={cn(
                  'p-3 rounded-lg border text-center space-y-1',
                  safeTestScore >= safeTargetScore
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200'
                    : safeTestScore >= safeTargetScore - 25
                    ? 'border-amber-500/40 bg-amber-500/10 text-amber-950 dark:text-amber-200'
                    : 'border-rose-500/40 bg-rose-500/10 text-rose-950 dark:text-rose-200'
                )}
              >
                <div className="font-bold text-xs">
                  {safeTestScore >= safeTargetScore
                    ? 'Peluang Lolos: AMAN / TINGGI (MEMENUHI PASSING GRADE)'
                    : safeTestScore >= safeTargetScore - 25
                    ? 'Peluang Lolos: CUKUP / WAJIB TINGKATKAN SEDIKIT LAGI'
                    : 'Peluang Lolos: RISIKO TINGGI (DI BAWAH AMBANG AMAN)'}
                </div>
                <p className="text-[11px] opacity-90">
                  Selisih terhadap target:{' '}
                  <strong>
                    {diff >= 0 ? '+' : ''}
                    {diff.toFixed(2)} Poin
                  </strong>
                </p>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSimulasiOpen(false)}>
                  Tutup Simulasi
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Passing Grade"
        description={`Apakah Anda yakin ingin menghapus data passing grade untuk prodi "${selectedPG?.majorName} - ${selectedPG?.ptnName}"?`}
        onConfirm={() => {
          if (selectedPG) {
            deletePassingGrade(selectedPG.id);
          }
        }}
      />
    </div>
  );
}
