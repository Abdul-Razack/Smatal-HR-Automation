import { apiClient } from '@/api/client';
import { Branch, Company, Department, Designation } from '../types';

export const organizationApi = {
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
