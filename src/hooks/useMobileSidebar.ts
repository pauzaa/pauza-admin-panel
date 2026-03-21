import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const MOBILE_QUERY = '(max-width: 1023px)';

interface UseMobileSidebarReturn {
  readonly isMobile: boolean;
  readonly isOpen: boolean;
  readonly open: () => void;
  readonly close: () => void;
}

export function useMobileSidebar(): UseMobileSidebarReturn {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );
  const [isOpen, setIsOpen] = useState(false);
  const { pathname } = useLocation();

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [pathname, isMobile]);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);

    function handleChange(e: MediaQueryListEvent) {
      setIsMobile(e.matches);
      if (!e.matches) setIsOpen(false);
    }

    mql.addEventListener('change', handleChange);
    return () => {
      mql.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isMobile, isOpen]);

  return { isMobile, isOpen, open, close };
}
