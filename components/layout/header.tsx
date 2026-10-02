'use client';

import * as React from 'react';
import { Menu, Sun, Moon, RotateCcw, Shield, Building, Sparkles, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useConfigStore } from '@/store/useConfigStore';
import { useMasterStore } from '@/store/useMasterStore';
import { useUserStore } from '@/store/useUserStore';
import { useExamStore } from '@/store/useExamStore';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';

export function AppHeader({
  onOpenMobile,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: {
  onOpenMobile: () => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}) {
  const { isDarkMode, toggleDarkMode, activeRoleId, setActiveRoleId, roleConfigs, appConfig } =
    useConfigStore();
  const { resetMasterData } = useMasterStore();
  const { resetUserData } = useUserStore();
  const { resetExamData } = useExamStore();
  const { resetConfig } = useConfigStore();

  const [confirmResetOpen, setConfirmResetOpen] = React.useState(false);

  const activeRole = roleConfigs[activeRoleId] || {
    roleName: 'Super Administrator',
    roleCode: 'SUPER_ADMIN',
  };

  const handleResetAllData = () => {
    resetMasterData();
    resetUserData();
    resetExamData();
    resetConfig();
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 sm:px-6 backdrop-blur-xs">
        {/* Left: Desktop sidebar toggle, Mobile trigger & context info */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={onOpenMobile}
            className="flex lg:hidden items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-foreground hover:bg-muted transition-colors cursor-pointer"
            aria-label="Buka menu navigasi"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Desktop sidebar toggle button */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex items-center justify-center h-9 w-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer shadow-2xs"
              title={isSidebarCollapsed ? 'Perluas sidebar navigasi' : 'Perkecil sidebar navigasi'}
              aria-label="Toggle sidebar navigasi"
            >
              {isSidebarCollapsed ? (
                <PanelLeft className="h-4.5 w-4.5 text-primary" />
              ) : (
                <PanelLeftClose className="h-4.5 w-4.5" />
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <Building className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="font-semibold text-foreground tracking-tight">{appConfig.organizationName}</span>
            <span className="text-border">/</span>
            <span className="text-primary font-medium">CBT Engine v1.0</span>
          </div>
        </div>

        {/* Right: Role Simulator, Reset Data, Theme toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Role Selector Simulation */}
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs shadow-2xs">
            <Shield className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="hidden md:inline font-semibold text-muted-foreground">Peran:</span>
            <select
              value={activeRoleId}
              onChange={(e) => setActiveRoleId(e.target.value)}
              className="bg-transparent text-xs font-bold text-foreground focus:outline-none cursor-pointer"
              title="Ganti peran pengguna simulasi"
            >
              <option value="role-1">Super Admin</option>
              <option value="role-3">Admin Sekolah</option>
              <option value="role-4">Guru / Panitia</option>
            </select>
          </div>

          {/* Reset Dummy Data Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmResetOpen(true)}
            className="h-8 text-xs hidden sm:flex items-center gap-1.5"
            title="Reset seluruh state ke dummy data awal"
          >
            <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Reset Demo</span>
          </Button>

          {/* Dark / Light Toggle */}
          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
            className="h-8 w-8"
            aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-foreground" />}
          </Button>
        </div>
      </header>

      {/* Confirmation for resetting all mock data */}
      <ConfirmationDialog
        open={confirmResetOpen}
        onOpenChange={setConfirmResetOpen}
        title="Reset Data Demo"
        description="Apakah Anda yakin ingin mengembalikan seluruh data (Master, Soal, Event, Peserta, RBAC) ke kondisi bawaan awal? Perubahan lokal Anda akan direset."
        confirmLabel="Ya, Reset Data"
        cancelLabel="Batal"
        onConfirm={handleResetAllData}
      />
    </>
  );
}
