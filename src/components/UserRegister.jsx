import { useState } from 'react';

export default function UserRegister({ onRegisterSuccess, onBackToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [locality, setLocality] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all required fields.'); return; }
    onRegisterSuccess({ name, email, password, workLocation: locality || 'Madhapur, Hyderabad', role: 'user' });
  };

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToLogin}><i className="fas fa-arrow-left"></i></button>
          <div><h3>Create Student &amp; Professional Account</h3><p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Register to bookmark properties, save preferences, and request beds.</p></div>
        </div>
        {error && <div className="auth-error-banner"><i className="fas fa-circle-exclamation"></i> {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g"><label>Full Name *</label><input type="text" placeholder="Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required /></div>
          <div className="input-g"><label>Email Address *</label><input type="email" placeholder="rahul.sharma@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="input-g"><label>Password * (minimum 6 characters)</label><input type="password" minLength={6} placeholder="Create a password" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <div className="input-g"><label>Workplace / Locality Hub (Optional)</label><input type="text" placeholder="e.g. Madhapur, Koramangala" value={locality} onChange={(e) => setLocality(e.target.value)} /></div>
          <button type="submit" className="btn-primary auth-submit-btn" style={{ marginTop: '10px' }}>SIGN UP &amp; ENTER <i className="fas fa-user-plus"></i></button>
        </form>
        <div className="auth-footer-help" style={{ marginTop: '20px' }}><p>Already have an account? <a onClick={onBackToLogin}>Log In</a></p></div>
      </div>
    </div>
  );
}