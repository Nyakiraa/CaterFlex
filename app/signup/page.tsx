'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/state';
export default function SignupPage() {
  const router = useRouter();
  const setCurrentRole = useAppState((state) => state.setCurrentRole);
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
    setCurrentRole('customer');
    router.push('/customer/inquiry');
  }

  return (
    <main className="relative h-screen max-h-screen overflow-hidden bg-cover bg-center px-6 py-4 text-primary-foreground" style={{ backgroundImage: "url('/background.webp')" }}>
      <div className="absolute inset-0 bg-brand/80" aria-hidden="true" />
      <div className="relative z-10 flex h-full items-center justify-center">
        <section className="w-full max-w-lg rounded-3xl border border-border/70 bg-card p-6 text-card-foreground shadow-2xl sm:p-8" aria-labelledby="signup-heading">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-muted-foreground">Welcome to CaterFlex</p>
          <h1 id="signup-heading" className="mt-3 text-4xl font-semibold uppercase tracking-tight">Create account</h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <label htmlFor="name" className="flex flex-col gap-2 text-sm font-semibold">Full name<input id="name" name="name" required autoComplete="name" placeholder="Your name" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label htmlFor="email" className="flex flex-col gap-2 text-sm font-semibold">Email address<input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label htmlFor="password" className="flex flex-col gap-2 text-sm font-semibold">Password<input id="password" name="password" type="password" required minLength={6} autoComplete="new-password" placeholder="At least 6 characters" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            <label htmlFor="confirmPassword" className="flex flex-col gap-2 text-sm font-semibold">Confirm password<input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} autoComplete="new-password" placeholder="Repeat your password" className="h-11 w-full rounded-xl border border-border bg-card px-4 font-normal text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20" /></label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full text-base">Create customer account</Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">Already have an account? <button type="button" onClick={() => router.push('/login')} className="font-semibold text-primary hover:underline">Sign in</button></p>
        </section>
      </div>
    </main>
  );
}
