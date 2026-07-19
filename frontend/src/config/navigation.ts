import {
  LayoutDashboard,
  Users,
  Building2,
  FileText,
  Briefcase,
  Settings,
  Bell,
  Shield,
  BarChart,
  UserPlus
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
    id: 'organization',
    title: 'Organization',
    route: '/master/organization',
    icon: Building2,
    permission: 'organization:view',
    module: 'organization',
    order: 20,
  },
  {
    id: 'employees',
    title: 'Employees',
    route: '/hr/employees',
    icon: Users,
    permission: 'employee:view',
    module: 'employee',
    order: 30,
  },
  {
    id: 'ats',
    title: 'ATS',
    route: '/ats',
    icon: UserPlus,
    permission: 'candidate:view',
    module: 'candidate',
    order: 40,
  },
  {
    id: 'ats-reports',
    title: 'ATS Reports',
    route: '/ats/reports',
    icon: BarChart,
    permission: 'candidate:view',
    module: 'candidate',
    order: 45,
  },
  {
    id: 'workflows',
    title: 'Workflows',
    route: '/hr/workflows',
    icon: Briefcase,
    permission: 'workflow:view',
    module: 'workflow',
    order: 50,
  },
  {
    id: 'documents',
    title: 'Documents',
    route: '/hr/documents',
    icon: FileText,
    permission: 'document:view',
    module: 'document',
    order: 60,
  },
  {
    id: 'document-templates',
    title: 'Doc Templates',
    route: '/documents/templates',
    icon: FileText,
    permission: 'document:view',
    module: 'document',
    order: 65,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    route: '/hr/reports',
    icon: BarChart,
    permission: 'analytics:view',
    module: 'analytics',
    order: 70,
  },
  {
    id: 'notifications',
    title: 'Notifications',
    route: '/hr/notifications',
    icon: Bell,
    permission: 'notification:view',
    module: 'notification',
    order: 80,
  },
  {
    id: 'audit',
    title: 'Audit Logs',
    route: '/hr/audit',
    icon: Shield,
    permission: 'audit:view',
    module: 'audit',
    order: 90,
  },
  {
    id: 'master',
    title: 'Master Data',
    route: '/master',
    icon: Settings,
    permission: 'master:view',
    module: 'master',
    order: 100,
  }
];

