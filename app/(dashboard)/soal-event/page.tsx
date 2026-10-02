'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileSpreadsheet,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  BookOpen,
  CheckCircle2,
  Filter,
  Search,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useExamStore } from '@/store/useExamStore';
import { EventQuestionAssignment, QuestionItem } from '@/types';

function SoalEventContent() {
  const searchParams = useSearchParams();
  const initialEventId = searchParams.get('eventId');

  const {
    events,
    questions,
    eventQuestionAssignments,
    assignMultipleQuestionsToEvent,
    removeQuestionFromEvent,
    moveQuestionOrder,
  } = useExamStore();

  const [selectedEventId, setSelectedEventId] = React.useState<string>(
    initialEventId || events[0]?.id || ''
  );
  const [addModalOpen, setAddModalOpen] = React.useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = React.useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    React.useState<EventQuestionAssignment | null>(null);

  // Bank Soal picker filters inside modal
  const [modalSubjectFilter, setModalSubjectFilter] = React.useState<string>('all');
  const [modalTypeFilter, setModalTypeFilter] = React.useState<string>('all');
  const [modalSearchQuery, setModalSearchQuery] = React.useState<string>('');
  const [selectedQuestionIdsToAdd, setSelectedQuestionIdsToAdd] = React.useState<string[]>([]);

  const currentEvent = events.find((e) => e.id === selectedEventId) || events[0];

  // List of question assignments for the selected event, sorted by orderNumber
  const assignedList = React.useMemo(() => {
    if (!currentEvent) return [];
    return eventQuestionAssignments
      .filter((a) => a.eventId === currentEvent.id)
      .sort((a, b) => a.orderNumber - b.orderNumber);
  }, [eventQuestionAssignments, currentEvent]);

  // Set of question IDs already in this event
  const assignedQuestionIds = React.useMemo(() => {
    return new Set(assignedList.map((a) => a.questionId));
  }, [assignedList]);

  // Available questions from Bank Soal that are NOT yet in this event
  const availableQuestions = React.useMemo(() => {
    return questions.filter((q) => {
      if (assignedQuestionIds.has(q.id)) return false;
      const matchSubject = modalSubjectFilter === 'all' || q.subject === modalSubjectFilter;
      const matchType = modalTypeFilter === 'all' || q.type === modalTypeFilter;
      const matchSearch =
        !modalSearchQuery.trim() ||
        q.prompt.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
        q.code.toLowerCase().includes(modalSearchQuery.toLowerCase());
      return matchSubject && matchType && matchSearch;
    });
  }, [questions, assignedQuestionIds, modalSubjectFilter, modalTypeFilter, modalSearchQuery]);

  const uniqueSubjects = React.useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.subject)));
  }, [questions]);

  const handleOpenAddModal = () => {
    setSelectedQuestionIdsToAdd([]);
    setModalSearchQuery('');
    setModalSubjectFilter('all');
    setModalTypeFilter('all');
    setAddModalOpen(true);
  };

  const handleConfirmAddQuestions = () => {
    if (!currentEvent || selectedQuestionIdsToAdd.length === 0) return;
    assignMultipleQuestionsToEvent(currentEvent.id, selectedQuestionIdsToAdd);
    setAddModalOpen(false);
  };

  const handleMove = (assignmentId: string, direction: 'up' | 'down') => {
    if (!currentEvent) return;
    moveQuestionOrder(currentEvent.id, assignmentId, direction);
  };

  const handleConfirmRemove = () => {
    if (selectedAssignment) {
      removeQuestionFromEvent(selectedAssignment.id);
      setSelectedAssignment(null);
    }
  };

  // Stats
  const pgCount = assignedList.filter((a) => a.questionType === 'PG').length;
  const esaiCount = assignedList.filter((a) => a.questionType === 'ESAI').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Soal Event (Pemetaan Ujian)"
        description="Pilih jadwal event, petakan butir soal dari Bank Soal terstandarisasi, dan atur nomor urut pengerjaan."
      >
        <Button onClick={handleOpenAddModal} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Tambah Soal ke Event</span>
        </Button>
      </PageHeader>

      {/* Event Selection & Context */}
      <Card className="bg-card border-border/80 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Pilih Jadwal Event Ujian:</span>
            <div className="w-full sm:w-96">
              <Select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
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
                <span className="text-muted-foreground text-[11px]">Total Soal Terkunci</span>
                <span className="font-bold text-foreground text-sm">
                  {assignedList.length} Butir
                </span>
              </div>
              <div className="h-7 w-[1px] bg-border" />
              <div className="flex flex-col">
                <span className="text-muted-foreground text-[11px]">Komposisi</span>
                <span className="font-medium text-foreground">
                  {pgCount} PG / {esaiCount} Esai
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

      {/* Mapped Questions Table */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Daftar Soal Ter-Mapping pada Event Ini
            </h3>
            <p className="text-xs text-muted-foreground">
              Gunakan tombol panah untuk mengubah nomor urut soal pengerjaan siswa.
            </p>
          </div>
          <span className="text-xs text-muted-foreground font-mono">
            {assignedList.length} Soal
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/40 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="p-3 w-16 text-center">No. Urut</th>
                <th className="p-3 w-28">Urutan</th>
                <th className="p-3">Pertanyaan & Cuplikan Soal</th>
                <th className="p-3 w-32">Mata Pelajaran</th>
                <th className="p-3 w-24">Tipe</th>
                <th className="p-3 w-28">Tingkat</th>
                <th className="p-3 w-20 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {assignedList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <p>Belum ada butir soal yang dipetakan ke event ini.</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleOpenAddModal}
                        className="text-xs gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Pilih dari Bank Soal</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                assignedList.map((item, index) => {
                  const isFirst = index === 0;
                  const isLast = index === assignedList.length - 1;

                  return (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-center font-bold text-foreground">
                        {item.orderNumber}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isFirst}
                            onClick={() => handleMove(item.id, 'up')}
                            className="h-6 w-6 p-0 disabled:opacity-30"
                            title="Pindah ke atas"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isLast}
                            onClick={() => handleMove(item.id, 'down')}
                            className="h-6 w-6 p-0 disabled:opacity-30"
                            title="Pindah ke bawah"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-foreground line-clamp-2 max-w-xl">
                          {item.questionPrompt}
                        </p>
                      </td>
                      <td className="p-3 text-muted-foreground">{item.subject}</td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-muted text-foreground border border-border">
                          {item.questionType}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="px-1.5 py-0.5 rounded text-[11px] font-medium border border-border">
                          {item.difficulty}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAssignment(item);
                            setDeleteConfirmOpen(true);
                          }}
                          className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          title="Hapus dari event"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Add Questions from Bank Soal Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent maxWidth="max-w-3xl">
          <div className="space-y-4 text-xs max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Pilih Soal dari Bank Soal</DialogTitle>
              <DialogDescription>
                Centang soal yang ingin dipetakan ke &ldquo;{currentEvent?.title}&rdquo;. Soal di Bank Soal tidak akan terhapus.
              </DialogDescription>
            </DialogHeader>

            {/* Filter toolbar inside modal */}
            <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-lg border border-border bg-muted/20">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={modalSearchQuery}
                  onChange={(e) => setModalSearchQuery(e.target.value)}
                  placeholder="Cari pertanyaan..."
                  className="h-8 pl-8 text-xs"
                />
              </div>
              <div className="w-36">
                <Select
                  value={modalSubjectFilter}
                  onChange={(e) => setModalSubjectFilter(e.target.value)}
                  className="h-8 text-xs"
                >
                  <option value="all">Semua Mapel</option>
                  {uniqueSubjects.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="w-28">
                <Select
                  value={modalTypeFilter}
                  onChange={(e) => setModalTypeFilter(e.target.value)}
                  className="h-8 text-xs"
                >
                  <option value="all">Semua Tipe</option>
                  <option value="PG">PG</option>
                  <option value="ESAI">Esai</option>
                </Select>
              </div>
            </div>

            {/* Questions Table */}
            <div className="flex-1 overflow-y-auto rounded-lg border border-border max-h-96">
              <table className="w-full text-xs text-left">
                <thead className="sticky top-0 bg-muted border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-2.5 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          availableQuestions.length > 0 &&
                          selectedQuestionIdsToAdd.length === availableQuestions.length
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIdsToAdd(availableQuestions.map((q) => q.id));
                          } else {
                            setSelectedQuestionIdsToAdd([]);
                          }
                        }}
                      />
                    </th>
                    <th className="p-2.5 w-28">Kode & Mapel</th>
                    <th className="p-2.5">Teks Soal</th>
                    <th className="p-2.5 w-16">Tipe</th>
                    <th className="p-2.5 w-20">Kesulitan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {availableQuestions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="h-28 text-center text-muted-foreground">
                        Tidak ada soal di Bank Soal yang cocok dengan kriteria atau seluruh soal sudah ter-mapping.
                      </td>
                    </tr>
                  ) : (
                    availableQuestions.map((q) => {
                      const isChecked = selectedQuestionIdsToAdd.includes(q.id);
                      return (
                        <tr
                          key={q.id}
                          className={`hover:bg-muted/30 transition-colors ${
                            isChecked ? 'bg-secondary/40' : ''
                          }`}
                        >
                          <td className="p-2.5 text-center">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedQuestionIdsToAdd([...selectedQuestionIdsToAdd, q.id]);
                                } else {
                                  setSelectedQuestionIdsToAdd(
                                    selectedQuestionIdsToAdd.filter((id) => id !== q.id)
                                  );
                                }
                              }}
                            />
                          </td>
                          <td className="p-2.5">
                            <div className="font-mono text-[11px] font-semibold">{q.code}</div>
                            <div className="text-[10px] text-muted-foreground">{q.subject}</div>
                          </td>
                          <td className="p-2.5">
                            <p className="line-clamp-2 text-foreground font-medium">{q.prompt}</p>
                          </td>
                          <td className="p-2.5 font-semibold">{q.type}</td>
                          <td className="p-2.5 text-muted-foreground">{q.difficulty}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <div className="flex items-center justify-between w-full">
                <span className="text-muted-foreground text-xs">
                  {selectedQuestionIdsToAdd.length} butir soal dipilih
                </span>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                    Batal
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmAddQuestions}
                    disabled={selectedQuestionIdsToAdd.length === 0}
                  >
                    Tambahkan ke Event
                  </Button>
                </div>
              </div>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Confirmation */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Hapus Soal dari Event"
        description="Apakah Anda yakin ingin mengeluarkan butir soal ini dari Event ujian? Soal asli di Bank Soal tetap tersimpan aman."
        confirmLabel="Ya, Keluarkan"
        onConfirm={handleConfirmRemove}
      />
    </div>
  );
}

export default function SoalEventPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Memuat pemetaan soal event...
        </div>
      }
    >
      <SoalEventContent />
    </React.Suspense>
  );
}
