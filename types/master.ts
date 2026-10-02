// Master Data Types

export interface School {
  id: string;
  name: string;
  npsn: string;
  branchId: string;
  branchName: string;
  levelId: string;
  levelName: string;
  address: string;
  phone: string;
  principal: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Branch {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  manager: string;
  phone: string;
  schoolCount: number;
  status: 'active' | 'inactive';
}

export interface AcademicYear {
  id: string;
  year: string; // e.g. "2024/2025"
  semester: 'Ganjil' | 'Genap';
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface EducationalLevel {
  id: string;
  code: string; // "SD", "SMP", "SMA", "SMK"
  name: string;
  description: string;
  defaultPassingGrade: number;
}

export interface ExamType {
  id: string;
  code: string; // "PTS", "PAS", "UTBK", "US", "SIMULASI"
  name: string;
  category: 'Formatif' | 'Sumatif' | 'Seleksi' | 'Simulasi';
  description: string;
}

export interface UserRole {
  id: string;
  code: string;
  name: string;
  description: string;
  userCount: number;
  isSystem: boolean;
}

export interface PassingGradeConfig {
  id: string;
  subject: string;
  levelId: string;
  levelName: string;
  minimumScore: number;
  maximumScore: number;
  remedialThreshold: number;
}

export interface QuestionType {
  id: string;
  code: string; // "PG", "ESAI", "PGK", "JODOH"
  name: string;
  description: string;
  hasOptions: boolean;
  isAutoGraded: boolean;
}

export interface TestType {
  id: string;
  code: string; // "AKADEMIK", "PSIKOTES", "SKD", "KEPRIBADIAN"
  name: string;
  purpose: string;
  scoringModel: 'Standard 0-100' | 'Skala 1-5' | 'IRT / Bobot Dinamis';
}

export interface WeightConfig {
  id: string;
  examTypeId: string;
  examTypeName: string;
  multipleChoiceWeight: number; // e.g. 70
  essayWeight: number; // e.g. 30
  penaltyWrongAnswer: number; // 0 or -1
  scorePerQuestion: number;
}
