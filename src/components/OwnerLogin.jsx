import { useState, useEffect } from 'react';

export default function OwnerLogin({ onLoginSuccess, onBackToSelection, onGoToRegister, onSwitchRole, initialEmail = '', serverError }) {
  const [email, setEmail] = useState(initialEmail || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialEmail) {
      setEmail(initialEmail);
    }
  }, [initialEmail]);

  const displayError = error || serverError;
  const isUserAccount = displayError && (
    displayError.toLowerCase().includes('user account') ||
    displayError.toLowerCase().includes('student')
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onLoginSuccess({ name: email.split('@')[0] || 'PG Owner Account', email, password, role: 'owner' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || (err.response ? "Unable to sign in. Check your email and password." : "Cannot reach the server. Please make sure the backend is running."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setError('');
    setIsSubmitting(true);
    try {
      await onLoginSuccess({ name: 'Smart PG Manager', email: 'manager@smartpg.com', password: 'password', role: 'owner' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Guest owner sign-in failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-card owner-theme-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToSelection} disabled={isSubmitting}><i className="fas fa-arrow-left"></i></button>
          <div><h3>PG Owner Login</h3><p>Login to register properties, edit layouts, and manage requests.</p></div>
        </div>
        {displayError && (
          <div className={`auth-error-banner ${isUserAccount ? 'role-mismatch-banner' : ''}`}>
            <div className="auth-error-text">
              <i className="fas fa-circle-exclamation"></i>
              <span>{displayError}</span>
            </div>
            {isUserAccount && onSwitchRole && (
              <button
                type="button"
                className="btn-switch-role"
                onClick={() => onSwitchRole('user', email)}
              >
                <i className="fas fa-arrow-right-arrow-left"></i> Switch to Student &amp; Professional Login
              </button>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g">
            <label>Business Email / Username</label>
            <input
              type="email"
              placeholder="owner@smartpg.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="input-g">
            <label>Password</label>
            <input
              type="password"
              placeholder="--------"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              disabled={isSubmitting}
              required
            />
          </div>
          <button type="submit" className="btn-primary auth-submit-btn owner-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i> LOGGING IN...</>
            ) : (
              <>LOG IN TO OWNER DASHBOARD <i className="fas fa-toolbox"></i></>
            )}
          </button>
        </form>
        <div className="divider-or"><span>OR</span></div>
        <button className="btn-guest-login owner-guest-btn" onClick={handleGuestLogin} disabled={isSubmitting}>
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin"></i> CONNECTING GUEST OWNER...</>
          ) : (
            <><i className="fas fa-user-gear"></i> Login as Guest PG Owner</>
          )}
        </button>
        <div className="auth-footer-help">
          <p>Don't have an account? <a onClick={onGoToRegister}>Register PG</a></p>
          <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Demo: manager@smartpg.com (pwd: password) or pudidivya57@gmail.com (pwd: 123456)
          </p>
        </div>
      </div>
    </div>
  );
}