'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/state';
import type { UserRole } from '@/lib/types';

export default function SignupPage() {
  const router = useRouter();
  const setCurrentRole = useAppState((state) => state.setCurrentRole);
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    const confirm = String(form.get('confirmPassword') || '');
    if (!name || !email || password.length < 6) return setError('Enter your details and a password with at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    setError('');
    setCurrentRole(role);
    router.push(role === 'owner' ? '/owner/dashboard' : '/customer/inquiry');
  }

  return (
    <main className="relative h-screen max-h-screen overflow-hidden bg-cover bg-center px-6 py-4 text-primary-foreground" style={{ backgroundImage: "url('/background.webp')" }}>
      <div className="absolute inset-0 bg-brand/80" aria-hidden="true" />
      <header className="relative z-10 flex justify-end"><span className="hidden font-mono text-xs uppercase tracking-[0.35em] text-primary-foreground/80 sm:block">Catering, refined</span></header>
      <div className="relative z-10 mx-auto flex h-[calc(100vh-5rem)] max-w-6xl items-center justify-center gap-12 py-2 lg:gap-16">
        <section className="hidden max-w-xl lg:block">
          <button type="button" onClick={() => router.push('/')} className="mb-4 block" aria-label="Back to CaterFlex home"><img src="/logo.png" alt="CaterFlex logo" className="size-28 object-contain object-left" /></button>
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-primary-foreground/80">Make every gathering count</p>
          <h1 className="mt-6 max-w-xl text-balance text-6xl font-bold uppercase leading-[0.88] tracking-tight">Your table starts here.</h1>
          <p className="mt-7 max-w-xl font-mono text-lg leading-7 text-primary-foreground/85">Create your CaterFlex account and bring thoughtful catering, planning, and service together.</p>
        </section>
        <section className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 text-card-foreground shadow-2xl sm:p-8" aria-labelledby="signup-heading">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Welcome to CaterFlex</p>
          <h1 id="signup-heading" className="mt-3 text-4xl font-semibold uppercase tracking-tight">Create account</h1>
          <div className="mt-6 grid grid-cols-2 rounded-xl bg-muted p-1" role="tablist" aria-label="Account type">
            {(['owner', 'customer'] as const).map((accountRole) => <button key={accountRole} type="button" role="tab" aria-selected={role === accountRole} onClick={() => setRole(accountRole)} className={`rounded-lg px-3 py-3 text-sm font-semibold capitalize transition-colors ${role === accountRole ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{accountRole}</button>)}
          </div>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label htmlFor="name" className="flex flex-col gap-2 text-sm font-semibold">Full name<input id="name" name="name" required autoComplete="name" placeholder="Your name" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label htmlFor="email" className="flex flex-col gap-2 text-sm font-semibold">Email address<input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label htmlFor="password" className="flex flex-col gap-2 text-sm font-semibold">Password<input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label htmlFor="confirmPassword" className="flex flex-col gap-2 text-sm font-semibold">Confirm password<input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" placeholder="Repeat your password" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full text-base">Create {role} account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <button type="button" onClick={() => router.push('/login')} className="font-semibold text-primary hover:underline">Sign in</button></p>
        </section>
      </div>
    </main>
  );
}
