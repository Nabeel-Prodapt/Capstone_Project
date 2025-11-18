import React, { useState, useEffect } from 'react';
import assignmentAPI from '../services/assignmentAPI';
import licenseAPI from '../services/licenseAPI';
import "../styles/FormModal.css";

function AssignmentForm({ deviceId, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    deviceId: deviceId || '',
    licenseKey: ''
  });

  const [licenses, setLicenses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    licenseAPI.getAll({ page: 0, size: 100 }).then(res => {
      setLicenses(res.data.content || []);
    });
  }, []);

  useEffect(() => {
    // Fetch existing assignments for this device
    assignmentAPI.getByDevice(deviceId).then(res => {
      setAssignments(res.data || []);
    });
  }, [deviceId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const alreadyAssigned = assignments.some(a => a.licenseKey === formData.licenseKey);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (alreadyAssigned) {
      setError('License is already assigned to this device');
      return;
    }
    setLoading(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await assignmentAPI.create({ ...formData, assignedOn: today });
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      setError('Failed to save assignment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: '410px', padding: '22px 28px' }}
      >
        <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#2188bb' }}>
          Assign License
        </h3>
        {error && <div className="error-message" style={{ textAlign: 'center' }}>{error}</div>}
        <form className="form-modal" onSubmit={handleSubmit} noValidate>
          <label>
            Device ID
            <input
              name="deviceId"
              value={formData.deviceId}
              disabled
              required
              style={{ background: '#f6fbff' }}
            />
          </label>
          <label>
            License Key
            <select
              name="licenseKey"
              value={formData.licenseKey}
              onChange={handleChange}
              required
              style={{ background: '#f6fbff' }}
            >
              <option value="">Select License</option>
              {licenses.map(lic =>
                <option key={lic.licenseKey} value={lic.licenseKey}>
                  {lic.softwareName} ({lic.licenseKey})
                </option>
              )}
            </select>
          </label>
          {alreadyAssigned && (
            <div style={{ color: '#ef4444', fontWeight: 600, textAlign: 'center', margin: '10px 0' }}>
              License is already assigned to this device
            </div>
          )}
          <div className="form-actions" style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
            <button
              className="btn-submit"
              type="submit"
              disabled={loading || alreadyAssigned}
              style={{ flexGrow: 1 }}
            >
              {loading ? 'Assigning...' : 'Assign'}
            </button>
            <button
              className="btn-cancel"
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{ flexGrow: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignmentForm;