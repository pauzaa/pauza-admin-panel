import { useLocation } from 'react-router-dom';

import { ThemeToggle } from '@/components/shared/ThemeToggle';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/entitlements': 'Entitlements',
  '/revenue': 'Revenue',
};

function getPageTitle(pathname: string): string {
  const title = PAGE_TITLES[pathname];
  if (title) return title;
  if (pathname.startsWith('/users/')) return 'User Detail';
  return 'Pauza';
}

export function TopBar() {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-outline-variant bg-surface px-6">
      <h1 className="text-lg font-semibold tracking-tight text-on-surface">
        {getPageTitle(pathname)}
      </h1>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
          A
        </div>
      </div>
    </header>
  );
}
