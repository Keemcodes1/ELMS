import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    login: (credentials) => axios.post(`${API_URL}/auth/token/`, credentials),
    register: (userData) => axios.post(`${API_URL}/users/register/`, userData),
    getProfile: () => apiClient.get('/users/profile/'),
};

// Properties API
export const propertiesAPI = {
    getAll: () => apiClient.get('/properties/'),
    getOne: (id) => apiClient.get(`/properties/${id}/`),
    create: (data) => apiClient.post('/properties/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    update: (id, data) => apiClient.put(`/properties/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    delete: (id) => apiClient.delete(`/properties/${id}/`),
    getStatistics: () => apiClient.get('/properties/statistics/'),
    getUnits: (id) => apiClient.get(`/properties/${id}/units/`),

    // Units
    createUnit: (data) => apiClient.post('/units/', data),
    updateUnit: (id, data) => apiClient.put(`/units/${id}/`, data),
    deleteUnit: (id) => apiClient.delete(`/units/${id}/`),
};

// Units API
export const unitsAPI = {
    getAll: () => apiClient.get('/units/'),
    getVacant: () => apiClient.get('/units/vacant/'),
    getOccupied: () => apiClient.get('/units/occupied/'),
};

// Tenants API
export const tenantsAPI = {
    getAll: () => apiClient.get('/tenants/'),
    getOne: (id) => apiClient.get(`/tenants/${id}/`),
    create: (data) => apiClient.post('/tenants/', data),
    update: (id, data) => apiClient.put(`/tenants/${id}/`, data),
};

// Finance API
export const financeAPI = {
    getInvoices: () => apiClient.get('/invoices/'),
    getPayments: () => apiClient.get('/payments/'),
    createPayment: (data) => apiClient.post('/payments/', data),
    getStatistics: () => apiClient.get('/invoices/statistics/'),
};

// Maintenance API
export const maintenanceAPI = {
    getComplaints: () => apiClient.get('/complaints/'),
    createComplaint: (data) => apiClient.post('/complaints/', data),
    updateComplaint: (id, data) => apiClient.put(`/complaints/${id}/`, data),
    getStatistics: () => apiClient.get('/complaints/statistics/'),
};

export default apiClient;
