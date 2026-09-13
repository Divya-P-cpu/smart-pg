import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../utils/api";

export default function SavedPGs() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const navigate = useNavigate();

  const loadFavorites = () => {
    setLoading(true);
    api.get("/api/favorites")
      .then(r => setItems(r.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleRemoveFavorite = async (pgId) => {
    try {
      setRemovingId(pgId);
      await api.delete(`/api/favorites/${pgId}`);
      // Instantly filter out and maintain database sync
      setItems(prev => prev.filter(item => item.pg_id !== pgId));
    } catch (err) {
      console.error("Failed to remove favorite:", err);
      alert("Could not remove bookmark from database.");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <section className="account-page">
      <div className="page-heading">
        <span className="sub-title">Your shortlist</span>
        <h1>Saved PGs</h1>
        <p>Keep your best options together while you compare and decide. All saved properties are synchronized with your database account.</p>
      </div>

      {loading ? (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Loading saved stays from database…</p>
        </div>
      ) : items.length ? (
        <div className="saved-list">
          {items.map(item => (
            <article key={item.pg_id} className="card saved-row glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <div className="saved-icon" style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(236, 72, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ec4899', fontSize: '1.25rem' }}>
                  <i className="fas fa-heart"></i>
                </div>
                <div className="saved-info">
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>{item.pg_name || "Saved property"}</h2>
                  <p style={{ margin: '3px 0 0', color: '#94a3b8', fontSize: '0.85rem' }}>
                    <i className="fas fa-location-dot"></i> {item.area ? `${item.area}, ${item.city || ''}` : item.city || "Location available"}
                    {item.min_rent && <span style={{ marginLeft: '10px', color: '#6366f1', fontWeight: 700 }}>₹{Number(item.min_rent).toLocaleString('en-IN')}/mo</span>}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={removingId === item.pg_id}
                  onClick={() => handleRemoveFavorite(item.pg_id)}
                  style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                >
                  <i className={`fas ${removingId === item.pg_id ? 'fa-spinner fa-spin' : 'fa-trash'}`}></i> Remove
                </button>
                <Link className="btn btn-primary btn-sm" to="/explore">
                  View in Explore <i className="fas fa-arrow-right"></i>
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="state-card glass-card">
          <i className="far fa-heart" style={{ fontSize: '2.5rem', color: '#ec4899', marginBottom: '1rem' }}></i>
          <h3>No saved PGs in database yet</h3>
          <p>Tap the heart icon on any property to build your shortlist.</p>
          <Link className="btn btn-primary" to="/explore">Explore PGs</Link>
        </div>
      )}
    </section>
  );
}
