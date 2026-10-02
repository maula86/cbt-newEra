'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Database,
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  UserCheck,
  FileSpreadsheet,
  BarChart3,
  ShieldCheck,
  Settings,
  ChevronDown,
  Layers,
  Sparkles,
  School,
  Building2,
  CalendarDays,
  Target,
  SlidersHorizontal,
  Award,
  ListOrdered,
  FileQuestion,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/useConfigStore';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: {
    title: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  }[];
}

const masterSubMenus = [
  { title: 'Config Bobot', href: '/master/config-bobot', icon: SlidersHorizontal },
  { title: 'Tahun Pelajaran', href: '/master/tahun-pelajaran', icon: CalendarDays },
  { title: 'Jenjang', href: '/master/jenjang', icon: Layers },
  { title: 'Tipe Ujian', href: '/master/tipe-ujian', icon: Target },
  { title: 'Sekolah', href: '/master/sekolah', icon: School },
  { title: 'Cabang', href: '/master/cabang', icon: Building2 },
  { title: 'Role User', href: '/master/role-user', icon: ShieldCheck },
  { title: 'Passing Grade', href: '/master/passing-grade', icon: Award },
  { title: 'Tipe Soal', href: '/master/tipe-soal', icon: FileQuestion },
  { title: 'Tipe Tes', href: '/master/tipe-tes', icon: ListOrdered },
];

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'Pegawai & Guru', href: '/pegawai', icon: Users },
  { title: 'Peserta Ujian', href: '/peserta', icon: GraduationCap },
  { title: 'Bank Soal', href: '/bank-soal', icon: BookOpen },
  { title: 'Event Ujian', href: '/event', icon: Calendar },
  { title: 'Pendaftaran', href: '/pendaftaran', icon: UserCheck },
  { title: 'Soal Event', href: '/soal-event', icon: FileSpreadsheet },
  { title: 'Report & Analisis', href: '/report', icon: BarChart3 },
  { title: 'Menu (RBAC & ACL)', href: '/menu', icon: ShieldCheck },
  { title: 'Config Sistem', href: '/config', icon: Settings },
];

export function AppSidebar({
  isMobileOpen,
  onCloseMobile,
  isCollapsed = false,
}: {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  isCollapsed?: boolean;
}) {
  const pathname = usePathname();
  const { appConfig } = useConfigStore();

  // Check if current route is within master section
  const isMasterActive = pathname.startsWith('/master');
  const [manualMasterOpen, setManualMasterOpen] = React.useState<boolean | null>(null);
  const isMasterOpen = manualMasterOpen !== null ? manualMasterOpen : true;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Surface */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col h-screen overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-all duration-300 lg:static shrink-0',
          isCollapsed ? 'w-20' : 'w-72',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 shrink-0 items-center px-4 border-b border-sidebar-border bg-sidebar z-10">
          <Link
            href="/"
            className="flex items-center gap-3 overflow-hidden font-semibold text-sidebar-foreground w-full"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-base shadow-sm">
              CBT
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate min-w-0">
                <span className="truncate text-sm font-semibold tracking-tight text-foreground">
                  {appConfig.appName}
                </span>
                <span className="truncate text-[10px] text-muted-foreground font-normal">
                  Portal Administrator
                </span>
              </div>
            )}
          </Link>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 [scrollbar-width:thin] [scrollbar-color:#ff810a_transparent]">
          {/* Main section */}
          <div className="space-y-1">
            {!isCollapsed && (
              <div className="px-3 pb-2 text-[11px] font-medium text-muted-foreground tracking-normal">
                Menu Utama
              </div>
            )}

            {/* Dashboard Link */}
            {(() => {
              const item = mainNavItems[0];
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseMobile}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors select-none',
                    isActive
                      ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary shadow-2xs'
                      : 'text-foreground/80 hover:bg-muted/70 hover:text-foreground font-medium',
                    isCollapsed && 'justify-center px-0'
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  {!isCollapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })()}

            {/* Collapsible Master Data Menu (Sidebar-07 Pattern) */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setManualMasterOpen(!isMasterOpen)}
                className={cn(
                  'group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer select-none',
                  isMasterActive
                    ? 'text-primary font-bold bg-primary/5 border-l-2 border-primary'
                    : 'text-foreground/80 hover:bg-muted/70 hover:text-foreground font-medium',
                  isCollapsed && 'justify-center px-0'
                )}
                title={isCollapsed ? 'Master Data' : undefined}
              >
                <div className="flex items-center gap-3">
                  <Database className={cn('h-4 w-4 shrink-0 transition-colors', isMasterActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                  {!isCollapsed && <span>Master Data</span>}
                </div>
                {!isCollapsed && (
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 text-muted-foreground transition-transform duration-200',
                      isMasterOpen && 'rotate-180'
                    )}
                  />
                )}
              </button>

              {/* Sub-menu tree */}
              {isMasterOpen && !isCollapsed && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-border/70 pl-2.5">
                  {masterSubMenus.map((sub) => {
                    const SubIcon = sub.icon;
                    const isSubActive = pathname === sub.href;
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        onClick={onCloseMobile}
                        className={cn(
                          'group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[11px] transition-colors',
                          isSubActive
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 font-medium'
                        )}
                      >
                        <SubIcon className={cn('h-3.5 w-3.5 shrink-0 transition-colors', isSubActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                        <span className="truncate">{sub.title}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Other Operations */}
            <div className="pt-3">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/90 tracking-wide">
                  Operasional Ujian
                </div>
              )}
              {mainNavItems.slice(1, 7).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors select-none',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary shadow-2xs'
                        : 'text-foreground/80 hover:bg-muted/70 hover:text-foreground font-medium',
                      isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </div>

            {/* System & Config */}
            <div className="pt-3">
              {!isCollapsed && (
                <div className="px-3 pb-1.5 text-[11px] font-semibold text-muted-foreground/90 tracking-wide">
                  Analisis & Hak Akses
                </div>
              )}
              {mainNavItems.slice(7).map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors select-none',
                      isActive
                        ? 'bg-primary/10 text-primary font-bold border-l-2 border-primary shadow-2xs'
                        : 'text-foreground/80 hover:bg-muted/70 hover:text-foreground font-medium',
                      isCollapsed && 'justify-center px-0'
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <Icon className={cn('h-4 w-4 shrink-0 transition-colors', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')} />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="shrink-0 p-3 border-t border-sidebar-border bg-sidebar z-10">
          {!isCollapsed ? (
            <div className="flex items-center justify-between rounded-lg bg-sidebar-accent/50 p-2.5 border border-sidebar-border text-xs">
              <div className="flex flex-col">
                <span className="font-semibold text-foreground text-[11px]">Versi 1.0.0</span>
                <span className="text-[10px] text-muted-foreground">Admin Mode Ready</span>
              </div>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Online
              </span>
            </div>
          ) : (
            <div className="flex justify-center text-[10px] text-muted-foreground font-mono">
              v1.0
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
