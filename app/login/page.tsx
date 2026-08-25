'use client';

import { FormEvent, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChefHat, ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppState } from '@/lib/state';
import type { UserRole } from '@/lib/types';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') === 'owner' ? 'owner' : 'customer';
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState('');
  const setCurrentRole = useAppState((state) => state.setCurrentRole);

  const destination = role === 'owner' ? '/owner/dashboard' : '/customer/inquiry';
  const title = role === 'owner' ? 'Welcome back, owner' : 'Welcome back, customer';

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
    router.push(destination);
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center">
        <button type="button" onClick={() => router.push('/')} className="mb-8 flex items-center gap-2 self-start text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft aria-hidden="true" className="size-4" /> Back to role selection
        </button>
        <div className="mb-8 text-center">
          <img src="/logo.png" alt="CaterFlex" className="mx-auto mb-4 size-20 object-contain" />
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-primary">CaterFlex access</p>
          <h1 className="text-balance text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-3 text-pretty text-sm leading-6 text-muted-foreground">Sign in to continue managing catering experiences with CaterFlex.</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-border bg-card p-1">
          <button type="button" onClick={() => setRole('owner')} className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${role === 'owner' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <ChefHat aria-hidden="true" className="size-4" /> Owner
          </button>
          <button type="button" onClick={() => setRole('customer')} className={`flex items-center justify-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${role === 'customer' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <UtensilsCrossed aria-hidden="true" className="size-4" /> Customer
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm">
          <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="email">Email address
            <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-md border border-input bg-background px-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="password">Password
            <input id="password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" className="h-11 rounded-md border border-input bg-background px-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
          </label>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-11 w-full">Sign in as {role === 'owner' ? 'Owner' : 'Customer'}</Button>
          <p className="text-center text-xs leading-5 text-muted-foreground">Prototype access: any valid email and password will continue to the selected workspace.</p>
        </form>
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
