import { useState } from 'react';

export default function UserRegister({ onRegisterSuccess, onBackToLogin, serverError }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [locality, setLocality] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const displayError = error || serverError;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError('Please fill in all required fields.'); return; }
    setError('');
    setIsSubmitting(true);
    try {
      await onRegisterSuccess({ name, email, password, workLocation: locality || 'Madhapur, Hyderabad', role: 'user' });
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail || (err.response ? "Unable to create account. Please check your details and try again." : "Cannot reach the server. Please check your connection."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <button className="btn-back-arrow" onClick={onBackToLogin} disabled={isSubmitting}><i className="fas fa-arrow-left"></i></button>
          <div><h3>Create Student &amp; Professional Account</h3><p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Register to bookmark properties, save preferences, and request beds.</p></div>
        </div>
        {displayError && <div className="auth-error-banner"><i className="fas fa-circle-exclamation"></i> {displayError}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-g"><label>Full Name *</label><input type="text" placeholder="Rahul Sharma" value={name} onChange={(e) => { setName(e.target.value); setError(''); }} disabled={isSubmitting} required /></div>
          <div className="input-g"><label>Email Address *</label><input type="email" placeholder="rahul.sharma@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} disabled={isSubmitting} required /></div>
          <div className="input-g"><label>Password * (minimum 6 characters)</label><input type="password" minLength={6} placeholder="Create a password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} disabled={isSubmitting} required /></div>
          <div className="input-g"><label>Workplace / Locality Hub (Optional)</label><input type="text" placeholder="e.g. Madhapur, Koramangala" value={locality} onChange={(e) => setLocality(e.target.value)} disabled={isSubmitting} /></div>
          <button type="submit" className="btn-primary auth-submit-btn" style={{ marginTop: '10px' }} disabled={isSubmitting}>
            {isSubmitting ? (
              <><i className="fas fa-spinner fa-spin"></i> CREATING ACCOUNT...</>
            ) : (
              <>SIGN UP &amp; ENTER <i className="fas fa-user-plus"></i></>
            )}
          </button>
        </form>
        <div className="auth-footer-help" style={{ marginTop: '20px' }}><p>Already have an account? <a onClick={onBackToLogin}>Log In</a></p></div>
      </div>
    </div>
  );
}