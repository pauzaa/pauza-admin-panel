import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';

const LoginPage = lazy(() =>
  import('@/features/auth/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const UsersListPage = lazy(() =>
  import('@/features/users/UsersListPage').then((m) => ({ default: m.UsersListPage })),
);
const UserDetailPage = lazy(() =>
  import('@/features/users/UserDetailPage').then((m) => ({ default: m.UserDetailPage })),
);
const EntitlementsListPage = lazy(() =>
  import('@/features/entitlements/EntitlementsListPage').then((m) => ({
    default: m.EntitlementsListPage,
  })),
);
const RevenuePage = lazy(() =>
  import('@/features/revenue/RevenuePage').then((m) => ({ default: m.RevenuePage })),
);

function SuspenseRoute({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <LoadingSpinner />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <SuspenseRoute>
        <LoginPage />
      </SuspenseRoute>
    ),
  },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseRoute>
            <DashboardPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'users',
        element: (
          <SuspenseRoute>
            <UsersListPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <SuspenseRoute>
            <UserDetailPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'entitlements',
        element: (
          <SuspenseRoute>
            <EntitlementsListPage />
          </SuspenseRoute>
        ),
      },
      {
        path: 'revenue',
        element: (
          <SuspenseRoute>
            <RevenuePage />
          </SuspenseRoute>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
