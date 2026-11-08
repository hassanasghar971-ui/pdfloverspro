'use client';

import type { ReactNode } from 'react';
import { useAdsAllowed } from '@/lib/consent';

export default function AdsGate({ children }: { children: ReactNode }) {
  const allowed = useAdsAllowed();
  return allowed ? <>{children}</> : null;
}
