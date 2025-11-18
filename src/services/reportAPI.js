// src/services/reportAPI.js
import api from './api';

const reportAPI = {
  getAuditLogs: (params) => api.get('/reports/audit-logs', { params }),
  exportAuditLogsCsv: (params) => api.get('/reports/audit-logs/export/csv', { params, responseType: 'blob' }),
  exportAuditLogsPdf: () => api.get('/reports/non-compliant-devices/export/pdf', { responseType: 'blob' }),
  // Add this for license usage CSV:
  exportLicenseUsageCsv: (params) =>
    api.get('/reports/license-usage/export/csv', { params, responseType: 'blob' }),
};

export default reportAPI;
