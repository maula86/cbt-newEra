'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';
import { useConfigStore } from '@/store/useConfigStore';
import { ShieldCheck, Moon, Sun, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { isDarkMode, toggleDarkMode, isAuthenticated } = useConfigStore();

  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Left Column: Brand & Form Area */}
      <div className="flex flex-col justify-between p-6 sm:p-8 md:p-10 min-h-svh">
        {/* Top Header / Brand Logo & Theme Switcher */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 group transition-opacity hover:opacity-90"
          >
            {/* Soft Square Brand Icon - No Pill, No circle */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-sm leading-tight text-foreground tracking-tight">
                CBT Admin
              </span>
              <span className="text-[11px] text-muted-foreground leading-tight">
                Platform Ujian Digital
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            {/* Direct Dashboard Link if already logged in */}
            {isAuthenticated && (
              <Link
                href="/"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline px-2.5 py-1.5 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              >
                <span>Buka Dashboard</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            )}

            {/* Dark / Light Mode Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={toggleDarkMode}
              className="h-8 w-8 rounded-lg border-border hover:border-primary/40"
              aria-label={isDarkMode ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-amber-500" />
              ) : (
                <Moon className="h-4 w-4 text-foreground" />
              )}
            </Button>
          </div>
        </div>

        {/* Center Container: Login-04 Form */}
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-xs sm:max-w-sm">
            <LoginForm onSuccessRedirect="/" />
          </div>
        </div>

        {/* Bottom Footer Information */}
        <div className="text-center text-xs text-muted-foreground font-medium pt-4">
          &copy; {new Date().getFullYear()} CBT Admin Platform. Seluruh Hak Cipta Dilindungi.
        </div>
      </div>

      {/* Right Column: Visual Brand Image (hidden on mobile, visible on desktop) */}
      <div className="relative hidden bg-muted lg:block overflow-hidden border-l border-border select-none">
        <Image
          src="https://picsum.photos/seed/cbt-assessment-minimal/1600/1200"
          alt="CBT Assessment Center Infrastructure"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover brightness-95 contrast-[1.02] dark:brightness-[0.35] dark:contrast-[1.1] transition-all duration-700"
        />

        {/* Palette Tinted Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-tr from-background/90 via-primary/15 to-transparent mix-blend-multiply pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />

        {/* Content Overlay: Platform Highlight / Testimonial */}
        <div className="absolute bottom-0 inset-x-0 p-12 z-10 flex flex-col gap-4">
          <div className="inline-flex items-center gap-2 self-start rounded-md border border-primary/30 bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-semibold text-primary shadow-2xs">
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            <span>Platform Asesmen & Ujian Terstandar</span>
          </div>

          <blockquote className="space-y-2 max-w-lg">
            <p className="text-lg font-medium text-foreground tracking-tight leading-snug">
              &ldquo;Infrastruktur Computer Based Test terpusat dengan integritas tinggi, bank butir soal multidisiplin, dan analitika nilai ujian instan.&rdquo;
            </p>
            <footer className="text-xs text-muted-foreground font-medium">
              Sistem Manajemen Asesmen Pendidikan & Sertifikasi Digital
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  );
}
