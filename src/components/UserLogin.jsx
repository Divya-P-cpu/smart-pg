import { useState } from 'react';

export default function UserLogin({ onLoginSuccess, onBackToSelection, onGoToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    onLoginSuccess({ name: email.split('@')[0] || 'Rahul Sharma', email, password, role: 'user' });
  };

  const handleGuestLogin = () => {
    onLoginSuccess({ name: 'Rahul Sharma', email: 'rahul.sharma@example.com', password: 'password', role: 'user' });
  };

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToSelection}><i className="fas fa-arrow-left"></i></button>
          <div><h3>Student &amp; Professional Login</h3><p>Login to save favorites, check bookings, and reserve beds.</p></div>
        </div>
        {error && <div className="auth-error-banner"><i className="fas fa-circle-exclamation"></i> {error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g"><label>Email Address / Username</label><input type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required /></div>
          <div className="input-g"><label>Password</label><input type="password" placeholder="--------" value={password} onChange={(e) => setPassword(e.target.value)} required /></div>
          <button type="submit" className="btn-primary auth-submit-btn">LOG IN <i className="fas fa-right-to-bracket"></i></button>
        </form>
        <div className="divider-or"><span>OR</span></div>
        <button className="btn-guest-login user-guest-btn" onClick={handleGuestLogin}><i className="fas fa-circle-user"></i> Login as Guest User (Rahul Sharma)</button>
        <div className="auth-footer-help"><p>Don't have an account? <a onClick={onGoToRegister}>Create Account</a></p><p style={{ marginTop: '8px', fontSize: '11px' }}>Guest access enables booking privileges instantly.</p></div>
      </div>
    </div>
  );
}