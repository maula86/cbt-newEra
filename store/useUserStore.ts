import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Staff, Participant } from '@/types';
import { mockStaff, mockParticipants } from '@/lib/mock-data';

interface UserState {
  staff: Staff[];
  participants: Participant[];

  // Staff CRUD
  addStaff: (data: Omit<Staff, 'id'>) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  // Participant CRUD
  addParticipant: (data: Omit<Participant, 'id'>) => void;
  updateParticipant: (id: string, data: Partial<Participant>) => void;
  deleteParticipant: (id: string) => void;
  deleteMultipleParticipants: (ids: string[]) => void;
  toggleParticipantStatus: (id: string) => void;
  importParticipants: (data: Omit<Participant, 'id'>[]) => void;

  resetUserData: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      staff: mockStaff,
      participants: mockParticipants,

      addStaff: (data) =>
        set((state) => ({
          staff: [{ ...data, id: `stf-${Date.now()}` }, ...state.staff],
        })),
      updateStaff: (id, data) =>
        set((state) => ({
          staff: state.staff.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
      deleteStaff: (id) =>
        set((state) => ({
          staff: state.staff.filter((s) => s.id !== id),
        })),

      addParticipant: (data) =>
        set((state) => ({
          participants: [{ ...data, id: `par-${Date.now()}`, registeredEventsCount: 0 }, ...state.participants],
        })),
      updateParticipant: (id, data) =>
        set((state) => ({
          participants: state.participants.map((p) => (p.id === id ? { ...p, ...data } : p)),
        })),
      deleteParticipant: (id) =>
        set((state) => ({
          participants: state.participants.filter((p) => p.id !== id),
        })),
      deleteMultipleParticipants: (ids) =>
        set((state) => ({
          participants: state.participants.filter((p) => !ids.includes(p.id)),
        })),
      toggleParticipantStatus: (id) =>
        set((state) => ({
          participants: state.participants.map((p) =>
            p.id === id ? { ...p, status: p.status === 'active' ? 'inactive' : 'active' } : p
          ),
        })),
      importParticipants: (newItems) =>
        set((state) => ({
          participants: [
            ...newItems.map((item, idx) => ({
              ...item,
              id: `par-imp-${Date.now()}-${idx}`,
              registeredEventsCount: 0,
            })),
            ...state.participants,
          ],
        })),

      resetUserData: () =>
        set({
          staff: mockStaff,
          participants: mockParticipants,
        }),
    }),
    {
      name: 'cbt-user-storage',
    }
  )
);
