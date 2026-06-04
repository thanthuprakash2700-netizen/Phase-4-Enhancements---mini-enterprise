import api from './api';

export const workflowGovernanceService = {
  // Approval Escalations
  getEscalations: async () => {
    const response = await api.get('/approval-escalations');
    return response.data;
  },
  
  getPendingEscalations: async () => {
    const response = await api.get('/approval-escalations/pending');
    return response.data;
  },
  
  getEscalationsByApprovalId: async (approvalId) => {
    const response = await api.get(`/approval-escalations/approval/${approvalId}`);
    return response.data;
  },
  
  createEscalation: async (data) => {
    const response = await api.post('/approval-escalations', data);
    return response.data;
  },
  
  resolveEscalation: async (id) => {
    const response = await api.put(`/approval-escalations/${id}/resolve`);
    return response.data;
  },
  
  cancelEscalation: async (id) => {
    const response = await api.put(`/approval-escalations/${id}/cancel`);
    return response.data;
  },

  // Approval Delegations
  createDelegation: async (data) => {
    const response = await api.post('/approval-delegations', data);
    return response.data;
  },
  
  getMyDelegations: async () => {
    const response = await api.get('/approval-delegations/me');
    return response.data;
  },
  
  getActiveDelegations: async () => {
    const response = await api.get('/approval-delegations/active');
    return response.data;
  },
  
  cancelDelegation: async (id) => {
    const response = await api.put(`/approval-delegations/${id}/cancel`);
    return response.data;
  }
};
