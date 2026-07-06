import React from 'react';
import { Icon } from './src/index'; // Assuming Icon is exported from index.jsx

const LandingPage = ({ onNavigateToLogin }) => {
  return (
    <div className="login-page"> {/* Reusing login-page styling for consistency */}
      <div className="login-card" style={{ maxWidth: 600, padding: '40px 30px' }}>
        <div className="login-logo" style={{ marginBottom: 30 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 80, height: 80, background: 'var(--teal-faint)', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 50, border: '2px dashed var(--teal)' }}>
              🏥
            </div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 100, color: 'var(--text)', textAlign: 'center' }}>
              ClinicOS
            </div>
            <div style={{ fontSize: 16, color: 'var(--text-muted)', marginTop: 2, textAlign: 'center' }}>
              Enterprise GitOps & Service Mesh Platform
            </div>
          </div>
        </div>

        <h2 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)', textAlign: 'center', marginBottom: 20 }}>
          Zero-Downtime, Automated Continuous Deployment for Healthcare Management
        </h2>

        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 30 }}>
          ClinicOS solves the critical business problem of deployment downtime and the high risk associated with "big-bang" software releases.
          By utilizing GitOps principles and a Service Mesh (ArgoCD for declarative infrastructure, Istio for advanced network routing),
          this platform allows new software versions to be safely tested in production on a fractional user base (10% Canary) before full promotion.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 30 }}>
          <button className="btn btn-primary" onClick={onNavigateToLogin}>
            <Icon name="user" /> Login
          </button>
          <button className="btn btn-secondary" onClick={onNavigateToLogin}>
            <Icon name="plus" /> Sign Up
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;