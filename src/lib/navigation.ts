import type { LucideIcon } from 'lucide-react';
import { DollarSign, LayoutDashboard, Shield, Users } from 'lucide-react';

interface NavItem {
  readonly to: string;
  readonly label: string;
  readonly icon: LucideIcon;
  readonly end?: boolean;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/entitlements', label: 'Entitlements', icon: Shield },
  { to: '/revenue', label: 'Revenue', icon: DollarSign },
];
