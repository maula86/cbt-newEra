import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  School,
  Branch,
  AcademicYear,
  EducationalLevel,
  ExamType,
  UserRole,
  PassingGradeConfig,
  QuestionType,
  TestType,
  WeightConfig,
} from '@/types';
import {
  mockSchools,
  mockBranches,
  mockAcademicYears,
  mockEducationalLevels,
  mockExamTypes,
  mockUserRoles,
  mockPassingGrades,
  mockQuestionTypes,
  mockTestTypes,
  mockWeightConfigs,
} from '@/lib/mock-data';

interface MasterState {
  schools: School[];
  branches: Branch[];
  academicYears: AcademicYear[];
  educationalLevels: EducationalLevel[];
  examTypes: ExamType[];
  userRoles: UserRole[];
  passingGrades: PassingGradeConfig[];
  questionTypes: QuestionType[];
  testTypes: TestType[];
  weightConfigs: WeightConfig[];

  // School actions
  addSchool: (school: Omit<School, 'id' | 'createdAt'>) => void;
  updateSchool: (id: string, data: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  // Branch actions
  addBranch: (branch: Omit<Branch, 'id' | 'schoolCount'>) => void;
  updateBranch: (id: string, data: Partial<Branch>) => void;
  deleteBranch: (id: string) => void;

  // Academic Year actions
  addAcademicYear: (data: Omit<AcademicYear, 'id'>) => void;
  updateAcademicYear: (id: string, data: Partial<AcademicYear>) => void;
  deleteAcademicYear: (id: string) => void;

  // Educational Level actions
  addEducationalLevel: (data: Omit<EducationalLevel, 'id'>) => void;
  updateEducationalLevel: (id: string, data: Partial<EducationalLevel>) => void;
  deleteEducationalLevel: (id: string) => void;

  // Exam Type actions
  addExamType: (data: Omit<ExamType, 'id'>) => void;
  updateExamType: (id: string, data: Partial<ExamType>) => void;
  deleteExamType: (id: string) => void;

  // User Role actions
  addUserRole: (data: Omit<UserRole, 'id' | 'userCount' | 'isSystem'>) => void;
  updateUserRole: (id: string, data: Partial<UserRole>) => void;
  deleteUserRole: (id: string) => void;

  // Passing Grade actions
  addPassingGrade: (data: Omit<PassingGradeConfig, 'id'>) => void;
  updatePassingGrade: (id: string, data: Partial<PassingGradeConfig>) => void;
  deletePassingGrade: (id: string) => void;

  // Question Type actions
  addQuestionType: (data: Omit<QuestionType, 'id'>) => void;
  updateQuestionType: (id: string, data: Partial<QuestionType>) => void;
  deleteQuestionType: (id: string) => void;

  // Test Type actions
  addTestType: (data: Omit<TestType, 'id'>) => void;
  updateTestType: (id: string, data: Partial<TestType>) => void;
  deleteTestType: (id: string) => void;

  // Weight Config actions
  addWeightConfig: (data: Omit<WeightConfig, 'id'>) => void;
  updateWeightConfig: (id: string, data: Partial<WeightConfig>) => void;
  deleteWeightConfig: (id: string) => void;

  // Reset to initial
  resetMasterData: () => void;
}

export const useMasterStore = create<MasterState>()(
  persist(
    (set) => ({
      schools: mockSchools,
      branches: mockBranches,
      academicYears: mockAcademicYears,
      educationalLevels: mockEducationalLevels,
      examTypes: mockExamTypes,
      userRoles: mockUserRoles,
      passingGrades: mockPassingGrades,
      questionTypes: mockQuestionTypes,
      testTypes: mockTestTypes,
      weightConfigs: mockWeightConfigs,

      addSchool: (school) =>
        set((state) => ({
          schools: [
            {
              ...school,
              id: `sch-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
            },
            ...state.schools,
          ],
        })),
      updateSchool: (id, data) =>
        set((state) => ({
          schools: state.schools.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteSchool: (id) =>
        set((state) => ({
          schools: state.schools.filter((item) => item.id !== id),
        })),

      addBranch: (branch) =>
        set((state) => ({
          branches: [
            {
              ...branch,
              id: `br-${Date.now()}`,
              schoolCount: 0,
            },
            ...state.branches,
          ],
        })),
      updateBranch: (id, data) =>
        set((state) => ({
          branches: state.branches.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteBranch: (id) =>
        set((state) => ({
          branches: state.branches.filter((item) => item.id !== id),
        })),

      addAcademicYear: (data) =>
        set((state) => ({
          academicYears: [{ ...data, id: `ay-${Date.now()}` }, ...state.academicYears],
        })),
      updateAcademicYear: (id, data) =>
        set((state) => ({
          academicYears: state.academicYears.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteAcademicYear: (id) =>
        set((state) => ({
          academicYears: state.academicYears.filter((item) => item.id !== id),
        })),

      addEducationalLevel: (data) =>
        set((state) => ({
          educationalLevels: [{ ...data, id: `lvl-${Date.now()}` }, ...state.educationalLevels],
        })),
      updateEducationalLevel: (id, data) =>
        set((state) => ({
          educationalLevels: state.educationalLevels.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteEducationalLevel: (id) =>
        set((state) => ({
          educationalLevels: state.educationalLevels.filter((item) => item.id !== id),
        })),

      addExamType: (data) =>
        set((state) => ({
          examTypes: [{ ...data, id: `et-${Date.now()}` }, ...state.examTypes],
        })),
      updateExamType: (id, data) =>
        set((state) => ({
          examTypes: state.examTypes.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteExamType: (id) =>
        set((state) => ({
          examTypes: state.examTypes.filter((item) => item.id !== id),
        })),

      addUserRole: (data) =>
        set((state) => ({
          userRoles: [
            {
              ...data,
              id: `role-${Date.now()}`,
              userCount: 0,
              isSystem: false,
            },
            ...state.userRoles,
          ],
        })),
      updateUserRole: (id, data) =>
        set((state) => ({
          userRoles: state.userRoles.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteUserRole: (id) =>
        set((state) => ({
          userRoles: state.userRoles.filter((item) => item.id !== id && !item.isSystem),
        })),

      addPassingGrade: (data) =>
        set((state) => ({
          passingGrades: [{ ...data, id: `pg-${Date.now()}` }, ...state.passingGrades],
        })),
      updatePassingGrade: (id, data) =>
        set((state) => ({
          passingGrades: state.passingGrades.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deletePassingGrade: (id) =>
        set((state) => ({
          passingGrades: state.passingGrades.filter((item) => item.id !== id),
        })),

      addQuestionType: (data) =>
        set((state) => ({
          questionTypes: [{ ...data, id: `qt-${Date.now()}` }, ...state.questionTypes],
        })),
      updateQuestionType: (id, data) =>
        set((state) => ({
          questionTypes: state.questionTypes.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteQuestionType: (id) =>
        set((state) => ({
          questionTypes: state.questionTypes.filter((item) => item.id !== id),
        })),

      addTestType: (data) =>
        set((state) => ({
          testTypes: [{ ...data, id: `tt-${Date.now()}` }, ...state.testTypes],
        })),
      updateTestType: (id, data) =>
        set((state) => ({
          testTypes: state.testTypes.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteTestType: (id) =>
        set((state) => ({
          testTypes: state.testTypes.filter((item) => item.id !== id),
        })),

      addWeightConfig: (data) =>
        set((state) => ({
          weightConfigs: [{ ...data, id: `wc-${Date.now()}` }, ...state.weightConfigs],
        })),
      updateWeightConfig: (id, data) =>
        set((state) => ({
          weightConfigs: state.weightConfigs.map((item) => (item.id === id ? { ...item, ...data } : item)),
        })),
      deleteWeightConfig: (id) =>
        set((state) => ({
          weightConfigs: state.weightConfigs.filter((item) => item.id !== id),
        })),

      resetMasterData: () =>
        set({
          schools: mockSchools,
          branches: mockBranches,
          academicYears: mockAcademicYears,
          educationalLevels: mockEducationalLevels,
          examTypes: mockExamTypes,
          userRoles: mockUserRoles,
          passingGrades: mockPassingGrades,
          questionTypes: mockQuestionTypes,
          testTypes: mockTestTypes,
          weightConfigs: mockWeightConfigs,
        }),
    }),
    {
      name: 'cbt-master-storage',
    }
  )
);
