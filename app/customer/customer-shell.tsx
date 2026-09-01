'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, ClipboardList, Home, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/customer/inquiry', label: 'Start an order', icon: Home },
  { href: '/customer/status', label: 'My requests', icon: ClipboardList },
  { href: '/customer/active-orders', label: 'Meal plans', icon: BookOpen },
];

export function CustomerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/95">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 lg:px-8">
          <Link href="/customer/inquiry" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <UtensilsMark />
            </span>
            <span>
              <span className="block font-heading text-lg font-bold tracking-tight">CaterFlex</span>
              <span className="block text-xs text-muted-foreground">Thoughtful food, made easy</span>
            </span>
          </Link>
          <button type="button" className="rounded-md p-2 md:hidden" aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen(!open)}>
            {open ? <X /> : <Menu />}
          </button>
          <nav className="hidden items-center gap-2 md:flex" aria-label="Customer navigation">
            {links.map((link) => {
              const Icon = link.icon;
              return <Link key={link.href} href={link.href} className={cn('rounded-full px-4 py-2 text-sm transition-colors hover:bg-muted', pathname === link.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground')}><Icon className="mr-2 inline size-4" />{link.label}</Link>;
            })}
          </nav>
        </div>
        {open && <nav className="flex flex-col gap-2 border-t border-border px-5 py-4 md:hidden" aria-label="Customer navigation">{links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className={cn('rounded-lg px-4 py-3 text-sm', pathname === link.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted')}>{link.label}</Link>)}</nav>}
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-12">{children}</main>
    </div>
  );
}

function UtensilsMark() {
  return <span aria-hidden="true" className="text-lg">CF</span>;
}
