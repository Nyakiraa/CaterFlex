'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/lib/state';
import { Button } from '@/components/ui/button';
import { ChefHat, UtensilsCrossed } from 'lucide-react';


export default function Page() {
  const router = useRouter();
  const setCurrentRole = useAppState((state) => state.setCurrentRole);
  const [role, setRole] = useState<'owner' | 'customer'>('customer');
  const [error, setError] = useState('');

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
    <main className="min-h-screen relative overflow-hidden flex flex-col items-center px-4 py-0" style={{backgroundImage: 'url(/background.webp)', backgroundSize: 'cover', backgroundPosition: 'center'}}>
      {/* Subtle overlay for content readability */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none -z-10" />

      {/* Logo pinned to the top, enlarged */}
      <img
        src="/logo.png"
        alt="CaterFlex Logo"
        className="w-56 h-40 object-contain object-top mt-0 relative z-10"
      />

      <div className="max-w-4xl w-full flex-1 flex flex-col justify-center relative z-10 -mt-8 pb-6">
        <div className="text-center mb-4">
          <p className="text-xl text-white/90 font-semibold drop-shadow-sm">
            Professional Catering Management System
          </p>
        </div>

        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-lg">
          <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg border border-border bg-background p-1">
            <button type="button" onClick={() => setRole('owner')} className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${role === 'owner' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Owner</button>
            <button type="button" onClick={() => setRole('customer')} className={`rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${role === 'customer' ? 'bg-secondary text-secondary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Customer</button>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="landing-email">Email address
              <input id="landing-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" className="h-11 rounded-md border border-input bg-background px-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium" htmlFor="landing-password">Password
              <input id="landing-password" name="password" type="password" autoComplete="current-password" placeholder="Enter your password" className="h-11 rounded-md border border-input bg-background px-3 font-normal outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20" />
            </label>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="h-11 w-full">Login as {role === 'owner' ? 'Owner' : 'Customer'}</Button>
          </form>
        </div>

        {/* Role details */}
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          {/* Owner Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-primary/50 transition-all hover:shadow-lg flex flex-col min-h-[405px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-primary/10 rounded-lg">
                <ChefHat className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Owner</h2>
                <p className="text-xs text-muted-foreground">Manage your business</p>
              </div>
            </div>

            <p className="text-card-foreground text-sm mb-4 leading-snug">
              Access your dashboard to manage bookings, menus, inventory, and payments all in one place.
            </p>

            <ul className="space-y-1.5 mb-5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Booking management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Menu & pricing control
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Inventory tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                Payment records
              </li>
            </ul>

          </div>

          {/* Customer Card */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:border-secondary/50 transition-all hover:shadow-lg flex flex-col min-h-[405px]">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-secondary/10 rounded-lg">
                <UtensilsCrossed className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-card-foreground">Customer</h2>
                <p className="text-xs text-muted-foreground">Book catering services</p>
              </div>
            </div>

            <p className="text-card-foreground text-sm mb-4 leading-snug">
              Browse our menu, check dietary options, and request catering for your event.
            </p>

            <ul className="space-y-1.5 mb-5 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Event booking form
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Browse menu items
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Dietary preferences
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full" />
                Macro tracking
              </li>
            </ul>

          </div>
        </div>
      </div>
    </main>
  );
}
