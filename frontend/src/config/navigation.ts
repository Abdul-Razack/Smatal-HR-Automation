import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  UserMinus,
  Shield,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  title: string;
  route: string;
  icon: any; // Lucide icon
  permission?: string;
  module: string;
  order: number;
  children?: Omit<NavigationItem, 'icon' | 'module' | 'children'>[];
}

export const navigationConfig: NavigationItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    route: '/',
    icon: LayoutDashboard,
    module: 'dashboard',
    order: 10,
  },
  {
    id: 'employees',
    title: 'Employees',
    route: '/hr/employees',
    icon: Users,
    permission: 'employee:read',
    module: 'employee',
    order: 20,
  },
  {
    id: 'documents',
    title: 'Documents',
    route: '/hr/documents',
    icon: FileText,
    permission: 'document:read',
    module: 'document',
    order: 30,
  },
  {
    id: 'document-templates',
    title: 'Templates',
    route: '/documents/templates',
    icon: FileText,
    permission: 'document:read',
    module: 'document',
    order: 40,
  },
  {
    id: 'exit-resignation',
    title: 'Exit / Resignation',
    route: '/hr/exit',
    icon: UserMinus,
    permission: 'employee:read',
    module: 'employee',
    order: 50,
  },
  {
    id: 'organization',
    title: 'Company Settings',
    route: '/master/organization',
    icon: Building2,
    permission: 'role:read',
    module: 'organization',
    order: 60,
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    route: '/hr/audit',
    icon: Shield,
    permission: 'user:read',
    module: 'audit',
    order: 70,
  },
];

