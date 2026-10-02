'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  UserCheck,
  UserMinus,
  CheckCircle2,
  Users,
  Search,
  School,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/shared/status-badge';
import { useExamStore } from '@/store/useExamStore';
import { useUserStore } from '@/store/useUserStore';
import { useMasterStore } from '@/store/useMasterStore';
import { Participant } from '@/types';

function PendaftaranContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId');

  const {
    events,
    registrations,
    registerParticipantToEvent,
    bulkRegisterParticipants,
    unregisterParticipantFromEvent,
  } = useExamStore();
  const { participants } = useUserStore();
  const { schools } = useMasterStore();

  const [selectedEventId, setSelectedEventId] = React.useState<string>(
    initialEventId || events[0]?.id || ''
  );
  const [activeTab, setActiveTab] = React.useState<string>('unregistered');
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [schoolFilter, setSchoolFilter] = React.useState<string>('all');
  const [selectedUnregisteredIds, setSelectedUnregisteredIds] = React.useState<string[]>([]);

  // Current active event
  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // Set of registered participant IDs for this event
  const registeredParticipantIds = React.useMemo(() => {
    return new Set(
      registrations
        .filter((r) => r.eventId === currentEvent?.id)
        .map((r) => r.participantId)
    );
  }, [registrations, currentEvent]);

  // List of participants already registered
  const registeredList = React.useMemo(() => {
    return participants
      .filter((p) => registeredParticipantIds.has(p.id))
      .filter((p) => {
        const matchSchool = schoolFilter === 'all' || p.schoolId === schoolFilter;
        const matchQuery =
          !searchQuery.trim() ||
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nisn.includes(searchQuery);
        return matchSchool && matchQuery;
      });
  }, [participants, registeredParticipantIds, schoolFilter, searchQuery]);

  // List of participants not yet registered
  const unregisteredList = React.useMemo(() => {
    return participants
      .filter((p) => !registeredParticipantIds.has(p.id))
      .filter((p) => {
        const matchSchool = schoolFilter === 'all' || p.schoolId === schoolFilter;
        const matchQuery =
          !searchQuery.trim() ||
          p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nisn.includes(searchQuery);
        return matchSchool && matchQuery;
      });
  }, [participants, registeredParticipantIds, schoolFilter, searchQuery]);

  const handleRegisterSingle = (participantId: string) => {
    if (!currentEvent) return;
    registerParticipantToEvent(currentEvent.id, participantId);
  };

  const handleRegisterBulk = () => {
    if (!currentEvent || selectedUnregisteredIds.length === 0) return;
    bulkRegisterParticipants(currentEvent.id, selectedUnregisteredIds);
    setSelectedUnregisteredIds([]);
  };

  const handleRegisterAllFiltered = () => {
    if (!currentEvent || unregisteredList.length === 0) return;
    bulkRegisterParticipants(
      currentEvent.id,
      unregisteredList.map((p) => p.id)
    );
    setSelectedUnregisteredIds([]);
  };

  const handleUnregister = (participantId: string) => {
    if (!currentEvent) return;
    unregisterParticipantFromEvent(currentEvent.id, participantId);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pendaftaran Peserta ke Event"
        description="Petakan dan daftarkan rombongan belajar atau siswa individual ke dalam jadwal ujian CBT tertentu."
      />

      {/* Event Selector Banner */}
      <Card className="bg-card border-border/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Pilih Jadwal Event Ujian:</span>
            <div className="w-full sm:w-96">
              <Select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setSelectedUnregisteredIds([]);
                }}
                className="font-medium text-xs sm:text-sm"
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.academicYear})
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {currentEvent && (
            <div className="flex items-center gap-4 text-xs">
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[11px]">Token Ujian</span>
                <span className="font-mono font-bold text-foreground text-sm">
                  {currentEvent.token}
                </span>
              </div>
              <div className="h-7 w-[1px] bg-border" />
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[11px]">Durasi</span>
                <span className="font-medium text-foreground">
                  {currentEvent.durationMinutes} Menit
                </span>
              </div>
              <div className="h-7 w-[1px] bg-border" />
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[11px]">Status</span>
                <StatusBadge status={currentEvent.status} />
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari siswa atau NISN..."
              className="pl-8 text-xs"
            />
          </div>
          <div className="w-48 shrink-0">
            <Select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              className="text-xs h-9"
            >
              <option value="all">Semua Sekolah</option>
              {schools.map((sch) => (
                <option key={sch.id} value={sch.id}>
                  {sch.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {activeTab === 'unregistered' && (
          <div className="flex items-center gap-2">
            {selectedUnregisteredIds.length > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={handleRegisterBulk}
                className="gap-1.5 text-xs h-9"
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Daftarkan Terpilih ({selectedUnregisteredIds.length})</span>
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRegisterAllFiltered}
              disabled={unregisteredList.length === 0}
              className="text-xs h-9"
            >
              Daftarkan Semua ({unregisteredList.length})
            </Button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="unregistered">
            Belum Terdaftar ({unregisteredList.length})
          </TabsTrigger>
          <TabsTrigger value="registered">
            Sudah Terdaftar ({registeredList.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Belum Terdaftar */}
        <TabsContent value="unregistered" className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          unregisteredList.length > 0 &&
                          selectedUnregisteredIds.length === unregisteredList.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUnregisteredIds(unregisteredList.map((p) => p.id));
                          } else {
                            setSelectedUnregisteredIds([]);
                          }
                        }}
                        className="rounded border-border"
                      />
                    </th>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">L/P</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Sekolah</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {unregisteredList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="h-28 text-center text-muted-foreground">
                        Semua siswa yang sesuai filter sudah terdaftar pada event ini.
                      </td>
                    </tr>
                  ) : (
                    unregisteredList.map((p) => {
                      const isChecked = selectedUnregisteredIds.includes(p.id);
                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isChecked ? 'bg-secondary/40' : ''
                          }`}
                        >
                          <td className="p-3 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUnregisteredIds([...selectedUnregisteredIds, p.id]);
                                } else {
                                  setSelectedUnregisteredIds(
                                    selectedUnregisteredIds.filter((id) => id !== p.id)
                                  );
                                }
                              }}
                              className="rounded border-border"
                            />
                          </td>
                          <td className="p-3 font-mono font-medium">{p.nisn}</td>
                          <td className="p-3 font-semibold text-foreground">{p.fullName}</td>
                          <td className="p-3">{p.gender}</td>
                          <td className="p-3 font-medium">{p.className}</td>
                          <td className="p-3 text-muted-foreground">{p.schoolName}</td>
                          <td className="p-3 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRegisterSingle(p.id)}
                              className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                            >
                              <UserCheck className="h-3 w-3" />
                              <span>Daftarkan</span>
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Sudah Terdaftar */}
        <TabsContent value="registered" className="space-y-4">
          <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
                  <tr>
                    <th className="p-3">NISN</th>
                    <th className="p-3">Nama Lengkap</th>
                    <th className="p-3">Kelas</th>
                    <th className="p-3">Sekolah</th>
                    <th className="p-3">Waktu Registrasi</th>
                    <th className="p-3">Status Kehadiran</th>
                    <th className="p-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {registeredList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="h-28 text-center text-muted-foreground">
                        Belum ada peserta yang didaftarkan ke event ini.
                      </td>
                    </tr>
                  ) : (
                    registeredList.map((p) => {
                      const regInfo = registrations.find(
                        (r) => r.eventId === currentEvent?.id && r.participantId === p.id
                      );
                      return (
                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                          <td className="p-3 font-mono font-medium">{p.nisn}</td>
                          <td className="p-3 font-semibold text-foreground">{p.fullName}</td>
                          <td className="p-3 font-medium">{p.className}</td>
                          <td className="p-3 text-muted-foreground">{p.schoolName}</td>
                          <td className="p-3 text-muted-foreground">
                            {regInfo?.registeredAt || '-'}
                          </td>
                          <td className="p-3">
                            <StatusBadge status={regInfo?.attendanceStatus || 'Belum Hadir'} />
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUnregister(p.id)}
                              className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                            >
                              Keluarkan
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PendaftaranPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Memuat data pendaftaran...
        </div>
      }
    >
      <PendaftaranContent />
    </React.Suspense>
  );
}
