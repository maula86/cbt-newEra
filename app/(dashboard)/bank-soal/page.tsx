'use client';

import * as React from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  CheckCircle,
  HelpCircle,
  Tag,
  Sparkles,
  FileText,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { DataTable, ColumnDef } from '@/components/shared/data-table';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useExamStore } from '@/store/useExamStore';
import { QuestionItem, QuestionOption, QuestionOptionLetter } from '@/types';

export default function BankSoalPage() {
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useExamStore();

  const [formOpen, setFormOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState<QuestionItem | null>(null);

  // Filters
  const [subjectFilter, setSubjectFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>('all');

  // Dynamic Question Form State
  const [formCode, setFormCode] = React.useState('');
  const [formSubject, setFormSubject] = React.useState('Matematika Wajib');
  const [formType, setFormType] = React.useState<'PG' | 'ESAI'>('PG');
  const [formDifficulty, setFormDifficulty] = React.useState<'Mudah' | 'Sedang' | 'Sukar'>('Sedang');
  const [formPrompt, setFormPrompt] = React.useState('');
  const [formPoints, setFormPoints] = React.useState(4);
  const [formTags, setFormTags] = React.useState('Aljabar, Logika');
  const [formAuthor, setFormAuthor] = React.useState('Guru Pengampu');

  // PG Options
  const [options, setOptions] = React.useState<{ [key in QuestionOptionLetter]: string }>({
    A: '',
    B: '',
    C: '',
    D: '',
    E: '',
  });
  const [correctAnswer, setCorrectAnswer] = React.useState<QuestionOptionLetter>('A');

  // Essay Rubric
  const [rubric, setRubric] = React.useState('');

  const filteredQuestions = React.useMemo(() => {
    return questions.filter((q) => {
      const matchSub = subjectFilter === 'all' || q.subject === subjectFilter;
      const matchType = typeFilter === 'all' || q.type === typeFilter;
      const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      return matchSub && matchType && matchDiff;
    });
  }, [questions, subjectFilter, typeFilter, difficultyFilter]);

  const uniqueSubjects = React.useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.subject)));
  }, [questions]);

  const handleOpenAdd = () => {
    setSelectedQuestion(null);
    setFormCode(`SOAL-${Date.now().toString().slice(-4)}`);
    setFormSubject(uniqueSubjects[0] || 'Matematika Wajib');
    setFormType('PG');
    setFormDifficulty('Sedang');
    setFormPrompt('');
    setFormPoints(4);
    setFormTags('Kurikulum Merdeka');
    setFormAuthor('Guru Pengampu');
    setOptions({ A: '', B: '', C: '', D: '', E: '' });
    setCorrectAnswer('A');
    setRubric('');
    setFormOpen(true);
  };

  const handleOpenEdit = (q: QuestionItem) => {
    setSelectedQuestion(q);
    setFormCode(q.code);
    setFormSubject(q.subject);
    setFormType(q.type);
    setFormDifficulty(q.difficulty);
    setFormPrompt(q.prompt);
    setFormPoints(q.defaultPoints);
    setFormTags(q.tags.join(', '));
    setFormAuthor(q.author);

    if (q.type === 'PG' && q.options) {
      const optMap: { [key in QuestionOptionLetter]: string } = { A: '', B: '', C: '', D: '', E: '' };
      q.options.forEach((opt) => {
        optMap[opt.key] = opt.text;
      });
      setOptions(optMap);
      setCorrectAnswer(q.correctAnswer || 'A');
    } else {
      setRubric(q.rubric || '');
    }

    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim() || !formCode.trim()) return;

    const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);

    let payload: Omit<QuestionItem, 'id' | 'createdAt'>;

    if (formType === 'PG') {
      const formattedOptions: QuestionOption[] = (['A', 'B', 'C', 'D', 'E'] as QuestionOptionLetter[]).map(
        (letter) => ({
          key: letter,
          text: options[letter] || `Opsi ${letter}`,
          isCorrect: letter === correctAnswer,
        })
      );

      payload = {
        code: formCode,
        subject: formSubject,
        type: 'PG',
        difficulty: formDifficulty,
        prompt: formPrompt,
        options: formattedOptions,
        correctAnswer,
        defaultPoints: Number(formPoints),
        tags: tagsArray,
        author: formAuthor,
      };
    } else {
      payload = {
        code: formCode,
        subject: formSubject,
        type: 'ESAI',
        difficulty: formDifficulty,
        prompt: formPrompt,
        rubric,
        defaultPoints: Number(formPoints),
        tags: tagsArray,
        author: formAuthor,
      };
    }

    if (selectedQuestion) {
      updateQuestion(selectedQuestion.id, payload);
    } else {
      addQuestion(payload);
    }
    setFormOpen(false);
  };

  const columns: ColumnDef<QuestionItem>[] = [
    {
      header: 'Kode & Mapel',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5">
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
            {row.code}
          </span>
          <div className="text-xs font-medium text-foreground">{row.subject}</div>
        </div>
      ),
    },
    {
      header: 'Butir Soal & Opsi Kunci',
      accessorKey: 'prompt',
      cell: (row) => (
        <div className="space-y-1.5 max-w-xl">
          <p className="text-xs font-medium text-foreground line-clamp-2">
            {row.prompt}
          </p>
          {row.type === 'PG' && row.options && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-medium">Kunci:</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {row.correctAnswer} - {row.options.find((o) => o.key === row.correctAnswer)?.text}
              </span>
            </div>
          )}
          {row.type === 'ESAI' && row.rubric && (
            <div className="text-[11px] text-muted-foreground line-clamp-1 italic">
              Rubrik: {row.rubric}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Tipe',
      accessorKey: 'type',
      sortable: true,
      cell: (row) => (
        <span className="px-2 py-0.5 rounded text-xs font-semibold bg-muted text-foreground border border-border">
          {row.type === 'PG' ? 'Pilihan Ganda' : 'Uraian Esai'}
        </span>
      ),
    },
    {
      header: 'Tingkat Kesulitan',
      accessorKey: 'difficulty',
      sortable: true,
      cell: (row) => {
        let badgeColor = 'bg-muted text-muted-foreground';
        if (row.difficulty === 'Mudah') badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20';
        if (row.difficulty === 'Sedang') badgeColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20';
        if (row.difficulty === 'Sukar') badgeColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20';
        return (
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${badgeColor}`}>
            {row.difficulty}
          </span>
        );
      },
    },
    {
      header: 'Poin',
      accessorKey: 'defaultPoints',
      sortable: true,
      cell: (row) => <span className="font-semibold text-xs">{row.defaultPoints} Pts</span>,
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
            title="Edit butir soal"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedQuestion(row);
              setDeleteOpen(true);
            }}
            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
            title="Hapus butir soal"
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
        title="Repositori Bank Soal"
        description="Pusat penyimpanan butir soal terstandarisasi. Soal di sini bersifat permanen dan siap dipetakan ke berbagai Event ujian."
      >
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Buat Soal Baru</span>
        </Button>
      </PageHeader>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border/70 bg-card text-xs">
        <span className="font-medium text-foreground">Filter Khusus:</span>
        <div className="w-44">
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="all">Semua Mata Pelajaran</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-36">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Semua Tipe</option>
            <option value="PG">Pilihan Ganda</option>
            <option value="ESAI">Esai / Uraian</option>
          </Select>
        </div>
        <div className="w-36">
          <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="all">Semua Kesulitan</option>
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sukar">Sukar</option>
          </Select>
        </div>
      </div>

      <DataTable
        data={filteredQuestions}
        columns={columns}
        searchKey="prompt"
        searchPlaceholder="Cari isi pertanyaan atau kode soal..."
      />

      {/* Dynamic Question Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto pr-1">
            <DialogHeader>
              <DialogTitle>
                {selectedQuestion ? 'Edit Butir Soal' : 'Buat Butir Soal Baru'}
              </DialogTitle>
              <DialogDescription>
                Lengkapi pertanyaan, kunci jawaban, serta rubrik acuan evaluasi.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground">Kode Soal *</label>
                <Input
                  required
                  placeholder="MAT-XII-001"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Mata Pelajaran *</label>
                <Input
                  required
                  placeholder="Matematika Wajib"
                  value={formSubject}
                  onChange={(e) => setFormSubject(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tingkat Kesulitan</label>
                <Select
                  value={formDifficulty}
                  onChange={(e) =>
                    setFormDifficulty(e.target.value as 'Mudah' | 'Sedang' | 'Sukar')
                  }
                >
                  <option value="Mudah">Mudah</option>
                  <option value="Sedang">Sedang</option>
                  <option value="Sukar">Sukar</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Tipe Soal *</label>
                <Select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as 'PG' | 'ESAI')}
                >
                  <option value="PG">Pilihan Ganda (PG)</option>
                  <option value="ESAI">Esai / Uraian</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Bobot Poin Standar</label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={formPoints}
                  onChange={(e) => setFormPoints(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground">Penyusun / Penulis</label>
                <Input
                  placeholder="Nama guru"
                  value={formAuthor}
                  onChange={(e) => setFormAuthor(e.target.value)}
                />
              </div>

              {/* Soal Prompt Textarea */}
              <div className="sm:col-span-3 space-y-1 pt-1">
                <label className="font-medium text-foreground">Isi Pertanyaan / Soal *</label>
                <Textarea
                  rows={4}
                  required
                  placeholder="Tuliskan teks pertanyaan lengkap beserta rumus atau narasi di sini..."
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                />
              </div>

              {/* DYNAMIC FORM SECTION: PG vs ESAI */}
              {formType === 'PG' ? (
                <div className="sm:col-span-3 space-y-3 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground">
                      Pilihan Jawaban (A - E) & Kunci Benar:
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Pilih radio button untuk menentukan kunci jawaban yang benar
                    </span>
                  </div>

                  {(['A', 'B', 'C', 'D', 'E'] as QuestionOptionLetter[]).map((letter) => (
                    <div key={letter} className="flex items-center gap-2.5">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="correctKeyRadio"
                          checked={correctAnswer === letter}
                          onChange={() => setCorrectAnswer(letter)}
                          className="text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                        />
                        <span className="font-bold font-mono text-sm w-5 text-foreground">
                          {letter}.
                        </span>
                      </label>
                      <Input
                        required={letter === 'A' || letter === 'B' || letter === 'C' || letter === 'D'}
                        placeholder={`Teks opsi jawaban ${letter}`}
                        value={options[letter]}
                        onChange={(e) =>
                          setOptions({ ...options, [letter]: e.target.value })
                        }
                        className={correctAnswer === letter ? 'border-primary ring-1 ring-primary/40' : ''}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="sm:col-span-3 space-y-2 pt-2 border-t border-border/60">
                  <div className="space-y-1">
                    <label className="font-medium text-foreground">
                      Rubrik Penilaian Acuan Guru (Pedoman Penskoran)
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Jelaskan kriteria poin per tahapan jawaban siswa..."
                      value={rubric}
                      onChange={(e) => setRubric(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="sm:col-span-3 space-y-1 pt-1">
                <label className="font-medium text-foreground">Label / Tag (Pisahkan dengan koma)</label>
                <Input
                  placeholder="Kalkulus, Limit, Aljabar"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit">
                {selectedQuestion ? 'Simpan Perubahan' : 'Tambahkan ke Bank Soal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Hapus Butir Soal"
        description={`Apakah Anda yakin ingin menghapus soal "${selectedQuestion?.code}"? Soal yang telah digunakan pada event yang sedang aktif akan dibersihkan.`}
        onConfirm={() => {
          if (selectedQuestion) {
            deleteQuestion(selectedQuestion.id);
          }
        }}
      />
    </div>
  );
}
