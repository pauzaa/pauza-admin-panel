import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { NAV_ITEMS } from '@/lib/navigation';

interface TopBarProps {
  readonly isMobile: boolean;
  readonly onMenuClick: () => void;
}

const PAGE_TITLES = Object.fromEntries(
  NAV_ITEMS.map((item) => [item.to, item.label]),
);

function getPageTitle(pathname: string): string {
  const title = PAGE_TITLES[pathname];
  if (title) return title;
  if (pathname.startsWith('/users/')) return 'User Detail';
  return 'Pauza';
}

export function TopBar({ isMobile, onMenuClick }: TopBarProps) {
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-outline-variant bg-surface px-4 lg:px-6">
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={onMenuClick}
            className="flex size-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            aria-label="Open menu"
          >
            <Menu className="size-5" />
          </button>
        )}

        <h1 className="text-lg font-semibold tracking-tight text-on-surface">
          {getPageTitle(pathname)}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
          A
        </div>
      </div>
    </header>
  );
}
