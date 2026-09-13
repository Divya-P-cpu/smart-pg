export default function LoginSelection({ onSelectRole, onCancel, mode = 'login' }) {
  const isRegister = mode === 'register';

  return (
    <div className="auth-selection-container">
      <div className="auth-selection-card glass-card">
        <div className="auth-logo">
          <i className="fas fa-building-circle-arrow-right"></i>
          <h2>SMART PG FINDER</h2>
        </div>
        
        <div className="selection-title-area">
          <h3>{isRegister ? 'Create your Smart PG account' : 'Welcome back to Smart PG'}</h3>
          <p>{isRegister ? 'Choose how you will use the platform' : 'Choose an account to sign in'}</p>
        </div>

        <div className="role-options">
          <div className="role-card glass-card" onClick={() => onSelectRole('user')}>
            <div className="role-icon-circle user-circle">
              <i className="fas fa-user-tie"></i>
            </div>
            <div className="role-details">
              <h4>I'm a User / Guest</h4>
              <p>{isRegister ? 'Create a profile to save preferences, compare stays, and request beds.' : 'Find PGs, check real-time bed layouts, compare, and reserve beds.'}</p>
            </div>
            <div className="role-action-arrow">
              <i className={`fas ${isRegister ? 'fa-user-plus' : 'fa-circle-chevron-right'}`}></i>
            </div>
          </div>

          <div className="role-card glass-card" onClick={() => onSelectRole('owner')}>
            <div className="role-icon-circle owner-circle">
              <i className="fas fa-hotel"></i>
            </div>
            <div className="role-details">
              <h4>I'm a PG Owner</h4>
              <p>{isRegister ? 'Create an owner account to list properties and manage available beds.' : 'List PGs, configure rooms, mark bed hotspot markers, approve booking requests.'}</p>
            </div>
            <div className="role-action-arrow">
              <i className={`fas ${isRegister ? 'fa-building-circle-check' : 'fa-circle-chevron-right'}`}></i>
            </div>
          </div>
        </div>

        <button className="btn-back-home" onClick={onCancel}>
          <i className="fas fa-arrow-left"></i> Back to Homepage
        </button>
      </div>
    </div>
  );
}
