// src/services/vendorAPI.js
import api from './api';  // your centralized axios instance

const vendorAPI = {
  // Fetch all vendors
  getAll: () => api.get('/vendors'),

  // Add more methods if needed e.g., getById, create, update, delete
  // getById: (id) => api.get(`/vendors/${id}`),
  // create: (vendorData) => api.post('/vendors', vendorData),
  // update: (id, vendorData) => api.put(`/vendors/${id}`, vendorData),
  // delete: (id) => api.delete(`/vendors/${id}`),
};

export default vendorAPI;