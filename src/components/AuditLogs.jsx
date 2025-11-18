import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import auditLogAPI from '../services/auditLogAPI';
import Pagination from './Pagination';

function AuditLogs() {
  const { user } = useContext(AuthContext);

  // Only ADMIN and AUDITOR can see audit logs
  if (!['ADMIN', 'AUDITOR'].includes(user?.role)) {
    return (
      <div style={{ textAlign: 'center', marginTop: 50, color: '#ff4d4f' }}>
        You do not have permission to view audit logs.
      </div>
    );
  }

  // Filters state
  const [filters, setFilters] = useState({
    entityType: '',
    entityId: '',
    action: '',
    userFilter: ''
  });

  // Pagination and data state
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const pageSize = 5;

  // Fetch audit logs
  const fetchAuditLogs = async () => {
  setLoading(true);
  setError(null);
  try {
    const params = {
      entityType: filters.entityType || undefined,
      entityId: filters.entityId || undefined,
      action: filters.action || undefined,
      user: filters.userFilter || undefined
    };
    const res = await auditLogAPI.getAuditLogs(params);
    setLogs(res.data || []); // <- use res.data directly
  } catch (err) {
    console.error(err);
    setError('Failed to fetch audit logs.');
    setLogs([]);
  } finally {
    setLoading(false);
  }
};


  // Load logs when filters or page change
  useEffect(() => {
    fetchAuditLogs(page);
  }, [filters, page]);

  // Unified filter handler
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // reset page on filter change
  };

  return (
    <section style={{ maxWidth: 900, margin: 'auto', marginTop: 30 }}>
      <h2 style={{ color: '#2188bb', marginBottom: 18 }}>Audit Logs</h2>

      {error && (
        <div style={{ color: '#ff4d4f', marginBottom: 12, textAlign: 'center' }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: 12 }}>
        <select name="entityType" value={filters.entityType} onChange={handleFilterChange} style={{ padding: 6 }}>
          <option value="">All Entity Types</option>
          <option value="DEVICE">Device</option>
          <option value="LICENSE">License</option>
          <option value="ASSIGNMENT">Assignment</option>
        </select>

        <input
          type="text"
          name="entityId"
          value={filters.entityId}
          onChange={handleFilterChange}
          placeholder="Entity ID"
          style={{ padding: 6 }}
        />

        <select name="action" value={filters.action} onChange={handleFilterChange} style={{ padding: 6 }}>
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="ASSIGN">Assign</option>
        </select>

        <input
          type="text"
          name="userFilter"
          value={filters.userFilter}
          onChange={handleFilterChange}
          placeholder="User ID"
          style={{ padding: 6 }}
        />
      </div>

      {/* Table */}
      <table className="dashboard-table" aria-label="Audit logs table">
  <thead>
    <tr>
      <th>User ID</th>
      <th>Username</th> {/* new column */}
      <th>Entity Type</th>
      <th>Entity ID</th>
      <th>Action</th>
      <th>Timestamp</th>
      <th>Details</th>
    </tr>
  </thead>
  <tbody>
    {loading ? (
      <tr><td colSpan={7} style={{ textAlign: 'center' }}>Loading...</td></tr>
    ) : logs.length === 0 ? (
      <tr><td colSpan={7} style={{ textAlign: 'center', color: '#2188bb' }}>No audit logs found.</td></tr>
    ) : (
      logs.map(log => (
        <tr key={log.logId}>
          <td>{log.userId}</td>
          <td>{log.username}</td> {/* render username */}
          <td>{log.entityType}</td>
          <td>{log.entityId}</td>
          <td>{log.action}</td>
          <td>{new Date(log.timestamp).toLocaleString()}</td>
          <td title={log.details}>
            {log.details?.length > 50 ? log.details.substring(0, 50) + '...' : log.details}
          </td>
        </tr>
      ))
    )}
  </tbody>
</table>


      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

export default AuditLogs;