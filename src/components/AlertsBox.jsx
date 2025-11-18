import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { licenseAPI } from '../services/api';

function daysTo(dateStr) {
  const to = new Date(dateStr), now = new Date();
  return Math.round((to - now) / (1000 * 60 * 60 * 24));
}

function AlertsBox() {
  const { user } = useContext(AuthContext);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role) fetchAlerts();
    // eslint-disable-next-line
  }, [user?.role]);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const res = await licenseAPI.getAll({ days: 30 });
      setAlerts(res.data || []);
    } catch {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  if (!alerts.length) return null;

  return (
    <div className="alerts-box" style={{
      backgroundColor: '#ffe564', padding: '10px', borderRadius: '8px', marginBottom: '1rem'
    }}>
      <h4 style={{
        margin: 0, color: "#2188bb", fontSize: "1.1em"
      }}>Alerts</h4>
      {loading ? (
        <p>Loading alerts...</p>
      ) : (
        alerts.slice(0,3).map((alert) => (
          <div key={alert.licenseKey} style={{
            margin: '7px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span>
              <strong>{alert.softwareName}</strong> ({alert.licenseKey})<br />
              Expires on {new Date(alert.validTo).toLocaleDateString()}
            </span>
            <span style={{ marginLeft: 12, fontSize: "1.3em" }}>
              {daysTo(alert.validTo) < 15 ? '⚠️' : '🟡'}
            </span>
          </div>
        ))
      )}
      <div style={{
        fontSize: "0.95em", color: "#876", marginTop: 5
      }}>
        Status: <span style={{ fontSize: "1em" }}>⚠️</span> &lt; 15 days, <span>🟡</span> &lt; 30 days
      </div>
    </div>
  );
}

export default AlertsBox;