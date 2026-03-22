import { Outlet } from 'react-router-dom';

import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { QueryErrorBoundary } from '@/components/shared/QueryErrorBoundary';
import { useMobileSidebar } from '@/hooks/useMobileSidebar';

export function AppLayout() {
  const { isMobile, isOpen, open, close } = useMobileSidebar();

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar isMobile={isMobile} isOpen={isOpen} onClose={close} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar isMobile={isMobile} onMenuClick={open} />
        <main className="flex-1 overflow-y-auto bg-surface-container-lowest p-4 lg:p-6">
          <QueryErrorBoundary>
            <Outlet />
          </QueryErrorBoundary>
        </main>
      </div>
    </div>
  );
}
