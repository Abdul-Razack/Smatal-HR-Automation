'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Building2, FileText, Settings, Briefcase, FormInput } from 'lucide-react';
import { Card } from '@/components/ui/card';

const masterRoutes = [
  {
    title: 'Organization',
    icon: Building2,
    children: [
      { title: 'Departments', href: '/master/organization/departments' },
      { title: 'Branches', href: '/master/organization/branches' },
      { title: 'Designations', href: '/master/organization/designations' },
    ],
  },
  {
    title: 'Workflows',
    icon: Briefcase,
    children: [
      { title: 'Definitions', href: '/master/workflows/definitions' },
    ],
  },
  {
    title: 'Dynamic Fields',
    icon: FormInput,
    children: [
      { title: 'Field Registry', href: '/master/fields/registry' },
      { title: 'Document Types', href: '/master/fields/documents' },
    ],
  },
  {
    title: 'Templates',
    icon: FileText,
    children: [
      { title: 'Template Manager', href: '/master/templates' },
    ],
  },
];

export default function MasterSetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col md:flex-row gap-6 p-8 pt-6">
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-3xl font-bold tracking-tight mb-6">Master Setup</h2>
        <Card className="p-2 border-none shadow-none md:border md:shadow-sm bg-transparent md:bg-card">
          <nav className="space-y-6">
            {masterRoutes.map((group) => (
              <div key={group.title} className="flex flex-col space-y-1">
                <div className="flex items-center px-2 py-1 mb-1 text-sm font-semibold tracking-tight">
                  <group.icon className="mr-2 h-4 w-4" />
                  {group.title}
                </div>
                {group.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors hover:bg-accent hover:text-accent-foreground',
                      pathname === child.href ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {child.title}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </Card>
      </aside>
      <main className="flex-1 overflow-auto">
        <Card className="h-full border-none shadow-none p-0 md:border md:shadow-sm md:p-6">
          {children}
        </Card>
      </main>
    </div>
  );
}
