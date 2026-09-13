import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Reveal from "../components/Reveal";

export default function Services() {
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const servicesList = [
    {
      id: "geo-commute",
      tag: "Geo & Commute Radar",
      icon: "fa-map-location-dot",
      color: "#059669",
      gradient: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
      lightBg: "#ecfdf5",
      border: "rgba(16, 185, 129, 0.28)",
      glow: "rgba(16, 185, 129, 0.22)",
      title: "Smart Location & Commute Intelligence",
      desc: "Accurately map PGs and co-living spaces around your daily workplace, tech park, or university with walking and transit radius filters.",
      features: [
        "Walking distance & metro station proximity calculator",
        "Target locality radius mapping (0.5km to 15km)",
        "Nearby essentials check: supermarkets, clinics & gyms"
      ],
      badgeText: "Transit Proximity"
    },
    {
      id: "pricing-transparency",
      tag: "Transparent Rent",
      icon: "fa-wallet",
      color: "#d97706",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
      lightBg: "#fffbeb",
      border: "rgba(245, 158, 11, 0.28)",
      glow: "rgba(245, 158, 11, 0.22)",
      title: "Budget Transparency & 0% Brokerage",
      desc: "Complete, crystal-clear pricing breakdown with zero hidden maintenance fees, transparent security deposits, and zero broker commissions.",
      features: [
        "Direct-to-owner pricing with transparent deposit terms",
        "Included amenities (Wi-Fi, Food, Power Backup, AC)",
        "Zero middleman commission or lock-in booking fees"
      ],
      badgeText: "100% Commission-Free"
    },
    {
      id: "live-bed-inventory",
      tag: "Live Room Layout",
      icon: "fa-bed",
      color: "#0284c7",
      gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
      lightBg: "#ecfeff",
      border: "rgba(6, 182, 212, 0.28)",
      glow: "rgba(6, 182, 212, 0.22)",
      title: "Interactive 3D Bed Map & Availability",
      desc: "Inspect live verified room photographs with real-time interactive bed hotspot overlays. Pick and reserve your exact bed position before visiting.",
      features: [
        "Real-time green available bed slot indicators",
        "Floor-by-floor room architecture & sharing breakdown",
        "Direct bed reservation confirmation"
      ],
      badgeText: "Sub-Second Live Inventory"
    },
    {
      id: "smart-matching",
      tag: "Smart Matching",
      icon: "fa-wand-magic-sparkles",
      color: "#db2777",
      gradient: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
      lightBg: "#fdf2f8",
      border: "rgba(236, 72, 153, 0.28)",
      glow: "rgba(236, 72, 153, 0.22)",
      title: "Multi-Factor Lifestyle Fit Score",
      desc: "An intelligent compatibility algorithm that evaluates your budget, sharing preferences, gender policy, food habits, and move-in timing.",
      features: [
        "Dynamic percentage score for every accommodation",
        "Instant explanation with 'Why This Match' breakdown",
        "Personalized recommendations based on your preferences"
      ],
      badgeText: "98.4% Match Accuracy"
    },
    {
      id: "compare-matrix",
      tag: "Matrix Comparison",
      icon: "fa-code-compare",
      color: "#7c3aed",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
      lightBg: "#f5f3ff",
      border: "rgba(139, 92, 246, 0.28)",
      glow: "rgba(139, 92, 246, 0.22)",
      title: "Side-by-Side Multi-Stay Comparison",
      desc: "Select up to 3 candidate properties and compare rent, deposit, room sharing, food quality, air conditioning, and ratings side-by-side.",
      features: [
        "Side-by-side feature comparison table",
        "Direct price vs amenity metric visualization",
        "Export and share comparison summaries"
      ],
      badgeText: "Compare Up To 3 PGs"
    },
    {
      id: "owner-platform",
      tag: "Owner Portal",
      icon: "fa-house-user",
      color: "#4f46e5",
      gradient: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
      lightBg: "#eef2ff",
      border: "rgba(79, 70, 229, 0.28)",
      glow: "rgba(79, 70, 229, 0.22)",
      title: "Owner Property & Occupancy Hub",
      desc: "For PG operators: digitized floor maps, real-time bed occupancy management, automated booking requests, and tenant notifications.",
      features: [
        "Digitize room floorplans with bed coordinates",
        "Manage incoming booking requests in real-time",
        "Automate tenant move-in and rent reminders"
      ],
      badgeText: "For PG Proprietors"
    }
  ];

  const faqs = [
    {
      q: "How does the Real-Time Bed Availability map work?",
      a: "Every verified property has digitized room layout photography with mapped bed positions. When an owner updates a room or a resident reserves a bed, the map immediately updates to show which beds are Available (Green), Reserved (Orange), or Occupied (Red)."
    },
    {
      q: "Is there any brokerage or hidden registration fee?",
      a: "No! Smart PG connects tenants directly with verified PG owners. You never pay any brokerage, commission, or middleman fees."
    },
    {
      q: "How is the Smart Compatibility Score calculated?",
      a: "Our multi-vector algorithm compares your specific search filters (budget range, preferred sharing, AC/Non-AC, food preference, commute radius, and move-in date) against the property's verified live data to compute an exact percentage match."
    },
    {
      q: "Can I compare multiple PGs before making a decision?",
      a: "Yes! Use the Compare checkbox on any PG card to select up to 3 accommodations and evaluate rent, room sharing, amenities, and ratings side-by-side."
    }
  ];

  return (
    <div className="services-page-wrap">
      {/* ═══════ HERO BANNER ═══════ */}
      <section className="services-hero-section">
        <div className="services-hero-orb services-orb-1" aria-hidden="true"></div>
        <div className="services-hero-orb services-orb-2" aria-hidden="true"></div>

        <div className="services-hero-content">
          <Reveal direction="down">
            <span className="services-hero-kicker">
              <i className="fas fa-wand-magic-sparkles"></i> Comprehensive Resident &amp; Owner Services
            </span>
          </Reveal>

          <Reveal direction="up" delay={80}>
            <h1 className="services-hero-title">
              Smart Living, <br />
              <span className="highlight-text">Re-Engineered For You.</span>
            </h1>
          </Reveal>

          <Reveal direction="up" delay={140}>
            <p className="services-hero-desc">
              From sub-second live bed maps to multi-factor lifestyle matching, explore our full suite of verified PG discovery and management solutions.
            </p>
          </Reveal>

          <Reveal direction="up" delay={200}>
            <div className="services-hero-stats">
              <div className="service-stat-card">
                <span className="stat-number">140+</span>
                <span className="stat-label">Verified Properties</span>
              </div>
              <div className="service-stat-card">
                <span className="stat-number">420+</span>
                <span className="stat-label">Live Beds Available</span>
              </div>
              <div className="service-stat-card">
                <span className="stat-number">0%</span>
                <span className="stat-label">Zero Brokerage</span>
              </div>
              <div className="service-stat-card">
                <span className="stat-number">98.4%</span>
                <span className="stat-label">Match Accuracy</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ SERVICES GRID ═══════ */}
      <section className="services-grid-section">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: "2.5rem" }}>
            <span className="services-pill-badge">
              <i className="fas fa-layer-group"></i> Core Capabilities
            </span>
            <h2 className="services-section-heading">Everything You Need For Your Next Stay</h2>
            <p className="services-section-sub">
              Engineered to eliminate uncertainty, fake listings, and unexpected broker fees.
            </p>
          </div>
        </Reveal>

        <div className="services-interactive-grid">
          {servicesList.map((service, index) => (
            <Reveal direction="up" delay={index * 80} key={service.id}>
              <div
                className="service-card-enhanced"
                style={{
                  "--card-gradient": service.gradient,
                  "--card-glow": service.glow,
                  "--card-color": service.color,
                  "--card-light-bg": service.lightBg,
                  "--card-border": service.border
                }}
              >
                <div className="service-card-header">
                  <span className="service-card-tag">
                    <i className={`fas ${service.icon}`}></i> {service.tag}
                  </span>
                  <div className="service-card-icon-box">
                    <i className={`fas ${service.icon}`}></i>
                  </div>
                </div>

                <h3 className="service-card-title">{service.title}</h3>
                <p className="service-card-desc">{service.desc}</p>

                <div className="service-features-list">
                  {service.features.map((feat, fi) => (
                    <div className="service-feature-row" key={fi}>
                      <i className="fas fa-circle-check"></i>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="service-card-footer">
                  <span><i className="fas fa-shield-halved"></i> {service.badgeText}</span>
                  <button
                    className="service-card-btn"
                    onClick={() => navigate(service.id === "owner-platform" ? "/login" : "/explore")}
                  >
                    Try Feature <i className="fas fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════ HOW IT WORKS 3-STEP PIPELINE ═══════ */}
      <section className="services-pipeline-section">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: "2.5rem" }}>
            <span className="services-pill-badge">
              <i className="fas fa-route"></i> Seamless Journey
            </span>
            <h2 className="services-section-heading">How Our Platform Works</h2>
            <p className="services-section-sub">From discovery to confirmed move-in in 3 transparent steps</p>
          </div>
        </Reveal>

        <div className="pipeline-steps-grid">
          <Reveal direction="up" delay={60}>
            <div className="pipeline-step-card">
              <div className="pipeline-step-badge">Phase 01</div>
              <div className="pipeline-step-icon"><i className="fas fa-sliders"></i></div>
              <h4>Set Your Filters</h4>
              <p>Enter your target workplace locality, maximum monthly budget, preferred sharing, and move-in date.</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={140}>
            <div className="pipeline-step-card">
              <div className="pipeline-step-badge">Phase 02</div>
              <div className="pipeline-step-icon"><i className="fas fa-wand-magic-sparkles"></i></div>
              <h4>Smart Recommendation &amp; Bed Map</h4>
              <p>Review matches sorted by your exact fit score and inspect real room photos with green live bed slots.</p>
            </div>
          </Reveal>

          <Reveal direction="up" delay={220}>
            <div className="pipeline-step-card">
              <div className="pipeline-step-badge">Phase 03</div>
              <div className="pipeline-step-icon"><i className="fas fa-circle-check"></i></div>
              <h4>Direct Owner Connect</h4>
              <p>Reserve your exact bed and submit your move-in request directly to the verified owner with 0% brokerage.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ FAQ SECTION ═══════ */}
      <section className="services-faq-section">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: "2.5rem" }}>
            <span className="services-pill-badge">
              <i className="fas fa-circle-question"></i> Help &amp; FAQs
            </span>
            <h2 className="services-section-heading">Frequently Asked Questions</h2>
            <p className="services-section-sub">Have questions about our verified PG services? We've got answers.</p>
          </div>
        </Reveal>

        <div className="services-faq-accordion">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className={`faq-item-card ${activeFaq === idx ? "active" : ""}`}
              onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
            >
              <div className="faq-question-row">
                <h4><i className="fas fa-circle-info" style={{ color: "#4f46e5", marginRight: "8px" }}></i> {faq.q}</h4>
                <i className={`fas fa-chevron-${activeFaq === idx ? "up" : "down"}`}></i>
              </div>
              {activeFaq === idx && (
                <div className="faq-answer-content">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ HIGH-IMPACT CALL TO ACTION ═══════ */}
      <section className="services-cta-section">
        <div className="services-cta-card">
          <div className="services-cta-content">
            <span className="services-cta-pill">🚀 Ready To Find Your Ideal Stay?</span>
            <h2 className="services-cta-title">Experience Verified Accommodations Today</h2>
            <p className="services-cta-desc">
              Join thousands of students and working professionals discovering transparent, verified PG living spaces across top tech hubs.
            </p>
            <div className="services-cta-actions">
              <button className="btn-apply-filters btn-shine" onClick={() => navigate("/explore")}>
                Explore Verified PGs <i className="fas fa-arrow-right"></i>
              </button>
              <button className="btn-reset-filters" onClick={() => navigate("/login")}>
                I'm a PG Owner &rarr;
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
