'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  School,
  ArrowRight,
  Plus,
  Clock,
  KeyRound,
  CheckCircle2,
  TrendingUp,
  Award,
  ShieldCheck,
  FileSpreadsheet,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import { useMasterStore } from '@/store/useMasterStore';
import { useUserStore } from '@/store/useUserStore';
import { useExamStore } from '@/store/useExamStore';
import { useConfigStore } from '@/store/useConfigStore';

export default function DashboardPage() {
  const { schools, branches } = useMasterStore();
  const { participants } = useUserStore();
  const { events, questions, examResults } = useExamStore();
  const { appConfig } = useConfigStore();

  const activeEvents = events.filter((e) => e.status === 'active');
  const passingResults = examResults.filter((r) => r.status === 'Lulus');
  const passRate =
    examResults.length > 0
      ? Math.round((passingResults.length / examResults.length) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Top Welcome & KPI Header */}
      <PageHeader
        title="Ringkasan Operasional Ujian"
        description="Pantau kesiapan master institusi, bank soal, jadwal event, dan integritas pelaksanaan CBT secara real-time."
      >
        <Link href="/event">
          <Button variant="default" className="gap-2">
            <Plus className="h-4 w-4" />
            <span>Buat Event Baru</span>
          </Button>
        </Link>
        <Link href="/bank-soal">
          <Button variant="outline" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span>Bank Soal</span>
          </Button>
        </Link>
      </PageHeader>

      {/* Metric Cards - Strict AntiSlop: No colored circles behind icons, soft square radius */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Institusi & Cabang</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {schools.length} <span className="text-xs font-normal text-muted-foreground">Sekolah</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Tersebar di {branches.length} kantor cabang wilayah
                </p>
              </div>
              <School className="h-5 w-5 text-primary shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Card 2 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Total Peserta Terdaftar</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {participants.length} <span className="text-xs font-normal text-muted-foreground">Siswa</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {participants.filter((p) => p.status === 'active').length} akun peserta aktif
                </p>
              </div>
              <GraduationCap className="h-5 w-5 text-primary shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Card 3 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Repositori Bank Soal</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {questions.length} <span className="text-xs font-normal text-muted-foreground">Butir Soal</span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {questions.filter((q) => q.type === 'PG').length} PG / {questions.filter((q) => q.type === 'ESAI').length} Esai terstandarisasi
                </p>
              </div>
              <BookOpen className="h-5 w-5 text-primary shrink-0" />
            </div>
          </CardContent>
        </Card>

        {/* Card 4 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Tingkat Kelulusan Rekap</span>
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  {passRate}%
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {passingResults.length} dari {examResults.length} ujian terekam memenuhi KKM
                </p>
              </div>
              <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Live Events & Quick Workflows */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Active & Scheduled Exam Events */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-base font-semibold text-foreground tracking-tight">
                Event Ujian Terkini
              </h2>
              <p className="text-xs text-muted-foreground">
                Daftar jadwal ujian yang sedang aktif atau dalam masa persiapan.
              </p>
            </div>
            <Link href="/event">
              <Button variant="ghost" size="sm" className="text-xs text-primary font-medium gap-1">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>

          <div className="space-y-3">
            {events.map((event) => (
              <Card key={event.id} className="p-4 transition-all hover:border-primary/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-foreground">
                        {event.title}
                      </h3>
                      <StatusBadge status={event.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                        {event.durationMinutes} Menit
                      </span>
                      <span className="flex items-center gap-1 font-mono font-medium text-foreground">
                        <KeyRound className="h-3.5 w-3.5 text-primary" />
                        Token: {event.token}
                      </span>
                      <span>
                        {event.assignedQuestionCount} Soal ter-mapping
                      </span>
                      <span>
                        {event.registeredParticipantCount} Peserta
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/soal-event?eventId=${event.id}`}>
                      <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                        <FileSpreadsheet className="h-3.5 w-3.5" />
                        <span>Mapping Soal</span>
                      </Button>
                    </Link>
                    <Link href={`/pendaftaran?eventId=${event.id}`}>
                      <Button variant="secondary" size="sm" className="text-xs h-8">
                        Daftarkan Siswa
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Quick Workflow & RBAC Status */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Alur Kerja Cepat (Workflow)</CardTitle>
              <CardDescription>
                Langkah standar mempersiapkan siklus ujian CBT baru.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <Link
                href="/bank-soal"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-foreground">1. Siapkan Bank Soal</div>
                  <div className="text-muted-foreground text-[11px]">Input butir soal pilihan ganda atau esai</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/event"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-foreground">2. Jadwalkan Event</div>
                  <div className="text-muted-foreground text-[11px]">Atur durasi, token acak, dan aturan ujian</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/soal-event"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-foreground">3. Mapping Soal Event</div>
                  <div className="text-muted-foreground text-[11px]">Kunci soal dari bank ke event spesifik</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>

              <Link
                href="/pendaftaran"
                className="flex items-center justify-between p-3 rounded-lg border border-border/70 hover:bg-muted/40 transition-colors"
              >
                <div>
                  <div className="font-semibold text-foreground">4. Daftarkan Peserta</div>
                  <div className="text-muted-foreground text-[11px]">Tetapkan siswa yang berhak mengikuti tes</div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-xs">
                <ShieldCheck className="h-4 w-4" />
                <span>Simulasi Hak Akses (RBAC)</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Anda dapat mengganti peran aktif melalui selector di header atas untuk menguji isolasi data antara Super Admin, Operator Sekolah, dan Guru.
              </p>
              <Link href="/menu">
                <Button variant="outline" size="sm" className="w-full text-xs h-7 mt-1 bg-card">
                  Kelola Matriks Hak Akses
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
