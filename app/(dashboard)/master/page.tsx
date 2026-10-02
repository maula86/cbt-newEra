'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  SlidersHorizontal,
  CalendarDays,
  Layers,
  Target,
  School,
  Building2,
  ShieldCheck,
  Award,
  FileQuestion,
  ListOrdered,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { useMasterStore } from '@/store/useMasterStore';

export default function MasterHubPage() {
  const {
    schools,
    branches,
    academicYears,
    educationalLevels,
    examTypes,
    userRoles,
    passingGrades,
    questionTypes,
    testTypes,
    weightConfigs,
  } = useMasterStore();

  const masterCards = [
    {
      title: 'Sekolah',
      description: 'Unit sekolah pelaksana ujian dan kontak kepala sekolah.',
      count: `${schools.length} Unit`,
      href: '/master/sekolah',
      icon: School,
    },
    {
      title: 'Cabang Wilayah',
      description: 'Wilayah administratif koordinasi sekolah.',
      count: `${branches.length} Cabang`,
      href: '/master/cabang',
      icon: Building2,
    },
    {
      title: 'Tahun Pelajaran',
      description: 'Kalender periode akademik semester ganjil dan genap.',
      count: `${academicYears.length} Periode`,
      href: '/master/tahun-pelajaran',
      icon: CalendarDays,
    },
    {
      title: 'Jenjang Pendidikan',
      description: 'Tingkatan pendidikan SD, SMP, SMA, dan SMK.',
      count: `${educationalLevels.length} Jenjang`,
      href: '/master/jenjang',
      icon: Layers,
    },
    {
      title: 'Tipe Ujian',
      description: 'Kategori asesmen (PTS, PAS, UTBK, US).',
      count: `${examTypes.length} Tipe`,
      href: '/master/tipe-ujian',
      icon: Target,
    },
    {
      title: 'Role User',
      description: 'Definisi peran dan hak akses pengguna.',
      count: `${userRoles.length} Peran`,
      href: '/master/role-user',
      icon: ShieldCheck,
    },
    {
      title: 'Passing Grade',
      description: 'Nilai ambang batas KKM per mata pelajaran.',
      count: `${passingGrades.length} Aturan`,
      href: '/master/passing-grade',
      icon: Award,
    },
    {
      title: 'Tipe Soal',
      description: 'Format butir soal pilihan ganda atau uraian.',
      count: `${questionTypes.length} Tipe`,
      href: '/master/tipe-soal',
      icon: FileQuestion,
    },
    {
      title: 'Tipe Tes',
      description: 'Instrumen evaluasi akademik atau psikotes.',
      count: `${testTypes.length} Instrumen`,
      href: '/master/tipe-tes',
      icon: ListOrdered,
    },
    {
      title: 'Config Bobot',
      description: 'Persentase bobot nilai PG, esai, dan minus salah.',
      count: `${weightConfigs.length} Aturan`,
      href: '/master/config-bobot',
      icon: SlidersHorizontal,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pusat Konfigurasi Master Data"
        description="Kelola seluruh parameter fondasi institusi, jenis evaluasi, jenjang, dan standarisasi ujian CBT."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {masterCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group">
              <Card className="h-full transition-all group-hover:border-primary/50 group-hover:shadow-sm">
                <CardContent className="p-5 flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                        {card.count}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                        {card.title}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center text-xs font-medium text-primary gap-1 pt-2 border-t border-border/40">
                    <span>Buka Pengaturan</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
