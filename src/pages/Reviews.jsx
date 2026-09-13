import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

export default function Reviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [availablePgs, setAvailablePgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPgId, setSelectedPgId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [notice, setNotice] = useState("");

  const loadReviewsData = async () => {
    try {
      setLoading(true);
      const [revRes, pgsRes] = await Promise.all([
        api.get("/api/reviews"),
        api.get("/api/pgs", { params: { page_size: 50 } }),
      ]);
      setReviews(revRes.data || []);
      const pgItems = pgsRes.data?.items || [];
      setAvailablePgs(pgItems);
      if (pgItems.length > 0 && !selectedPgId) {
        setSelectedPgId(pgItems[0].pg_id);
      }
    } catch (err) {
      console.warn("Error loading reviews from database:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadReviewsData();
    }
  }, [user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedPgId) {
      alert("Please select a PG to review.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.post("/api/reviews", {
        pg_id: selectedPgId,
        rating: Number(rating),
        comment: comment.trim() || null,
      });
      setReviews((prev) => [res.data, ...prev]);
      setComment("");
      setNotice("Your review was successfully saved to the MySQL database!");
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert("Could not save review to database.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review from the database?")) return;
    try {
      await api.delete(`/api/reviews/${reviewId}`);
      setReviews((prev) => prev.filter((r) => r.review_id !== reviewId));
    } catch (err) {
      console.error("Failed to delete review:", err);
      alert("Error deleting review from database.");
    }
  };

  return (
    <section className="account-page">
      <div className="page-heading">
        <span className="sub-title">Your feedback</span>
        <h1>Community Reviews & Ratings</h1>
        <p>Share authentic feedback about stays. All submitted reviews are stored persistently in MySQL.</p>
      </div>

      {notice && (
        <div style={{ padding: "0.85rem 1.25rem", background: "rgba(16, 185, 129, 0.15)", border: "1px solid rgba(16, 185, 129, 0.35)", borderRadius: "10px", color: "#10b981", fontWeight: 600, marginBottom: "1.5rem" }}>
          <i className="fas fa-circle-check" style={{ marginRight: "8px" }}></i> {notice}
        </div>
      )}

      {/* Review Submission Card */}
      <div className="card glass-card" style={{ padding: "1.75rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "0.5rem" }}>
          <i className="fas fa-pen-to-square" style={{ color: "#6366f1", marginRight: "8px" }}></i> Write a Review
        </h2>
        <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "1.25rem" }}>
          Help future residents by rating food quality, maintenance, Wi-Fi speed, and safety.
        </p>

        <form onSubmit={handleSubmitReview}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#cbd5e1" }}>
                Select PG Property *
              </label>
              <select
                value={selectedPgId}
                onChange={(e) => setSelectedPgId(e.target.value)}
                style={{ width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff" }}
              >
                {availablePgs.map((p) => (
                  <option key={p.pg_id} value={p.pg_id}>
                    {p.pg_name} ({p.area || p.city})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#cbd5e1" }}>
                Rating (1 - 5 Stars) *
              </label>
              <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", paddingTop: "4px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.5rem", color: star <= rating ? "#f59e0b" : "#475569" }}
                  >
                    ★
                  </button>
                ))}
                <span style={{ marginLeft: "8px", fontWeight: 700, color: "#f59e0b" }}>{rating}.0 / 5.0</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#cbd5e1" }}>
              Your Review / Experience
            </label>
            <textarea
              rows="3"
              placeholder="Tell others about the rooms, food, owner behavior, cleanliness..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", background: "rgba(30, 41, 59, 0.8)", border: "1px solid rgba(255, 255, 255, 0.15)", color: "#fff", resize: "vertical" }}
            ></textarea>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-shine">
            <i className={`fas ${submitting ? "fa-spinner fa-spin" : "fa-paper-plane"}`} style={{ marginRight: "6px" }}></i>
            {submitting ? "Saving to MySQL..." : "Submit Review"}
          </button>
        </form>
      </div>

      {/* Your Submitted Reviews List */}
      <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1rem" }}>Your Submitted Reviews</h2>
      {loading ? (
        <div className="state-card">
          <div className="spinner"></div>
          <p>Loading your reviews from database…</p>
        </div>
      ) : reviews.length ? (
        <div className="review-list" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((rev) => (
            <article key={rev.review_id} className="card glass-card" style={{ padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.35rem" }}>
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 700, margin: 0 }}>{rev.pg_name || "PG Property"}</h3>
                  <div style={{ color: "#f59e0b", fontSize: "0.9rem" }}>
                    {"★".repeat(Math.round(rev.rating))}
                    {"☆".repeat(5 - Math.round(rev.rating))}
                    <span style={{ marginLeft: "4px", fontWeight: 700 }}>({rev.rating})</span>
                  </div>
                </div>
                <p style={{ margin: "0.4rem 0", color: "#e2e8f0", fontSize: "0.95rem", lineHeight: 1.5 }}>
                  {rev.comment || "No detailed written feedback."}
                </p>
                <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  <i className="far fa-clock" style={{ marginRight: "4px" }}></i> {rev.created_at}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => handleDeleteReview(rev.review_id)}
                style={{ color: "#ef4444", borderColor: "rgba(239,68,68,0.3)" }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </article>
          ))}
        </div>
      ) : (
        <div className="state-card glass-card">
          <i className="far fa-star" style={{ fontSize: "2.5rem", color: "#f59e0b", marginBottom: "1rem" }}></i>
          <h3>No reviews submitted yet</h3>
          <p>Use the form above to share your experience with any PG property in our network.</p>
        </div>
      )}
    </section>
  );
}

