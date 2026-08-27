'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/state';
import type { UserRole } from '@/lib/types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const setCurrentRole = useAppState((state) => state.setCurrentRole);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    if (!email || !password) {
      setError('Enter your email and password to continue.');
      return;
    }
    setError('');
    setCurrentRole(role);
    router.push(role === 'owner' ? '/owner/dashboard' : '/customer/inquiry');
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cover bg-center px-6 py-8" style={{ backgroundImage: "url('/background.webp')" }}>
      <div className="absolute inset-0 bg-brand/70" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-[2rem] border border-border/70 bg-card p-7 text-card-foreground shadow-2xl sm:p-10">
        <div className="flex justify-center">
          <img src="/logo.png" alt="CaterFlex logo" className="size-24 object-contain" />
        </div>
        <div className="mt-5 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">Welcome back</p>
          <h1 className="mt-3 text-balance text-4xl font-bold leading-tight">Log in to CaterFlex</h1>
          <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">Plan your next meal, browse menus, and send a booking request.</p>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Account type">
          {(['customer', 'owner'] as const).map((accountRole) => (
            <button key={accountRole} type="button" role="tab" aria-selected={role === accountRole} onClick={() => setRole(accountRole)} className={`rounded-lg px-3 py-2.5 text-sm font-semibold capitalize transition-colors ${role === accountRole ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              {accountRole}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <label htmlFor="email" className="flex flex-col gap-2 text-sm font-semibold">Email address
            <input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-12 w-full rounded-xl border border-border bg-background px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label htmlFor="password" className="flex flex-col gap-2 text-sm font-semibold">Password
            <span className="relative">
              <input id="password" name="password" type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Enter your password" className="h-12 w-full rounded-xl border border-border bg-background px-4 pr-20 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary hover:underline">{showPassword ? 'Hide' : 'Show'}</button>
            </span>
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="size-4 accent-primary" /> Remember me</label>
            <button type="button" className="font-semibold text-primary hover:underline">Forgot password?</button>
          </div>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-12 w-full">Log in as {role}</Button>
        </form>
        <p className="mt-7 text-center text-sm text-muted-foreground">New to CaterFlex? <button type="button" onClick={() => router.push('/')} className="font-semibold text-primary hover:underline">Create an account</button></p>
        <button type="button" onClick={() => router.push('/')} className="mt-5 block w-full text-center text-sm text-muted-foreground hover:text-foreground">Back to landing page</button>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-background" aria-busy="true" />}>
      <LoginForm />
    </Suspense>
  );
}
