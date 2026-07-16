export interface Company {
  id: string;
  name: string;
  code: string;
  website?: string;
  industry?: string;
  registrationNumber?: string;
  taxNumber?: string;
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
