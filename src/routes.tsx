import { createBrowserRouter, Navigate } from 'react-router-dom';

import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/features/auth/LoginPage';
import { RequireAuth } from '@/features/auth/RequireAuth';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { EntitlementsListPage } from '@/features/entitlements/EntitlementsListPage';
import { RevenuePage } from '@/features/revenue/RevenuePage';
import { UserDetailPage } from '@/features/users/UserDetailPage';
import { UsersListPage } from '@/features/users/UsersListPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: (
      <RequireAuth>
        <AppLayout />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'users', element: <UsersListPage /> },
      { path: 'users/:id', element: <UserDetailPage /> },
      { path: 'entitlements', element: <EntitlementsListPage /> },
      { path: 'revenue', element: <RevenuePage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
