import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  // Add shadow / shrink the header once the page is scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu whenever route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const navLinks = user
    ? user.role === "owner"
      ? [
          { to: "/owner", label: "Dashboard" },
          { to: "/owner/add-pg", label: "Add PG" },
        ]
      : [
          { to: "/dashboard", label: "Dashboard" },
          { to: "/explore", label: "Explore" },
          { to: "/bookings", label: "Bookings" },
          { to: "/saved", label: "Saved" },
        ]
    : [
        { to: "/", label: "Home" },
        { to: "/services", label: "Services" },
        { to: "/explore", label: "Explore" },
      ];

  const logoTarget = user ? (user.role === "owner" ? "/owner" : "/dashboard") : "/";

  return (
    <header className={`app-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="logo">
        <i className="fas fa-house-chimney logo-icon"></i>
        <Link to={logoTarget} className="logo-link">Smart&nbsp;PG</Link>
      </div>

      <button
        type="button"
        className={`nav-burger ${menuOpen ? "open" : ""}`}
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`nav ${menuOpen ? "nav-open" : ""}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/"}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            {link.label}
          </NavLink>
        ))}
        {user ? (
          <>
            <span className="nav-user-chip">
              <i className="fas fa-circle-user"></i> {user.name || "Account"}
            </span>
            <button onClick={logout} className="btn btn-secondary btn-sm-nav">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm-nav">
              Register <i className="fas fa-arrow-right"></i>
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}