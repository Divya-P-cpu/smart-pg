import { useState } from 'react';

export default function OwnerRegister({ onRegisterSuccess, onBackToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pgName, setPgName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !pgName) { setError('Please fill in all fields.'); return; }
    onRegisterSuccess({ name, email, password, pgName, role: 'owner' });
  };

  return (
    <div className="login-form-container">
      <div className="login-card owner-theme-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToLogin}><i className="fas fa-arrow-left"></i></button>
          <div><h3>Register as PG Owner</h3><p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>List properties, configure rooms, and manage occupant requests.</p></div>
        </div>
        {error && <div className="auth-error-banner"><i className="fas fa-circle-exclamation"></i> {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g"><label>Owner Name *</label><input type="text" placeholder="e.g. Sri Sai Manager" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="input-g"><label>Business Email *</label><input type="email" placeholder="manager@srisaipg.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="input-g"><label>Password * (minimum 6 characters)</label><input type="password" minLength={6} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="input-g"><label>PG Brand Name *</label><input type="text" placeholder="e.g. Sri Sai Premium PG" value={pgName} onChange={(e) => setPgName(e.target.value)} required /></div>
          <button type="submit" className="btn-primary auth-submit-btn owner-submit-btn" style={{ marginTop: '10px' }}>REGISTER PG BUSINESS <i className="fas fa-hotel"></i></button>
        </form>
        <div className="auth-footer-help" style={{ marginTop: '20px' }}><p>Already have an account? <a onClick={onBackToLogin}>Log In</a></p></div>
      </div>
    </div>
  );
}