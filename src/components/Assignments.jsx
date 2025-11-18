import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import deviceAPI from '../services/deviceAPI';
import licenseAPI from '../services/licenseAPI';
import assignmentAPI from '../services/assignmentAPI';

function Assignments() {
  const { user } = useContext(AuthContext);
  const canView = user?.role === 'ADMIN' || user?.role === 'ENGINEER' || user?.role === 'AUDITOR';

  const [devices, setDevices] = useState([]);
  const [licenses, setLicenses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  // License lookup map
  const licenseMap = licenses.reduce((acc, lic) => {
    acc[lic.licenseKey] = lic;
    return acc;
  }, {});

  useEffect(() => {
    if (canView) {
      fetchDevices();
      fetchLicenses();
      fetchAssignments();
    }
  }, [canView]);

  const fetchDevices = async () => {
    try {
      const res = await deviceAPI.getAll({ page: 0, size: 100 });
      setDevices(res.data.content || []);
    } catch {
      setDevices([]);
    }
  };

  const fetchLicenses = async () => {
    try {
      const res = await licenseAPI.getAll({ page: 0, size: 100 });
      setLicenses(res.data.content || []);
    } catch {
      setLicenses([]);
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

  if (!canView) return <p>You do not have permission to view assignments.</p>;

  // Validity and Status helpers
  const getValidityPercent = (validFrom, validTo) => {
    if (!validFrom || !validTo) return 0;
    const from = new Date(validFrom);
    const to = new Date(validTo);
    const now = new Date();
    if (now < from) return 0;
    if (now >= to) return 100;
    const total = to - from;
    const elapsed = now - from;
    return Math.round((elapsed / total) * 100);
  };

  const getBarColor = (percent) => {
    if (percent > 75) return '#ef4444'; // red
    if (percent > 50) return '#facc15'; // yellow
    return '#1db893'; // teal
  };

  const getStatusColor = (validFrom, validTo) => {
    const now = new Date();
    const from = new Date(validFrom);
    const to = new Date(validTo);
    if (now > to) return '#ef4444'; // expired
    if ((to - now) / (1000 * 60 * 60 * 24) < 30) return '#facc15'; // nearly expired
    return '#1db893'; // active
  };

  return (
    <section className="dashboard-section" style={{ maxWidth: 1000, margin: 'auto' }}>
      <div style={{ marginTop: '24px', marginBottom: '34px', textAlign: 'left' }}>
        <h2 style={{
          color: '#2188bb',
          fontWeight: 700,
          fontSize: '2rem',
          margin: 0,
          marginBottom: '12px',
          letterSpacing: 0,
          textShadow: '0 0 20px #2188bb33'
        }}>
          License Assignments
        </h2>
      </div>
      {assignments.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#2188bb', marginTop: '36px' }}>No assignments found.</p>
      ) : (
        <table className="dashboard-table" style={{
          width: '100%',
          borderCollapse: 'separate',
          borderSpacing: '0 8px',
          textAlign: 'center',
          backgroundColor: '#fff',
          marginBottom: '28px'
        }}>
          <thead>
            <tr>
              <th>Assignment ID</th>
              <th>Device ID</th>
              <th>License Key</th>
              <th>Assigned On</th>
              <th>Status</th>
              <th>Validity</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((asgmt) => {
              const license = licenseMap[asgmt.licenseKey] || {};
              const validityPercent = getValidityPercent(license.validFrom, license.validTo);
              const statusColor = getStatusColor(license.validFrom, license.validTo);
              return (
                <tr key={asgmt.assignmentId} style={{ backgroundColor: '#f6fbff' }}>
                  <td style={{ padding: '14px 10px' }}>{asgmt.assignmentId}</td>
                  <td style={{ padding: '14px 10px' }}>{asgmt.deviceId}</td>
                  <td style={{ padding: '14px 10px' }}>{asgmt.licenseKey}</td>
                  <td style={{ padding: '14px 10px' }}>{new Date(asgmt.assignedOn).toLocaleDateString()}</td>
                  <td>
                    <span
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: statusColor,
                        boxShadow: `0 0 8px ${statusColor}`
                      }}
                    />
                  </td>
                  <td>
                    <div style={{
                      width: '100%',
                      height: '10px',
                      backgroundColor: '#e5eaf1',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: 4,
                    }}>
                      <div style={{
                        width: `${validityPercent}%`,
                        minWidth: validityPercent > 0 ? '4px' : '0',
                        height: '100%',
                        backgroundColor: getBarColor(validityPercent),
                        transition: 'width 0.3s ease-in-out'
                      }} />
                    </div>
                    <small style={{ color: '#2188bb' }}>{validityPercent}% used</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}

export default Assignments;