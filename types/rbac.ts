// RBAC & ACL Types

export interface PermissionNode {
  id: string;
  key: string;
  label: string;
  path?: string;
  children?: PermissionNode[];
}

export interface PermissionAction {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
}

export type RolePermissionsMap = Record<string, PermissionAction>;

export interface RoleConfig {
  roleId: string;
  roleCode: string;
  roleName: string;
  scopeType: 'global' | 'branch' | 'school';
  scopedSchoolId?: string;
  permissions: RolePermissionsMap;
}

export interface AppConfig {
  appName: string;
  organizationName: string;
  logoUrl: string;
  faviconUrl: string;
  supportEmail: string;
  primaryColor: string;
  defaultTheme: 'light' | 'dark' | 'system';
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpSenderName: string;
  maintenanceMode: boolean;
}
