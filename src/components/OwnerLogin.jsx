import { useState } from 'react';

export default function OwnerLogin({ onLoginSuccess, onBackToSelection, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    onLoginSuccess({ name: email.split('@')[0] || 'PG Owner Account', email, password, role: 'owner' });
  };

  const handleGuestLogin = () => {
    onLoginSuccess({ name: 'Smart PG Manager', email: 'manager@smartpg.com', password: 'password', role: 'owner' });
  };

  return (
    <div className="login-form-container">
      <div className="login-card owner-theme-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToSelection}><i className="fas fa-arrow-left"></i></button>
          <div><h3>PG Owner Login</h3><p>Login to register properties, edit layouts, and manage requests.</p></div>
        </div>
        {error && <div className="auth-error-banner"><i className="fas fa-circle-exclamation"></i> {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g"><label>Business Email / Username</label><input type="email" placeholder="owner@smartpg.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="input-g"><label>Password</label><input type="password" placeholder="--------" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="btn-primary auth-submit-btn owner-submit-btn">LOG IN TO OWNER DASHBOARD <i className="fas fa-toolbox"></i></button>
        </form>
        <div className="divider-or"><span>OR</span></div>
        <button className="btn-guest-login owner-guest-btn" onClick={handleGuestLogin}><i className="fas fa-user-gear"></i> Login as Guest PG Owner</button>
        <div className="auth-footer-help"><p>Don't have an account? <a onClick={onGoToRegister}>Register PG</a></p><p style={{ marginTop: '8px', fontSize: '11px' }}>Guest Owner access enables list editing immediately.</p></div>
      </div>
    </div>
  );
}