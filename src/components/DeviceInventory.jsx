import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import deviceAPI from '../services/deviceAPI';
import licenseAPI from '../services/licenseAPI';
import Pagination from './Pagination';
import DeviceForm from './DeviceForm';
import AssignmentForm from './AssignmentForm'; // Import the new modal form
import reportAPI from '../services/reportAPI';
import "../styles/FormModal.css";

function DeviceInventory() {
  const { user } = useContext(AuthContext);

  const canEdit = user?.role === 'ADMIN' || user?.role === 'ENGINEER';
  const canDelete = user?.role === 'ADMIN';
  const canAssignLicense = canEdit;
  const canCreate = canEdit;

  const [devices, setDevices] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');
  const [deviceNameFilter, setDeviceNameFilter] = useState('');
  const [filteredDevices, setFilteredDevices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editDevice, setEditDevice] = useState(null);

  // Modal state for license assignment
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedDeviceForAssignment, setSelectedDeviceForAssignment] = useState(null);

  const pageSize = 5;

  const fetchDevices = async (page = 0) => {
    try {
      const params = { page, size: pageSize };
      const res = await deviceAPI.getAll(params);
      const content = res.data.content || [];
      setDevices(content);
      setCurrentPage(res.data.currentPage + 1);
      setTotalPages(res.data.totalPages || 1);
      const uniqueLocations = Array.from(
        new Set(content.map(d => d.location).filter(Boolean))
      ).sort();
      setLocations(uniqueLocations);
    } catch (err) {
      console.error(err);
      setDevices([]);
      setLocations([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  };

  const fetchLicenses = async () => {
    try {
      const res = await licenseAPI.getAll({ page: 0, size: 100 });
      setLicenses(res.data.content || []);
    } catch (err) {
      console.error(err);
      setLicenses([]);
    }
  };

  useEffect(() => {
    fetchDevices(currentPage - 1);
    fetchLicenses();
  }, [currentPage]);

  // Filtering
  useEffect(() => {
    let filtered = devices;
    if (locationFilter) {
      filtered = filtered.filter(d => d.location === locationFilter);
    }
    if (ipFilter.trim()) {
      filtered = filtered.filter(d =>
        d.ipAddress.toLowerCase().includes(ipFilter.trim().toLowerCase())
      );
    }
    if (deviceNameFilter.trim()) {
      filtered = filtered.filter(d =>
        d.deviceId.toLowerCase().includes(deviceNameFilter.trim().toLowerCase())
      );
    }
    setFilteredDevices(filtered);
  }, [devices, locationFilter, ipFilter, deviceNameFilter]);

  // Controls
  const onPageChange = (page) => setCurrentPage(page);
  const onLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };
  const onIpChange = (e) => {
    setIpFilter(e.target.value);
    setCurrentPage(1);
  };
  const onDeviceNameChange = (e) => {
    setDeviceNameFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleCreateClick = () => {
    setEditDevice(null);
    setShowForm(true);
  };
  const handleEditClick = (device) => {
    setEditDevice(device);
    setShowForm(true);
  };
  const handleDeleteClick = async (deviceId) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      try {
        await deviceAPI.delete(deviceId);
        fetchDevices(currentPage - 1);
      } catch {
        alert('Failed to delete device.');
      }
    }
  };

  // Assignment Modal Logic
  const handleAssignClick = (device) => {
    setSelectedDeviceForAssignment(device);
    setShowAssignmentForm(true);
  };

  const handleAssignmentModalClose = () => {
    setShowAssignmentForm(false);
    setSelectedDeviceForAssignment(null);
  };

  const handleAssignmentSuccess = () => {
    setShowAssignmentForm(false);
    setSelectedDeviceForAssignment(null);
    fetchDevices(currentPage - 1); // refresh list after assign
  };

  const onFormClose = () => {
    setShowForm(false);
    setEditDevice(null);
    fetchDevices(currentPage - 1);
  };

  // Export PDF handler
  const handleExportPdf = async () => {
  try {
    const response = await reportAPI.exportAuditLogsPdf();
    // response.data is a Blob now
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'non_compliant_devices.pdf');
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    alert("Export failed. Please check your authentication or network.");
    console.error(err);
  }
};

  return (
    <section className="dashboard-section">
      <h2 style={{
        marginTop: '36px',
        marginBottom: '22px',
        color: '#1e80b1ff',
        fontWeight: 700,
        fontSize: '2rem',
        letterSpacing: '0.5px'
      }}>Device Inventory</h2>

      <div
        className="device-controls"
        style={{ gap: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}
      >
        {canCreate && (
          <button className="btn-submit add-device-btn" onClick={handleCreateClick}>
            + Add Device
          </button>
        )}

        <button
  className="btn-submit"
  onClick={handleExportPdf}
  style={{ marginLeft: canCreate ? '' : '0', width: '300px' }}
>
  Export Non-Compliant Devices as PDF
</button>

        <select
          value={locationFilter}
          onChange={onLocationChange}
          className="location-dropdown"
          style={{ flex: '0 0 220px', minWidth: 150 }}
        >
          <option value="">All locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>

        <input
          type="search"
          placeholder="Filter by IP"
          value={ipFilter}
          onChange={onIpChange}
          className="ip-filter-input"
          style={{
            flex: '0 0 240px',
            minWidth: 150,
            padding: '8px 12px',
            borderRadius: 8,
            border: '2px solid #2188bb',
            fontSize: '1rem',
            color: '#2188bb',
          }}
        />
        <input
          type="search"
          placeholder="Search By Device ID"
          value={deviceNameFilter}
          onChange={onDeviceNameChange}
          className="device-name-search"
          style={{
            flex: '0 0 220px',
            minWidth: 150,
            padding: '8px 12px',
            borderRadius: 8,
            border: '2px solid #2188bb',
            fontSize: '1rem',
            color: '#2188bb',
          }}
        />
      </div>

      <table className="dashboard-table">
        <thead>
          <tr>
            <th>Device ID</th>
            <th>Type</th>
            <th>IP</th>
            <th>Location</th>
            <th>Model</th>
            <th>Status</th>
            {(canEdit || canDelete || canAssignLicense) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredDevices.length === 0 ? (
            <tr>
              <td colSpan={canEdit || canDelete || canAssignLicense ? 7 : 6} style={{ textAlign: 'center' }}>
                No devices found
              </td>
            </tr>
          ) : (
            filteredDevices.map((device) => (
              <tr key={device.deviceId}>
                <td>{device.deviceId}</td>
                <td>{device.type}</td>
                <td>{device.ipAddress}</td>
                <td>{device.location}</td>
                <td>{device.model}</td>
                <td>{device.status}</td>
                {(canEdit || canDelete || canAssignLicense) && (
                  <td>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {canEdit && (
                        <button className="table-btn" onClick={() => handleEditClick(device)}>
                          Edit
                        </button>
                      )}
                      {canDelete && (
                        <button className="table-btn danger" onClick={() => handleDeleteClick(device.deviceId)}>
                          Delete
                        </button>
                      )}
                      {canAssignLicense && (
                        <button
                          className="table-btn assign-btn"
                          onClick={() => handleAssignClick(device)}
                          style={{ minWidth: 120 }}
                        >
                          Assign License
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      {showForm && (
        <DeviceForm device={editDevice} onClose={onFormClose} />
      )}

      {showAssignmentForm && selectedDeviceForAssignment && (
        <AssignmentForm
          deviceId={selectedDeviceForAssignment.deviceId}
          onClose={handleAssignmentModalClose}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </section>
  );
}

export default DeviceInventory;
