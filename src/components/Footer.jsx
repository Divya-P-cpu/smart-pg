import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-wave" aria-hidden="true">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,32 C240,64 480,0 720,24 C960,48 1200,8 1440,28 L1440,60 L0,60 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="footer-main">
        <div className="footer-col footer-brand">
          <div className="footer-logo">
            <i className="fas fa-house-chimney"></i> Smart&nbsp;PG
          </div>
          <p>
            Find premium PG & co-living accommodations matched to your budget,
            location and lifestyle — with real-time bed availability.
          </p>
          <div className="footer-socials">
            <a href="#" aria-label="Twitter / X"><i className="fab fa-x-twitter"></i></a>
            <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
            <a href="#" aria-label="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
            <a href="#" aria-label="YouTube"><i className="fab fa-youtube"></i></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><Link to="/explore">Find a PG</Link></li>
            <li><Link to="/compare">Compare Stays</Link></li>
            <li><Link to="/register">Create Account</Link></li>
            <li><Link to="/login">Owner Login</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="mailto:support@smartpg.com">support@smartpg.com</a></li>
            <li><a href="mailto:owners@smartpg.com">owners@smartpg.com</a></li>
            <li><a href="tel:+919999977777">+91 99999 77777</a></li>
            <li><Link to="/">Help Center</Link></li>
          </ul>
        </div>

        <div className="footer-col footer-news">
          <h4>Stay in the loop</h4>
          <p>New stays and price drops, straight to your inbox.</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.currentTarget.reset();
              e.currentTarget.querySelector("input").placeholder = "Subscribed ✓";
            }}
          >
            <input type="email" placeholder="you@example.com" aria-label="Email address" required />
            <button type="submit" aria-label="Subscribe"><i className="fas fa-paper-plane"></i></button>
          </form>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 Smart PG Inc. All rights reserved.</span>
        <span className="footer-heart">Made with <i className="fas fa-heart"></i> for smart living</span>
      </div>
    </footer>
  );
}