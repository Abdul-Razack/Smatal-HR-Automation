import { create } from 'zustand';
import { storage } from '@/utils/storage';

export interface User {
  id: string;
  name?: string;
  email: string;
  companyId?: string;
  isCommon?: boolean;
}

export interface Company {
  id: string;
  name: string;
  code?: string;
  businessId?: string;
  logoUrl?: string | null;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  currentCompany: Company | null;
  accessibleCompanies: Company[];
  isCommon: boolean;
  roles: string[];
  permissions: string[];
  status: AuthStatus;

  // Actions
  login: (data: {
    accessToken: string;
    refreshToken: string;
    user: User;
    company?: Company;
    accessibleCompanies?: Company[];
    roles: string[];
    permissions: string[];
  }) => void;
  logout: () => void;
  refresh: (accessToken: string, refreshToken: string) => void;
  setUser: (
    user: User,
    roles?: string[],
    permissions?: string[],
    accessibleCompanies?: Company[],
  ) => void;
  setCompany: (company: Company) => void;
  setAccessibleCompanies: (companies: Company[]) => void;
  switchCompany: (company: Company) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: storage.get('access_token'),
  refreshToken: storage.get('refresh_token'),
  currentUser: null,
  currentCompany: null,
  accessibleCompanies: storage.get('accessible_companies') || [],
  isCommon: false,
  roles: [],
  permissions: [],
  status: storage.get('access_token') ? 'loading' : 'idle',

  login: (data) => {
    storage.set('access_token', data.accessToken);
    storage.set('refresh_token', data.refreshToken);

    const companies: Company[] =
      data.accessibleCompanies && data.accessibleCompanies.length > 0
        ? data.accessibleCompanies
        : data.company
          ? [data.company]
          : [];
    storage.set('accessible_companies', companies);

    const isCommon = Boolean(
      data.user?.isCommon || data.roles?.includes('SUPER_ADMIN'),
    );

    const savedCompanyId = storage.get('company_id');
    const matched = companies.find((c) => c.id === savedCompanyId);
    const activeCompany = matched || data.company || companies[0] || null;

    if (activeCompany) {
      storage.set('company_id', activeCompany.id);
    } else if (data.user && data.user.companyId) {
      storage.set('company_id', data.user.companyId);
    }

    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      currentUser: data.user,
      currentCompany: activeCompany,
      accessibleCompanies: companies,
      isCommon,
      roles: data.roles,
      permissions: data.permissions,
      status: 'authenticated',
    });
  },

  logout: () => {
    storage.remove('access_token');
    storage.remove('refresh_token');
    storage.remove('company_id');
    storage.remove('accessible_companies');

    set({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      currentCompany: null,
      accessibleCompanies: [],
      isCommon: false,
      roles: [],
      permissions: [],
      status: 'unauthenticated',
    });
  },

  refresh: (accessToken, refreshToken) => {
    storage.set('access_token', accessToken);
    storage.set('refresh_token', refreshToken);

    set({
      accessToken,
      refreshToken,
      status: 'authenticated',
    });
  },

  setUser: (user, roles, permissions, accessibleCompanies) => {
    const isCommon = Boolean(user.isCommon || roles?.includes('SUPER_ADMIN'));

    let companies: Company[] = accessibleCompanies || [];
    if (!companies || companies.length === 0) {
      companies = storage.get('accessible_companies') || [];
    }

    const savedCompanyId = storage.get('company_id');
    const matched = companies.find((c) => c.id === savedCompanyId);
    const activeCompany = matched || companies[0] || null;

    if (activeCompany) {
      storage.set('company_id', activeCompany.id);
    }

    set((state) => ({
      currentUser: user,
      isCommon: isCommon || state.isCommon,
      accessibleCompanies: companies.length > 0 ? companies : state.accessibleCompanies,
      currentCompany: activeCompany || state.currentCompany,
      ...(roles !== undefined ? { roles } : {}),
      ...(permissions !== undefined ? { permissions } : {}),
      status: 'authenticated',
    }));
  },

  setCompany: (company) => {
    storage.set('company_id', company.id);
    set({ currentCompany: company });
  },

  setAccessibleCompanies: (companies) => {
    storage.set('accessible_companies', companies);
    set({ accessibleCompanies: companies });
  },

  switchCompany: (company) => {
    storage.set('company_id', company.id);
    set({ currentCompany: company });
  },

  clear: () => {
    storage.remove('access_token');
    storage.remove('refresh_token');
    storage.remove('company_id');
    storage.remove('accessible_companies');
    set({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      currentCompany: null,
      accessibleCompanies: [],
      isCommon: false,
      roles: [],
      permissions: [],
      status: 'unauthenticated',
    });
  },
}));
