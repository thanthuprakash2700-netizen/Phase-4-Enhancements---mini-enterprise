import api from './api';

export const notificationPrefService = {
  getPreferences: async () => {
    const response = await api.get('/notification-preferences/me');
    return response.data;
  },
  
  updatePreferences: async (data) => {
    const response = await api.put('/notification-preferences/me', data);
    return response.data;
  }
};
