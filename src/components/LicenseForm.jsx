import React, { useState, useEffect } from 'react';
import vendorAPI from '../services/vendorAPI';
import licenseAPI from '../services/licenseAPI';
import "../styles/FormModal.css";

function LicenseForm({ onClose, onSuccess, editData }) {
  // Initialize form data with editData fallback or defaults
  const getInitialFormData = () => editData ? {
    licenseKey: editData.licenseKey || '',
    softwareName: editData.softwareName || '',
    vendorId: editData.vendorId || '',
    validFrom: editData.validFrom ? editData.validFrom.slice(0, 10) : '',
    validTo: editData.validTo ? editData.validTo.slice(0, 10) : '',
    licenseType: editData.licenseType || 'PER_DEVICE',
    maxUsage: editData.maxUsage || 1,
  } : {
    licenseKey: '',
    softwareName: '',
    vendorId: '',
    validFrom: '',
    validTo: '',
    licenseType: 'PER_DEVICE',
    maxUsage: 1,
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [vendors, setVendors] = useState([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [errorVendors, setErrorVendors] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync form data with editData changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [editData]);

  // Fetch vendors on mount
  useEffect(() => {
    async function loadVendors() {
      try {
        const res = await vendorAPI.getAll();
        setVendors(res.data || []);
        setLoadingVendors(false);
      } catch {
        setErrorVendors('Failed to load vendors.');
        setVendors([]);
        setLoadingVendors(false);
      }
    }
    loadVendors();
  }, []);

  // Handle input changes generically
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Submit handler to create or update license
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editData && editData.id) {
        await licenseAPI.update(editData.id, formData);
      } else {
        await licenseAPI.create(formData);
      }
      onSuccess();
      onClose();
    } catch {
      setError('Failed to save license. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}
        style={{ maxWidth: '600px', padding: '22px 28px', background: '#fff' }}>
        <h3
          style={{ color: '#2188bb', marginBottom: '14px', textAlign: 'center', fontWeight: 700 }}
        >
          {editData ? 'Edit License' : 'Create New License'}
        </h3>

        {error && (
          <div className="error-message" style={{ background: '#fff0f0', color: '#ef4444', textAlign: 'center', marginBottom: 12 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="form-modal"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 22px' }}>
          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            License Key
            <input
              name="licenseKey"
              placeholder="e.g., CISCO-ASR-2024-001"
              value={formData.licenseKey}
              onChange={handleChange}
              required
              disabled={!!editData}
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            Software Name
            <input
              name="softwareName"
              placeholder="e.g., SolarWinds, PAN Threat"
              value={formData.softwareName}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            Vendor
            <select
              name="vendorId"
              value={formData.vendorId}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb', cursor: 'pointer', padding: '8px 10px', borderRadius: 6 }}
              disabled={loadingVendors}
            >
              <option value="">Select Vendor</option>
              {loadingVendors
                ? <option disabled>Loading vendors...</option>
                : vendors.map(vendor => (
                  <option key={vendor.vendorId} value={vendor.vendorId}>
                    {vendor.vendorName}
                  </option>
                ))}
            </select>
            {errorVendors && <span style={{ color: '#ef4444', marginTop: 4 }}>{errorVendors}</span>}
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            License Type
            <select
              name="licenseType"
              value={formData.licenseType}
              onChange={handleChange}
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb', cursor: 'pointer', padding: '9px 12px', borderRadius: 6 }}
            >
              <option value="PER_DEVICE">Per Device</option>
              <option value="PER_USER">Per User</option>
              <option value="ENTERPRISE">Enterprise</option>
            </select>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            Valid From
            <input
              type="date"
              name="validFrom"
              value={formData.validFrom}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            Valid To
            <input
              type="date"
              name="validTo"
              value={formData.validTo}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb' }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', color: '#2188bb' }}>
            Max Usage
            <input
              type="number"
              min="1"
              name="maxUsage"
              placeholder="Enter max usage count"
              value={formData.maxUsage}
              onChange={handleChange}
              required
              style={{ backgroundColor: '#fff', borderColor: '#2188bb', color: '#2188bb' }}
            />
          </label>

          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: 14, marginTop: 8 }}>
            <button className="btn-submit" type="submit" disabled={loading} style={{ flexGrow: 1 }}>
              {loading ? 'Saving...' : editData ? 'Update License' : 'Create License'}
            </button>
            <button className="btn-cancel" type="button" onClick={onClose} disabled={loading} style={{ flexGrow: 1 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LicenseForm;