export interface Company {
  id: string;
  name: string;
  legalName?: string | null;
  code: string;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  authorizedPerson?: string | null;
  authorizedPersonDesignation?: string | null;
  signatureUrl?: string | null;
  industry?: string;
  registrationNumber?: string;
  taxNumber?: string;
}

export interface CreateCompanyDto {
  name: string;
  code: string;
  legalName?: string;
  website?: string;
  industry?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface CompanySettings {
  id: string;
  name: string;
  legalName?: string | null;
  code: string;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logoUrl?: string | null;
  authorizedPerson?: string | null;
  authorizedPersonDesignation?: string | null;
  signatureUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCompanySettingsDto {
  name?: string;
  legalName?: string | null;
  website?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  authorizedPerson?: string | null;
  authorizedPersonDesignation?: string | null;
}

export interface Branch {
  id: string;
  name: string;
  code: string;
  isHeadquarters: boolean;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  parentId?: string;
}

export interface Designation {
  id: string;
  name: string;
  code: string;
  level: number;
}
