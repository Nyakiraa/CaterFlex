'use client';

import { useEffect } from 'react';
import { restoreSession } from '@/lib/auth';

export function AuthSessionSync() {
  useEffect(() => {
    void restoreSession();
  }, []);

  return null;
}
