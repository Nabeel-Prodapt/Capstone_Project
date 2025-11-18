import api from './api'; // Your centralized axios instance with base URL and auth

const dashboardAPI = {
  getOverview: () => api.get('/dashboard/overview'),
};

export default dashboardAPI;