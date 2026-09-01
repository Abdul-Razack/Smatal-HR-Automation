import { create } from 'zustand';
import { storage } from '@/utils/storage';

export interface User {
  id: string;
  name?: string;
  email: string;
  companyId?: string;
}

export interface Company {
  id: string;
  name: string;
}

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  currentUser: User | null;
  currentCompany: Company | null;
  roles: string[];
  permissions: string[];
  status: AuthStatus;

  // Actions
  login: (data: { accessToken: string; refreshToken: string; user: User; company?: Company; roles: string[]; permissions: string[] }) => void;
  logout: () => void;
  refresh: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  setCompany: (company: Company) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: storage.get('access_token'),
  refreshToken: storage.get('refresh_token'),
  currentUser: null,
  currentCompany: null,
  roles: [],
  permissions: [],
  status: storage.get('access_token') ? 'loading' : 'idle', // initially loading if we have token but need to fetch Me

  login: (data) => {
    storage.set('access_token', data.accessToken);
    storage.set('refresh_token', data.refreshToken);
    if (data.company) {
      storage.set('company_id', data.company.id);
    } else if (data.user && data.user.companyId) {
      storage.set('company_id', data.user.companyId);
    }

    set({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      currentUser: data.user,
      currentCompany: data.company || null,
      roles: data.roles,
      permissions: data.permissions,
      status: 'authenticated',
    });
  },

  logout: () => {
    storage.remove('access_token');
    storage.remove('refresh_token');
    storage.remove('company_id');

    set({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      currentCompany: null,
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

  setUser: (user) => set({ currentUser: user, status: 'authenticated' }),
  
  setCompany: (company) => {
    storage.set('company_id', company.id);
    set({ currentCompany: company });
  },

  clear: () => {
    storage.remove('access_token');
    storage.remove('refresh_token');
    storage.remove('company_id');
    set({
      accessToken: null,
      refreshToken: null,
      currentUser: null,
      currentCompany: null,
      roles: [],
      permissions: [],
      status: 'unauthenticated',
    });
  },
}));
