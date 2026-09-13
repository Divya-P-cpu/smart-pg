import { useEffect, useState } from "react";
import { api } from "../utils/api";

export default function Notifications() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/notifications")
      .then(r => setItems(r.data))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="account-page">
      <div className="page-heading">
        <span className="sub-title">Stay updated</span>
        <h1>Notifications</h1>
        <p>Booking updates and important changes appear here.</p>
      </div>

      {loading ? (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Loading notifications…</p>
        </div>
      ) : items.length ? (
        <div className="notification-list">
          {items.map((item, index) => (
            <article key={item.notification_id || index} className="card notification-row glass-card">
              <div className="notification-icon"><i className="fas fa-bell"></i></div>
              <div className="notification-content">
                <h2>{item.title || "Smart PG update"}</h2>
                <p>{item.message || "You have a new update."}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="state-card glass-card">
          <i className="far fa-bell"></i>
          <h3>You're all caught up</h3>
          <p>We'll show booking and property updates here.</p>
        </div>
      )}
    </section>
  );
}
