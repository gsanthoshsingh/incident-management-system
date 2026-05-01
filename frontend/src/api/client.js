import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const getWorkItems = (params) => api.get('/work-items', { params });
export const getWorkItem = (id) => api.get(`/work-items/${id}`);
export const updateStatus = (id, status, rca) => api.patch(`/work-items/${id}/status`, { status, rca });
export const ingestSignal = (data) => api.post('/signals', data);