import PGCard from './PGCard';

export default function UserDashboard({ user, pgs, savedIds, compareIds, bookingRequests, onToggleSave, onToggleCompare, onViewDetails, onNavigateToSearch, onOpenPrefs }) {
  const userName = user?.name || 'User';
  const myRequests = bookingRequests.filter(b => (b.userName || '').toLowerCase() === userName.toLowerCase());
  const savedPgs = pgs.filter(p => savedIds.has(p.id));
  const recommendedPgs = [...pgs].sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0)).slice(0, 4);

  const getStatusClass = (s) => {
    const st = String(s || '').toLowerCase();
    if (st === 'accepted' || st === 'approved') return 'booking-status-accepted';
    if (st === 'rejected') return 'booking-status-rejected';
    return 'booking-status-pending';
  };

  const getStatusLabel = (s) => {
    const st = String(s || '').toLowerCase();
    if (st === 'accepted' || st === 'approved') return 'Accepted & Confirmed';
    if (st === 'rejected') return 'Unavailable';
    return 'Pending Review';
  };

  const getStatusIcon = (s) => {
    const st = String(s || '').toLowerCase();
    if (st === 'accepted' || st === 'approved') return 'fa-circle-check';
    if (st === 'rejected') return 'fa-circle-xmark';
    return 'fa-clock';
  };

  const initials = userName
    ? userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  return (
    <div className="user-dashboard-wrap">
      {/* Top Welcome & User Profile Card */}
      <div className="dashboard-welcome-card-enhanced">
        <div className="dashboard-profile-left">
          <div className="dashboard-avatar-large">
            {initials}
          </div>
          <div>
            <h2 className="dashboard-greeting-title">Hello, {userName}!</h2>
            <p className="dashboard-greeting-sub">Welcome to your resident dashboard &mdash; discover, manage bookings, and track verified stays.</p>
          </div>
        </div>

        <div className="dashboard-user-stat-pills">
          <span className="dashboard-stat-pill">
            <i className="fas fa-calendar-check" style={{ color: '#4f46e5' }}></i> {myRequests.length} Active Bookings
          </span>
          <span className="dashboard-stat-pill">
            <i className="fas fa-heart" style={{ color: '#ec4899' }}></i> {savedPgs.length} Bookmarked
          </span>
          <span className="dashboard-stat-pill">
            <i className="fas fa-shield-halved" style={{ color: '#10b981' }}></i> Verified Resident
          </span>
        </div>
      </div>

      {/* Smart Search Launch Banner */}
      <div className="dashboard-action-card-enhanced">
        <div className="dashboard-action-text">
          <h3><i className="fas fa-magnifying-glass-location" style={{ color: '#06b6d4' }}></i> Need to search adjacent localities?</h3>
          <p>Launch our interactive search engine with verified room inventory, live bed status, and real-time compatibility matching.</p>
        </div>
        <button className="btn-apply-filters btn-shine" onClick={() => onNavigateToSearch(null)}>
          LAUNCH SEARCH FILTERS <i className="fas fa-arrow-right"></i>
        </button>
      </div>

      {/* My Booking Requests */}
      <div className="dashboard-section-enhanced">
        <div className="dashboard-section-header-row">
          <h3 className="dashboard-section-title-large">
            <i className="fas fa-envelope-open-text" style={{ color: '#4f46e5' }}></i> My Booking Requests
          </h3>
          <span className="badge-counter-capsule">
            <span className="dot dot-green animate-pulse" style={{ width: '7px', height: '7px' }}></span>
            {myRequests.length} Active
          </span>
        </div>

        {myRequests.length === 0 ? (
          <div className="state-card glass-card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <i className="fas fa-calendar-check" style={{ fontSize: '2.4rem', color: '#94a3b8', marginBottom: '10px' }}></i>
            <p style={{ fontWeight: 700, color: '#475569' }}>No booking requests submitted yet.</p>
          </div>
        ) : (
          <div className="dashboard-bookings-grid">
            {myRequests.map(b => (
              <div key={b.id} className="booking-item-card-enhanced">
                <div className="booking-card-top-row">
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <i className="fas fa-building"></i> PG Listing
                    </span>
                    <h4 className="booking-pg-name">{b.pgName}</h4>
                  </div>
                  <span className={`booking-status-pill ${getStatusClass(b.status)}`}>
                    <i className={`fas ${getStatusIcon(b.status)}`}></i> {getStatusLabel(b.status)}
                  </span>
                </div>

                <div className="booking-meta-badges-row">
                  <span className="booking-meta-badge">
                    <i className="fas fa-bed" style={{ color: '#06b6d4' }}></i> {b.roomName} &bull; Bed {b.bedNumber}
                  </span>
                  <span className="booking-meta-badge">
                    <i className="fas fa-indian-rupee-sign" style={{ color: '#10b981' }}></i> ₹{Number(b.rent || 0).toLocaleString('en-IN')}/mo
                  </span>
                  <span className="booking-meta-badge">
                    <i className="fas fa-calendar-day" style={{ color: '#f59e0b' }}></i> {b.date}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Smart Recommended Stays */}
      <div className="dashboard-section-enhanced">
        <div className="dashboard-section-header-row">
          <h3 className="dashboard-section-title-large">
            <i className="fas fa-sparkles" style={{ color: '#f59e0b' }}></i> Top Recommended Stays for You
          </h3>
        </div>
        <div className="pg-grid">
          {recommendedPgs.map(pg => (
            <PGCard
              key={pg.id}
              pg={pg}
              isSaved={savedIds.has(pg.id)}
              isCompared={compareIds.has(pg.id)}
              onToggleSave={onToggleSave}
              onToggleCompare={onToggleCompare}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      </div>

      {/* Bookmarked Properties */}
      <div className="dashboard-section-enhanced">
        <div className="dashboard-section-header-row">
          <h3 className="dashboard-section-title-large">
            <i className="fas fa-heart" style={{ color: '#ec4899' }}></i> Bookmarked Properties ({savedPgs.length})
          </h3>
        </div>
        {savedPgs.length === 0 ? (
          <div className="state-card glass-card" style={{ padding: '2.5rem', textAlign: 'center', borderRadius: '20px' }}>
            <i className="fas fa-heart" style={{ fontSize: '2.4rem', color: '#cbd5e1', marginBottom: '10px' }}></i>
            <p style={{ fontWeight: 700, color: '#475569' }}>Your saved properties will appear here.</p>
          </div>
        ) : (
          <div className="pg-grid">
            {savedPgs.map(pg => (
              <PGCard
                key={pg.id}
                pg={pg}
                isSaved={savedIds.has(pg.id)}
                isCompared={compareIds.has(pg.id)}
                onToggleSave={onToggleSave}
                onToggleCompare={onToggleCompare}
                onViewDetails={onViewDetails}
              />
            ))}
          </div>
        )}
      </div>

      {/* My Matching Filters & Preferences */}
      <div className="dashboard-preferences-card-enhanced">
        <div className="dashboard-section-header-row">
          <h3 className="dashboard-section-title-large">
            <i className="fas fa-sliders" style={{ color: '#4f46e5' }}></i> My Matching Filters &amp; Preferences
          </h3>
          <button className="btn-reset-filters" onClick={onOpenPrefs}>
            <i className="fas fa-user-pen"></i> EDIT PREFERENCES
          </button>
        </div>

        <div className="pref-tiles-grid">
          <div className="pref-tile">
            <span className="pref-tile-label"><i className="fas fa-location-dot" style={{ color: '#06b6d4' }}></i> Target Locality</span>
            <span className="pref-tile-value">{user.workLocation || user.area || 'Madhapur, Hyderabad'}</span>
          </div>
          <div className="pref-tile">
            <span className="pref-tile-label"><i className="fas fa-indian-rupee-sign" style={{ color: '#10b981' }}></i> Max Monthly Budget</span>
            <span className="pref-tile-value">₹{user.budgetMax ? Number(user.budgetMax).toLocaleString('en-IN') : '20,000'} / mo</span>
          </div>
          <div className="pref-tile">
            <span className="pref-tile-label"><i className="fas fa-bed" style={{ color: '#8b5cf6' }}></i> Preferred Sharing</span>
            <span className="pref-tile-value">{user.sharing || user.preferred_sharing || 3} Sharing</span>
          </div>
          <div className="pref-tile">
            <span className="pref-tile-label"><i className="fas fa-calendar-check" style={{ color: '#ec4899' }}></i> Target Move-In</span>
            <span className="pref-tile-value">{user.moveIn || 'Immediate Move-in'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
