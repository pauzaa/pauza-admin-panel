import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut, X } from 'lucide-react';

import { PauzaLogo } from '@/components/shared/PauzaLogo';
import { useAuth } from '@/features/auth/useAuth';
import { NAV_ITEMS } from '@/lib/navigation';
import { cn } from '@/lib/utils';

interface SidebarProps {
  readonly isMobile: boolean;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export function Sidebar({ isMobile, isOpen, onClose }: SidebarProps) {
  const { logout } = useAuth();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (isMobile && isOpen && sidebarRef.current) {
      sidebarRef.current.focus();
    }
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isMobile || !isOpen) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobile, isOpen, onClose]);

  const sidebarContent = (
    <aside
      ref={sidebarRef}
      tabIndex={-1}
      className={cn(
        'flex h-full w-64 shrink-0 flex-col border-r border-outline-variant bg-surface-container-low outline-none',
        isMobile && 'shadow-xl',
      )}
    >
      <div className="flex h-16 items-center justify-between border-b border-outline-variant px-5">
        <PauzaLogo />
        {isMobile && (
          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-lg text-on-surface-variant transition-colors duration-200 hover:bg-surface-container hover:text-on-surface"
            aria-label="Close sidebar"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full transition-colors duration-200',
                    isActive
                      ? 'bg-primary opacity-100'
                      : 'bg-transparent opacity-0',
                  )}
                />
                <Icon className="size-[18px] shrink-0" />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-outline-variant p-3">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-on-surface-variant transition-colors duration-200 hover:bg-error/10 hover:text-error"
        >
          <LogOut className="size-[18px] shrink-0" />
          Logout
        </button>
      </div>
    </aside>
  );

  if (!isMobile) {
    return sidebarContent;
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-on-surface/40 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebarContent}
      </div>
    </>
  );
}
