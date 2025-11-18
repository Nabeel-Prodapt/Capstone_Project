import api from './api'; // central axios instance

const licenseAPI = {
  getAll: (params = {}) => api.get('/licenses', { params }),
  getById: (licenseKey) => api.get(`/licenses/${licenseKey}`),
  create: (licenseData) => api.post('/licenses', licenseData),
  update: (licenseKey, licenseData) => api.put(`/licenses/${licenseKey}`, licenseData),
  delete: (licenseKey) => api.delete(`/licenses/${licenseKey}`),
};

export default licenseAPI;