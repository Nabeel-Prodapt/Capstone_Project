import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LandingPage.css';

const FEATURES = [
  { icon: "🖥️", label: "Device Inventory" },
  { icon: "📜", label: "License Repository" },
  { icon: "🔒", label: "Role-Based Access" },
  { icon: "💡", label: "Smart Tracking" },
];

function LandingPage() {
  const navigate = useNavigate();

  return (
    <main className="landing-page" role="main">
      <section className="landing-content">
        <div className="hero-card">
          <div className="running-text">
            <h1>Welcome to License Tracker</h1>
            <p className="subtitle">
              Manage your software licenses and devices efficiently — all in one place.
            </p>
            <div className="features">
              {FEATURES.map((feature, idx) => (
                <div
                  className="feature-item"
                  style={{ "--feature": idx }}
                  key={feature.label}
                  tabIndex={0}
                  aria-label={feature.label}
                >
                  <span className="feature-icon" role="img" aria-hidden="true">{feature.icon}</span>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/signup')}
            className="btn-signup"
            tabIndex={0}
            aria-label="Sign Up"
          >
            Sign Up Now
          </button>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;