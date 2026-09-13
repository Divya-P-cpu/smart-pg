import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();

  return (
    <section className="account-page">
      <div className="page-heading">
        <span className="sub-title">Account</span>
        <h1>Your profile</h1>
        <p>Use the search filters to keep your accommodation preferences current.</p>
      </div>

      <div className="profile-card card glass-card">
        <div className="profile-avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div>
        <div className="profile-info">
          <h2>{user?.name || "Smart PG member"}</h2>
          <p>{user?.email || "Email not available"}</p>
          <span className="profile-role">{user?.role === "owner" ? "Property owner" : "Guest / seeker"}</span>
        </div>
      </div>

      <div className="card profile-preferences glass-card">
        <h2>Search preferences</h2>
        <p>Your selected location, budget, sharing choice, move-in date and amenities are applied in the Explore page.</p>
        <Link className="btn btn-primary" to="/explore">Update search preferences</Link>
      </div>
    </section>
  );
}
