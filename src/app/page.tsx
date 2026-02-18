'use client';

import { CrmProvider } from '@/context/CrmContext';
import Dashboard from '@/components/Dashboard';

export default function Home() {
  return (
    <CrmProvider>
      <div className="h-screen w-screen overflow-hidden">
        <Dashboard />
      </div>
    </CrmProvider>
  );
}