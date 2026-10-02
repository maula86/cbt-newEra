import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppConfig, RoleConfig, PermissionNode } from '@/types';
import { defaultAppConfig, initialRoleConfigs, mockPermissionTree } from '@/lib/mock-data';

interface ConfigState {
  appConfig: AppConfig;
  roleConfigs: Record<string, RoleConfig>;
  permissionTree: PermissionNode[];
  activeRoleId: string;
  isDarkMode: boolean;

  setActiveRoleId: (roleId: string) => void;
  toggleDarkMode: () => void;
  setDarkMode: (val: boolean) => void;
  updateAppConfig: (data: Partial<AppConfig>) => void;
  updateRolePermission: (
    roleId: string,
    permissionKey: string,
    action: 'create' | 'read' | 'update' | 'delete',
    value: boolean
  ) => void;
  updateRoleScope: (
    roleId: string,
    scopeType: 'global' | 'branch' | 'school',
    scopedSchoolId?: string
  ) => void;
  resetConfig: () => void;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      appConfig: defaultAppConfig,
      roleConfigs: initialRoleConfigs,
      permissionTree: mockPermissionTree,
      activeRoleId: 'role-1', // Default Super Admin
      isDarkMode: false,

      setActiveRoleId: (roleId) => set({ activeRoleId: roleId }),

      toggleDarkMode: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        if (typeof document !== 'undefined') {
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      setDarkMode: (val) => {
        set({ isDarkMode: val });
        if (typeof document !== 'undefined') {
          if (val) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      updateAppConfig: (data) =>
        set((state) => ({
          appConfig: { ...state.appConfig, ...data },
        })),

      updateRolePermission: (roleId, permissionKey, action, value) => {
        set((state) => {
          const currentRoleConfig = state.roleConfigs[roleId];
          if (!currentRoleConfig) return state;

          const updatedPermissions = { ...currentRoleConfig.permissions };
          const currentActionPerm = updatedPermissions[permissionKey] || {
            create: false,
            read: false,
            update: false,
            delete: false,
          };

          const newActionPerm = { ...currentActionPerm };

          if (action === 'read') {
            newActionPerm.read = value;
            // If read is false, cascade uncheck create, update, delete as required by FRD 3.8
            if (!value) {
              newActionPerm.create = false;
              newActionPerm.update = false;
              newActionPerm.delete = false;
            }
          } else {
            // Cannot enable create/update/delete if read is disabled
            if (!currentActionPerm.read && value) {
              newActionPerm.read = true;
            }
            newActionPerm[action] = value;
          }

          updatedPermissions[permissionKey] = newActionPerm;

          // Cascade to children if parent permission (e.g. master -> master.*)
          if (permissionKey === 'master') {
            const childKeys = [
              'master.config-bobot',
              'master.tahun-pelajaran',
              'master.jenjang',
              'master.tipe-ujian',
              'master.sekolah',
              'master.cabang',
              'master.role-user',
              'master.passing-grade',
              'master.tipe-soal',
              'master.tipe-tes',
            ];
            childKeys.forEach((ckey) => {
              const childCurrent = updatedPermissions[ckey] || {
                create: false,
                read: false,
                update: false,
                delete: false,
              };
              const childNew = { ...childCurrent };
              if (action === 'read') {
                childNew.read = value;
                if (!value) {
                  childNew.create = false;
                  childNew.update = false;
                  childNew.delete = false;
                }
              } else {
                if (value) childNew.read = true;
                childNew[action] = value;
              }
              updatedPermissions[ckey] = childNew;
            });
          }

          return {
            roleConfigs: {
              ...state.roleConfigs,
              [roleId]: {
                ...currentRoleConfig,
                permissions: updatedPermissions,
              },
            },
          };
        });
      },

      updateRoleScope: (roleId, scopeType, scopedSchoolId) =>
        set((state) => {
          const currentRole = state.roleConfigs[roleId];
          if (!currentRole) return state;

          return {
            roleConfigs: {
              ...state.roleConfigs,
              [roleId]: {
                ...currentRole,
                scopeType,
                scopedSchoolId: scopeType === 'school' ? scopedSchoolId : undefined,
              },
            },
          };
        }),

      resetConfig: () =>
        set({
          appConfig: defaultAppConfig,
          roleConfigs: initialRoleConfigs,
          permissionTree: mockPermissionTree,
          activeRoleId: 'role-1',
          isDarkMode: false,
        }),
    }),
    {
      name: 'cbt-config-storage',
    }
  )
);
