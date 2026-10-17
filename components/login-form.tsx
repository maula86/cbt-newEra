'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfigStore } from '@/store/useConfigStore';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

interface LoginFormProps extends React.ComponentPropsWithoutRef<'form'> {
  onSuccessRedirect?: string;
}

export function LoginForm({
  className,
  onSuccessRedirect = '/',
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const { login } = useConfigStore();
  const [email, setEmail] = React.useState('admin@cbtplatform.ac.id');
  const [password, setPassword] = React.useState('••••••••••••');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      setErrorMessage('Harap masukkan alamat email Anda.');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Harap masukkan kata sandi Anda.');
      return;
    }

    setIsLoading(true);

    // Simulate login verification
    setTimeout(() => {
      login(email.trim());
      setIsLoading(false);
      router.push(onSuccessRedirect);
    }, 600);
  };

  const handleDemoFill = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('SuperAdmin123!');
    setErrorMessage(null);
  };

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSubmit}
      {...props}
    >
      {/* Title & Description — Hierarchical Typography (no uppercase eyebrow) */}
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Login to your account
        </h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-5">
        {/* Email Field */}
        <div className="grid gap-2 text-left">
          <Label htmlFor="email" className="text-xs font-semibold text-foreground">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="h-10 text-sm"
          />
        </div>

        {/* Password Field */}
        <div className="grid gap-2 text-left">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-foreground">
              Password
            </Label>
            <Link
              href="#"
              onClick={(e) => {
                e.preventDefault();
                alert('Tautan pemulihan kata sandi telah dikirim ke email demo Anda.');
              }}
              className="text-xs font-medium text-muted-foreground underline-offset-4 hover:underline hover:text-primary transition-colors"
            >
              Forgot your password?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-10 text-sm pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
              aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Primary Soft Square Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.99] transition-all shadow-2xs"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Signing in...
            </>
          ) : (
            'Login'
          )}
        </Button>

        {/* Divider with subtle border */}
        <div className="relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-3 text-muted-foreground font-medium">
            Or continue with
          </span>
        </div>

        {/* Social Authentication Buttons (Soft Square) */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoFill('google.admin@cbtplatform.ac.id')}
            className="w-full h-10 text-xs font-medium border-border hover:border-primary/40 hover:bg-muted/60 transition-colors"
          >
            <svg
              className="h-4 w-4 shrink-0"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Google</span>
          </Button>

          <Button
            variant="outline"
            type="button"
            disabled={isLoading}
            onClick={() => handleDemoFill('apple.admin@cbtplatform.ac.id')}
            className="w-full h-10 text-xs font-medium border-border hover:border-primary/40 hover:bg-muted/60 transition-colors"
          >
            <svg
              className="h-4 w-4 shrink-0 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.61-.75 1.04-1.8 0.92-2.85-.9.04-2 .6-2.65 1.35-.56.64-1.06 1.71-.93 2.73 1.01.08 2.05-.48 2.66-1.23z" />
            </svg>
            <span>Apple</span>
          </Button>
        </div>

        {/* Demo Fast Login Helper */}
        <div className="rounded-lg border border-border/80 bg-muted/40 p-3 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-foreground">
              Akses Cepat Pengujian:
            </span>
            <span className="text-[10px] text-primary font-medium">Demo Ready</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => handleDemoFill('superadmin@cbt.ac.id')}
              className="text-[11px] px-2 py-1 rounded bg-card border border-border hover:border-primary/50 text-foreground transition-colors"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('guru@cbt.ac.id')}
              className="text-[11px] px-2 py-1 rounded bg-card border border-border hover:border-primary/50 text-foreground transition-colors"
            >
              Guru / Penilai
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('adminsekolah@cbt.ac.id')}
              className="text-[11px] px-2 py-1 rounded bg-card border border-border hover:border-primary/50 text-foreground transition-colors"
            >
              Admin Sekolah
            </button>
          </div>
        </div>

        {/* Sign up prompt */}
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert('Pendaftaran akun dikelola oleh Administrator Institusi.');
            }}
            className="font-semibold text-foreground underline underline-offset-4 hover:text-primary transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>

      {/* Terms disclaimer */}
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our{' '}
        <Link href="#">Terms of Service</Link> and{' '}
        <Link href="#">Privacy Policy</Link>.
      </div>
    </form>
  );
}
