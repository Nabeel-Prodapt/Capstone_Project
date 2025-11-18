import api from './api';

const auditLogAPI = {
  getAuditLogs: (params) => api.get('/audit/logs', { params }),
};

export default auditLogAPI;