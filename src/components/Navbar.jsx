import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/Navbar.css';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

function daysTo(dateStr) {
  const to = new Date(dateStr);
  const now = new Date();
  return Math.round((to - now) / (1000 * 60 * 60 * 24));
}

const badgeStyle = {
  position: 'absolute',
  top: '-6px',
  right: '-8px',
  background: 'red',
  color: 'white',
  borderRadius: '50%',
  fontSize: '0.75em',
  minWidth: '16px',
  height: '16px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  lineHeight: 1,
};

function Navbar({ showLoginButton = true }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);

  // License alerts state
  const [alerts, setAlerts] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const alertDropdownRef = useRef();

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAuditDropdown, setShowAuditDropdown] = useState(false);
  const auditDropdownRef = useRef();

  // Fetch license alerts for roles with access
  useEffect(() => {
    async function fetchAlerts() {
      if (user && (user.role === 'ADMIN' || user.role === 'ENGINEER' || user.role === 'AUDITOR')) {
        try {
          const response = await api.get('/alerts', { params: { days: 30 } });
          setAlerts(Array.isArray(response.data) ? response.data : []);
        } catch {
          setAlerts([]);
        }
      }
    }
    fetchAlerts();
  }, [user]);

  // Fetch recent audit logs only for ADMIN and AUDITOR
  useEffect(() => {
    async function fetchAuditLogs() {
      if (user && (user.role === 'ADMIN' || user.role === 'AUDITOR')) {
        try {
          const res = await api.get('/audit/logs', { params: { page: 0, size: 5 } });
          setAuditLogs(res.data.content || []);
        } catch {
          setAuditLogs([]);
        }
      }
    }
    fetchAuditLogs();
  }, [user]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (alertDropdownRef.current && !alertDropdownRef.current.contains(event.target)) {
        setShowAlertDropdown(false);
      }
      if (auditDropdownRef.current && !auditDropdownRef.current.contains(event.target)) {
        setShowAuditDropdown(false);
      }
    }
    if (showAlertDropdown || showAuditDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAlertDropdown, showAuditDropdown]);

  const alertCount = alerts.length;
  const navLinks = [
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Devices', to: '/devices' },
    { label: 'Licenses', to: '/licenses' },
    { label: 'Assignments', to: '/assignments' },
    { label: 'AI Bot', to: '/ai-bot' }
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2
          onClick={() => navigate('/')}
          style={{
            cursor: 'pointer',
            color: '#2188bb',
            margin: 0,
            padding: '0 10px',
            userSelect: 'none',
            fontWeight: 800,
            letterSpacing: '.02em'
          }}
          title="Go to Landing page"
          tabIndex={0}
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") navigate('/'); }}
          aria-label="Navigate to landing page"
          role="button"
        >
          📜 License Tracker
        </h2>
      </div>

      <div className="navbar-tabs" style={{ display: 'flex', gap: '20px', marginLeft: '30px' }}>
        {navLinks.map(link => (
          <button
            className={`navbar-tab${location.pathname.startsWith(link.to) ? ' active' : ''}`}
            key={link.to}
            onClick={() => navigate(link.to)}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname.startsWith(link.to) ? '#2188bb' : '#444',
              fontWeight: location.pathname.startsWith(link.to) ? 700 : 500,
              fontSize: '1.07em',
              cursor: 'pointer',
              padding: '7px 0',
              borderBottom: location.pathname.startsWith(link.to) ? '2.5px solid #2188bb' : '2.5px solid transparent'
            }}
          >
            {link.label}
          </button>
        ))}

        {(user?.role === 'ADMIN' || user?.role === 'AUDITOR') && (
          <button
            className={`navbar-tab${showAuditDropdown ? ' active' : ''}`}
            onClick={() => setShowAuditDropdown(v => !v)}
            style={{
              background: 'none',
              border: 'none',
              color: showAuditDropdown ? '#2188bb' : '#444',
              fontWeight: showAuditDropdown ? 700 : 500,
              fontSize: '1.07em',
              cursor: 'pointer',
              padding: '7px 0',
              borderBottom: showAuditDropdown ? '2.5px solid #2188bb' : '2.5px solid transparent',
              marginLeft: 12,
            }}
            aria-haspopup="true"
            aria-expanded={showAuditDropdown}
            aria-label="Audit Logs"
          >
            Audit Logs
          </button>
        )}
      </div>

      <div className="navbar-actions" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '18px' }}>
        {user ? (
          <>
            {(user.role === 'ADMIN' || user.role === 'ENGINEER' || user.role === 'AUDITOR') && (
              <div className="alerts-container" style={{ position: 'relative' }}>
                <button
                  className="btn-alerts"
                  aria-label="License Alerts"
                  onClick={() => setShowAlertDropdown(v => !v)}
                  style={{
                    position: 'relative',
                    cursor: 'pointer',
                    fontSize: '16px',
                    background: 'none',
                    border: 'none',
                    padding: '2px 6px'
                  }}
                >
                  🔔
                  {alertCount > 0 && (
                    <span className="alert-badge" style={badgeStyle}>{alertCount}</span>
                  )}
                </button>
                {showAlertDropdown && (
                  <div
                    className="alert-dropdown"
                    ref={alertDropdownRef}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '30px',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      borderRadius: '10px',
                      width: '280px',
                      maxHeight: '280px',
                      overflowY: 'auto',
                      zIndex: 1000,
                      padding: '12px 14px',
                      border: '1px solid #cfdfe8'
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2188bb', marginBottom: 10 }}>
                      Expiring Licenses
                    </div>
                    {alertCount === 0 ? (
                      <div style={{ textAlign: 'center', color: '#2188bb', fontWeight: 500 }}>
                        No expiring licenses in next 30 days
                      </div>
                    ) : (
                      alerts.slice(0, 3).map(alert => {
                        const d = daysTo(alert.validTo);
                        return (
                          <div key={alert.licenseKey} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            borderBottom: '1px solid #eaeef2', padding: '5px 0', fontSize: '0.9rem'
                          }}>
                            <div style={{ flex: 1, marginRight: 10 }}>
                              <span style={{ fontWeight: '600', color: '#186195' }}>{alert.softwareName}</span>
                              <span style={{ color: '#888' }}> ({alert.licenseKey})</span><br />
                              <span style={{ color: '#4a6fa5', fontSize: '0.85rem' }}>
                                Expires: {new Date(alert.validTo).toLocaleDateString()}
                              </span>
                            </div>
                            <span style={{ fontSize: '1.2em' }}>
                              {d < 0 ? '' : d < 15 ? '⚠️' : d < 30 ? '🟡' : ''}
                            </span>
                          </div>
                        );
                      })
                    )}
                    <button
                      className="btn-submit"
                      style={{ width: '100%', marginTop: 10, padding: '8px 0', fontWeight: 700, borderRadius: 8 }}
                      onClick={() => {
                        setShowAlertDropdown(false);
                        navigate('/alerts-expiry');
                      }}
                    >
                      View All
                    </button>
                    <div style={{ textAlign: 'center', color: '#999', marginTop: 10, fontSize: '0.85rem' }}>
                      Status: <span style={{ fontSize: '1.1em' }}>⚠️</span> {"<"} 15 days, <span style={{ fontSize: '1.1em' }}>🟡</span> {"<"} 30 days
                    </div>
                  </div>
                )}
              </div>
            )}
            <span title={`Logged in as ${user.role}`} style={{ marginRight: '12px', color: "#2188bb", fontWeight: 700 }}>
              Welcome, {user.username}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="btn-logout"
              style={{ cursor: 'pointer' }}
            >
              Logout
            </button>
          </>
        ) : (
          showLoginButton && (
            <button onClick={() => navigate('/login')} className="btn-login" style={{ cursor: 'pointer' }}>
              Login
            </button>
          )
        )}
      </div>

      {showAuditDropdown && (
        <div
          className="alert-dropdown"
          ref={auditDropdownRef}
          style={{
            position: 'absolute',
            right: 0,
            top: '60px',
            backgroundColor: 'white',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            borderRadius: '10px',
            width: '280px',
            maxHeight: '280px',
            overflowY: 'auto',
            zIndex: 1000,
            padding: '12px 14px',
            border: '1px solid #cfdfe8',
          }}
        >
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#2188bb', marginBottom: 10 }}>
            Recent Audit Logs
          </div>
          {auditLogs.length === 0 ? (
            <div style={{ padding: '10px', textAlign: 'center' }}>No recent logs found.</div>
          ) : (
            auditLogs.map((log) => (
              <div key={log.logId} style={{ padding: '8px', borderBottom: '1px solid #eaeef2' }}>
                <div><strong>User {log.userId}</strong></div>
                <div>{log.entityType} - {log.action}</div>
                <div style={{ fontSize: '0.9em', color: '#555' }}>
                  {new Date(log.timestamp).toLocaleString()}
                </div>
              </div>
            ))
          )}
          <button
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#2188bb',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
            onClick={() => {
              setShowAuditDropdown(false);
              navigate('/audit-logs');
            }}
          >
            View All Logs
          </button>
        </div>
      )}
    </nav>
  );
}

export default Navbar;