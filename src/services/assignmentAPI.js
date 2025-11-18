// src/services/assignmentAPI.js
import api from './api'; // Centralized axios instance with baseURL and auth interceptor

const assignmentAPI = {
  // Get assignments by license key
  getByLicense: (licenseKey) => api.get(`/assignments/by-license/${licenseKey}`),

  // Get assignments by device ID
  getByDevice: (deviceId) => api.get(`/assignments/by-device/${deviceId}`),

  // Create a new assignment (assign license to device)
  create: (assignmentRequest) => api.post(`/assignments`, assignmentRequest),

  getAll: () => api.get('/assignments'),


  // Optional: add update, delete methods if supported by backend
  // update: (id, data) => api.put(`${baseURL}/${id}`, data),
  // delete: (id) => api.delete(`${baseURL}/${id}`),
};

export default assignmentAPI;