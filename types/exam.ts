// Exam & Assessment Types

export type QuestionOptionLetter = 'A' | 'B' | 'C' | 'D' | 'E';

export interface QuestionOption {
  key: QuestionOptionLetter;
  text: string;
  isCorrect: boolean;
}

export interface QuestionItem {
  id: string;
  code: string;
  subject: string;
  type: 'PG' | 'ESAI'; // Pilihan Ganda or Esai
  difficulty: 'Mudah' | 'Sedang' | 'Sukar';
  prompt: string;
  options?: QuestionOption[];
  correctAnswer?: QuestionOptionLetter;
  rubric?: string; // For Essay
  defaultPoints: number;
  tags: string[];
  createdAt: string;
  author: string;
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
  questionType: 'PG' | 'ESAI';
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
