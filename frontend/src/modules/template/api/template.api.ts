import { apiClient } from '@/api/client';
import { Template } from '../types';

export const templateApi = {
  listTemplates: async (): Promise<Template[]> => {
    // Backend missing GET endpoint for templates
    return Promise.resolve([]);
  },
  
  createTemplate: async (data: Omit<Template, 'id' | 'currentVersion'>): Promise<void> => {
    await apiClient.post('/template', data); // Assume endpoint format
  },
};
