'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit2,
  Trash2,
  Layers,
  FolderKanban,
  FileQuestion,
  Search,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Check,
  X,
  Eye,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  HelpCircle,
  FileText,
  RotateCcw,
  PlusCircle,
  Hash,
  Tag,
  GripVertical,
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
  QuestionPackage,
  SubTopic,
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

export function PaketSoalView() {
  const {
    questionPackages,
    questions,
    addQuestionPackage,
    updateQuestionPackage,
    deleteQuestionPackage,
    addSubTopic,
    updateSubTopic,
    deleteSubTopic,
    assignQuestionsToSubTopic,
    removeQuestionFromSubTopic,
    addQuestion,
  } = useExamStore();

  // Dialog & Panel states
  const [packageModalOpen, setPackageModalOpen] = React.useState(false);
  const [deletePackageOpen, setDeletePackageOpen] = React.useState(false);
  const [selectedPackage, setSelectedPackage] = React.useState<QuestionPackage | null>(null);

  // Side Right Panel state (mirip seperti Data Peserta di Peserta perEvent)
  const [selectedPackageForSubTopics, setSelectedPackageForSubTopics] =
    React.useState<QuestionPackage | null>(null);
  const [panelWidth, setPanelWidth] = React.useState<number>(660);
  const isResizingRef = React.useRef(false);

  // Sub Topic creation/edit state
  const [newSubTopicName, setNewSubTopicName] = React.useState('');
  const [newSubTopicDesc, setNewSubTopicDesc] = React.useState('');
  const [editingSubTopic, setEditingSubTopic] = React.useState<SubTopic | null>(null);

  // Question Picker modal state (Pop-up modal: Pilih dari Butir Soal)
  const [pickerModalOpen, setPickerModalOpen] = React.useState(false);
  const [activeSubTopicForPicker, setActiveSubTopicForPicker] = React.useState<SubTopic | null>(null);
  const [selectedQuestionIdsFromPicker, setSelectedQuestionIdsFromPicker] = React.useState<string[]>([]);
  const [pickerSearchQuery, setPickerSearchQuery] = React.useState('');

  // Complete Question Creator modal state (Pop-up modal: Buat Butir Soal Baru persis menu Butir Soal)
  const [createModalOpen, setCreateModalOpen] = React.useState(false);
  const [activeSubTopicForCreate, setActiveSubTopicForCreate] = React.useState<SubTopic | null>(null);

  // Form state for creating question (persis seperti Butir Soal)
  const [formQuestionCode, setFormQuestionCode] = React.useState('');
  const [formQuestionSubject, setFormQuestionSubject] = React.useState('Matematika Wajib');
  const [formQuestionType, setFormQuestionType] = React.useState<QuestionTypeEnum>('PG');
  const [formQuestionDifficulty, setFormQuestionDifficulty] = React.useState<'Mudah' | 'Sedang' | 'Sukar'>('Sedang');
  const [formQuestionPrompt, setFormQuestionPrompt] = React.useState('');
  const [formQuestionScoringMode, setFormQuestionScoringMode] = React.useState<'TOTAL' | 'PER_SUB'>('TOTAL');
  const [formQuestionPoints, setFormQuestionPoints] = React.useState(4);
  const [formQuestionTags, setFormQuestionTags] = React.useState('Kurikulum Merdeka');
  const [formQuestionAuthor, setFormQuestionAuthor] = React.useState('Penyusun Paket');

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

  // Preview Question modal state
  const [previewQuestion, setPreviewQuestion] = React.useState<QuestionItem | null>(null);
  const [previewModalOpen, setPreviewModalOpen] = React.useState(false);

  // Filters for Packages list
  const [subjectFilter, setSubjectFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');

  // Package Form State (Langkah 1)
  const [formCode, setFormCode] = React.useState('');
  const [formName, setFormName] = React.useState('');
  const [formSubject, setFormSubject] = React.useState('Matematika Wajib');
  const [formLevel, setFormLevel] = React.useState('SMA / XII');
  const [formAcademicYear, setFormAcademicYear] = React.useState('2024/2025');
  const [formDescription, setFormDescription] = React.useState('');
  const [formStatus, setFormStatus] = React.useState<'active' | 'draft'>('active');

  // Active package currently open in Right Panel
  const activePackage = React.useMemo(() => {
    if (!selectedPackageForSubTopics) return null;
    return (
      questionPackages.find((p) => p.id === selectedPackageForSubTopics.id) ||
      selectedPackageForSubTopics
    );
  }, [selectedPackageForSubTopics, questionPackages]);

  // Unique subjects for filter
  const uniqueSubjects = React.useMemo(() => {
    return Array.from(new Set(questionPackages.map((p) => p.subject))).filter(Boolean);
  }, [questionPackages]);

  // Filtered packages
  const filteredPackages = React.useMemo(() => {
    return questionPackages.filter((pkg) => {
      const matchSub = subjectFilter === 'all' || pkg.subject === subjectFilter;
      const matchStat = statusFilter === 'all' || pkg.status === statusFilter;
      return matchSub && matchStat;
    });
  }, [questionPackages, subjectFilter, statusFilter]);

  // Resizing logic for Right Panel
  const startResizing = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRef.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'ew-resize';

    const handleMouseMove = (mouseEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const newWidth = window.innerWidth - mouseEvent.clientX;
      const minWidth = 440;
      const maxWidth = Math.min(1150, window.innerWidth - 60);
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  }, []);

  // Calculate sub points for PER_SUB mode in question creation
  const calculatedSubPoints = React.useMemo(() => {
    if (formQuestionType === 'ESAI') {
      return formQuestionPoints;
    }
    if (formQuestionType === 'PG') {
      if (formQuestionScoringMode === 'PER_SUB') {
        const pts = Object.values(optionPoints).map((v) => Number(v) || 0);
        return Math.max(...pts, 0) || formQuestionPoints;
      }
      return formQuestionPoints;
    }
    if (formQuestionType === 'PERNYATAAN') {
      return statements.reduce((acc, s) => acc + (Number(s.points) || 0), 0);
    }
    if (formQuestionType === 'PENJODOHAN') {
      return matchingPairs.reduce((acc, m) => acc + (Number(m.points) || 0), 0);
    }
    if (formQuestionType === 'MULTI_CHOICE') {
      return multiOptions
        .filter((o) => o.isCorrect)
        .reduce((acc, o) => acc + (Number(o.points) || 0), 0);
    }
    return formQuestionPoints;
  }, [
    formQuestionType,
    formQuestionScoringMode,
    optionPoints,
    statements,
    matchingPairs,
    multiOptions,
    formQuestionPoints,
  ]);

  // KPI statistics
  const stats = React.useMemo(() => {
    const totalPackages = questionPackages.length;
    const totalSubTopics = questionPackages.reduce((acc, p) => acc + (p.subTopics?.length || 0), 0);
    const totalAllocatedQuestions = questionPackages.reduce(
      (acc, p) =>
        acc +
        (p.subTopics?.reduce((subAcc, s) => subAcc + (s.questionIds?.length || 0), 0) || 0),
      0
    );
    const activePackagesCount = questionPackages.filter((p) => p.status === 'active').length;

    return { totalPackages, totalSubTopics, totalAllocatedQuestions, activePackagesCount };
  }, [questionPackages]);

  // Open modal create new package
  const handleOpenAddPackage = () => {
    setSelectedPackage(null);
    setFormCode(`PKT-${Date.now().toString().slice(-4)}`);
    setFormName('');
    setFormSubject('Matematika Wajib');
    setFormLevel('SMA / XII');
    setFormAcademicYear('2024/2025');
    setFormDescription('');
    setFormStatus('active');
    setPackageModalOpen(true);
  };

  // Open modal edit package basic info
  const handleOpenEditPackage = (pkg: QuestionPackage) => {
    setSelectedPackage(pkg);
    setFormCode(pkg.code);
    setFormName(pkg.name);
    setFormSubject(pkg.subject);
    setFormLevel(pkg.level || 'SMA / XII');
    setFormAcademicYear(pkg.academicYear || '2024/2025');
    setFormDescription(pkg.description || '');
    setFormStatus(pkg.status === 'active' ? 'active' : 'draft');
    setPackageModalOpen(true);
  };

  // Open manage sub-topics in Side Right Panel
  const handleOpenManageSubTopicsPanel = (pkg: QuestionPackage) => {
    setSelectedPackageForSubTopics(pkg);
    setNewSubTopicName('');
    setNewSubTopicDesc('');
    setEditingSubTopic(null);
  };

  // Submit Step 1: Create or update package
  const handleSubmitPackageForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formCode.trim() || !formName.trim()) return;

    if (selectedPackage) {
      updateQuestionPackage(selectedPackage.id, {
        code: formCode,
        name: formName,
        subject: formSubject,
        level: formLevel,
        academicYear: formAcademicYear,
        description: formDescription,
        status: formStatus,
      });
      setPackageModalOpen(false);
    } else {
      const newPkgId = `pkg-${Date.now()}`;
      addQuestionPackage({
        code: formCode,
        name: formName,
        subject: formSubject,
        level: formLevel,
        academicYear: formAcademicYear,
        description: formDescription,
        status: formStatus,
        subTopics: [],
      });

      setPackageModalOpen(false);

      // LANGKAH SELANJUTNYA: Langsung buka Side Right Panel penentuan Sub Materi
      setTimeout(() => {
        const createdPkg = questionPackages.find((p) => p.code === formCode) || {
          id: newPkgId,
          code: formCode,
          name: formName,
          subject: formSubject,
          level: formLevel,
          academicYear: formAcademicYear,
          description: formDescription,
          status: formStatus,
          subTopics: [],
          createdAt: new Date().toISOString().split('T')[0],
        };
        handleOpenManageSubTopicsPanel(createdPkg);
      }, 150);
    }
  };

  // Add new Sub Topic dynamically inside Right Panel
  const handleAddSubTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackage || !newSubTopicName.trim()) return;

    if (editingSubTopic) {
      updateSubTopic(activePackage.id, editingSubTopic.id, {
        name: newSubTopicName,
        description: newSubTopicDesc,
      });
      setEditingSubTopic(null);
    } else {
      addSubTopic(activePackage.id, {
        name: newSubTopicName,
        description: newSubTopicDesc,
        orderNumber: (activePackage.subTopics?.length || 0) + 1,
        questionIds: [],
      });
    }

    setNewSubTopicName('');
    setNewSubTopicDesc('');
  };

  // Open Question Picker Modal (Pilih Dari Butir Soal yang sudah ada)
  const handleOpenPicker = (st: SubTopic) => {
    setActiveSubTopicForPicker(st);
    setSelectedQuestionIdsFromPicker([]);
    setPickerSearchQuery('');
    setPickerModalOpen(true);
  };

  // Candidates for picker modal (soal aktif dari bank soal yang sesuai mapel dan belum ada di sub materi ini)
  const candidateQuestionsForPicker = React.useMemo(() => {
    if (!activeSubTopicForPicker || !activePackage) return [];
    const currentSubTopicIds = new Set(activeSubTopicForPicker.questionIds);

    return questions
      .filter((q) => q.status !== 'inactive')
      .filter((q) => q.subject === activePackage.subject)
      .filter((q) => !currentSubTopicIds.has(q.id))
      .filter((q) => {
        if (!pickerSearchQuery.trim()) return true;
        const query = pickerSearchQuery.toLowerCase();
        return q.prompt.toLowerCase().includes(query) || q.code.toLowerCase().includes(query);
      });
  }, [questions, activeSubTopicForPicker, activePackage, pickerSearchQuery]);

  // Confirm selection from Question Picker Modal
  const handleConfirmPickerSelection = () => {
    if (!activePackage || !activeSubTopicForPicker || selectedQuestionIdsFromPicker.length === 0)
      return;
    assignQuestionsToSubTopic(
      activePackage.id,
      activeSubTopicForPicker.id,
      selectedQuestionIdsFromPicker
    );
    setPickerModalOpen(false);
  };

  // Open Complete Question Creator Modal (Buat Butir Soal Baru persis menu Butir Soal)
  const handleOpenCreateQuestionModal = (st: SubTopic) => {
    setActiveSubTopicForCreate(st);
    setFormQuestionCode(`SOAL-${Date.now().toString().slice(-4)}`);
    setFormQuestionSubject(activePackage?.subject || 'Matematika Wajib');
    setFormQuestionType('PG');
    setFormQuestionDifficulty('Sedang');
    setFormQuestionPrompt('');
    setFormQuestionScoringMode('TOTAL');
    setFormQuestionPoints(4);
    setFormQuestionTags(`Paket ${activePackage?.name || ''}, ${st.name}`);
    setFormQuestionAuthor('Guru Pengampu');

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
    setCreateModalOpen(true);
  };

  // Preset changes for Statement question
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

  // Confirm Complete Question Creator Modal
  const handleConfirmCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePackage || !activeSubTopicForCreate) return;
    if (!formQuestionPrompt.trim() || !formQuestionCode.trim()) return;

    const tagsArray = formQuestionTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const effectiveScoringMode = formQuestionType === 'ESAI' ? 'TOTAL' : formQuestionScoringMode;

    let finalPoints = Number(formQuestionPoints) || 1;
    if (formQuestionType === 'ESAI') {
      finalPoints = Number(formQuestionPoints) || 1;
    } else if (effectiveScoringMode === 'PER_SUB') {
      finalPoints = calculatedSubPoints;
    }

    const newQuestionId = `qst-${Date.now()}`;

    let payload: Omit<QuestionItem, 'id' | 'createdAt'> = {
      code: formQuestionCode,
      subject: formQuestionSubject,
      type: formQuestionType,
      difficulty: formQuestionDifficulty,
      prompt: formQuestionPrompt,
      scoringMode: effectiveScoringMode,
      defaultPoints: finalPoints,
      tags: tagsArray,
      author: formQuestionAuthor,
      status: 'active',
    };

    if (formQuestionType === 'PG') {
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
    } else if (formQuestionType === 'MULTI_CHOICE') {
      const correctKeys = multiOptions.filter((o) => o.isCorrect).map((o) => o.key);
      payload = {
        ...payload,
        multiOptions: multiOptions.map((o) => ({
          ...o,
          points: Number(o.points) || 0,
        })),
        correctAnswersMulti: correctKeys,
      };
    } else if (formQuestionType === 'PERNYATAAN') {
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
    } else if (formQuestionType === 'PENJODOHAN') {
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

    // 1. Simpan ke Bank Soal
    addQuestion(payload);

    // 2. Langsung alokasikan ke Sub Materi yang sedang aktif
    assignQuestionsToSubTopic(activePackage.id, activeSubTopicForCreate.id, [newQuestionId]);

    setCreateModalOpen(false);
  };

  // Helper functions for options
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
  const columns: ColumnDef<QuestionPackage>[] = [
    {
      header: 'No',
      cell: (_row, idx) => (
        <span className="font-mono text-xs font-semibold text-muted-foreground w-6 text-center block">
          {(idx ?? 0) + 1}
        </span>
      ),
      className: 'w-12 text-center',
    },
    {
      header: 'Kode Paket',
      accessorKey: 'code',
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Nama Paket Soal & Materi',
      accessorKey: 'name',
      sortable: true,
      cell: (row) => (
        <div className="space-y-0.5 max-w-sm">
          <div className="font-bold text-xs text-foreground leading-snug">{row.name}</div>
          <div className="text-xs font-semibold text-primary">{row.subject}</div>
          {row.description && (
            <p className="text-[11px] text-muted-foreground line-clamp-1">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      header: 'Jenjang & Tapel',
      accessorKey: 'level',
      sortable: true,
      cell: (row) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-foreground">{row.level || 'SMA / XII'}</div>
          <div className="text-[10px] text-muted-foreground">{row.academicYear || '2024/2025'}</div>
        </div>
      ),
    },
    {
      header: 'Sub Materi Dinamis',
      cell: (row) => {
        const count = row.subTopics?.length || 0;
        return (
          <div className="space-y-0.5">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
              {count} Sub Materi
            </span>
            <div className="text-[10px] text-muted-foreground">Topik Bahasan</div>
          </div>
        );
      },
    },
    {
      header: 'Total Butir Soal',
      cell: (row) => {
        const totalQ =
          row.subTopics?.reduce((acc, s) => acc + (s.questionIds?.length || 0), 0) || 0;
        return (
          <div className="space-y-0.5">
            <span className="font-bold text-xs text-foreground flex items-center gap-1">
              <FileQuestion className="h-3.5 w-3.5 text-primary" />
              <span>{totalQ} Soal</span>
            </span>
            <div className="text-[10px] text-muted-foreground">Teralokasi dalam paket</div>
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
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25'
              : 'bg-muted text-muted-foreground border-border'
          )}
        >
          {row.status === 'active' ? 'Aktif' : 'Draft'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cell: (row) => {
        const isSelected = selectedPackageForSubTopics?.id === row.id;

        return (
          <div className="flex items-center justify-end gap-1.5">
            {/* Kelola Sub Materi & Butir Soal (Opens Side Right Panel) */}
            <Button
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleOpenManageSubTopicsPanel(row)}
              className={cn(
                'h-8 text-xs font-semibold gap-1.5 transition-colors',
                isSelected && 'shadow-xs'
              )}
              title="Buka panel kelola sub materi dan butir soal paket ini"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Kelola Sub Materi</span>
              <ArrowRight className="h-3 w-3" />
            </Button>

            {/* Edit info dasar paket */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenEditPackage(row)}
              className="h-8 w-8 p-0"
              title="Edit info paket soal"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </Button>

            {/* Hapus paket */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedPackage(row);
                setDeletePackageOpen(true);
              }}
              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
              title="Hapus paket soal"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="relative space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Paket Soal (Wrap Butir Soal)"
        description="Kelola paket bundel soal ujian dengan sub materi dinamis. Susun dan petakan butir soal berdasarkan topik bahasan kompetensi untuk modul tryout dan ujian."
      >
        <Link href="/bank-soal/butir">
          <Button variant="outline" className="gap-2 font-semibold shadow-2xs">
            <FileQuestion className="h-4 w-4" />
            <span>Lihat Butir Soal</span>
          </Button>
        </Link>
        <Button onClick={handleOpenAddPackage} className="gap-2 font-semibold shadow-2xs">
          <Plus className="h-4 w-4" />
          <span>Buat Paket Soal Baru</span>
        </Button>
      </PageHeader>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Paket Soal</span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.totalPackages} Paket
          </div>
          <p className="text-[11px] text-muted-foreground">Bundel soal terdaftar</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Total Sub Materi Dinamis</span>
          <div className="text-2xl font-bold tracking-tight text-primary">
            {stats.totalSubTopics} Sub Materi
          </div>
          <p className="text-[11px] text-muted-foreground">Topik pengelompokan soal</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">
            Soal Teralokasi dalam Paket
          </span>
          <div className="text-2xl font-bold tracking-tight text-foreground">
            {stats.totalAllocatedQuestions} Butir
          </div>
          <p className="text-[11px] text-muted-foreground">Tersusun rapi per sub materi</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-2xs space-y-1">
          <span className="text-xs font-medium text-muted-foreground">Paket Status Aktif</span>
          <div className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
            {stats.activePackagesCount} Paket
          </div>
          <p className="text-[11px] text-muted-foreground">Siap dijadwalkan ke Event Ujian</p>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-border bg-card text-xs shadow-2xs">
        <span className="font-semibold text-foreground flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
          <span>Filter Paket:</span>
        </span>

        {/* Filter Mapel */}
        <div className="w-56">
          <Select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
            <option value="all">Semua Mata Pelajaran</option>
            {uniqueSubjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </Select>
        </div>

        {/* Filter Status */}
        <div className="w-36">
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="draft">Draft</option>
          </Select>
        </div>

        {(subjectFilter !== 'all' || statusFilter !== 'all') && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSubjectFilter('all');
              setStatusFilter('all');
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
        data={filteredPackages}
        columns={columns}
        searchKey="name"
        searchPlaceholder="Cari nama paket soal, kode, atau materi..."
      />

      {/* RESIZABLE SIDE RIGHT PANEL: KELOLA SUB MATERI (Persis Komponen Data Peserta) */}
      {activePackage && selectedPackageForSubTopics && (
        <>
          {/* Mobile backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs"
            onClick={() => setSelectedPackageForSubTopics(null)}
          />

          {/* Right Panel Surface */}
          <aside
            style={{ width: `${panelWidth}px` }}
            className={cn(
              'fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-card border-l border-border shadow-2xl transition-transform duration-200 ease-out',
              'max-w-[95vw]'
            )}
          >
            {/* Draggable Resizer Handle on Left Edge */}
            <div
              onMouseDown={startResizing}
              className="absolute left-0 top-0 bottom-0 w-3 -translate-x-1.5 cursor-ew-resize hover:bg-primary/40 active:bg-primary z-50 flex items-center justify-center group select-none transition-colors"
              title="Tahan dan geser ke kiri/kanan untuk menyesuaikan lebar panel"
            >
              <div className="h-10 w-1 rounded-full bg-muted-foreground/30 group-hover:bg-primary group-active:bg-primary transition-colors" />
            </div>

            {/* Panel Header */}
            <div className="p-4 border-b border-border bg-muted/40 shrink-0">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                      {activePackage.code}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground border border-border">
                      {activePackage.subject}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activePackage.level || 'SMA / XII'} • {activePackage.academicYear || '2024/2025'}
                    </span>
                  </div>
                  <h3
                    className="font-bold text-sm text-foreground leading-snug truncate"
                    title={activePackage.name}
                  >
                    Kelola Sub Materi: {activePackage.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Lebar panel dapat diseret (Drag tepi kiri). Saat ini:{' '}
                    <span className="font-mono font-semibold">{panelWidth}px</span>
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPackageForSubTopics(null)}
                  className="h-8 w-8 p-0 shrink-0 hover:bg-muted"
                  title="Tutup panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Package Sub Metrics Pills */}
              <div className="grid grid-cols-3 gap-2 pt-3 mt-3 border-t border-border/60 text-center text-xs">
                <div className="p-2 rounded-lg bg-card border border-border space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Sub Materi Dinamis</span>
                  <span className="font-bold text-foreground text-sm">
                    {activePackage.subTopics?.length || 0} Sub
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-primary space-y-0.5">
                  <span className="text-[10px] block opacity-80">Total Butir Soal</span>
                  <span className="font-bold text-sm">
                    {activePackage.subTopics?.reduce(
                      (acc, s) => acc + (s.questionIds?.length || 0),
                      0
                    ) || 0}{' '}
                    Soal
                  </span>
                </div>
                <div className="p-2 rounded-lg bg-card border border-border space-y-0.5">
                  <span className="text-[10px] text-muted-foreground block">Status Paket</span>
                  <span className="font-bold text-foreground text-sm">
                    {activePackage.status === 'active' ? 'Aktif' : 'Draft'}
                  </span>
                </div>
              </div>
            </div>

            {/* Panel Form Tambah Sub Materi Baru (Dinamis) */}
            <div className="p-3.5 border-b border-border bg-card shrink-0">
              <form onSubmit={handleAddSubTopic} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground flex items-center gap-1.5">
                    <PlusCircle className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {editingSubTopic ? 'Edit Sub Materi' : 'Tambah Sub Materi Baru (Dinamis)'}
                    </span>
                  </span>
                  {editingSubTopic && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingSubTopic(null);
                        setNewSubTopicName('');
                        setNewSubTopicDesc('');
                      }}
                      className="h-6 text-[11px] text-muted-foreground"
                    >
                      Batal Edit
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="sm:col-span-2 space-y-1">
                    <Input
                      required
                      placeholder="Nama Sub Materi (contoh: Kalkulus, Dimensi Tiga, Aljabar)..."
                      value={newSubTopicName}
                      onChange={(e) => setNewSubTopicName(e.target.value)}
                      className="text-xs h-8"
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      placeholder="Deskripsi singkat..."
                      value={newSubTopicDesc}
                      onChange={(e) => setNewSubTopicDesc(e.target.value)}
                      className="text-xs h-8 flex-1"
                    />
                    <Button type="submit" size="sm" className="font-semibold shrink-0 h-8 text-xs">
                      {editingSubTopic ? 'Update' : '+ Simpan Sub'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>

            {/* Panel Scrollable List of Sub Topics */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {(activePackage.subTopics?.length || 0) === 0 ? (
                <div className="p-8 text-center border border-border rounded-xl bg-card space-y-2">
                  <Layers className="h-8 w-8 text-muted-foreground/40 mx-auto" />
                  <p className="font-semibold text-foreground">Belum ada Sub Materi pada paket ini</p>
                  <p className="text-muted-foreground max-w-xs mx-auto text-xs">
                    Tambahkan sub materi pertama di atas untuk mulai mengelompokkan butir soal.
                  </p>
                </div>
              ) : (
                activePackage.subTopics.map((st, sIdx) => {
                  const subQuestions = st.questionIds
                    .map((qid) => questions.find((q) => q.id === qid))
                    .filter(Boolean) as QuestionItem[];

                  return (
                    <div
                      key={st.id}
                      className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs space-y-2 p-3.5"
                    >
                      {/* Sub Topic Header */}
                      <div className="flex items-start justify-between gap-2 border-b border-border/60 pb-2">
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              Sub {sIdx + 1}
                            </span>
                            <span className="font-bold text-xs text-foreground truncate">
                              {st.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                              {st.questionIds.length} Butir Soal
                            </span>
                          </div>
                          {st.description && (
                            <p className="text-[11px] text-muted-foreground">{st.description}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSubTopic(st);
                              setNewSubTopicName(st.name);
                              setNewSubTopicDesc(st.description || '');
                            }}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                            title="Edit nama sub materi"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteSubTopic(activePackage.id, st.id)}
                            className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                            title="Hapus sub materi ini"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      {/* List Butir Soal di Sub Materi ini */}
                      {subQuestions.length === 0 ? (
                        <div className="py-3 text-center text-muted-foreground text-xs italic bg-muted/20 rounded-lg">
                          Belum ada butir soal di sub materi ini. Pilih dari Bank Soal atau buat baru di bawah.
                        </div>
                      ) : (
                        <div className="border border-border rounded-lg overflow-hidden bg-card text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead className="bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground">
                              <tr>
                                <th className="p-2 w-8 text-center">No</th>
                                <th className="p-2 w-28">Kode & Tipe</th>
                                <th className="p-2">Teks Soal</th>
                                <th className="p-2 w-16 text-right">Poin</th>
                                <th className="p-2 w-16 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {subQuestions.map((q, qIdx) => (
                                <tr key={q.id} className="hover:bg-muted/30">
                                  <td className="p-2 text-center font-mono text-[11px] text-muted-foreground">
                                    {qIdx + 1}
                                  </td>
                                  <td className="p-2">
                                    <div className="font-mono text-[11px] font-semibold">{q.code}</div>
                                    <span className="text-[10px] text-muted-foreground">{q.type}</span>
                                  </td>
                                  <td className="p-2">
                                    <p className="line-clamp-1 font-medium">{q.prompt}</p>
                                  </td>
                                  <td className="p-2 text-right font-bold text-primary font-mono">
                                    {q.defaultPoints} Pts
                                  </td>
                                  <td className="p-2 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setPreviewQuestion(q);
                                          setPreviewModalOpen(true);
                                        }}
                                        className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                        title="Preview soal"
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          removeQuestionFromSubTopic(activePackage.id, st.id, q.id)
                                        }
                                        className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10"
                                        title="Hapus dari sub materi ini"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {/* Action Buttons Per Sub Materi: Pilih dari Bank Soal OR Buat Soal Baru (Pop-up Modal) */}
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenPicker(st)}
                          className="h-7 text-xs font-semibold gap-1.5"
                        >
                          <FileQuestion className="h-3.5 w-3.5 text-primary" />
                          <span>+ Pilih Dari Butir Soal</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleOpenCreateQuestionModal(st)}
                          className="h-7 text-xs font-semibold gap-1.5"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>+ Buat Butir Soal Baru</span>
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Panel Footer */}
            <div className="p-3 border-t border-border bg-muted/30 flex items-center justify-between gap-2 shrink-0">
              <span className="text-[11px] text-muted-foreground">
                Tersinkronisasi otomatis dengan Bank Soal CBT
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPackageForSubTopics(null)}
                className="text-xs font-semibold"
              >
                Tutup Panel
              </Button>
            </div>
          </aside>
        </>
      )}

      {/* POP-UP MODAL: STEP 1 BUAT / EDIT PAKET SOAL */}
      <Dialog open={packageModalOpen} onOpenChange={setPackageModalOpen}>
        <DialogContent maxWidth="max-w-lg">
          <form onSubmit={handleSubmitPackageForm} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <Layers className="h-5 w-5 text-primary" />
                <span>{selectedPackage ? 'Edit Paket Soal' : 'Buat Paket Soal Baru'}</span>
              </DialogTitle>
              <DialogDescription>
                Tentukan kode paket, nama paket, dan materi utama. Setelah disimpan, Side Right Panel penentuan sub materi akan langsung terbuka otomatis.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kode Paket Soal *</label>
                <Input
                  required
                  placeholder="PKT-MAT-UTBK-01"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Status Paket *</label>
                <Select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as 'active' | 'draft')}
                >
                  <option value="active">Aktif</option>
                  <option value="draft">Draft (Konsep)</option>
                </Select>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-foreground">Nama Paket Soal *</label>
                <Input
                  required
                  placeholder="Paket Intensif UTBK SNBT - Penalaran Matematika"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Mata Pelajaran / Materi *</label>
                <Select value={formSubject} onChange={(e) => setFormSubject(e.target.value)}>
                  <option value="Matematika Wajib">Matematika Wajib</option>
                  <option value="Bahasa Indonesia">Bahasa Indonesia</option>
                  <option value="Fisika Terapan">Fisika Terapan</option>
                  <option value="Biologi">Biologi</option>
                  <option value="Kimia">Kimia</option>
                  <option value="Bahasa Inggris">Bahasa Inggris</option>
                  <option value="Penalaran Umum">Penalaran Umum</option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Jenjang / Tingkat</label>
                <Input
                  placeholder="SMA / XII"
                  value={formLevel}
                  onChange={(e) => setFormLevel(e.target.value)}
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="font-semibold text-foreground">Deskripsi Paket Soal</label>
                <Textarea
                  rows={2}
                  placeholder="Ringkasan cakupan materi atau tujuan evaluasi paket..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPackageModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="font-semibold">
                {selectedPackage ? 'Simpan Perubahan' : 'Simpan & Lanjut Penentuan Sub Materi →'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL: PILIH DARI BUTIR SOAL YANG ADA */}
      <Dialog open={pickerModalOpen} onOpenChange={setPickerModalOpen}>
        <DialogContent maxWidth="max-w-2xl">
          <div className="space-y-3 text-xs">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                <FileQuestion className="h-4 w-4 text-primary" />
                <span>Pilih Butir Soal untuk: {activeSubTopicForPicker?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Pilih dari daftar butir soal aktif mapel &ldquo;{activePackage?.subject}&rdquo; yang belum dimasukkan ke sub materi ini.
              </DialogDescription>
            </DialogHeader>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Cari kode atau prompt soal..."
                value={pickerSearchQuery}
                onChange={(e) => setPickerSearchQuery(e.target.value)}
                className="pl-8 text-xs h-8"
              />
            </div>

            <div className="max-h-64 overflow-y-auto border border-border rounded-lg divide-y divide-border bg-card">
              {candidateQuestionsForPicker.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs">
                  Tidak ada butir soal yang cocok atau semua butir soal mapel ini sudah teralokasi ke sub materi ini.
                </div>
              ) : (
                candidateQuestionsForPicker.map((q) => {
                  const isChecked = selectedQuestionIdsFromPicker.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className="flex items-start gap-2.5 p-2.5 hover:bg-muted/40 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedQuestionIdsFromPicker([...selectedQuestionIdsFromPicker, q.id]);
                          } else {
                            setSelectedQuestionIdsFromPicker(
                              selectedQuestionIdsFromPicker.filter((id) => id !== q.id)
                            );
                          }
                        }}
                        className="accent-primary h-4 w-4 mt-0.5"
                      />
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[11px] text-foreground">{q.code}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-muted text-muted-foreground border border-border">
                            {q.type}
                          </span>
                          <span className="text-[10px] font-semibold text-primary">{q.defaultPoints} Poin</span>
                        </div>
                        <p className="text-[11px] text-foreground line-clamp-2">{q.prompt}</p>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPickerModalOpen(false)}>
                Batal
              </Button>
              <Button
                onClick={handleConfirmPickerSelection}
                disabled={selectedQuestionIdsFromPicker.length === 0}
                className="font-semibold"
              >
                Tambahkan {selectedQuestionIdsFromPicker.length} Soal ke Sub Materi
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL: BUAT BUTIR SOAL BARU (PERSIS KOMPONEN DI MENU BUTIR SOAL) */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent maxWidth="max-w-3xl">
          <form onSubmit={handleConfirmCreateQuestion} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-bold text-foreground">
                <FileText className="h-5 w-5 text-primary" />
                <span>Buat Butir Soal Baru untuk Sub Materi: {activeSubTopicForCreate?.name}</span>
              </DialogTitle>
              <DialogDescription>
                Soal baru yang dibuat akan langsung tersimpan di Bank Soal dan otomatis masuk ke sub materi &ldquo;{activeSubTopicForCreate?.name}&rdquo;.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">Kode Soal *</label>
                <Input
                  required
                  placeholder="MAT-XII-001"
                  value={formQuestionCode}
                  onChange={(e) => setFormQuestionCode(e.target.value)}
                  className="font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Mata Pelajaran *</label>
                <Select
                  value={formQuestionSubject}
                  onChange={(e) => setFormQuestionSubject(e.target.value)}
                >
                  <option value={activePackage?.subject || 'Matematika Wajib'}>
                    {activePackage?.subject || 'Matematika Wajib'} (Sesuai Paket)
                  </option>
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
                  value={formQuestionType}
                  onChange={(e) => {
                    const nextType = e.target.value as QuestionTypeEnum;
                    setFormQuestionType(nextType);
                    if (nextType === 'ESAI') {
                      setFormQuestionScoringMode('TOTAL');
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
                  value={formQuestionPrompt}
                  onChange={(e) => setFormQuestionPrompt(e.target.value)}
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Tingkat Kesulitan</label>
                <Select
                  value={formQuestionDifficulty}
                  onChange={(e) =>
                    setFormQuestionDifficulty(e.target.value as 'Mudah' | 'Sedang' | 'Sukar')
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
                  {formQuestionType === 'ESAI' && (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Terkunci: Esai wajib Total Poin
                    </span>
                  )}
                </div>
                <Select
                  value={formQuestionType === 'ESAI' ? 'TOTAL' : formQuestionScoringMode}
                  disabled={formQuestionType === 'ESAI'}
                  onChange={(e) =>
                    setFormQuestionScoringMode(e.target.value as 'TOTAL' | 'PER_SUB')
                  }
                >
                  <option value="TOTAL">Total Poin Tunggal</option>
                  <option value="PER_SUB" disabled={formQuestionType === 'ESAI'}>
                    Skor Per Sub-Item {formQuestionType === 'ESAI' ? '(Tidak berlaku untuk Esai)' : ''}
                  </option>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  {formQuestionType !== 'ESAI' && formQuestionScoringMode === 'PER_SUB'
                    ? 'Total Poin Otomatis (Sub-Item)'
                    : 'Bobot Poin *'}
                </label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  required
                  disabled={
                    formQuestionType !== 'ESAI' && formQuestionScoringMode === 'PER_SUB'
                  }
                  value={
                    formQuestionType !== 'ESAI' && formQuestionScoringMode === 'PER_SUB'
                      ? calculatedSubPoints
                      : formQuestionPoints
                  }
                  onChange={(e) => setFormQuestionPoints(Number(e.target.value) || 1)}
                  className="font-mono font-bold"
                />
              </div>
            </div>

            {/* Dynamic Options Editor by Type (Persis seperti di Butir Soal) */}
            {formQuestionType === 'PG' && (
              <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">Pilihan Ganda (A - E):</div>
                  {formQuestionScoringMode === 'PER_SUB' && (
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
                      {formQuestionScoringMode === 'PER_SUB' && (
                        <div className="flex items-center gap-1 shrink-0 bg-card px-2 py-1 rounded-md border border-border">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Skor:
                          </span>
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
                          name="correctAnswerInSub"
                          checked={correctAnswer === letter}
                          onChange={() => {
                            setCorrectAnswer(letter);
                            if (
                              formQuestionScoringMode === 'PER_SUB' &&
                              (!optionPoints[letter] || optionPoints[letter] === 0)
                            ) {
                              setOptionPoints({
                                ...optionPoints,
                                [letter]: formQuestionPoints || 4,
                              });
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

            {formQuestionType === 'MULTI_CHOICE' && (
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
                      {formQuestionScoringMode === 'PER_SUB' && (
                        <div className="flex items-center gap-1 shrink-0 bg-card px-2 py-1 rounded-md border border-border">
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Skor:
                          </span>
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

            {formQuestionType === 'PERNYATAAN' && (
              <div className="space-y-3 p-3.5 rounded-xl border border-border bg-muted/20 text-xs">
                {/* Preset & Dynamic Label Configuration Header */}
                <div className="p-3 rounded-lg border border-border bg-card space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="font-bold text-foreground flex items-center gap-1.5">
                      <SlidersHorizontal className="h-3.5 w-3.5 text-primary" />
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
                    {formQuestionScoringMode === 'PER_SUB' && (
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
                        {formQuestionScoringMode === 'PER_SUB' && (
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

            {formQuestionType === 'PENJODOHAN' && (
              <div className="space-y-2 p-3 rounded-xl border border-border bg-muted/20 text-xs">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-foreground">Pasangan Menjodohkan:</div>
                  {formQuestionScoringMode === 'PER_SUB' && (
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
                      {formQuestionScoringMode === 'PER_SUB' && (
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

            {formQuestionType === 'ESAI' && (
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
                  placeholder="Tuliskan kata kunci atau kriteria jawaban siswa..."
                  value={rubric}
                  onChange={(e) => setRubric(e.target.value)}
                  className="text-xs"
                />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="font-semibold">
                Simpan & Masukkan ke Sub Materi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* POP-UP MODAL: PREVIEW QUESTION */}
      <Dialog open={previewModalOpen} onOpenChange={setPreviewModalOpen}>
        <DialogContent maxWidth="max-w-lg">
          {previewQuestion && (
            <div className="space-y-3 text-xs">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Preview Soal: {previewQuestion.code}</span>
                </DialogTitle>
                <DialogDescription>
                  {previewQuestion.subject} • Tipe: {previewQuestion.type} • Bobot:{' '}
                  {previewQuestion.defaultPoints} Poin
                </DialogDescription>
              </DialogHeader>

              <div className="p-3 rounded-lg border border-border bg-card text-xs font-medium leading-relaxed whitespace-pre-wrap">
                {previewQuestion.prompt}
              </div>

              {previewQuestion.type === 'PG' && previewQuestion.options && (
                <div className="space-y-1">
                  <span className="font-semibold text-foreground">Pilihan Jawaban:</span>
                  {previewQuestion.options.map((opt) => (
                    <div
                      key={opt.key}
                      className={cn(
                        'p-2 rounded border text-xs flex items-center justify-between',
                        opt.isCorrect
                          ? 'border-emerald-500/40 bg-emerald-500/10 font-bold text-emerald-950 dark:text-emerald-200'
                          : 'border-border bg-card'
                      )}
                    >
                      <span>
                        {opt.key}. {opt.text}
                      </span>
                      {opt.isCorrect && (
                        <span className="text-[10px] text-emerald-600 font-bold">Kunci</span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setPreviewModalOpen(false)}>
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* CONFIRMATION DELETE PACKAGE */}
      <ConfirmationDialog
        open={deletePackageOpen}
        onOpenChange={setDeletePackageOpen}
        title="Hapus Paket Soal"
        description={`Apakah Anda yakin ingin menghapus paket soal "${selectedPackage?.name}" (${selectedPackage?.code})? Butir soal individual tetap tersimpan aman di Bank Soal.`}
        confirmLabel="Hapus Paket"
        onConfirm={() => {
          if (selectedPackage) {
            deleteQuestionPackage(selectedPackage.id);
            if (selectedPackageForSubTopics?.id === selectedPackage.id) {
              setSelectedPackageForSubTopics(null);
            }
            setSelectedPackage(null);
          }
        }}
      />
    </div>
  );
}
