'use client';

import { useAppState } from '@/lib/state';
import { User } from 'lucide-react';

export function TopNav() {
  const { currentRole } = useAppState();

  return (
    <header className="border-b border-border sticky top-0 z-50 shadow-md bg-surface text-surface-foreground">
      <div className="flex items-center justify-end h-16 px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1">
            <User className="w-4 h-4 text-surface-muted-foreground" />
            <span className="text-sm font-medium capitalize text-surface-foreground">
              {currentRole}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
