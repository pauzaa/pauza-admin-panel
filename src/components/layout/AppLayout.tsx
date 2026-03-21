import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { QueryErrorBoundary } from '@/components/shared/QueryErrorBoundary';

export function AppLayout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-6">
          <QueryErrorBoundary>
            <Outlet />
          </QueryErrorBoundary>
        </main>
      </div>
    </div>
  );
}
