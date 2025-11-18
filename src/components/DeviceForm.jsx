import React, { useState, useEffect } from 'react';
import deviceAPI from '../services/deviceAPI';
import "../styles/FormModal.css";

function DeviceForm({ device, onClose }) {
  const [formData, setFormData] = useState({
    deviceId: '',
    type: '',
    ipAddress: '',
    location: '',
    model: '',
    status: 'ACTIVE',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (device) {
      setFormData({
        deviceId: device.deviceId || '',
        type: device.type || '',
        ipAddress: device.ipAddress || '',
        location: device.location || '',
        model: device.model || '',
        status: device.status || 'ACTIVE',
      });
    }
  }, [device]);

  const validate = () => {
    const newErrors = {};
    if (!formData.deviceId.match(/^[A-Z]{3}-[A-Z]{3}-\d{3}$/))
      newErrors.deviceId = 'Device ID must follow pattern: RTR-BLR-001';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.ipAddress.match(/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/))
      newErrors.ipAddress = 'Invalid IP address format';
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.model) newErrors.model = 'Model is required';
    if (!['ACTIVE', 'OBSOLETE', 'MAINTENANCE', 'DECOMMISSIONED'].includes(formData.status))
      newErrors.status = 'Invalid status';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (device) {
        await deviceAPI.update(device.deviceId, formData);
      } else {
        await deviceAPI.create(formData);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data || 'Failed to save device' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-container"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: 'auto', maxWidth: '600px', padding: '20px 30px' }} // Less padding and wider modal
      >
        <h3 style={{ textAlign: 'center', marginBottom: '10px', color: '#2394a8ff' }}>
          {device ? 'Edit Device' : 'Add New Device'}
        </h3>

        {errors.submit && (
          <div className="error-message" style={{ textAlign: 'center' }}>
            {errors.submit}
          </div>
        )}

        <form
          className="form-modal"
          onSubmit={handleSubmit}
          noValidate
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px 24px',
          }}
        >
          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Device ID
            <input
              type="text"
              name="deviceId"
              value={formData.deviceId}
              onChange={handleChange}
              disabled={!!device}
              required
              placeholder="e.g., RTR-BLR-001"
            />
            {errors.deviceId && <small className="error-message">{errors.deviceId}</small>}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Type
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              placeholder="Router, Switch"
            />
            {errors.type && <small className="error-message">{errors.type}</small>}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column' }}>
            IP Address
            <input
              type="text"
              name="ipAddress"
              value={formData.ipAddress}
              onChange={handleChange}
              required
              placeholder="192.168.1.10"
            />
            {errors.ipAddress && <small className="error-message">{errors.ipAddress}</small>}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Location
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Bangalore"
            />
            {errors.location && <small className="error-message">{errors.location}</small>}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Model
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              placeholder="Cisco 2901"
            />
            {errors.model && <small className="error-message">{errors.model}</small>}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column' }}>
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              style={{ height: 'calc(2.2rem + 10px)' }}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="OBSOLETE">OBSOLETE</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
              <option value="DECOMMISSIONED">DECOMMISSIONED</option>
            </select>
            {errors.status && <small className="error-message">{errors.status}</small>}
          </label>

          {/* Buttons occupying full width under grid columns */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              className="btn-submit"
              type="submit"
              disabled={loading}
              style={{ flexGrow: 1 }}
            >
              {device ? 'Save Changes' : 'Create Device'}
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

export default DeviceForm;