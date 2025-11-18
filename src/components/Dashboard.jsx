import React, { useEffect, useState } from 'react';
import dashboardAPI from '../services/dashboardAPI'; // Axios client with /dashboard/overview
import "../styles/Dashboard.css";

function StatCard({ title, value }) {
  return (
    <div className="stat-card-animated">
      <div style={{ fontSize: '1.15rem', color: '#2188bb', marginBottom: 6 }}>{title}</div>
      <div>{value}</div>
    </div>
  );
}


function ExpiringLicensesTable({ licenses }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="dashboard-table-outer">
      <button
        className="dashboard-dropdown-btn"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
      >
        <span className="dropdown-arrow">{open ? '▼' : '▶'}</span>
        <span className="dropdown-title">Expiring Licenses This Month</span>
      </button>
      {open && (
        <div className="dashboard-table-inner">
          <table className="dashboard-table">
            <colgroup>
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
              <col style={{ width: "25%" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Software</th>
                <th>Vendor</th>
                <th>Devices Used</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {licenses?.length === 0 ? (
                <tr>
                  <td colSpan={4} className="dashboard-table-empty">No expiring licenses this month</td>
                </tr>
              ) : (
                licenses.map(({ software, vendor, devicesUsed, expiryDate }, idx) => (
                  <tr key={idx}>
                    <td>{software}</td>
                    <td>{vendor}</td>
                    <td className="centered-cell">{devicesUsed}</td>
                    <td>{expiryDate}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchOverview() {
      try {
        const res = await dashboardAPI.getOverview();
        setOverview(res.data);
        setError(null);
      } catch (err) {
        setError("Failed to load dashboard overview.");
      }
    }
    fetchOverview();
  }, []);

  if (error) {
    return <div style={{ color: 'red', textAlign: 'center', marginTop: '3rem' }}>{error}</div>;
  }

  if (!overview) {
    return <div style={{ color: '#2188bb', textAlign: 'center', marginTop: '3rem' }}>Loading dashboard overview...</div>;
  }

  return (
    <div style={{
      maxWidth: 900,
      margin: '2rem auto',
      padding: '0 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      color: '#2188bb',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{ display: 'flex', gap: 18 }}>
        <StatCard title="Total Devices" value={overview.totalDevices} />
        <StatCard title="Total Licenses" value={overview.totalLicenses} />
      </div>
      <div style={{ display: 'flex', gap: 18 }}>
        <StatCard title="Devices at Risk" value={overview.devicesAtRisk} />
        <StatCard title="Licenses Expiring" value={overview.licensesExpiring} />
      </div>
      <ExpiringLicensesTable licenses={overview.expiringLicenses} />
    </div>
  );
}