'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  HelpCircle,
  Tag,
  Sparkles,
  FileText,
  Check,
  CheckSquare,
  Layers,
  Link2,
  ArrowRight,
  Eye,
  ListChecks,
  Sliders,
  Hash,
  X,
  PlusCircle,
  Split,
  Archive,
  RotateCcw,
  AlertTriangle,
  FolderKanban,
  CheckCircle2,
  Filter,
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
import {
  QuestionItem,
  QuestionOption,
  QuestionOptionLetter,
  QuestionTypeEnum,
  StatementPreset,
  StatementItem,
  MatchingPair,
  MultiChoiceOption,
} from '@/types';
import { cn } from '@/lib/utils';

export function ButirSoalView() {
  const { questions, addQuestion, updateQuestion, deleteQuestion, setQuestionStatus } =
    useExamStore();

  // View state: 'active' (List Seluruh Butir Soal) vs 'inactive' (List Soal Inactive)
  const [currentView, setCurrentView] = React.useState<'active' | 'inactive'>('active');

  const [formOpen, setFormOpen] = React.useState(false);
  const [deletePermanentOpen, setDeletePermanentOpen] = React.useState(false);
  const [inactiveConfirmOpen, setInactiveConfirmOpen] = React.useState(false);
  const [activateConfirmOpen, setActivateConfirmOpen] = React.useState(false);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState<QuestionItem | null>(null);

  // Filters
  const [subjectFilter, setSubjectFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');
  const [difficultyFilter, setDifficultyFilter] = React.useState<string>('all');

  // Dynamic Question Form State
  const [formCode, setFormCode] = React.useState('');
  const [formSubject, setFormSubject] = React.useState('Matematika Wajib');
  const [formType, setFormType] = React.useState<QuestionTypeEnum>('PG');
  const [formDifficulty, setFormDifficulty] = React.useState<'Mudah' | 'Sedang' | 'Sukar'>('Sedang');
  const [formPrompt, setFormPrompt] = React.useState('');
  const [formScoringMode, setFormScoringMode] = React.useState<'TOTAL' | 'PER_SUB'>('TOTAL');
  const [formPoints, setFormPoints] = React.useState(4);
  const [formTags, setFormTags] = React.useState('Kurikulum Merdeka');
  const [formAuthor, setFormAuthor] = React.useState('Guru Pengampu');

  // PG (Single Choice) Options & Points per option
  const [options, setOptions] = React.useState<{ [key in QuestionOptionLetter]: string }>({
    A: '',
    B: '',
    C: '',
    D: '',
    E: '',
  });
  const [optionPoints, setOptionPoints] = React.useState<{ [key in QuestionOptionLetter]: number }>({
    A: 4,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  });
  const [correctAnswer, setCorrectAnswer] = React.useState<QuestionOptionLetter>('A');

  // Multi Choice Options
  const [multiOptions, setMultiOptions] = React.useState<MultiChoiceOption[]>([
    { key: 'A', text: '', isCorrect: true, points: 2 },
    { key: 'B', text: '', isCorrect: false, points: 0 },
    { key: 'C', text: '', isCorrect: true, points: 2 },
    { key: 'D', text: '', isCorrect: false, points: 0 },
    { key: 'E', text: '', isCorrect: false, points: 0 },
  ]);

  // Pernyataan (Statement) State
  const [statementPreset, setStatementPreset] = React.useState<StatementPreset>('BENAR_SALAH');
  const [statementOpt1, setStatementOpt1] = React.useState('Benar');
  const [statementOpt2, setStatementOpt2] = React.useState('Salah');
  const [statements, setStatements] = React.useState<StatementItem[]>([
    { id: 'sub-1', statement: '', correctAnswer: 'Benar', points: 2 },
    { id: 'sub-2', statement: '', correctAnswer: 'Salah', points: 2 },
    { id: 'sub-3', statement: '', correctAnswer: 'Benar', points: 2 },
  ]);

  // Penjodohan (Matching) State
  const [matchingPairs, setMatchingPairs] = React.useState<MatchingPair[]>([
    { id: 'm-1', leftText: '', rightText: '', points: 2.5 },
    { id: 'm-2', leftText: '', rightText: '', points: 2.5 },
    { id: 'm-3', leftText: '', rightText: '', points: 2.5 },
  ]);

  // Essay Rubric
  const [rubric, setRubric] = React.useState('');

  // Active vs Inactive counts
  const activeQuestions = React.useMemo(() => {
    return questions.filter((q) => q.status !== 'inactive');
  }, [questions]);

  const inactiveQuestions = React.useMemo(() => {
    return questions.filter((q) => q.status === 'inactive');
  }, [questions]);

  // Filtered dataset based on current view (active vs inactive) and dropdown filters
  const displayedQuestions = React.useMemo(() => {
    const targetSet = currentView === 'active' ? activeQuestions : inactiveQuestions;
    return targetSet.filter((q) => {
      const matchSub = subjectFilter === 'all' || q.subject === subjectFilter;
      const matchType = typeFilter === 'all' || q.type === typeFilter;
      const matchDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
      return matchSub && matchType && matchDiff;
    });
  }, [currentView, activeQuestions, inactiveQuestions, subjectFilter, typeFilter, difficultyFilter]);

  const uniqueSubjects = React.useMemo(() => {
    return Array.from(new Set(questions.map((q) => q.subject))).filter(Boolean);
  }, [questions]);

  // Calculate points for PER_SUB mode across all question types
  const calculatedSubPoints = React.useMemo(() => {
    if (formType === 'ESAI') {
      return formPoints;
    }
    if (formType === 'PG') {
      if (formScoringMode === 'PER_SUB') {
        const pts = Object.values(optionPoints).map((v) => Number(v) || 0);
        return Math.max(...pts, 0) || formPoints;
      }
      return formPoints;
    }
    if (formType === 'PERNYATAAN') {
      return statements.reduce((acc, s) => acc + (Number(s.points) || 0), 0);
    }
    if (formType === 'PENJODOHAN') {
      return matchingPairs.reduce((acc, m) => acc + (Number(m.points) || 0), 0);
    }
    if (formType === 'MULTI_CHOICE') {
      return multiOptions
        .filter((o) => o.isCorrect)
        .reduce((acc, o) => acc + (Number(o.points) || 0), 0);
    }
    return formPoints;
  }, [formType, formScoringMode, optionPoints, statements, matchingPairs, multiOptions, formPoints]);

  const handlePresetChange = (preset: StatementPreset) => {
    setStatementPreset(preset);
    let o1 = 'Benar';
    let o2 = 'Salah';
    if (preset === 'YA_TIDAK') {
      o1 = 'Ya';
      o2 = 'Tidak';
    } else if (preset === 'SETUJU_TIDAK') {
      o1 = 'Setuju';
      o2 = 'Tidak Setuju';
    } else if (preset === 'SESUAI_TIDAK') {
      o1 = 'Sesuai';
      o2 = 'Tidak Sesuai';
    } else if (preset === 'FAKTA_OPINI') {
      o1 = 'Fakta';
      o2 = 'Opini';
    } else if (preset === 'DINAMIS') {
      o1 = statementOpt1 || 'Opsi 1';
      o2 = statementOpt2 || 'Opsi 2';
    }
    const old1 = statementOpt1;
    const old2 = statementOpt2;
    setStatementOpt1(o1);
    setStatementOpt2(o2);

    setStatements((prev) =>
      prev.map((s) => ({
        ...s,
        correctAnswer:
          s.correctAnswer === old2 ||
          s.correctAnswer === 'Salah' ||
          s.correctAnswer === 'Tidak' ||
          s.correctAnswer === 'Tidak Setuju' ||
          s.correctAnswer === 'Tidak Sesuai' ||
          s.correctAnswer === 'Opini'
            ? o2
            : o1,
      }))
    );
  };

  const handleUpdateOption1Label = (newLabel: string) => {
    const oldVal = statementOpt1;
    setStatementOpt1(newLabel);
    setStatementPreset('DINAMIS');
    setStatements((prev) =>
      prev.map((s) => ({
        ...s,
        correctAnswer: s.correctAnswer === oldVal ? newLabel : s.correctAnswer,
      }))
    );
  };

  const handleUpdateOption2Label = (newLabel: string) => {
    const oldVal = statementOpt2;
    setStatementOpt2(newLabel);
    setStatementPreset('DINAMIS');
    setStatements((prev) =>
      prev.map((s) => ({
        ...s,
        correctAnswer: s.correctAnswer === oldVal ? newLabel : s.correctAnswer,
      }))
    );
  };

  const handleOpenAdd = () => {
    setSelectedQuestion(null);
    setFormCode(`SOAL-${Date.now().toString().slice(-4)}`);
    setFormSubject(uniqueSubjects[0] || 'Matematika Wajib');
    setFormType('PG');
    setFormDifficulty('Sedang');
    setFormPrompt('');
    setFormScoringMode('TOTAL');
    setFormPoints(4);
    setFormTags('Kurikulum Merdeka');
    setFormAuthor('Guru Pengampu');

    setOptions({ A: '', B: '', C: '', D: '', E: '' });
    setOptionPoints({ A: 4, B: 0, C: 0, D: 0, E: 0 });
    setCorrectAnswer('A');

    setMultiOptions([
      { key: 'A', text: '', isCorrect: true, points: 2 },
      { key: 'B', text: '', isCorrect: false, points: 0 },
      { key: 'C', text: '', isCorrect: true, points: 2 },
      { key: 'D', text: '', isCorrect: false, points: 0 },
      { key: 'E', text: '', isCorrect: false, points: 0 },
    ]);

    setStatementPreset('BENAR_SALAH');
    setStatementOpt1('Benar');
    setStatementOpt2('Salah');
    setStatements([
      { id: 'sub-1', statement: '', correctAnswer: 'Benar', points: 2 },
      { id: 'sub-2', statement: '', correctAnswer: 'Salah', points: 2 },
      { id: 'sub-3', statement: '', correctAnswer: 'Benar', points: 2 },
    ]);

    setMatchingPairs([
      { id: 'm-1', leftText: '', rightText: '', points: 2.5 },
      { id: 'm-2', leftText: '', rightText: '', points: 2.5 },
      { id: 'm-3', leftText: '', rightText: '', points: 2.5 },
    ]);
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
    // If ESAI, force TOTAL mode
    setFormScoringMode(q.type === 'ESAI' ? 'TOTAL' : q.scoringMode || 'TOTAL');
    setFormPoints(q.defaultPoints);
    setFormTags(q.tags.join(', '));
    setFormAuthor(q.author);

    if (q.type === 'PG' && q.options) {
      const optsObj: { [key in QuestionOptionLetter]: string } = {
        A: '',
        B: '',
        C: '',
        D: '',
        E: '',
      };
      const ptsObj: { [key in QuestionOptionLetter]: number } = {
        A: 0,
        B: 0,
        C: 0,
        D: 0,
        E: 0,
      };
      q.options.forEach((opt) => {
        optsObj[opt.key] = opt.text;
        ptsObj[opt.key] =
          typeof opt.points === 'number'
            ? opt.points
            : opt.isCorrect
            ? q.defaultPoints
            : 0;
      });
      setOptions(optsObj);
      setOptionPoints(ptsObj);
      setCorrectAnswer(q.correctAnswer || 'A');
    } else if (q.type === 'MULTI_CHOICE' && q.multiOptions) {
      setMultiOptions(
        q.multiOptions.map((o) => ({
          ...o,
          points: typeof o.points === 'number' ? o.points : o.isCorrect ? 2 : 0,
        }))
      );
    } else if (q.type === 'PERNYATAAN' && q.statementConfig) {
      setStatementPreset(q.statementConfig.preset);
      setStatementOpt1(q.statementConfig.option1);
      setStatementOpt2(q.statementConfig.option2);
      setStatements(
        q.statementConfig.items.map((s) => ({
          ...s,
          points: typeof s.points === 'number' ? s.points : 2,
        }))
      );
    } else if (q.type === 'PENJODOHAN' && q.matchingConfig) {
      setMatchingPairs(
        q.matchingConfig.pairs.map((p) => ({
          ...p,
          points: typeof p.points === 'number' ? p.points : 2.5,
        }))
      );
    } else if (q.type === 'ESAI' && q.rubric) {
      setRubric(q.rubric);
    }

    setFormOpen(true);
  };

  const handleOpenPreview = (q: QuestionItem) => {
    setSelectedQuestion(q);
    setPreviewOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPrompt.trim() || !formCode.trim()) return;

    const tagsArray = formTags.split(',').map((t) => t.trim()).filter(Boolean);

    // Esai automatically enforces TOTAL scoring
    const effectiveScoringMode = formType === 'ESAI' ? 'TOTAL' : formScoringMode;

    let finalPoints = Number(formPoints) || 1;
    if (formType === 'ESAI') {
      finalPoints = Number(formPoints) || 1;
    } else if (effectiveScoringMode === 'PER_SUB') {
      finalPoints = calculatedSubPoints;
    }

    let payload: Omit<QuestionItem, 'id' | 'createdAt'> = {
      code: formCode,
      subject: formSubject,
      type: formType,
      difficulty: formDifficulty,
      prompt: formPrompt,
      scoringMode: effectiveScoringMode,
      defaultPoints: finalPoints,
      tags: tagsArray,
      author: formAuthor,
      status: selectedQuestion?.status || 'active',
    };

    if (formType === 'PG') {
      const formattedOptions: QuestionOption[] = (
        ['A', 'B', 'C', 'D', 'E'] as QuestionOptionLetter[]
      ).map((letter) => ({
        key: letter,
        text: options[letter] || `Opsi ${letter}`,
        isCorrect: letter === correctAnswer,
        points:
          effectiveScoringMode === 'PER_SUB'
            ? Number(optionPoints[letter]) || 0
            : letter === correctAnswer
            ? finalPoints
            : 0,
      }));
      payload = {
        ...payload,
        options: formattedOptions,
        correctAnswer,
      };
    } else if (formType === 'MULTI_CHOICE') {
      const correctKeys = multiOptions.filter((o) => o.isCorrect).map((o) => o.key);
      payload = {
        ...payload,
        multiOptions: multiOptions.map((o) => ({
          ...o,
          points: Number(o.points) || 0,
        })),
        correctAnswersMulti: correctKeys,
      };
    } else if (formType === 'PERNYATAAN') {
      payload = {
        ...payload,
        statementConfig: {
          preset: statementPreset,
          option1: statementOpt1,
          option2: statementOpt2,
          items: statements.map((s) => ({
            ...s,
            points: Number(s.points) || 0,
          })),
        },
      };
    } else if (formType === 'PENJODOHAN') {
      payload = {
        ...payload,
        matchingConfig: {
          pairs: matchingPairs.map((p) => ({
            ...p,
            points: Number(p.points) || 0,
          })),
        },
      };
    } else {
      payload = {
        ...payload,
        rubric,
      };
    }

    if (selectedQuestion) {
      updateQuestion(selectedQuestion.id, payload);
    } else {
      addQuestion(payload);
    }

    setFormOpen(false);
  };

  const handleAddStatement = () => {
    setStatements((prev) => [
      ...prev,
      {
        id: `sub-${Date.now()}`,
        statement: '',
        correctAnswer: statementOpt1,
        points: 2,
      },
    ]);
  };

  const handleRemoveStatement = (id: string) => {
    if (statements.length <= 1) return;
    setStatements((prev) => prev.filter((s) => s.id !== id));
  };

  const handleAddMatchingPair = () => {
    setMatchingPairs((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        leftText: '',
        rightText: '',
        points: 2.5,
      },
    ]);
  };

  const handleRemoveMatchingPair = (id: string) => {
    if (matchingPairs.length <= 1) return;
    setMatchingPairs((prev) => prev.filter((m) => m.id !== id));
  };

  const handleAddMultiOption = () => {
    const nextCharCode = 65 + multiOptions.length;
    if (nextCharCode > 74) return;
    const nextKey = String.fromCharCode(nextCharCode);
    setMultiOptions((prev) => [
      ...prev,
      { key: nextKey, text: '', isCorrect: false, points: 2 },
    ]);
  };

  const handleRemoveMultiOption = (key: string) => {
    if (multiOptions.length <= 2) return;
    setMultiOptions((prev) => prev.filter((o) => o.key !== key));
  };

  // Table columns definition
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
      header: 'Butir Soal & Kunci Jawaban',
      accessorKey: 'prompt',
      cell: (row) => (
        <div className="space-y-1.5 max-w-xl">
          <p className="text-xs font-medium text-foreground line-clamp-2">{row.prompt}</p>

          {/* PG Single Choice Preview */}
          {row.type === 'PG' && row.options && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-medium">Kunci:</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                {row.correctAnswer} - {row.options.find((o) => o.key === row.correctAnswer)?.text}
              </span>
            </div>
          )}

          {/* Multi Choice Preview */}
          {row.type === 'MULTI_CHOICE' && row.multiOptions && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-medium">
                Kunci ({row.correctAnswersMulti?.length || 0}):
              </span>
              {row.multiOptions
                .filter((o) => o.isCorrect)
                .map((o) => (
                  <span
                    key={o.key}
                    className="font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20"
                  >
                    {o.key}. {o.text.length > 20 ? `${o.text.slice(0, 20)}...` : o.text}
                  </span>
                ))}
            </div>
          )}

          {/* Pernyataan Preview */}
          {row.type === 'PERNYATAAN' && row.statementConfig && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-medium">
                {row.statementConfig.items.length} Sub-Pernyataan ({row.statementConfig.option1}/
                {row.statementConfig.option2}):
              </span>
              <span className="font-mono text-[10px] text-amber-800 dark:text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {row.statementConfig.items
                  .map((it, idx) => `${idx + 1}:${it.correctAnswer}`)
                  .join(', ')}
              </span>
            </div>
          )}

          {/* Penjodohan Preview */}
          {row.type === 'PENJODOHAN' && row.matchingConfig && (
            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
              <span className="text-muted-foreground font-medium">
                {row.matchingConfig.pairs.length} Pasangan Menjodohkan:
              </span>
              <span className="font-medium text-teal-800 dark:text-teal-300 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                Kolom A ➔ Kolom B
              </span>
            </div>
          )}

          {/* Esai Preview */}
          {row.type === 'ESAI' && row.rubric && (
            <div className="text-[11px] text-muted-foreground line-clamp-1 italic">
              Rubrik: {row.rubric}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Tipe & Kesulitan',
      accessorKey: 'type',
      sortable: true,
      cell: (row) => {
        let typeBadge = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20';
        let typeLabel = 'Pilihan Ganda';

        if (row.type === 'MULTI_CHOICE') {
          typeBadge = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';
          typeLabel = 'Pilihan Ganda Kompleks';
        } else if (row.type === 'PERNYATAAN') {
          typeBadge = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20';
          typeLabel = 'Pernyataan (Benar/Salah)';
        } else if (row.type === 'PENJODOHAN') {
          typeBadge = 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20';
          typeLabel = 'Menjodohkan';
        } else if (row.type === 'ESAI') {
          typeBadge = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20';
          typeLabel = 'Uraian / Esai';
        }

        let diffBadge = 'text-foreground';
        if (row.difficulty === 'Mudah') diffBadge = 'text-emerald-700 dark:text-emerald-400';
        if (row.difficulty === 'Sedang') diffBadge = 'text-amber-700 dark:text-amber-400';
        if (row.difficulty === 'Sukar') diffBadge = 'text-rose-700 dark:text-rose-400';

        return (
          <div className="space-y-1">
            <span className={cn('px-2 py-0.5 rounded text-[10px] font-semibold border', typeBadge)}>
              {typeLabel}
            </span>
            <div className={cn('text-[11px] font-semibold', diffBadge)}>
              Tingkat: {row.difficulty}
            </div>
          </div>
        );
      },
    },
    {
      header: 'Bobot Poin',
      accessorKey: 'defaultPoints',
      sortable: true,
      cell: (row) => {
        const isPerSub = row.scoringMode === 'PER_SUB';
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-foreground">{row.defaultPoints} Pts</span>
            {isPerSub ? (
              <div className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400">
                Per Sub-Item
              </div>
            ) : (
              <div className="text-[10px] text-muted-foreground">Per Butir</div>
            )}
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => {
        const isInactiveList = currentView === 'inactive';

        return (
          <div className="flex items-center justify-end gap-1">
            {/* ACTION 1: Preview (tersedia di kedua list) */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenPreview(row)}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
              title="Preview butir soal"
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>

            {!isInactiveList ? (
              <>
                {/* ACTION 2 (Active list): Edit */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenEdit(row)}
                  className="h-8 w-8 p-0"
                  title="Edit butir soal"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>

                {/* ACTION 3 (Active list): Inactive (pindahkan ke list inactive) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedQuestion(row);
                    setInactiveConfirmOpen(true);
                  }}
                  className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700 dark:text-amber-400"
                  title="Nonaktifkan soal (pindahkan ke List Soal Inactive)"
                >
                  <Archive className="h-3.5 w-3.5" />
                </Button>
              </>
            ) : (
              <>
                {/* ACTION 2 (Inactive list): Active (Aktifkan kembali) */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedQuestion(row);
                    setActivateConfirmOpen(true);
                  }}
                  className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-700 dark:text-emerald-400"
                  title="Aktifkan kembali butir soal"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </Button>

                {/* ACTION 3 (Inactive list): Delete Permanen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedQuestion(row);
                    setDeletePermanentOpen(true);
                  }}
                  className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  title="Hapus butir soal secara permanen"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title={
          currentView === 'active'
            ? 'Bank Butir Soal (Aktif)'
            : 'Bank Butir Soal - List Soal Inactive'
        }
        description={
          currentView === 'active'
            ? 'Koleksi butir soal ujian aktif dengan dukungan ragam model asesmen (Pilihan Ganda, Multi Choice, Pernyataan Dinamis, Menjodohkan, dan Esai).'
            : 'Daftar butir soal yang dinonaktifkan sementara. Anda dapat mempratinjau, mengaktifkan kembali, atau menghapusnya secara permanen.'
        }
      >
        {/* Link to Paket Soal */}
        <Link href="/bank-soal/paket">
          <Button variant="outline" className="gap-2 font-semibold shadow-2xs">
            <Layers className="h-4 w-4" />
            <span>Lihat Paket Soal</span>
          </Button>
        </Link>

        {/* Action Group: Buat Butir Soal & Tombol "List soal In active" DI BAWAHNYA */}
        <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
          <Button onClick={handleOpenAdd} className="gap-2 font-semibold shadow-2xs w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            <span>Buat Butir Soal</span>
          </Button>

          {/* REQUESTED BUTTON: Tepat di bawah button Buat Butir Soal */}
          <Button
            variant={currentView === 'inactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCurrentView(currentView === 'active' ? 'inactive' : 'active')}
            className={cn(
              'gap-2 text-xs font-semibold w-full sm:w-auto transition-colors',
              currentView === 'inactive'
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-muted-foreground hover:text-foreground'
            )}
            title="Beralih antara list soal aktif dan list soal inactive"
          >
            <Archive className="h-3.5 w-3.5" />
            <span>
              {currentView === 'active'
                ? `List Soal Inactive (${inactiveQuestions.length})`
                : `Kembali ke Soal Aktif (${activeQuestions.length})`}
            </span>
          </Button>
        </div>
      </PageHeader>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Seluruh Soal</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">{questions.length} Butir</div>
          <p className="text-[11px] text-muted-foreground">Tercatat di Bank Soal</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Soal Status Aktif</span>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {activeQuestions.length} Butir
          </div>
          <p className="text-[11px] text-muted-foreground">Tersedia untuk disusun ke paket/event</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Soal Status Inactive</span>
          <div className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
            {inactiveQuestions.length} Butir
          </div>
          <p className="text-[11px] text-muted-foreground">Dipindahkan dari peredaran aktif</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Mata Pelajaran Aktif</span>
          <div className="text-2xl font-bold tracking-tight text-primary">
            {uniqueSubjects.length} Mapel
          </div>
          <p className="text-[11px] text-muted-foreground">Cakupan kurikulum terdaftar</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs shadow-2xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <Filter className="h-3.5 w-3.5 text-primary" />
          <span>Filter:</span>
        </span>

        {/* Filter Mapel */}
        <div className="w-48">
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="all">Semua Mata Pelajaran</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </div>

        {/* Filter Tipe */}
        <div className="w-44">
          <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">Semua Tipe Soal</option>
            <option value="PG">Pilihan Ganda (PG)</option>
            <option value="MULTI_CHOICE">Pilihan Ganda Kompleks</option>
            <option value="PERNYATAAN">Pernyataan (Benar/Salah)</option>
            <option value="PENJODOHAN">Menjodohkan</option>
            <option value="ESAI">Uraian / Esai</option>
          </Select>
        </div>

        {/* Filter Kesulitan */}
        <div className="w-36">
          <Select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
            <option value="all">Semua Kesulitan</option>
            <option value="Mudah">Mudah</option>
            <option value="Sedang">Sedang</option>
            <option value="Sukar">Sukar</option>
          </Select>
        </div>

        {(subjectFilter !== 'all' || typeFilter !== 'all' || difficultyFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubjectFilter('all');
              setTypeFilter('all');
              setDifficultyFilter('all');
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
        data={displayedQuestions}
        columns={columns}
        searchKey="prompt"
        searchPlaceholder={
          currentView === 'active'
            ? 'Cari teks butir soal aktif, kode, atau materi...'
            : 'Cari butir soal inactive...'
        }
      />

      {/* MODAL PREVIEW BUTIR SOAL */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent maxWidth="max-w-2xl">
          {selectedQuestion && (
            <div className="space-y-4 text-xs">
              <DialogHeader>
                <div className="flex items-center justify-between gap-2">
                  <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    <span>Preview Soal: {selectedQuestion.code}</span>
                  </DialogTitle>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded text-[10px] font-semibold border',
                      selectedQuestion.status === 'inactive'
                        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'
                    )}
                  >
                    {selectedQuestion.status === 'inactive' ? 'Status: Inactive' : 'Status: Aktif'}
                  </span>
                </div>
                <DialogDescription>
                  {selectedQuestion.subject} • Tipe: {selectedQuestion.type} • Tingkat:{' '}
                  {selectedQuestion.difficulty} • Bobot: {selectedQuestion.defaultPoints} Poin
                </DialogDescription>
              </DialogHeader>

              {/* Soal Prompt */}
              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <div className="text-xs font-semibold text-foreground leading-relaxed whitespace-pre-wrap">
                  {selectedQuestion.prompt}
                </div>
              </div>

              {/* PG Preview */}
              {selectedQuestion.type === 'PG' && selectedQuestion.options && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">Pilihan Jawaban:</span>
                  <div className="space-y-1">
                    {selectedQuestion.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={cn(
                          'p-2.5 rounded-lg border flex items-center justify-between gap-2',
                          opt.isCorrect
                            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 font-semibold'
                            : 'border-border bg-card text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold w-5">{opt.key}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">
                            Kunci Jawaban
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Multi Choice Preview */}
              {selectedQuestion.type === 'MULTI_CHOICE' && selectedQuestion.multiOptions && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">
                    Pilihan Jawaban Majemuk (Jawaban benar lebih dari satu):
                  </span>
                  <div className="space-y-1">
                    {selectedQuestion.multiOptions.map((opt) => (
                      <div
                        key={opt.key}
                        className={cn(
                          'p-2.5 rounded-lg border flex items-center justify-between gap-2',
                          opt.isCorrect
                            ? 'border-purple-500/40 bg-purple-500/10 text-purple-950 dark:text-purple-200 font-semibold'
                            : 'border-border bg-card text-foreground'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold w-5">{opt.key}.</span>
                          <span>{opt.text}</span>
                        </div>
                        {opt.isCorrect && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-600 text-white font-bold">
                            +{opt.points || 2} Poin
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pernyataan Preview */}
              {selectedQuestion.type === 'PERNYATAAN' && selectedQuestion.statementConfig && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">
                    Sub-Pernyataan ({selectedQuestion.statementConfig.option1} vs{' '}
                    {selectedQuestion.statementConfig.option2}):
                  </span>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Pernyataan</th>
                          <th className="p-2 text-right">Kunci</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedQuestion.statementConfig.items.map((it, idx) => (
                          <tr key={it.id}>
                            <td className="p-2 text-center text-muted-foreground font-mono">{idx + 1}</td>
                            <td className="p-2 font-medium">{it.statement}</td>
                            <td className="p-2 text-right font-bold text-amber-700 dark:text-amber-300">
                              {it.correctAnswer} (+{it.points || 2} Poin)
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Penjodohan Preview */}
              {selectedQuestion.type === 'PENJODOHAN' && selectedQuestion.matchingConfig && (
                <div className="space-y-1.5">
                  <span className="font-semibold text-foreground">Pasangan Menjodohkan:</span>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground">
                        <tr>
                          <th className="p-2">Premis (Kolom Kiri)</th>
                          <th className="p-2 text-right">Jawaban Tepat (Kolom Kanan)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {selectedQuestion.matchingConfig.pairs.map((p) => (
                          <tr key={p.id}>
                            <td className="p-2 font-medium">{p.leftText}</td>
                            <td className="p-2 text-right font-bold text-teal-700 dark:text-teal-300">
                              ➔ {p.rightText}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Esai Rubric Preview */}
              {selectedQuestion.type === 'ESAI' && selectedQuestion.rubric && (
                <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                  <span className="font-semibold text-foreground">Rubrik Penilaian:</span>
                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedQuestion.rubric}</p>
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                  Tutup Preview
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* FORM MODAL BUAT / EDIT BUTIR SOAL */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent maxWidth="max-w-3xl overflow-y-auto h-[calc(100vh-5rem)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                <span>{selectedQuestion ? 'Edit Butir Soal' : 'Buat Butir Soal Baru'}</span>
              </DialogTitle>
              <DialogDescription>
                Tentukan tipe butir soal, mata pelajaran, tingkat kesulitan, serta opsi kunci jawaban.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kode Soal *</label>
                <Input
                  required
                  placeholder="MAT-XII-001"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Mata Pelajaran *</label>
                <Select value={formSubject} onChange={(e) => setFormSubject(e.target.value)}>
                  {uniqueSubjects.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="Matematika Wajib">Matematika Wajib</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Fisika Terapan">Fisika Terapan</option>
                  <option value="Biologi">Biologi</option>
                  <option value="Kimia">Kimia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Model Asesmen (Tipe) *</label>
                <Select
                  value={formType}
                  onChange={(e) => {
                    const nextType = e.target.value as QuestionTypeEnum;
                    setFormType(nextType);
                    if (nextType === 'ESAI') {
                      setFormScoringMode('TOTAL');
                    }
                  }}
                >
                  <option value="PG">Pilihan Ganda (Single Choice)</option>
                  <option value="MULTI_CHOICE">Pilihan Ganda Kompleks</option>
                  <option value="PERNYATAAN">Pernyataan (Benar/Salah / Dinamis)</option>
                  <option value="PENJODOHAN">Menjodohkan (Matching)</option>
                  <option value="ESAI">Uraian / Esai Bebas</option>
                </Select>
              </div>

              <div className="sm:col-span-3 space-y-1">
                <label className="font-semibold text-foreground">Prompt / Teks Soal *</label>
                <Textarea
                  required
                  rows={3}
                  placeholder="Ketikkan narasi, stimulus teks, atau pertanyaan soal di sini..."
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tingkat Kesulitan</label>
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
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground">Metode Skoring Poin</label>
                  {formType === 'ESAI' && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Terkunci: Esai wajib Total Poin
                    </span>
                  )}
                </div>
                <Select
                  value={formType === 'ESAI' ? 'TOTAL' : formScoringMode}
                  disabled={formType === 'ESAI'}
                  onChange={(e) => setFormScoringMode(e.target.value as 'TOTAL' | 'PER_SUB')}
                >
                  <option value="TOTAL">Total Poin Tunggal</option>
                  <option value="PER_SUB" disabled={formType === 'ESAI'}>
                    Skor Per Sub-Item {formType === 'ESAI' ? '(Tidak berlaku untuk Esai)' : ''}
                  </option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  {formType !== 'ESAI' && formScoringMode === 'PER_SUB'
                    ? 'Total Poin Otomatis (Sub-Item)'
                    : 'Bobot Poin *'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  required
                  disabled={formType !== 'ESAI' && formScoringMode === 'PER_SUB'}
                  value={
                    formType !== 'ESAI' && formScoringMode === 'PER_SUB'
                      ? calculatedSubPoints
                      : formPoints
                  }
                  onChange={(e) => setFormPoints(Number(e.target.value) || 1)}
                  className="font-mono font-bold"
                />
              </div>
            </div>

            {/* Dynamic Options Editor by Type */}
            {formType === 'PG' && (
              <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">Pilihan Ganda (A - E):</div>
                  {formScoringMode === 'PER_SUB' && (
                    <span className="text-[11px] text-primary font-semibold">
                      Mode Skor Per Opsi: Tentukan bobot poin untuk tiap opsi A - E
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {(['A', 'B', 'C', 'D', 'E'] as QuestionOptionLetter[]).map((letter) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="font-mono font-bold w-4 text-center">{letter}.</span>
                      <Input
                        required
                        placeholder={`Teks pilihan ${letter}`}
                        value={options[letter]}
                        onChange={(e) => setOptions({ ...options, [letter]: e.target.value })}
                        className="text-xs flex-1"
                      />
                      {formScoringMode === 'PER_SUB' && (
                        <div className="flex items-center gap-1 shrink-0 bg-card px-2 py-1 rounded-md border border-border">
                          <span className="text-[10px] text-muted-foreground font-semibold">Skor:</span>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={optionPoints[letter]}
                            onChange={(e) =>
                              setOptionPoints({
                                ...optionPoints,
                                [letter]: Number(e.target.value) || 0,
                              })
                            }
                            className="w-14 h-7 text-xs font-mono font-bold text-center p-1"
                            placeholder="0"
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2 py-1.5 rounded-md border border-border bg-card shrink-0 hover:border-primary transition-colors">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={correctAnswer === letter}
                          onChange={() => {
                            setCorrectAnswer(letter);
                            if (
                              formScoringMode === 'PER_SUB' &&
                              (!optionPoints[letter] || optionPoints[letter] === 0)
                            ) {
                              setOptionPoints({ ...optionPoints, [letter]: formPoints || 4 });
                            }
                          }}
                          className="accent-primary"
                        />
                        <span>Kunci Utama</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formType === 'MULTI_CHOICE' && (
              <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">
                    Opsi Pilihan Ganda Kompleks (Centang yang Benar):
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMultiOption}
                    className="h-7 text-xs font-medium"
                  >
                    + Tambah Opsi
                  </Button>
                </div>
                <div className="space-y-2">
                  {multiOptions.map((opt) => (
                    <div key={opt.key} className="flex items-center gap-2">
                      <span className="font-mono font-bold w-4 text-center">{opt.key}.</span>
                      <Input
                        required
                        placeholder={`Opsi teks ${opt.key}`}
                        value={opt.text}
                        onChange={(e) =>
                          setMultiOptions(
                            multiOptions.map((o) =>
                              o.key === opt.key ? { ...o, text: e.target.value } : o
                            )
                          )
                        }
                        className="text-xs flex-1"
                      />
                      {formScoringMode === 'PER_SUB' && (
                        <div className="flex items-center gap-1 shrink-0 bg-card px-2 py-1 rounded-md border border-border">
                          <span className="text-[10px] text-muted-foreground font-semibold">Skor:</span>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={opt.points ?? (opt.isCorrect ? 2 : 0)}
                            onChange={(e) =>
                              setMultiOptions(
                                multiOptions.map((o) =>
                                  o.key === opt.key
                                    ? { ...o, points: Number(e.target.value) || 0 }
                                    : o
                                )
                              )
                            }
                            className="w-14 h-7 text-xs font-mono font-bold text-center p-1"
                            placeholder="2"
                          />
                        </div>
                      )}
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold px-2 py-1.5 rounded-md border border-border bg-card shrink-0 hover:border-primary transition-colors">
                        <input
                          type="checkbox"
                          checked={opt.isCorrect}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            setMultiOptions(
                              multiOptions.map((o) =>
                                o.key === opt.key
                                  ? {
                                      ...o,
                                      isCorrect: checked,
                                      points:
                                        checked && (!o.points || o.points === 0) ? 2 : o.points,
                                    }
                                  : o
                              )
                            );
                          }}
                          className="accent-primary"
                        />
                        <span>Benar</span>
                      </label>
                      {multiOptions.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMultiOption(opt.key)}
                          className="h-7 w-7 p-0 text-destructive shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formType === 'PERNYATAAN' && (
              <div className="space-y-3 p-3.5 rounded-xl border border-border bg-muted/20 text-xs">
                {/* Preset & Dynamic Label Configuration Header */}
                <div className="p-3 rounded-lg border border-border bg-card space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5 text-primary" />
                      <span>Format Pilihan / Preset Label:</span>
                    </div>
                    <div className="w-full sm:w-60">
                      <Select
                        value={statementPreset}
                        onChange={(e) => handlePresetChange(e.target.value as StatementPreset)}
                      >
                        <option value="BENAR_SALAH">Benar / Salah</option>
                        <option value="YA_TIDAK">Ya / Tidak</option>
                        <option value="SETUJU_TIDAK">Setuju / Tidak Setuju</option>
                        <option value="SESUAI_TIDAK">Sesuai / Tidak Sesuai</option>
                        <option value="FAKTA_OPINI">Fakta / Opini</option>
                        <option value="DINAMIS">Label Kustom / Dinamis (Bebas)</option>
                      </Select>
                    </div>
                  </div>

                  {/* Dynamic Label Inputs (Label Opsi 1 & Label Opsi 2) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-border">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                        <span>Label Pilihan Opsi 1 (Pertama) *</span>
                      </label>
                      <Input
                        required
                        value={statementOpt1}
                        onChange={(e) => handleUpdateOption1Label(e.target.value)}
                        placeholder="Contoh: Benar, Sesuai, Fakta..."
                        className="text-xs font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-foreground flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
                        <span>Label Pilihan Opsi 2 (Kedua) *</span>
                      </label>
                      <Input
                        required
                        value={statementOpt2}
                        onChange={(e) => handleUpdateOption2Label(e.target.value)}
                        placeholder="Contoh: Salah, Tidak Sesuai, Opini..."
                        className="text-xs font-medium"
                      />
                    </div>
                  </div>

                  {/* Quick presets buttons for instant 1-click preset switch */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-muted-foreground font-medium">Pilihan Cepat:</span>
                    {[
                      { id: 'BENAR_SALAH', label: 'Benar / Salah' },
                      { id: 'YA_TIDAK', label: 'Ya / Tidak' },
                      { id: 'SETUJU_TIDAK', label: 'Setuju / Tidak' },
                      { id: 'SESUAI_TIDAK', label: 'Sesuai / Tidak' },
                      { id: 'FAKTA_OPINI', label: 'Fakta / Opini' },
                    ].map((pr) => (
                      <button
                        key={pr.id}
                        type="button"
                        onClick={() => handlePresetChange(pr.id as StatementPreset)}
                        className={cn(
                          'px-2 py-0.5 rounded border transition-colors',
                          statementPreset === pr.id
                            ? 'border-primary bg-primary/10 text-primary font-semibold'
                            : 'border-border bg-card text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {pr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Statements List with Segmented Key Buttons + Skor Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">Daftar Butir Pernyataan:</span>
                    {formScoringMode === 'PER_SUB' && (
                      <span className="text-[11px] text-primary font-semibold">
                        Mode Skor Per Sub-Item: Tentukan skor untuk tiap pernyataan
                      </span>
                    )}
                  </div>

                  {statements.map((s, idx) => (
                    <div
                      key={s.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 rounded-lg border border-border bg-card"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-mono text-muted-foreground font-bold w-4 text-center shrink-0">
                          {idx + 1}.
                        </span>
                        <Input
                          required
                          placeholder="Ketikkan teks pernyataan di sini..."
                          value={s.statement}
                          onChange={(e) =>
                            setStatements(
                              statements.map((it) =>
                                it.id === s.id ? { ...it, statement: e.target.value } : it
                              )
                            )
                          }
                          className="text-xs flex-1"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {/* Skor per item input */}
                        {formScoringMode === 'PER_SUB' && (
                          <div className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md border border-border">
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              Skor:
                            </span>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              step={0.5}
                              value={s.points ?? 2}
                              onChange={(e) =>
                                setStatements(
                                  statements.map((it) =>
                                    it.id === s.id
                                      ? { ...it, points: Number(e.target.value) || 0 }
                                      : it
                                  )
                                )
                              }
                              className="w-14 h-7 text-xs font-mono font-bold text-center p-1"
                              placeholder="2"
                            />
                          </div>
                        )}

                        {/* Segmented Key Buttons: 100% bug-free instant key selection */}
                        <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg border border-border">
                          <span className="text-[10px] text-muted-foreground font-semibold px-1">
                            Kunci:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setStatements(
                                statements.map((it) =>
                                  it.id === s.id ? { ...it, correctAnswer: statementOpt1 } : it
                                )
                              )
                            }
                            className={cn(
                              'px-2.5 py-1 text-xs font-semibold rounded-md border transition-all flex items-center gap-1',
                              s.correctAnswer === statementOpt1
                                ? 'border-emerald-500 bg-emerald-600 text-white shadow-2xs'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card'
                            )}
                            title={`Tetapkan "${statementOpt1}" sebagai jawaban benar`}
                          >
                            {s.correctAnswer === statementOpt1 && (
                              <Check className="h-3 w-3 stroke-[3]" />
                            )}
                            <span>{statementOpt1 || 'Opsi 1'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setStatements(
                                statements.map((it) =>
                                  it.id === s.id ? { ...it, correctAnswer: statementOpt2 } : it
                                )
                              )
                            }
                            className={cn(
                              'px-2.5 py-1 text-xs font-semibold rounded-md border transition-all flex items-center gap-1',
                              s.correctAnswer === statementOpt2
                                ? 'border-amber-500 bg-amber-600 text-white shadow-2xs'
                                : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-card'
                            )}
                            title={`Tetapkan "${statementOpt2}" sebagai jawaban benar`}
                          >
                            {s.correctAnswer === statementOpt2 && (
                              <Check className="h-3 w-3 stroke-[3]" />
                            )}
                            <span>{statementOpt2 || 'Opsi 2'}</span>
                          </button>
                        </div>

                        {statements.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveStatement(s.id)}
                            className="h-7 w-7 p-0 text-destructive shrink-0"
                            title="Hapus baris pernyataan"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddStatement}
                    className="h-7 text-xs mt-1 font-medium"
                  >
                    + Tambah Pernyataan
                  </Button>
                </div>
              </div>
            )}

            {formType === 'PENJODOHAN' && (
              <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">Pasangan Menjodohkan:</div>
                  {formScoringMode === 'PER_SUB' && (
                    <span className="text-[11px] text-primary font-semibold">
                      Mode Skor Per Sub-Item: Tentukan poin untuk setiap pasangan tepat
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {matchingPairs.map((pair, idx) => (
                    <div key={pair.id} className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground w-4 text-center">
                        {idx + 1}.
                      </span>
                      <Input
                        required
                        placeholder="Premis (Kolom Kiri)"
                        value={pair.leftText}
                        onChange={(e) =>
                          setMatchingPairs(
                            matchingPairs.map((p) =>
                              p.id === pair.id ? { ...p, leftText: e.target.value } : p
                            )
                          )
                        }
                        className="text-xs flex-1"
                      />
                      <span className="text-muted-foreground font-bold">➔</span>
                      <Input
                        required
                        placeholder="Pasangan Tepat (Kolom Kanan)"
                        value={pair.rightText}
                        onChange={(e) =>
                          setMatchingPairs(
                            matchingPairs.map((p) =>
                              p.id === pair.id ? { ...p, rightText: e.target.value } : p
                            )
                          )
                        }
                        className="text-xs flex-1"
                      />
                      {formScoringMode === 'PER_SUB' && (
                        <div className="flex items-center gap-1 shrink-0 bg-card px-2 py-1 rounded-md border border-border">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Skor:
                          </span>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step={0.5}
                            value={pair.points ?? 2.5}
                            onChange={(e) =>
                              setMatchingPairs(
                                matchingPairs.map((p) =>
                                  p.id === pair.id
                                    ? { ...p, points: Number(e.target.value) || 0 }
                                    : p
                                )
                              )
                            }
                            className="w-14 h-7 text-xs font-mono font-bold text-center p-1"
                            placeholder="2.5"
                          />
                        </div>
                      )}
                      {matchingPairs.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveMatchingPair(pair.id)}
                          className="h-7 w-7 p-0 text-destructive shrink-0"
                        >
                          <X className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddMatchingPair}
                    className="h-7 text-xs mt-1 font-medium"
                  >
                    + Tambah Pasangan
                  </Button>
                </div>
              </div>
            )}

            {formType === 'ESAI' && (
              <div className="space-y-2 p-3.5 rounded-xl border border-border bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-foreground">
                    Rubrik Penilaian / Kunci Jawaban Acuan
                  </label>
                  <span className="text-[11px] text-muted-foreground">
                    Bobot skor diatur di bagian atas sebagai Total Poin Tunggal
                  </span>
                </div>
                <Textarea
                  rows={3}
                  placeholder="Tuliskan kata kunci yang wajib ada dalam jawaban siswa atau kriteria rubrik penskoran..."
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="font-semibold">
                {selectedQuestion ? 'Simpan Perubahan' : 'Tambahkan Butir Soal'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION INACTIVE (Pindahkan ke List Soal Inactive) */}
      <ConfirmationDialog
        open={inactiveConfirmOpen}
        onOpenChange={setInactiveConfirmOpen}
        title="Nonaktifkan Butir Soal"
        description={`Apakah Anda yakin ingin menonaktifkan soal "${selectedQuestion?.code}"? Soal ini akan dipindahkan ke "List Soal Inactive" dan disembunyikan dari daftar aktif.`}
        confirmLabel="Nonaktifkan Soal"
        onConfirm={() => {
          if (selectedQuestion) {
            setQuestionStatus(selectedQuestion.id, 'inactive');
            setSelectedQuestion(null);
          }
        }}
      />

      {/* CONFIRMATION ACTIVATE (Kembalikan ke List Soal Aktif) */}
      <ConfirmationDialog
        open={activateConfirmOpen}
        onOpenChange={setActivateConfirmOpen}
        title="Aktifkan Kembali Butir Soal"
        description={`Apakah Anda yakin ingin mengaktifkan kembali soal "${selectedQuestion?.code}"? Soal ini akan kembali muncul pada daftar butir soal aktif.`}
        confirmLabel="Aktifkan Kembali"
        onConfirm={() => {
          if (selectedQuestion) {
            setQuestionStatus(selectedQuestion.id, 'active');
            setSelectedQuestion(null);
          }
        }}
      />

      {/* CONFIRMATION PERMANENT DELETE (Hapus Permanen) */}
      <ConfirmationDialog
        open={deletePermanentOpen}
        onOpenChange={setDeletePermanentOpen}
        title="Hapus Butir Soal Secara Permanen"
        description={`PERINGATAN: Apakah Anda yakin ingin MENGHAPUS PERMANEN soal "${selectedQuestion?.code}"? Tindakan ini tidak dapat dibatalkan dan akan menghapus butir soal dari seluruh paket dan riwayat.`}
        confirmLabel="Hapus Permanen"
        variant="destructive"
        onConfirm={() => {
          if (selectedQuestion) {
            deleteQuestion(selectedQuestion.id);
            setSelectedQuestion(null);
          }
        }}
      />
    </div>
  );
}
