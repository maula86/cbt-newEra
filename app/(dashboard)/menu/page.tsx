'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Building,
  School,
  Check,
  Search,
  CheckCheck,
  Eye,
  XCircle,
  ChevronsUpDown,
  ArrowUp,
  FolderOpen,
  Folder,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/useConfigStore';
import { useMasterStore } from '@/store/useMasterStore';
import { PermissionNode } from '@/types';

function MenuRBACContent() {
  const searchParams = useSearchParams();
  const queryRoleId = searchParams.get('role');

  const {
    roleConfigs,
    permissionTree,
    activeRoleId,
    updateRolePermission,
    updateRoleScope,
  } = useConfigStore();
  const { userRoles, schools } = useMasterStore();

  const [selectedRoleId, setSelectedRoleId] = React.useState<string>(
    queryRoleId || activeRoleId || 'role-1'
  );
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [collapsedNodes, setCollapsedNodes] = React.useState<Record<string, boolean>>({});

  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  const currentRoleConfig = roleConfigs[selectedRoleId] || {
    roleId: selectedRoleId,
    roleCode: 'CUSTOM',
    roleName: 'Peran Terpilih',
    scopeType: 'global',
    permissions: {},
  };

  const handleCheckboxChange = (
    key: string,
    action: 'create' | 'read' | 'update' | 'delete',
    value: boolean
  ) => {
    updateRolePermission(selectedRoleId, key, action, value);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleScopeTypeChange = (scopeType: 'global' | 'branch' | 'school') => {
    updateRoleScope(selectedRoleId, scopeType, currentRoleConfig.scopedSchoolId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleScopedSchoolChange = (schoolId: string) => {
    updateRoleScope(selectedRoleId, currentRoleConfig.scopeType, schoolId);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const toggleNodeCollapse = (nodeKey: string) => {
    setCollapsedNodes((prev) => ({
      ...prev,
      [nodeKey]: !prev[nodeKey],
    }));
  };

  const handleExpandAll = () => {
    setCollapsedNodes({});
  };

  const handleCollapseAll = () => {
    const newCollapsed: Record<string, boolean> = {};
    permissionTree.forEach((node) => {
      if (node.children && node.children.length > 0) {
        newCollapsed[node.key] = true;
      }
    });
    setCollapsedNodes(newCollapsed);
  };

  // Quick Preset Actions
  const allKeys = React.useMemo(() => {
    const keys: string[] = [];
    const traverse = (nodes: PermissionNode[]) => {
      nodes.forEach((n) => {
        keys.push(n.key);
        if (n.children) traverse(n.children);
      });
    };
    traverse(permissionTree);
    return keys;
  }, [permissionTree]);

  const handleApplyPreset = (preset: 'all' | 'readOnly' | 'clear') => {
    allKeys.forEach((key) => {
      if (preset === 'all') {
        updateRolePermission(selectedRoleId, key, 'read', true);
        updateRolePermission(selectedRoleId, key, 'create', true);
        updateRolePermission(selectedRoleId, key, 'update', true);
        updateRolePermission(selectedRoleId, key, 'delete', true);
      } else if (preset === 'readOnly') {
        updateRolePermission(selectedRoleId, key, 'read', true);
        updateRolePermission(selectedRoleId, key, 'create', false);
        updateRolePermission(selectedRoleId, key, 'update', false);
        updateRolePermission(selectedRoleId, key, 'delete', false);
      } else if (preset === 'clear') {
        updateRolePermission(selectedRoleId, key, 'read', false);
      }
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const scrollToTop = () => {
    const scrollParent = tableContainerRef.current?.closest('.overflow-y-auto');
    if (scrollParent) {
      scrollParent.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Filtered permission tree based on search
  const isMatchSearch = (node: PermissionNode, query: string): boolean => {
    if (!query) return true;
    const q = query.toLowerCase();
    if (node.label.toLowerCase().includes(q) || node.key.toLowerCase().includes(q)) {
      return true;
    }
    if (node.children && node.children.some((c) => isMatchSearch(c, query))) {
      return true;
    }
    return false;
  };

  const renderPermissionRow = (node: PermissionNode, depth = 0) => {
    if (searchQuery && !isMatchSearch(node, searchQuery)) {
      return null;
    }

    const perm = currentRoleConfig.permissions[node.key] || {
      create: false,
      read: false,
      update: false,
      delete: false,
    };

    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isCollapsed = Boolean(collapsedNodes[node.key]);
    const cudDisabled = !perm.read;

    return (
      <React.Fragment key={node.id}>
        <tr
          className={`hover:bg-muted/40 transition-colors border-b border-border/40 ${
            depth > 0 ? 'bg-muted/15' : 'bg-card'
          }`}
        >
          <td className="p-3 text-xs">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${depth * 22}px` }}
            >
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleNodeCollapse(node.key)}
                  className="h-5 w-5 flex items-center justify-center rounded hover:bg-muted text-primary cursor-pointer transition-transform"
                  title={isCollapsed ? 'Perluas sub-modul' : 'Ciutkan sub-modul'}
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>
              ) : depth > 0 ? (
                <span className="h-5 w-5 flex items-center justify-center text-muted-foreground/50">
                  <span className="w-1.5 h-1.5 rounded-xs bg-muted-foreground/40" />
                </span>
              ) : (
                <span className="h-5 w-5" />
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    'font-medium transition-colors',
                    depth === 0
                      ? 'text-foreground font-semibold text-xs sm:text-sm'
                      : 'text-foreground/90 text-xs'
                  )}
                >
                  {node.label}
                </span>
                <span className="font-mono text-[10px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded border border-border">
                  {node.key}
                </span>
              </div>
            </div>
          </td>

          {/* Read Checkbox */}
          <td className="p-3 text-center w-28">
            <div className="flex items-center justify-center">
              <Checkbox
                checked={perm.read}
                onCheckedChange={(val) =>
                  handleCheckboxChange(node.key, 'read', Boolean(val))
                }
                aria-label={`Read ${node.label}`}
              />
            </div>
          </td>

          {/* Create Checkbox */}
          <td className="p-3 text-center w-28">
            <div className="flex items-center justify-center">
              {cudDisabled ? (
                <span className="text-muted-foreground/35 text-xs font-mono select-none" title="Tidak dapat dimodifikasi">—</span>
              ) : (
                <Checkbox
                  checked={perm.create}
                  onCheckedChange={(val) =>
                    handleCheckboxChange(node.key, 'create', Boolean(val))
                  }
                  aria-label={`Create ${node.label}`}
                />
              )}
            </div>
          </td>

          {/* Update Checkbox */}
          <td className="p-3 text-center w-28">
            <div className="flex items-center justify-center">
              {cudDisabled ? (
                <span className="text-muted-foreground/35 text-xs font-mono select-none" title="Tidak dapat dimodifikasi">—</span>
              ) : (
                <Checkbox
                  checked={perm.update}
                  onCheckedChange={(val) =>
                    handleCheckboxChange(node.key, 'update', Boolean(val))
                  }
                  aria-label={`Update ${node.label}`}
                />
              )}
            </div>
          </td>

          {/* Delete Checkbox */}
          <td className="p-3 text-center w-28">
            <div className="flex items-center justify-center">
              {cudDisabled ? (
                <span className="text-muted-foreground/35 text-xs font-mono select-none" title="Tidak dapat dimodifikasi">—</span>
              ) : (
                <Checkbox
                  checked={perm.delete}
                  onCheckedChange={(val) =>
                    handleCheckboxChange(node.key, 'delete', Boolean(val))
                  }
                  aria-label={`Delete ${node.label}`}
                />
              )}
            </div>
          </td>
        </tr>

        {/* Children Rows (hidden if collapsed or parent filtered) */}
        {!isCollapsed &&
          node.children &&
          node.children.map((child) => renderPermissionRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <PageHeader
          title="Manajemen Menu (RBAC & ACL)"
          description="Konfigurasi matriks wewenang dinamis per peran (Role-Based Access Control) dan pembatasan isolasi data per sekolah (Access Control List)."
        >
          {saveSuccess && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 animate-in fade-in">
              <Check className="h-3.5 w-3.5" />
              Tersimpan Otomatis
            </span>
          )}
        </PageHeader>
      </div>

      {/* Role & ACL Scope Selection Card */}
      <Card className="bg-card border-border shadow-2xs">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Pemilihan Peran & Lingkup Data (ACL)
          </CardTitle>
          <CardDescription>
            Pilih peran pengguna yang ingin disesuaikan hak akses menu dan cakupan isolasi datanya.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">Peran Pengguna (Role):</label>
              <Select
                value={selectedRoleId}
                onChange={(e) => setSelectedRoleId(e.target.value)}
                className="font-semibold text-xs sm:text-sm"
              >
                {userRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.code})
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-foreground text-xs">Lingkup Akses Data (ACL):</label>
              <Select
                value={currentRoleConfig.scopeType}
                onChange={(e) =>
                  handleScopeTypeChange(
                    e.target.value as 'global' | 'branch' | 'school'
                  )
                }
                className="text-xs sm:text-sm font-medium"
              >
                <option value="global">Global (Seluruh Sistem & Sekolah)</option>
                <option value="branch">Tingkat Cabang Wilayah</option>
                <option value="school">Tingkat Unit Sekolah Tertentu</option>
              </Select>
            </div>

            {currentRoleConfig.scopeType === 'school' && (
              <div className="space-y-1.5 animate-in fade-in">
                <label className="font-semibold text-foreground text-xs">Sekolah yang Dibatasi:</label>
                <Select
                  value={currentRoleConfig.scopedSchoolId || schools[0]?.id || ''}
                  onChange={(e) => handleScopedSchoolChange(e.target.value)}
                  className="text-xs sm:text-sm font-medium"
                >
                  {schools.map((sch) => (
                    <option key={sch.id} value={sch.id}>
                      {sch.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* Scope Explanation Callout */}
          <div className="pt-1">
            {currentRoleConfig.scopeType === 'global' && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-blue-500/10 border border-blue-500/25 text-xs text-blue-900 dark:text-blue-200">
                <ShieldCheck className="h-4 w-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-blue-800 dark:text-blue-300">Cakupan Global:</strong> Peran ini memiliki visibilitas data lintas unit sekolah di seluruh wilayah secara nasional tanpa batasan isolasi.
                </span>
              </div>
            )}
            {currentRoleConfig.scopeType === 'branch' && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-900 dark:text-amber-200">
                <Building className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-amber-800 dark:text-amber-300">Cakupan Cabang:</strong> Akses data terisolasi otomatis khusus untuk sekolah-sekolah di bawah cabang wilayah yang ditentukan.
                </span>
              </div>
            )}
            {currentRoleConfig.scopeType === 'school' && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-900 dark:text-emerald-200">
                <School className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>
                  <strong className="font-semibold text-emerald-800 dark:text-emerald-300">Cakupan Terisolasi:</strong> Seluruh data ujian, peserta, dan pegawai dibatasi ketat khusus untuk unit{' '}
                  <span className="font-semibold underline underline-offset-2">
                    {schools.find((s) => s.id === (currentRoleConfig.scopedSchoolId || schools[0]?.id))?.name || 'Sekolah Terpilih'}
                  </span>.
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix Tree Table Card */}
      <div className="rounded-xl border border-border bg-card shadow-2xs overflow-hidden">
        {/* Table Toolbar Header */}
        <div className="p-4 border-b border-border/70 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card shrink-0">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-foreground">
                Matriks Izin Modul: <span className="text-primary">{currentRoleConfig.roleName}</span>
              </h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-md font-mono font-bold bg-primary/10 text-primary border border-primary/30">
                {currentRoleConfig.roleCode}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Aturan: Hak <strong className="text-foreground font-semibold">&quot;Lihat (Read)&quot;</strong> merupakan syarat mutlak. Jika dimatikan, hak Create, Update, dan Delete dinonaktifkan otomatis.
            </p>
          </div>

          {/* Quick Tools: Search, Presets, Tree toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-44 sm:w-52">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama modul..."
                className="h-8 pl-8 text-xs font-medium"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCollapseAll}
              className="h-8 px-2.5 text-xs gap-1 font-medium text-foreground hover:text-primary"
              title="Ciutkan seluruh sub-modul"
            >
              <Folder className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Ciutkan</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExpandAll}
              className="h-8 px-2.5 text-xs gap-1 font-medium text-foreground hover:text-primary"
              title="Perluas seluruh sub-modul"
            >
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Perluas</span>
            </Button>

            <div className="h-6 w-[1px] bg-border mx-1 hidden sm:block" />

            {/* Presets */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset('all')}
              className="h-8 px-2.5 text-xs gap-1 font-semibold text-primary border-primary/40 bg-primary/5 hover:bg-primary hover:text-white transition-colors"
              title="Berikan semua izin (C, R, U, D) untuk seluruh modul"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Semua Akses</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset('readOnly')}
              className="h-8 px-2.5 text-xs gap-1 font-semibold text-blue-700 dark:text-blue-300 border-blue-500/30 bg-blue-500/5 hover:bg-blue-600 hover:text-white transition-colors"
              title="Hanya berikan izin Read untuk seluruh modul"
            >
              <Eye className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Hanya Baca</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleApplyPreset('clear')}
              className="h-8 px-2.5 text-xs gap-1 font-semibold text-rose-600 dark:text-rose-400 border-rose-500/30 bg-rose-500/5 hover:bg-rose-600 hover:text-white transition-colors"
              title="Kosongkan seluruh izin"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        </div>

        {/* Table Viewport with Sticky Header */}
        <div
          ref={tableContainerRef}
          className="overflow-x-auto border-b border-border/40"
        >
          <table className="w-full text-xs text-left border-collapse">
            <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur-xs border-b border-border text-foreground font-semibold shadow-2xs">
              <tr>
                <th className="p-3.5 bg-muted/95 sticky top-0 z-20 text-foreground font-semibold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>Struktur Modul & Navigasi</span>
                  </div>
                </th>
                <th className="p-3.5 text-center w-28 bg-muted/95 sticky top-0 z-20">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    <Eye className="h-3 w-3" />
                    Lihat (R)
                  </span>
                </th>
                <th className="p-3.5 text-center w-28 bg-muted/95 sticky top-0 z-20">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Buat (C)
                  </span>
                </th>
                <th className="p-3.5 text-center w-28 bg-muted/95 sticky top-0 z-20">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    Ubah (U)
                  </span>
                </th>
                <th className="p-3.5 text-center w-28 bg-muted/95 sticky top-0 z-20">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                    Hapus (D)
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {permissionTree.map((node) => renderPermissionRow(node))}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Summary & Scroll Helper */}
        <div className="p-3.5 bg-muted/30 border-t border-border flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">
              Total {allKeys.length} modul terkonfigurasi
            </span>
            <span className="text-border">|</span>
            <span>
              Peran: <strong className="text-primary font-semibold">{currentRoleConfig.roleName}</strong>
            </span>
            <span className="text-border">|</span>
            <span className="text-emerald-700 dark:text-emerald-300 font-semibold flex items-center gap-1">
              <Check className="h-3 w-3 stroke-[2.5]" />
              Tersimpan Otomatis
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={scrollToTop}
            className="h-7 text-xs gap-1 font-semibold text-primary hover:bg-primary/10"
            title="Kembali ke bagian atas tabel"
          >
            <ArrowUp className="h-3.5 w-3.5" />
            <span>Ke Atas</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MenuRBACPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-xs text-muted-foreground">
          Memuat matriks perizinan...
        </div>
      }
    >
      <MenuRBACContent />
    </React.Suspense>
  );
}
