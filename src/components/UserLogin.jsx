import { useState, useEffect } from 'react';

export default function UserLogin({ onLoginSuccess, onBackToSelection, onGoToRegister, onSwitchRole, initialEmail = '', serverError }) {
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
  const isOwnerAccount = displayError && displayError.toLowerCase().includes('pg owner');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onLoginSuccess({ name: email.split('@')[0] || 'Rahul Sharma', email, password, role: 'user' });
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
      await onLoginSuccess({ name: 'Rahul Sharma', email: 'rahul.sharma@example.com', password: 'password', role: 'user' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || "Guest login failed. Please try again or create an account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToSelection} disabled={isSubmitting}><i className="fas fa-arrow-left"></i></button>
          <div><h3>Student &amp; Professional Login</h3><p>Login to save favorites, check bookings, and reserve beds.</p></div>
        </div>
        {displayError && (
          <div className={`auth-error-banner ${isOwnerAccount ? 'role-mismatch-banner' : ''}`}>
            <div className="auth-error-text">
              <i className="fas fa-circle-exclamation"></i>
              <span>{displayError}</span>
            </div>
            {isOwnerAccount && onSwitchRole && (
              <button
                type="button"
                className="btn-switch-role"
                onClick={() => onSwitchRole('owner', email)}
              >
                <i className="fas fa-arrow-right-arrow-left"></i> Switch to PG Owner Login
              </button>
            )}
          </div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g">
            <label>Email Address / Username</label>
            <input
              type="email"
              placeholder="name@domain.com"
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
          <button type="submit" className="btn-primary auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i> LOGGING IN...</>
            ) : (
              <>LOG IN <i className="fas fa-right-to-bracket"></i></>
            )}
          </button>
        </form>
        <div className="divider-or"><span>OR</span></div>
        <button className="btn-guest-login user-guest-btn" onClick={handleGuestLogin} disabled={isSubmitting}>
          {isSubmitting ? (
            <><i className="fas fa-spinner fa-spin"></i> CONNECTING GUEST...</>
          ) : (
            <><i className="fas fa-circle-user"></i> Login as Guest User (Rahul Sharma)</>
          )}
        </button>
        <div className="auth-footer-help">
          <p>Don't have an account? <a onClick={onGoToRegister}>Create Account</a></p>
          <p style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Demo: rahul.sharma@example.com (pwd: password) or vangasravya@gmail.com (pwd: 123456)
          </p>
        </div>
      </div>
    </div>
  );
}