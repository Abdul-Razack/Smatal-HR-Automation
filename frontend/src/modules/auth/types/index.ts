export interface AccessibleCompany {
  id: string;
  businessId: string;
  name: string;
  code: string;
  logoUrl?: string | null;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions: string[];
  isCommon?: boolean;
  companyId?: string;
  accessibleCompanies?: AccessibleCompany[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserSession;
  accessibleCompanies?: AccessibleCompany[];
}
