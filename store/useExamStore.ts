import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  QuestionItem,
  QuestionPackage,
  SubTopic,
  ExamEvent,
  EventQuestionAssignment,
  EventRegistration,
  ExamResultRecord,
} from '@/types';
import {
  mockQuestions,
  mockQuestionPackages,
  mockEvents,
  mockEventQuestionAssignments,
  mockRegistrations,
  mockExamResults,
} from '@/lib/mock-data';

interface ExamState {
  questions: QuestionItem[];
  questionPackages: QuestionPackage[];
  events: ExamEvent[];
  eventQuestionAssignments: EventQuestionAssignment[];
  registrations: EventRegistration[];
  examResults: ExamResultRecord[];

  // Bank Soal (Butir Soal) CRUD
  addQuestion: (data: Omit<QuestionItem, 'id' | 'createdAt'>) => void;
  updateQuestion: (id: string, data: Partial<QuestionItem>) => void;
  deleteQuestion: (id: string) => void;
  setQuestionStatus: (id: string, status: 'active' | 'inactive') => void;

  // Paket Soal CRUD & Sub Materi
  addQuestionPackage: (data: Omit<QuestionPackage, 'id' | 'createdAt'>) => void;
  updateQuestionPackage: (id: string, data: Partial<QuestionPackage>) => void;
  deleteQuestionPackage: (id: string) => void;
  addSubTopic: (packageId: string, subTopic: Omit<SubTopic, 'id'>) => void;
  updateSubTopic: (packageId: string, subTopicId: string, data: Partial<SubTopic>) => void;
  deleteSubTopic: (packageId: string, subTopicId: string) => void;
  assignQuestionsToSubTopic: (packageId: string, subTopicId: string, questionIds: string[]) => void;
  removeQuestionFromSubTopic: (packageId: string, subTopicId: string, questionId: string) => void;

  // Event CRUD
  addEvent: (data: Omit<ExamEvent, 'id' | 'createdAt' | 'assignedQuestionCount' | 'registeredParticipantCount'>) => void;
  updateEvent: (id: string, data: Partial<ExamEvent>) => void;
  deleteEvent: (id: string) => void;
  generateToken: () => string;

  // Soal Event (Mapping)
  assignQuestionToEvent: (eventId: string, questionId: string) => void;
  assignMultipleQuestionsToEvent: (eventId: string, questionIds: string[]) => void;
  removeQuestionFromEvent: (assignmentId: string) => void;
  moveQuestionOrder: (eventId: string, assignmentId: string, direction: 'up' | 'down') => void;

  // Pendaftaran
  registerParticipantToEvent: (eventId: string, participantId: string) => void;
  bulkRegisterParticipants: (eventId: string, participantIds: string[]) => void;
  unregisterParticipantFromEvent: (eventId: string, participantId: string) => void;
  updateRegistrationStatus: (
    eventId: string,
    participantId: string,
    status: 'Hadir' | 'Belum Hadir' | 'Selesai',
    score?: number
  ) => void;

  // Reset
  resetExamData: () => void;
}

