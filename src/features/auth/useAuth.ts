import { use } from 'react';

import { AuthContext } from '@/features/auth/AuthProvider';
import type { AuthContextValue } from '@/features/auth/AuthProvider';

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
