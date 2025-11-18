import React, { useEffect, useState } from 'react';
import api from '../services/api';

function daysTo(dateStr) {
  const to = new Date(dateStr), now = new Date();
  return Math.round((to - now) / (1000 * 60 * 60 * 24));
}
function getAlertIcon(days) {
  if (days < 0) return "";
  if (days < 15) return "⚠️";
  if (days < 30) return "🟡";
  return "";
}

export default function AlertsExpiryView() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("15");

  useEffect(() => {
    async function fetchAlerts() {
      setLoading(true);
      try {
        const res = await api.get('/alerts', { params: { days: filter } });
        setAlerts(res.data || []);
      } catch {
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, [filter]);

  return (
    <section className="dashboard-section" style={{ margin: "auto", maxWidth: 760 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 18
      }}>
        <h2 style={{ color: '#2188bb', fontWeight: 700 }}>
          Alerts & Expiry View
        </h2>
        <div>
          <span style={{ fontWeight: 500, color: "#2188bb", marginRight: 9 }}>Filter:</span>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: 8, border: "1.5px solid #2188bb", color: "#2188bb" }}
          >
            <option value="15">Next 15 days</option>
            <option value="30">Next 30 days</option>
            <option value="">All</option>
          </select>
        </div>
      </div>
      <table style={{ width: "100%", background: "#fff", borderRadius: 14, fontWeight: 500 }}>
        <thead>
          <tr style={{ background: "#e5eaf1" }}>
            <th style={{ padding: "10px 8px", color: "#2188bb" }}>License Key</th>
            <th style={{ padding: "10px 8px", color: "#2188bb" }}>Software</th>
            <th style={{ padding: "10px 8px", color: "#2188bb" }}>Expiry Date</th>
            <th style={{ padding: "10px 8px", color: "#2188bb" }}>Alert</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={4} style={{ textAlign: "center" }}>Loading...</td></tr>
          ) : (alerts.length === 0 ? (
            <tr><td colSpan={4} style={{ textAlign: "center", color: "#2188bb" }}>No expiring licenses</td></tr>
          ) : alerts.map(alert => {
            const days = daysTo(alert.validTo);
            return (
              <tr key={alert.licenseKey} style={{ background: "#f6fbff" }}>
                <td style={{ padding: "10px 8px" }}>{alert.licenseKey}</td>
                <td style={{ padding: "10px 8px" }}>{alert.softwareName}</td>
                <td style={{ padding: "10px 8px" }}>{new Date(alert.validTo).toLocaleDateString()}</td>
                <td style={{ padding: "10px 8px", fontSize: "1.25em" }}>{getAlertIcon(days)}</td>
              </tr>
            );
          }))}
        </tbody>
      </table>
      <button
        className="btn-submit"
        style={{ width: 250, margin: "20px auto 0", display: 'block', borderRadius: 12 }}
        onClick={() => window.alert("This would send out reminder emails!")}
      >
        Send Reminder Email
      </button>
      <p style={{ marginTop: 15, color: "#888", fontSize: "1em", textAlign: "center" }}>
        Status icons: <span style={{ fontSize: "1.15em" }}>⚠️</span> &lt; 15 days,
        <span style={{ fontSize: "1.15em" }}>🟡</span> &lt; 30 days
      </p>
    </section>
  );
}
