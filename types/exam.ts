// Exam & Assessment Types

export type QuestionOptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuestionOption {
  key: QuestionOptionLetter;
  text: string;
  isCorrect: boolean;
  points?: number;
}

export type QuestionTypeEnum = 'PG' | 'MULTI_CHOICE' | 'PERNYATAAN' | 'PENJODOHAN' | 'ESAI';

// Multi Choice Option
export interface MultiChoiceOption {
  key: string;
  text: string;
  isCorrect: boolean;
  points?: number;
}

// Statement (Pernyataan) Types: Benar/Salah, Ya/Tidak, Setuju/Tidak, Sesuai/Tidak, Fakta/Opini, Dinamis
export type StatementPreset =
  | 'BENAR_SALAH'
  | 'YA_TIDAK'
  | 'SETUJU_TIDAK'
  | 'SESUAI_TIDAK'
  | 'FAKTA_OPINI'
  | 'DINAMIS';

export interface StatementItem {
  id: string;
  statement: string;
  correctAnswer: string;
  points?: number;
}

export interface StatementConfig {
  preset: StatementPreset;
  option1: string;
  option2: string;
  items: StatementItem[];
}

// Matching (Penjodohan) Types
export interface MatchingPair {
  id: string;
  leftText: string;
  rightText: string;
  points?: number;
}

export interface MatchingConfig {
  pairs: MatchingPair[];
}

export interface QuestionItem {
  id: string;
  code: string;
  subject: string;
  type: QuestionTypeEnum;
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
  prompt: string;

  // Dynamic scoring mode:
  // 'TOTAL': 1 butir soal memiliki bobot Point tunggal
  // 'PER_SUB': butir soal yang memiliki Sub memiliki bobot Point masing-masing
  scoringMode?: 'TOTAL' | 'PER_SUB';
  defaultPoints: number;

  // Single choice (PG):
  options?: QuestionOption[];
  correctAnswer?: QuestionOptionLetter;

  // Multi choice:
  multiOptions?: MultiChoiceOption[];
  correctAnswersMulti?: string[];

  // Pernyataan (Benar/Salah, Ya/Tidak, Setuju/Tidak, Dinamis):
  statementConfig?: StatementConfig;

  // Penjodohan:
  matchingConfig?: MatchingConfig;

  // Essay:
  rubric?: string;

  tags: string[];
  createdAt: string;
  author: string;
  status?: 'active' | 'inactive';
}

export interface SubTopic {
  id: string;
  name: string;
  description?: string;
  orderNumber: number;
  questionIds: string[];
}

export interface QuestionPackage {
  id: string;
  code: string;
  name: string;
  subject: string;
  level?: string;
  academicYear?: string;
  description?: string;
  status: 'active' | 'draft' | 'archived';
  subTopics: SubTopic[];
  createdAt: string;
}

export interface ExamRules {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  allowNavigateBack: boolean;
  disableRightClick: boolean;
  showScoreImmediately: boolean;
  enforceFullscreen: boolean;
}

export type ExamStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export interface ExamEvent {
  id: string;
  title: string;
  examTypeCode: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  durationMinutes: number;
  token: string;
  status: ExamStatus;
  schoolId?: string; // optional scope
  schoolName?: string;
  rules: ExamRules;
  assignedQuestionCount: number;
  registeredParticipantCount: number;
  createdAt: string;
}

export interface EventQuestionAssignment {
  id: string;
  eventId: string;
  questionId: string;
  orderNumber: number;
  customScoreWeight?: number;
  // Denormalized for rapid preview
  questionPrompt: string;
  questionType: QuestionTypeEnum;
  subject: string;
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
}

export interface Participant {
  id: string;
  nisn: string;
  fullName: string;
  gender: 'L' | 'P';
  schoolId: string;
  schoolName: string;
  className: string;
  email: string;
  status: 'active' | 'inactive';
  registeredEventsCount?: number;
}

export interface Staff {
  id: string;
  nip: string;
  fullName: string;
  role: string;
  schoolId: string;
  schoolName: string;
  subjectSpecialization: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
}

export interface EventRegistration {
  id: string;
  eventId: string;
  participantId: string;
  registeredAt: string;
  attendanceStatus: 'Hadir' | 'Belum Hadir' | 'Selesai';
  score?: number;
  isPassed?: boolean;
}

export interface ExamResultRecord {
  id: string;
  participantId: string;
  participantName: string;
  nisn: string;
  schoolName: string;
  className: string;
  eventId: string;
  eventTitle: string;
  rawScore: number;
  finalScore: number;
  passingScore: number;
  status: 'Lulus' | 'Tidak Lulus';
  completedAt: string;
  durationUsedMinutes: number;
}
