import api from './api';

export const slaService = {
  // SLA Rules Management
  getSlaRules: async () => {
    const response = await api.get('/sla-rules');
    return response.data;
  },
  
  createSlaRule: async (ruleData) => {
    const response = await api.post('/sla-rules', ruleData);
    return response.data;
  },
  
  updateSlaRule: async (id, ruleData) => {
    const response = await api.put(`/sla-rules/${id}`, ruleData);
    return response.data;
  },
  
  deleteSlaRule: async (id) => {
    const response = await api.delete(`/sla-rules/${id}`);
    return response.data;
  },

  // SLA Tracking Dashboard
  getActiveSlas: async () => {
    const response = await api.get('/sla-tracking/active');
    return response.data;
  },
  
  getBreachedSlas: async () => {
    const response = await api.get('/sla-tracking/breached');
    return response.data;
  },
  
  getSlasByModule: async (moduleName) => {
    const response = await api.get(`/sla-tracking/module/${moduleName}`);
    return response.data;
  },
  
  getSlaByRecord: async (moduleName, recordId) => {
    const response = await api.get(`/sla-tracking/record/${moduleName}/${recordId}`);
    return response.data;
  }
};
