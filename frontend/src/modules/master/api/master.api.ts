import { apiClient } from '@/api/client';
import { DocumentType, FieldDefinition, FieldGroup } from '../types';

export const masterApi = {
  // Document Types
  listDocumentTypes: async (): Promise<DocumentType[]> => {
    const response = await apiClient.get('/document-types');
    return response.data?.data || response.data || [];
  },
  createDocumentType: async (data: Omit<DocumentType, 'id'>): Promise<void> => {
    await apiClient.post('/document-types', data);
  },

  // Field Groups
  listFieldGroups: async (): Promise<FieldGroup[]> => {
    // Backend missing GET endpoint
    return Promise.resolve([]);
  },
  createFieldGroup: async (data: Omit<FieldGroup, 'id'>): Promise<void> => {
    await apiClient.post('/master/fields/groups', data);
  },

  // Field Definitions
  listFieldDefinitions: async (): Promise<FieldDefinition[]> => {
    // Backend missing GET endpoint
    return Promise.resolve([]);
  },
  createFieldDefinition: async (data: Omit<FieldDefinition, 'id'>): Promise<void> => {
    await apiClient.post('/master/fields/definitions', data);
  },
};
