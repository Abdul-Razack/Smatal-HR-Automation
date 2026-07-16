import { apiClient } from '@/api/client';
import { WorkflowInstance, WorkflowHistoryEvent, WorkflowInstanceStatus } from '../types/instance';

export const workflowInstanceApi = {
  start: async (data: { workflowDefinitionId: string; entityType: string; entityId: string; candidateId?: string; employeeId?: string }): Promise<{ id: string }> => {
    const response = await apiClient.post('/workflow-instances', data);
    return response.data;
  },

  list: async (params?: { status?: WorkflowInstanceStatus; entityType?: string; entityId?: string; page?: number; limit?: number }): Promise<WorkflowInstance[]> => {
    const response = await apiClient.get('/workflow-instances', { params });
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },
  
  getOne: async (id: string): Promise<WorkflowInstance> => {
    const response = await apiClient.get(`/workflow-instances/${id}`);
    return response.data;
  },

  getHistory: async (id: string): Promise<WorkflowHistoryEvent[]> => {
    const response = await apiClient.get(`/workflow-instances/${id}/history`);
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  advance: async (id: string, nextStageId: string, remarks?: string): Promise<void> => {
    await apiClient.post(`/workflow-instances/${id}/advance`, { nextStageId, remarks });
  },

  approve: async (id: string, remarks?: string): Promise<void> => {
    await apiClient.post(`/workflow-instances/${id}/approve`, { remarks });
  },

  reject: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/workflow-instances/${id}/reject`, { reason });
  },

  returnToStage: async (id: string, targetStageId: string, reason: string): Promise<void> => {
    await apiClient.post(`/workflow-instances/${id}/return`, { targetStageId, reason });
  },

  cancel: async (id: string, reason: string): Promise<void> => {
    await apiClient.post(`/workflow-instances/${id}/cancel`, { reason });
  },
};
