'use client';

import * as React from 'react';
import { Building2, Check, ChevronsUpDown, ShieldCheck, Plus } from 'lucide-react';
import { useAuthStore, Company } from '@/store';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { organizationApi } from '@/modules/organization/api/organization.api';
import { CreateCompanyModal } from '@/modules/organization/components/forms/CreateCompanyModal';

export function CompanySwitcher() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const {
    currentCompany,
    accessibleCompanies,
    isCommon,
    roles,
    switchCompany,
  } = useAuthStore();

  const isSuperAdmin = Boolean(roles?.includes('SUPER_ADMIN'));
  const canSwitch = isCommon || isSuperAdmin || accessibleCompanies.length > 1;

  // For leadership / super admin, fetch live list of all companies
  const { data: remoteCompanies } = useQuery({
    queryKey: ['organization', 'companies'],
    queryFn: organizationApi.listCompanies,
    enabled: Boolean(isCommon || isSuperAdmin),
    staleTime: 30000,
  });

  const displayCompanies =
    remoteCompanies && remoteCompanies.length > 0
      ? remoteCompanies
      : accessibleCompanies;

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentCompany && displayCompanies.length === 0) {
    return null;
  }

  const active =
    currentCompany ||
    displayCompanies[0] || {
      id: '',
      name: 'Default Company',
    };

  // If user only has access to one company and is not a common user, render a static badge
  if (!canSwitch) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-muted/40 text-muted-foreground text-xs font-medium">
        <Building2 className="h-3.5 w-3.5 text-primary" />
        <span className="truncate max-w-[160px]">{active.name}</span>
      </div>
    );
  }

  const handleSelectCompany = (company: Company) => {
    if (company.id === active.id) {
      setIsOpen(false);
      return;
    }

    switchCompany(company);
    setIsOpen(false);
    toast.success(`Active company switched to ${company.name}`);

    // Invalidate all queries and trigger smooth reload to refresh all tenant-scoped data
    queryClient.clear();
    window.location.reload();
  };

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150 shadow-sm',
            'bg-background hover:bg-accent/70 hover:text-accent-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isOpen ? 'ring-2 ring-primary border-primary' : 'border-border'
          )}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary">
            <Building2 className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground truncate max-w-[180px]">
                {active.name}
              </span>
              {isCommon && (
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                  Common
                </span>
              )}
            </div>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground ml-1 opacity-70" />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-2 w-72 rounded-xl border bg-popover text-popover-foreground shadow-lg z-50 animate-in fade-in-0 zoom-in-95 duration-100 p-1.5">
            <div className="px-2.5 py-2 border-b border-border/60 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span>Select Active Company</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Switching context updates staff, candidates, and documents.
              </p>
            </div>

            <div className="space-y-0.5 max-h-64 overflow-y-auto" role="listbox">
              {displayCompanies.map((comp) => {
                const isSelected = comp.id === active.id;
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleSelectCompany(comp)}
                    className={cn(
                      'w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs font-medium transition-colors text-left',
                      isSelected
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'hover:bg-accent hover:text-accent-foreground text-foreground'
                    )}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <div
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-[11px] font-bold uppercase',
                          isSelected
                            ? 'border-primary/40 bg-primary text-primary-foreground'
                            : 'border-border bg-muted/40 text-muted-foreground'
                        )}
                      >
                        {comp.name.substring(0, 2)}
                      </div>
                      <div className="truncate">
                        <div className="truncate">{comp.name}</div>
                        {comp.code && (
                          <div className="text-[10px] text-muted-foreground font-mono">
                            {comp.code}
                          </div>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {(isCommon || isSuperAdmin) && (
              <div className="pt-1.5 mt-1.5 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsCreateModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Sister Company</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </>
  );
}