export const useExamStore = create<ExamState>()(
  persist(
    (set, get) => ({
      questions: mockQuestions,
      questionPackages: mockQuestionPackages,
      events: mockEvents,
      eventQuestionAssignments: mockEventQuestionAssignments,
      registrations: mockRegistrations,
      examResults: mockExamResults,

      addQuestion: (data) =>
        set((state) => ({
          questions: [
            {
              ...data,
              id: `qst-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
              status: data.status || 'active',
            },
            ...state.questions,
          ],
        })),

      updateQuestion: (id, data) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, ...data } : q)),
        })),

      deleteQuestion: (id) =>
        set((state) => ({
          questions: state.questions.filter((q) => q.id !== id),
          eventQuestionAssignments: state.eventQuestionAssignments.filter((a) => a.questionId !== id),
          questionPackages: state.questionPackages.map((pkg) => ({
            ...pkg,
            subTopics: pkg.subTopics.map((st) => ({
              ...st,
              questionIds: st.questionIds.filter((qid) => qid !== id),
            })),
          })),
        })),

      setQuestionStatus: (id, status) =>
        set((state) => ({
          questions: state.questions.map((q) => (q.id === id ? { ...q, status } : q)),
        })),

      // Paket Soal CRUD & Sub Materi
      addQuestionPackage: (data) =>
        set((state) => ({
          questionPackages: [
            {
              ...data,
              id: `pkg-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
            },
            ...state.questionPackages,
          ],
        })),

      updateQuestionPackage: (id, data) =>
        set((state) => ({
          questionPackages: state.questionPackages.map((p) =>
            p.id === id ? { ...p, ...data } : p
          ),
        })),

      deleteQuestionPackage: (id) =>
        set((state) => ({
          questionPackages: state.questionPackages.filter((p) => p.id !== id),
        })),

      addSubTopic: (packageId, subTopic) =>
        set((state) => ({
          questionPackages: state.questionPackages.map((p) =>
            p.id === packageId
              ? {
                  ...p,
                  subTopics: [
                    ...p.subTopics,
                    {
                      ...subTopic,
                      id: `sub-${Date.now()}`,
                      orderNumber: p.subTopics.length + 1,
                      questionIds: subTopic.questionIds || [],
                    },
                  ],
                }
              : p
          ),
        })),

      updateSubTopic: (packageId, subTopicId, data) =>
        set((state) => ({
          questionPackages: state.questionPackages.map((p) =>
            p.id === packageId
              ? {
                  ...p,
                  subTopics: p.subTopics.map((s) => (s.id === subTopicId ? { ...s, ...data } : s)),
                }
              : p
          ),
        })),

      deleteSubTopic: (packageId, subTopicId) =>
        set((state) => ({
          questionPackages: state.questionPackages.map((p) =>
            p.id === packageId
              ? {
                  ...p,
                  subTopics: p.subTopics.filter((s) => s.id !== subTopicId),
                }
              : p
          ),
        })),

      assignQuestionsToSubTopic: (packageId, subTopicId, questionIds) =>
        set((state) => ({
          questionPackages: state.questionPackages.map((p) =>
            p.id === packageId
              ? {
                  ...p,
                  subTopics: p.subTopics.map((s) => {
                    if (s.id === subTopicId) {
                      const merged = Array.from(new Set([...s.questionIds, ...questionIds]));
                      return { ...s, questionIds: merged };
                    }
                    return s;
                  }),
                }
              : p
          ),
        })),

      removeQuestionFromSubTopic: (packageId, subTopicId, questionId) =>
        set((state) => ({
          questionPackages: state.questionPackages.map((p) =>
            p.id === packageId
              ? {
                  ...p,
                  subTopics: p.subTopics.map((s) =>
                    s.id === subTopicId
                      ? { ...s, questionIds: s.questionIds.filter((qid) => qid !== questionId) }
                      : s
                  ),
                }
              : p
          ),
        })),

      generateToken: () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
          result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
      },

      addEvent: (data) =>
        set((state) => ({
          events: [
            {
              ...data,
              id: `ev-${Date.now()}`,
              createdAt: new Date().toISOString().split('T')[0],
              assignedQuestionCount: 0,
              registeredParticipantCount: 0,
            },
            ...state.events,
          ],
        })),

      updateEvent: (id, data) =>
        set((state) => ({
          events: state.events.map((ev) => (ev.id === id ? { ...ev, ...data } : ev)),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((ev) => ev.id !== id),
          eventQuestionAssignments: state.eventQuestionAssignments.filter((a) => a.eventId !== id),
          registrations: state.registrations.filter((r) => r.eventId !== id),
        })),

      assignQuestionToEvent: (eventId, questionId) => {
        const question = get().questions.find((q) => q.id === questionId);
        if (!question) return;

        const currentAssignments = get().eventQuestionAssignments.filter((a) => a.eventId === eventId);
        const nextOrder = currentAssignments.length + 1;

        const newAssignment: EventQuestionAssignment = {
          id: `eqa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId,
          questionId,
          orderNumber: nextOrder,
          questionPrompt: question.prompt,
          questionType: question.type,
          subject: question.subject,
          difficulty: question.difficulty,
        };

        set((state) => ({
          eventQuestionAssignments: [...state.eventQuestionAssignments, newAssignment],
          events: state.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, assignedQuestionCount: ev.assignedQuestionCount + 1 }
              : ev
          ),
        }));
      },

      assignMultipleQuestionsToEvent: (eventId, questionIds) => {
        const questions = get().questions.filter((q) => questionIds.includes(q.id));
        const currentAssignments = get().eventQuestionAssignments.filter((a) => a.eventId === eventId);
        let startOrder = currentAssignments.length + 1;

        const newAssignments: EventQuestionAssignment[] = questions.map((q) => ({
          id: `eqa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId,
          questionId: q.id,
          orderNumber: startOrder++,
          questionPrompt: q.prompt,
          questionType: q.type,
          subject: q.subject,
          difficulty: q.difficulty,
        }));

        set((state) => ({
          eventQuestionAssignments: [...state.eventQuestionAssignments, ...newAssignments],
          events: state.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, assignedQuestionCount: ev.assignedQuestionCount + newAssignments.length }
              : ev
          ),
        }));
      },

      removeQuestionFromEvent: (assignmentId) => {
        const assignment = get().eventQuestionAssignments.find((a) => a.id === assignmentId);
        if (!assignment) return;
        const eventId = assignment.eventId;

        set((state) => {
          const remaining = state.eventQuestionAssignments
            .filter((a) => a.id !== assignmentId && a.eventId === eventId)
            .sort((a, b) => a.orderNumber - b.orderNumber)
            .map((item, idx) => ({ ...item, orderNumber: idx + 1 }));

          const otherAssignments = state.eventQuestionAssignments.filter((a) => a.eventId !== eventId);

          return {
            eventQuestionAssignments: [...otherAssignments, ...remaining],
            events: state.events.map((ev) =>
              ev.id === eventId
                ? { ...ev, assignedQuestionCount: Math.max(0, ev.assignedQuestionCount - 1) }
                : ev
            ),
          };
        });
      },

      moveQuestionOrder: (eventId, assignmentId, direction) => {
        set((state) => {
          const list = state.eventQuestionAssignments
            .filter((a) => a.eventId === eventId)
            .sort((a, b) => a.orderNumber - b.orderNumber);

          const index = list.findIndex((a) => a.id === assignmentId);
          if (index === -1) return state;

          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= list.length) return state;

          // Swap order numbers
          const temp = list[index];
          list[index] = list[targetIndex];
          list[targetIndex] = temp;

          const renumbered = list.map((item, idx) => ({ ...item, orderNumber: idx + 1 }));
          const others = state.eventQuestionAssignments.filter((a) => a.eventId !== eventId);

          return {
            eventQuestionAssignments: [...others, ...renumbered],
          };
        });
      },

      registerParticipantToEvent: (eventId, participantId) => {
        const exists = get().registrations.some(
          (r) => r.eventId === eventId && r.participantId === participantId
        );
        if (exists) return;

        const newReg: EventRegistration = {
          id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId,
          participantId,
          registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          attendanceStatus: 'Belum Hadir',
        };

        set((state) => ({
          registrations: [...state.registrations, newReg],
          events: state.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, registeredParticipantCount: ev.registeredParticipantCount + 1 }
              : ev
          ),
        }));
      },

      bulkRegisterParticipants: (eventId, participantIds) => {
        const currentRegs = get().registrations.filter((r) => r.eventId === eventId);
        const registeredIds = new Set(currentRegs.map((r) => r.participantId));
        const toAdd = participantIds.filter((pid) => !registeredIds.has(pid));

        const now = new Date().toISOString().replace('T', ' ').substring(0, 16);
        const newRegs: EventRegistration[] = toAdd.map((pid) => ({
          id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          eventId,
          participantId: pid,
          registeredAt: now,
          attendanceStatus: 'Belum Hadir',
        }));

        set((state) => ({
          registrations: [...state.registrations, ...newRegs],
          events: state.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, registeredParticipantCount: ev.registeredParticipantCount + newRegs.length }
              : ev
          ),
        }));
      },

      unregisterParticipantFromEvent: (eventId, participantId) => {
        set((state) => ({
          registrations: state.registrations.filter(
            (r) => !(r.eventId === eventId && r.participantId === participantId)
          ),
          events: state.events.map((ev) =>
            ev.id === eventId
              ? { ...ev, registeredParticipantCount: Math.max(0, ev.registeredParticipantCount - 1) }
              : ev
          ),
        }));
      },

      updateRegistrationStatus: (eventId, participantId, status, score) => {
        set((state) => ({
          registrations: state.registrations.map((r) => {
            if (r.eventId === eventId && r.participantId === participantId) {
              return {
                ...r,
                attendanceStatus: status,
                ...(score !== undefined ? { score } : {}),
                ...(status === 'Selesai' ? { isPassed: (score ?? r.score ?? 75) >= 75 } : {}),
              };
            }
            return r;
          }),
        }));
      },

      resetExamData: () =>
        set({
          questions: mockQuestions,
          questionPackages: mockQuestionPackages,
          events: mockEvents,
          eventQuestionAssignments: mockEventQuestionAssignments,
          registrations: mockRegistrations,
          examResults: mockExamResults,
        }),
    }),
    {
      name: 'cbt-exam-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (!persistedState) return persistedState;
        return {
          ...persistedState,
          questionPackages:
            persistedState.questionPackages && persistedState.questionPackages.length > 0
              ? persistedState.questionPackages
              : mockQuestionPackages,
        };
      },
    }
  )
);
