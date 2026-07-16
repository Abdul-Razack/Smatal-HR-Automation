import { apiClient } from '@/api/client';
import { WorkflowDefinition, WorkflowStage } from '../types';

export const workflowApi = {
  listWorkflows: async (): Promise<WorkflowDefinition[]> => {
    const response = await apiClient.get('/workflow-definitions');
    return response.data;
  },
  
  getWorkflow: async (id: string): Promise<WorkflowDefinition> => {
    const response = await apiClient.get(`/workflow-definitions/${id}`);
    return response.data;
  },

  createWorkflow: async (data: Partial<WorkflowDefinition>): Promise<{ id: string }> => {
    const response = await apiClient.post('/workflow-definitions', data);
    return response.data;
  },

  updateWorkflow: async ({ id, data }: { id: string; data: Partial<WorkflowDefinition> }): Promise<void> => {
    await apiClient.patch(`/workflow-definitions/${id}`, data);
  },

  publishWorkflow: async (id: string): Promise<void> => {
    await apiClient.post(`/workflow-definitions/${id}/publish`);
  },

  archiveWorkflow: async (id: string): Promise<void> => {
    await apiClient.post(`/workflow-definitions/${id}/archive`);
  },

  addStage: async ({ workflowId, data }: { workflowId: string; data: Partial<WorkflowStage> }): Promise<{ stageId: string }> => {
    const response = await apiClient.post(`/workflow-definitions/${workflowId}/stages`, data);
    return response.data;
  },

  removeStage: async ({ workflowId, stageId }: { workflowId: string; stageId: string }): Promise<void> => {
    await apiClient.delete(`/workflow-definitions/${workflowId}/stages/${stageId}`);
  },
};
