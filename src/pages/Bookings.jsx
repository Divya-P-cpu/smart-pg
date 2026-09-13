import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JourneyPlanner from "../components/JourneyPlanner";
import { api } from "../utils/api";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = () => {
    setLoading(true);
    api.get("/api/bookings")
      .then((response) => setBookings(response.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking request?")) return;
    try {
      setCancellingId(bookingId);
      const res = await api.patch(`/api/bookings/${bookingId}/cancel`);
      setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: "Cancelled" } : b));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Could not cancel booking in database.");
    } finally {
      setCancellingId(null);
    }
  };

  const status = (value) => String(value || "Pending").toLowerCase();

  return (
    <section className="account-page booking-page">
      <div className="page-heading">
        <span className="sub-title">Your requests</span>
        <h1>Bookings & inquiries</h1>
        <p>Track each bed request from submission to owner response. Records are synchronized directly with MySQL.</p>
      </div>

      {loading ? (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Loading requests from database…</p>
        </div>
      ) : bookings.length ? (
        <div className="booking-list">
          {bookings.map((item) => {
            const isPending = status(item.status) === "pending";
            return (
              <article key={item.booking_id} className="booking-item">
                <div className={`card booking-row glass-card booking-status-${status(item.status)}`}>
                  <div className="booking-row-main">
                    <span className={`request-status ${status(item.status)}`}>{item.status || "Pending"}</span>
                    <h2>{item.pgName || "PG booking request"}</h2>
                  </div>
                  <div className="booking-row-meta">
                    <span><i className="fas fa-bed"></i> {item.roomName || "Room to be confirmed"} · {item.bedNumber || "Bed to be confirmed"}</span>
                  </div>
                  <div className="booking-date">
                    <small>Move-in</small>
                    <strong>{item.requested_move_in_date || "—"}</strong>
                  </div>
                  {isPending && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', marginLeft: '1rem' }}
                      disabled={cancellingId === item.booking_id}
                      onClick={() => handleCancelBooking(item.booking_id)}
                    >
                      <i className={`fas ${cancellingId === item.booking_id ? 'fa-spinner fa-spin' : 'fa-ban'}`}></i> Cancel Request
                    </button>
                  )}
                </div>
                <JourneyPlanner booking={item} />
              </article>
            );
          })}
        </div>
      ) : (
        <div className="state-card glass-card">
          <i className="fas fa-calendar-check" style={{ fontSize: '2.5rem', color: '#6366f1', marginBottom: '1rem' }}></i>
          <h3>No booking requests in database</h3>
          <p>Open a property's bed map on Explore to select an available bed and submit an inquiry.</p>
          <Link className="btn btn-primary" to="/explore">Find an available bed</Link>
        </div>
      )}
    </section>
  );
}
