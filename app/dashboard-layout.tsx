'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

interface DashboardLayoutProps {
  children: ReactNode;
  mainStyle?: React.CSSProperties;
  mainClassName?: string;
}

export function DashboardLayout({
  children,
  mainStyle,
  mainClassName = '',
}: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col ml-64">
        <TopNav />
        <main
          className={`flex-1 bg-surface text-surface-foreground ${mainClassName}`}
          style={mainStyle}
        >
          <div className="p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
