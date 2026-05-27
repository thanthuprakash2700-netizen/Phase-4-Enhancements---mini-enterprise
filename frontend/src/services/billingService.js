import api from './api';

export const getBillingInfo = async () => {
    const response = await api.get('/billing/info');
    return response.data;
};

export const createCheckoutSession = async (planName) => {
    const response = await api.post('/billing/create-checkout-session', { plan_name: planName });
    return response.data;
};
