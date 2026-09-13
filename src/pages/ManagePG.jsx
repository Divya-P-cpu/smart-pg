import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";

export default function ManagePG() {
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/api/pgs/owner/listings")
      .then(r => setPgs(r.data))
      .catch(() => setError("Could not load your properties."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="state-card">
      <div className="spinner"></div>
      <p>Loading your properties…</p>
    </div>
  );

  return (
    <section className="manage-page">
      <div className="page-heading">
        <span className="sub-title">Owner workspace</span>
        <h1>Manage properties</h1>
        <p>Room and bed status changes are managed in the owner dashboard.</p>
      </div>

      <div className="form-actions">
        <Link className="btn btn-primary" to="/owner/add-pg">Add a property</Link>
        <Link className="btn btn-secondary" to="/owner">Open dashboard</Link>
      </div>

      {error && <p className="form-error">{error}</p>}

      <div className="owner-property-grid">
        {pgs.map(pg => (
          <article key={pg.pg_id} className="card owner-property-card glass-card">
            <div className="owner-property-main">
              <div>
                <span className="status-badge available">Active</span>
                <h2>{pg.pg_name}</h2>
                <p><i className="fas fa-location-dot"></i> {pg.area}, {pg.city}</p>
              </div>
              <div className="owner-property-price">
                <strong>₹{Number(pg.min_rent || 0).toLocaleString("en-IN")} <small>/ month</small></strong>
              </div>
            </div>

            <div className="owner-property-stats">
              <span>{pg.rooms.length} rooms</span>
              <span>{pg.rooms.reduce((sum, room) => sum + room.beds.filter(b => b.current_status === "Available").length, 0)} beds available</span>
            </div>

            <p className="amenity-summary">{pg.amenities.join(" · ") || "No amenities added"}</p>

            <Link className="btn btn-secondary" to="/owner">Manage rooms & beds</Link>
          </article>
        ))}
      </div>

      {!error && !pgs.length && (
        <div className="state-card glass-card">
          <i className="fas fa-house-circle-plus"></i>
          <h3>Your portfolio is empty</h3>
          <p>Add your first property to create rooms and live bed availability.</p>
          <Link className="btn btn-primary" to="/owner/add-pg">Add property</Link>
        </div>
      )}
    </section>
  );
}
