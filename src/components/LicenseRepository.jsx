import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import licenseAPI from '../services/licenseAPI';
import assignmentAPI from '../services/assignmentAPI';
import deviceAPI from '../services/deviceAPI';
import vendorAPI from '../services/vendorAPI';
import Pagination from './Pagination';
import LicenseForm from './LicenseForm';
import reportAPI from '../services/reportAPI';

function LicenseRepository() {
  const { user } = useContext(AuthContext);
  const canEdit = user?.role === 'ADMIN' || user?.role === 'ENGINEER';
  const canDelete = user?.role === 'ADMIN';
  const canCreate = canEdit;

  const [licenses, setLicenses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [devices, setDevices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [vendorFilter, setVendorFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editLicense, setEditLicense] = useState(null);
  const [expandedLicense, setExpandedLicense] = useState(null);
  const [assignmentsByLicense, setAssignmentsByLicense] = useState([]);

  const pageSize = 5;

  // Fetch initial data
  useEffect(() => {
    fetchVendors();
    fetchDevices();
    fetchAssignments();
  }, []);

  useEffect(() => {
    fetchLicenses(currentPage - 1, vendorFilter);
  }, [currentPage, vendorFilter]);

  const fetchVendors = async () => {
    try {
      const res = await vendorAPI.getAll();
      setVendors(res.data || []);
    } catch {
      setVendors([]);
    }
  };

  const fetchDevices = async () => {
    try {
      const res = await deviceAPI.getAll({ page: 0, size: 1000 }); // fetch all devices
      setDevices(res.data.content || []);
    } catch {
      setDevices([]);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await assignmentAPI.getAll();
      setAssignments(res.data || []);
    } catch {
      setAssignments([]);
    }
  };

  const fetchLicenses = async (page = 0, vendorId = '') => {
    try {
      const params = { page, size: pageSize };
      if (vendorId) params.vendorId = vendorId;
      const res = await licenseAPI.getAll(params);
      setLicenses(res.data.content || []);
      setCurrentPage(res.data.currentPage + 1);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setLicenses([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  };

  const handleExpand = async (licenseKey) => {
    if (expandedLicense === licenseKey) {
      setExpandedLicense(null);
      setAssignmentsByLicense([]);
      return;
    }
    setExpandedLicense(licenseKey);
    try {
      const res = await assignmentAPI.getByLicense(licenseKey);
      setAssignmentsByLicense(res.data || []);
    } catch {
      setAssignmentsByLicense([]);
    }
  };

  const handleCreate = () => {
    setEditLicense(null);
    setShowForm(true);
  };

  const handleEdit = (license) => {
    setEditLicense(license);
    setShowForm(true);
  };

  const handleDelete = async (licenseKey) => {
    if (!window.confirm('Are you sure to delete this license?')) return;

    try {
      await licenseAPI.delete(licenseKey);
      fetchLicenses(currentPage - 1, vendorFilter);
    } catch {
      alert('Failed to delete license.');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditLicense(null);
    fetchLicenses(currentPage - 1, vendorFilter);
  };

  const onPageChange = (page) => setCurrentPage(page);
  const onVendorChange = (e) => {
    setVendorFilter(e.target.value);
    setCurrentPage(1);
  };

  // Map vendorId to vendorName
  const vendorIdToName = vendors.reduce((acc, v) => {
    acc[v.vendorId] = v.vendorName;
    return acc;
  }, {});

  // Calculate usage %: (count assigned devices for license) / maxUsage * 100
  const calculateUsagePercent = (licenseKey, maxUsage) => {
    if (!maxUsage) return 0;
    const assignedCount = assignments.filter(a => a.licenseKey === licenseKey).length;
    return Math.round((assignedCount / maxUsage) * 100);
  };

  // Export CSV handler for license usage
  const handleExportCsv = async () => {
  try {
    let params = {};
    if (vendorFilter) params.vendorId = vendorFilter;

    const response = await reportAPI.exportLicenseUsageCsv(params);
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'license_usage.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    alert('Export failed. Please check your authentication or network.');
    console.error(err);
  }
};

  return (
    <section className="dashboard-section">
      <h2 style={{
        marginTop: '36px',
        marginBottom: '22px',
        color: '#2188bb',
        fontWeight: 800,
        fontSize: '2rem',
        letterSpacing: '0.5px'
      }}>License Repository</h2>

      <div className='license-controls' style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: 16 }}>
        {canCreate && (
          <button className="btn-submit add-device-btn" onClick={handleCreate}>
            + Create License
          </button>
        )}

        <button onClick={handleExportCsv} className="btn-submit" style={{width:'300px'}}>
  Export License Usage CSV
</button>


        <select value={vendorFilter} onChange={onVendorChange} className="vendor-dropdown" style={{ minWidth: 200 }}>
          <option value="">All Vendors</option>
          {vendors.length > 0
            ? vendors.map(vendor => (
              <option key={vendor.vendorId} value={vendor.vendorId}>
                {vendor.vendorName}
              </option>
            ))
            : <option disabled>Loading Vendors...</option>
          }
        </select>
      </div>

      <table
        className="dashboard-table"
        style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', textAlign: 'center' }}
      >
        <thead>
          <tr>
            <th>License Key</th>
            <th>Software Name</th>
            <th>Vendor</th>
            <th>Valid From</th>
            <th>Valid To</th>
            <th>Type</th>
            <th>Max Usage</th>
            <th>Usage %</th>
            {(canEdit || canDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {licenses.length === 0 ? (
            <tr>
              <td colSpan={(canEdit || canDelete) ? 9 : 8} style={{ textAlign: 'center' }}>
                No licenses found
              </td>
            </tr>
          ) : licenses.map(lic => (
            <React.Fragment key={lic.licenseKey}>
              <tr style={{ backgroundColor: '#f6fbff', borderRadius: '10px', textAlign: 'center' }}>
                <td>{lic.licenseKey}</td>
                <td>{lic.softwareName}</td>
                <td>{lic.vendor?.vendorName || vendorIdToName[lic.vendorId] || lic.vendorId}</td>
                <td>{lic.validFrom}</td>
                <td>{lic.validTo}</td>
                <td>{lic.licenseType}</td>
                <td>{lic.maxUsage}</td>
                <td>{calculateUsagePercent(lic.licenseKey, lic.maxUsage)}%</td>
                {(canEdit || canDelete) && (
                  <td style={{ textAlign: 'center', whiteSpace: 'nowrap', padding: '10px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', flexWrap: 'nowrap' }}>
                      {canEdit && (
                        <button className="table-btn" onClick={() => handleEdit(lic)}>Edit</button>
                      )}
                      {canDelete && (
                        <button className="table-btn danger" onClick={() => handleDelete(lic.licenseKey)}>Delete</button>
                      )}
                      <button
                        className="table-btn assign-btn"
                        style={{ fontSize: '13px', padding: '6px 10px' }}
                        onClick={() => handleExpand(lic.licenseKey)}
                      >
                        {expandedLicense === lic.licenseKey ? 'Hide Devices' : 'View Devices'}
                      </button>
                    </div>
                  </td>
                )}
              </tr>
              {expandedLicense === lic.licenseKey && (
                <tr>
                  <td colSpan={(canEdit || canDelete) ? 9 : 8} style={{
                    backgroundColor: '#e5eaf1',
                    borderRadius: '10px',
                    padding: '15px 20px',
                    textAlign: 'center'
                  }}>
                    {assignmentsByLicense.length === 0 ? (
                      <p style={{ color: '#2188bb', margin: 0 }}>No devices assigned.</p>
                    ) : (
                      <ul style={{
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        color: '#2188bb',
                        textAlign: 'center',
                        lineHeight: '1.6'
                      }}>
                        {assignmentsByLicense.map((a, idx) => (
                          <li key={a.id || `${a.deviceId}-${idx}`}>
                            {a.deviceId}, {a.deviceLocation}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />

      {showForm && (
        <LicenseForm
          editData={editLicense}
          onClose={handleFormClose}
          onSuccess={() => fetchLicenses(currentPage - 1, vendorFilter)}
        />
      )}
    </section>
  );
}

export default LicenseRepository;