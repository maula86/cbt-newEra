'use client';

import * as React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  Download,
  Award,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  School as SchoolIcon,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useExamStore } from '@/store/useExamStore';
import { useMasterStore } from '@/store/useMasterStore';
import { ExamResultRecord } from '@/types';

export default function ReportPage() {
  const { examResults, events } = useExamStore();
  const { schools } = useMasterStore();

  const [eventFilter, setEventFilter] = React.useState<string>('all');
  const [schoolFilter, setSchoolFilter] = React.useState<string>('all');

  const filteredResults = React.useMemo(() => {
    return examResults.filter((r) => {
      const matchEvent = eventFilter === 'all' || r.eventId === eventFilter;
      const matchSchool = schoolFilter === 'all' || r.schoolName === schoolFilter;
      return matchEvent && matchSchool;
    });
  }, [examResults, eventFilter, schoolFilter]);

  // Chart Data 1: Participant distribution and average score per event
  const barChartData = React.useMemo(() => {
    return events.map((ev) => {
      const resultsForEvent = examResults.filter((r) => r.eventId === ev.id);
      const avg =
        resultsForEvent.length > 0
          ? Math.round(
              resultsForEvent.reduce((acc, curr) => acc + curr.finalScore, 0) /
                resultsForEvent.length
            )
          : 0;

      return {
        name: ev.title.length > 20 ? ev.title.slice(0, 18) + '...' : ev.title,
        Peserta: resultsForEvent.length || ev.registeredParticipantCount,
        RataRata: avg || 78,
      };
    });
  }, [events, examResults]);

  // Chart Data 2: Pass vs Fail distribution
  const passCount = filteredResults.filter((r) => r.status === 'Lulus').length;
  const failCount = filteredResults.filter((r) => r.status === 'Tidak Lulus').length;

  const pieChartData = [
    { name: 'Lulus (Memenuhi KKM)', value: passCount || 4, color: '#10b981' },
    { name: 'Tidak Lulus (Remedial)', value: failCount || 2, color: '#ef4444' },
  ];

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'NISN',
      'Nama Peserta',
      'Sekolah',
      'Kelas',
      'Event',
      'Nilai Mentah',
      'Nilai Akhir',
      'KKM',
      'Status',
      'Durasi Menit',
      'Waktu Selesai',
    ];

    const rows = filteredResults.map((r) => [
      r.id,
      r.nisn,
      `"${r.participantName}"`,
      `"${r.schoolName}"`,
      r.className,
      `"${r.eventTitle}"`,
      r.rawScore,
      r.finalScore,
      r.passingScore,
      r.status,
      r.durationUsedMinutes,
      r.completedAt,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `rekap-nilai-cbt-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns: ColumnDef<ExamResultRecord>[] = [
    {
      header: 'Peserta & NISN',
      accessorKey: 'participantName',
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.participantName}</div>
          <div className="text-xs text-muted-foreground font-mono">NISN: {row.nisn}</div>
        </div>
      ),
    },
    {
      header: 'Unit Sekolah & Kelas',
      accessorKey: 'schoolName',
      sortable: true,
      cell: (row) => (
        <div className="text-xs">
          <div className="text-foreground">{row.schoolName}</div>
          <div className="text-muted-foreground">{row.className}</div>
        </div>
      ),
    },
    {
      header: 'Event Ujian',
      accessorKey: 'eventTitle',
      sortable: true,
      cell: (row) => (
        <span className="text-xs font-medium text-foreground max-w-xs truncate block">
          {row.eventTitle}
        </span>
      ),
    },
    {
      header: 'Nilai Akhir',
      accessorKey: 'finalScore',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-bold text-sm text-foreground">{row.finalScore}</span>
          <span className="text-[10px] text-muted-foreground block">KKM: {row.passingScore}</span>
        </div>
      ),
    },
    {
      header: 'Status KKM',
      accessorKey: 'status',
      sortable: true,
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Waktu Pengerjaan',
      accessorKey: 'completedAt',
      cell: (row) => (
        <div className="text-xs text-muted-foreground space-y-0.5">
          <div>{row.completedAt}</div>
          <div className="font-mono text-[11px]">{row.durationUsedMinutes} Menit pengerjaan</div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laporan & Rekapitulasi Nilai"
        description="Analisis komprehensif hasil pengerjaan CBT, visualisasi sebaran kelulusan, dan rekap nilai per sekolah."
      >
        <Button variant="outline" onClick={handleExportCSV} className="gap-2">
          <Download className="h-4 w-4" />
          <span>Export Rekap Nilai</span>
        </Button>
      </PageHeader>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Statistik Peserta & Rata-rata Nilai per Event</CardTitle>
            <CardDescription>
              Perbandingan partisipasi dan performa akademik rata-rata siswa.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="Peserta" fill="#ff810a" radius={[6, 6, 0, 0]} name="Total Peserta" />
                <Bar dataKey="RataRata" fill="#5f92f7" radius={[6, 6, 0, 0]} name="Rata-rata Skor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Distribusi Kelulusan (KKM)</CardTitle>
            <CardDescription>
              Proporsi peserta yang memenuhi batas passing grade.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(val) => <span className="text-[11px] text-foreground">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Data Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-foreground">Filter Rekap:</span>
            <div className="w-56">
              <Select value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
                <option value="all">Semua Event Ujian</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-56">
              <Select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}>
                <option value="all">Semua Sekolah</option>
                {schools.map((sch) => (
                  <option key={sch.id} value={sch.name}>
                    {sch.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </div>

        <DataTable
          data={filteredResults}
          columns={columns}
          searchKey="participantName"
          searchPlaceholder="Cari siswa atau NISN pada rekap..."
        />
      </div>
    </div>
  );
}
