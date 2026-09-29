import { apiClient } from '@/api/client';
import { Branch, Company, CompanySettings, Department, Designation, UpdateCompanySettingsDto } from '../types';

export const organizationApi = {
  // Company Settings (Step 9)
  getCompanySettings: async (): Promise<CompanySettings> => {
    const response = await apiClient.get('/company/settings');
    return response.data?.data || response.data;
  },
  updateCompanySettings: async (data: UpdateCompanySettingsDto): Promise<CompanySettings> => {
    const response = await apiClient.patch('/company/settings', data);
    return response.data?.data || response.data;
  },
  uploadLogo: async (file: File): Promise<{ url: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/company/settings/logo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },
  removeLogo: async (): Promise<void> => {
    await apiClient.delete('/company/settings/logo');
  },
  uploadSignature: async (file: File): Promise<{ url: string; path: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/company/settings/signature', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },
  removeSignature: async (): Promise<void> => {
    await apiClient.delete('/company/settings/signature');
  },

  // Company
  getMyCompany: async (): Promise<Company> => {
    const response = await apiClient.get('/organization/company/me');
    return response.data;
  },
  createCompany: async (data: Omit<Company, 'id'>): Promise<void> => {
    await apiClient.post('/organization/company', data);
  },

  // Branches
  listBranches: async (): Promise<Branch[]> => {
    const response = await apiClient.get('/organization/branches');
    return response.data;
  },
  createBranch: async (data: Omit<Branch, 'id'>): Promise<void> => {
    await apiClient.post('/organization/branches', data);
  },

  // Departments
  listDepartments: async (): Promise<Department[]> => {
    const response = await apiClient.get('/organization/departments');
    return response.data;
  },
  createDepartment: async (data: Omit<Department, 'id'>): Promise<void> => {
    await apiClient.post('/organization/departments', data);
  },

  // Designations
  listDesignations: async (): Promise<Designation[]> => {
    const response = await apiClient.get('/organization/designations');
    return response.data;
  },
  createDesignation: async (data: Omit<Designation, 'id'>): Promise<void> => {
    await apiClient.post('/organization/designations', data);
  },
};
