import api from './api';  // axios instance with interceptors and baseURL

const deviceAPI = {
  getAll: (params) => api.get('/devices', { params }),
  getById: (id) => api.get(`/devices/${id}`),
  create: (data) => api.post('/devices', data),
  update: (id, data) => api.put(`/devices/${id}`, data),
  delete: (id) => api.delete(`/devices/${id}`),
  
  // Assign license to device
  assignLicense: (deviceId, licenseKey) =>
    api.post(`/devices/${deviceId}/assign-license`, { licenseKey }),
};

export default deviceAPI;