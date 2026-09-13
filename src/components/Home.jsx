import { useState, useEffect, useRef } from 'react';
import { AREAS } from '../utils/constants';
import Reveal from './Reveal';

const PG_ROOM_IMAGES = [
  {
    url: 'https://i.pinimg.com/1200x/58/10/b3/5810b3bc845c6a04ff2e9cf904db6972.jpg',
    type: 'Premium 4-Sharing',
    sharing: '4-Sharing',
    desc: 'Well-furnished with AC, locker & window access',
    tag: 'Most Popular',
    tagIcon: 'fa-fire',
    tagGradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
    kickerColor: '#ec4899',
    border: 'rgba(236, 72, 153, 0.4)',
    glow: 'rgba(236, 72, 153, 0.3)',
    glowBorder: 'rgba(244, 114, 182, 0.9)',
    chips: ['❄️ AC Included', '🔒 Personal Locker', '🪟 Window Access']
  },
  {
    url: 'https://z-cdn-media.chatglm.cn/files/34eeacd9-605b-4d3e-aa01-bdcf41ff6484.png?auth_key=1887246960-cc7918d2a4764330a77aa92c19da51ce-0-c1ac399aa6f4e74cc3c4d3d42119a35b',
    type: 'Standard 2-Sharing',
    sharing: '2-Sharing',
    desc: 'Clean interiors with study desk area',
    tag: 'Best Value',
    tagIcon: 'fa-gem',
    tagGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    kickerColor: '#10b981',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.3)',
    glowBorder: 'rgba(52, 211, 153, 0.9)',
    chips: ['📚 Study Desk', '🛏️ Twin Beds', '🚿 Attached Bath']
  },
  {
    url: 'https://z-cdn-media.chatglm.cn/files/d13b9e9a-5423-480d-9e13-861296c27e88.png?auth_key=1887246960-92c57d72567145e183b71b5beaaaa17d-0-5aef89dda65ebae736f7ba3b95cdf027',
    type: 'Modern 2-Sharing',
    sharing: '2-Sharing',
    desc: 'Minimalist setup with wardrobe & AC',
    tag: 'Newly Renovated',
    tagIcon: 'fa-wand-magic-sparkles',
    tagGradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
    kickerColor: '#06b6d4',
    border: 'rgba(6, 182, 212, 0.4)',
    glow: 'rgba(6, 182, 212, 0.3)',
    glowBorder: 'rgba(56, 189, 248, 0.9)',
    chips: ['❄️ Split AC', '🚪 Full Wardrobe', '✨ Modern Decor']
  },
  {
    url: 'https://z-cdn-media.chatglm.cn/files/8eae139e-8128-4f62-992c-6d8571726c1e.png?auth_key=1887246960-a97a078439674b85aaec0d5076230773-0-7e556fe61db01e528fdd6d6f9764f466',
    type: 'Economy 3-Sharing',
    sharing: '3-Sharing',
    desc: 'Spacious dormitory with storage units',
    tag: 'Budget Friendly',
    tagIcon: 'fa-wallet',
    tagGradient: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
    kickerColor: '#f59e0b',
    border: 'rgba(245, 158, 11, 0.4)',
    glow: 'rgba(245, 158, 11, 0.3)',
    glowBorder: 'rgba(251, 191, 36, 0.9)',
    chips: ['📦 Storage Units', '🛏️ 3 Beds', '💰 Affordable Rent']
  },
  {
    url: 'https://z-cdn-media.chatglm.cn/files/49040c1f-20cc-408b-b2a3-38d2037189b9.png?auth_key=1887246960-ec99b35f7dba44ff9ba7e5fc7bda6a7e-0-d17fba0ce7d9aac70d6d6fb0a8e8de19',
    type: 'Deluxe 2-Sharing',
    sharing: '2-Sharing',
    desc: 'Hotel-grade furnishing with workspace',
    tag: 'Premium Plus',
    tagIcon: 'fa-crown',
    tagGradient: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
    kickerColor: '#8b5cf6',
    border: 'rgba(139, 92, 246, 0.4)',
    glow: 'rgba(139, 92, 246, 0.3)',
    glowBorder: 'rgba(167, 139, 250, 0.9)',
    chips: ['🏨 Hotel Grade Bed', '💻 Work Desk', '🌟 High-End Decor']
  },
  {
    url: 'https://z-cdn-media.chatglm.cn/files/efe972bb-e504-4e04-bf38-6b7d3bfd787e.png?auth_key=1887246960-8c537ca97d3f492b89bfcc1a1f111b45-0-23a568271c1578a50f180492be0389ef',
    type: 'Co-Living Bunk Beds',
    sharing: 'Bunk Dorm',
    desc: 'Bright shared dorms for backpackers',
    tag: 'Starting Rs.3,500',
    tagIcon: 'fa-tag',
    tagGradient: 'linear-gradient(135deg, #14b8a6 0%, #0284c7 100%)',
    kickerColor: '#14b8a6',
    border: 'rgba(20, 184, 166, 0.4)',
    glow: 'rgba(20, 184, 166, 0.3)',
    glowBorder: 'rgba(45, 212, 191, 0.9)',
    chips: ['🎒 Backpacker Dorm', '💡 Individual Lamp', '🏷️ From ₹3,500/mo']
  }
];

const TESTIMONIALS = [
  { name: 'Priya Nair', role: 'Product Analyst, Madhapur', text: 'The requirement matching score is a game changer. I found a 2-sharing room within budget, two minutes from my office — booked my bed the same evening.', rating: 5, initials: 'PN' },
  { name: 'Arjun Mehta', role: 'M.Tech Student, HSR Layout', text: 'Seeing exact bed availability on the room photo removed all guesswork. No more calling ten owners just to ask "is it free?".', rating: 5, initials: 'AM' },
  { name: 'Sana Sheikh', role: 'PG Owner, Gachibowli', text: 'Listing my property took minutes. The occupancy dashboard and booking request log help me manage 24 beds without spreadsheets.', rating: 4, initials: 'SS' }
];

const STATS = [
  { icon: 'fa-building', target: 520, suffix: '+', label: 'Verified PGs' },
  { icon: 'fa-users', target: 12400, suffix: '+', label: 'Happy Residents' },
  { icon: 'fa-city', target: 26, suffix: '', label: 'Cities Covered' },
  { icon: 'fa-star-half-stroke', target: 98, suffix: '%', label: 'Match Accuracy' }
];

/* Animated counter that starts when scrolled into view */
function StatItem({ icon, target, suffix, label }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { setStarted(true); observer.disconnect(); }
      });
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return undefined;
    let raf;
    const duration = 1600;
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target]);

  return (
    <div className="stat-item" ref={ref}>
      <div className="stat-icon"><i className={`fas ${icon}`}></i></div>
      <div className="stat-value">{value.toLocaleString('en-IN')}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function Home({ onNavigateToSearch, onNavigateToLogin }) {
  const [areaInput, setAreaInput] = useState('');
  const [selectedArea, setSelectedArea] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [budget, setBudget] = useState('');
  const [sharing, setSharing] = useState(3);
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().slice(0, 10));
  const [queryName, setQueryName] = useState('');
  const [queryEmail, setQueryEmail] = useState('');
  const [queryUserType, setQueryUserType] = useState('User');
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySubmitted, setQuerySubmitted] = useState(false);
  const [heroImgIdx, setHeroImgIdx] = useState(0);
  const [visibleCards, setVisibleCards] = useState(new Set());
  const galleryRef = useRef(null);

  // Auto-cycle hero
  useEffect(() => {
    const t = setInterval(() => setHeroImgIdx(i => (i + 1) % PG_ROOM_IMAGES.length), 4500);
    return () => clearInterval(t);
  }, []);

  // Intersection observer for scroll-reveal gallery cards
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const idx = entry.target.dataset.idx;
          setVisibleCards(prev => new Set([...prev, idx]));
        }
      });
    }, { threshold: 0.15 });
    galleryRef.current?.querySelectorAll('.room-standard-card').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleQuerySubmit = (e) => {
    e.preventDefault();
    if (!queryName || !queryEmail || !queryMessage) return;
    setQuerySubmitted(true);
    setTimeout(() => { setQuerySubmitted(false); setQueryName(''); setQueryEmail(''); setQuerySubject(''); setQueryMessage(''); }, 3000);
  };

  const suggestions = areaInput ? AREAS.filter(a => a.name.toLowerCase().includes(areaInput.toLowerCase()) || a.city.toLowerCase().includes(areaInput.toLowerCase())) : [];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onNavigateToSearch({
      area: selectedArea ? selectedArea.name : areaInput,
      location: selectedArea ? selectedArea.name : areaInput,
      city: selectedArea ? selectedArea.city : 'Hyderabad',
      lat: selectedArea ? selectedArea.lat : 17.4483,
      lng: selectedArea ? selectedArea.lng : 78.3915,
      budgetMax: budget ? parseInt(budget) : null,
      sharing, moveInDate
    });
  };

  const marqueeAreas = [...AREAS.slice(0, 12), ...AREAS.slice(0, 12)];

  return (
    <div className="homepage-wrap">

      {/* ═══════ HERO WRAPPER ═══════ */}
      <section className="hero-sec-wrapper">
        <div className="hero-orb hero-orb-1" aria-hidden="true"></div>
        <div className="hero-orb hero-orb-2" aria-hidden="true"></div>
        <div className="hero-orb hero-orb-3" aria-hidden="true"></div>

        <div className="hero-sec">
          <div className="hero-content">
            <Reveal direction="down">
              <span className="hero-brand-kicker">
                <i className="fas fa-sparkles"></i> SMART PG &bull; INTELLIGENT DISCOVERY
              </span>
            </Reveal>

            <Reveal direction="up" delay={80}>
              <h1 className="hero-main-h1">
                Don&rsquo;t Just Find a PG.<br />
                <span className="highlight-text">Find a PG That Fits You.</span>
              </h1>
            </Reveal>

            <Reveal direction="up" delay={140}>
              <p className="hero-sub-description">
                A responsive platform that matches PGs and co-living spaces to what you actually need &mdash; location, budget, sharing, amenities, and real-time bed availability.
              </p>
            </Reveal>

            <Reveal direction="up" delay={180}>
              <div className="hero-feature-chips">
                <span className="hero-feature-chip"><i className="fas fa-location-dot" style={{ color: '#06b6d4' }}></i> Smart Location</span>
                <span className="hero-feature-chip"><i className="fas fa-indian-rupee-sign" style={{ color: '#f59e0b' }}></i> Budget Matching</span>
                <span className="hero-feature-chip"><i className="fas fa-users" style={{ color: '#ec4899' }}></i> Sharing Preference</span>
                <span className="hero-feature-chip"><i className="fas fa-wifi" style={{ color: '#8b5cf6' }}></i> Verified Amenities</span>
                <span className="hero-feature-chip"><i className="fas fa-bed" style={{ color: '#10b981' }}></i> Real-Time Beds</span>
              </div>
            </Reveal>

            <Reveal direction="up" delay={220}>
              <div className="hero-actions">
                <button className="hero-btn-primary btn-shine" onClick={() => onNavigateToSearch(null)}>
                  Find Your Perfect PG <i className="fas fa-arrow-right"></i>
                </button>
                <button className="hero-btn-secondary" onClick={() => onNavigateToLogin('owner')}>
                  I'm a PG Owner <i className="fas fa-house-chimney"></i>
                </button>
              </div>

              <div className="hero-trust-row">
                <div className="avatar-stack">
                  {['PN', 'AM', 'RS', 'KT'].map((ini, i) => <span key={i} className={`avatar avatar-${i % 4}`}>{ini}</span>)}
                  <span className="avatar avatar-more">+9k</span>
                </div>
                <span className="trust-text">
                  <i className="fas fa-star" style={{ color: '#F59E0B' }}></i>
                  <strong>4.9/5</strong>&nbsp;from 2,300+ verified residents
                </span>
              </div>
            </Reveal>
          </div>

          <div className="hero-media">
            <Reveal direction="zoom" delay={140}>
              <div className="hero-image-card">
                <img src={PG_ROOM_IMAGES[heroImgIdx].url} alt="PG Room" className="hero-img hero-crossfade" key={heroImgIdx} />
                <div className="hero-img-dots">
                  {PG_ROOM_IMAGES.map((_, i) => (
                    <span
                      key={i}
                      className={`hero-dot ${i === heroImgIdx ? 'active' : ''}`}
                      onClick={() => setHeroImgIdx(i)}
                    ></span>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════ STATS STRIP ═══════ */}
      <section className="stats-strip">
        <div className="stats-inner">
          {STATS.map((s, i) => <StatItem key={i} {...s} />)}
        </div>
      </section>

      {/* ═══════ POPULAR AREAS MARQUEE ═══════ */}
      <section className="areas-marquee-section" aria-label="Popular areas">
        <div className="marquee-mask">
          <div className="marquee-track">
            {marqueeAreas.map((a, i) => (
              <button type="button" key={`${a.name}-${i}`} className="area-chip" onClick={() => onNavigateToSearch({ location: a.name, city: a.city, lat: a.lat, lng: a.lng })}>
                <i className="fas fa-location-dot"></i> {a.name}, {a.city}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ROOM TYPE GALLERY ═══════ */}
      <section className="room-standards-section">
        <Reveal direction="up">
          <div className="room-standards-heading">
            <span className="room-standards-pill-badge">
              <i className="fas fa-wand-magic-sparkles" style={{ marginRight: '5px' }}></i> Room Standards
            </span>
            <h2 className="room-standards-main-title">Room Standards That Fit Your Lifestyle</h2>
            <p className="room-standards-sub-text">
              From practical shared rooms to premium spaces, explore verified comfort tiers with complete transparency.
            </p>
          </div>
        </Reveal>
        <div className="room-standards-grid" ref={galleryRef}>
          {PG_ROOM_IMAGES.map((img, i) => (
            <button
              type="button"
              key={img.type}
              className={`room-standard-card ${visibleCards.has(String(i)) ? 'is-visible' : ''}`}
              data-idx={String(i)}
              onClick={() => onNavigateToSearch(null)}
              aria-label={`Explore ${img.type} PGs`}
              style={{
                '--card-tag-gradient': img.tagGradient,
                '--card-glow': img.glow,
                '--card-border': img.border,
                '--card-glow-border': img.glowBorder,
                '--card-kicker-color': img.kickerColor
              }}
            >
              {/* Top Image Container */}
              <div className="room-img-container">
                <img src={img.url} alt={img.type} loading="lazy" />
                <span className="room-top-tag">
                  <i className={`fas ${img.tagIcon}`}></i> {img.tag}
                </span>
                <span className="room-sharing-badge">
                  <i className="fas fa-bed"></i> {img.sharing}
                </span>
              </div>

              {/* Bottom Content Body */}
              <div className="room-body-container">
                <div>
                  <span className="room-card-kicker">
                    <i className="fas fa-circle-check" style={{ fontSize: '11px' }}></i> Verified Room Type
                  </span>
                  <h3 className="room-card-title">{img.type}</h3>
                  <p className="room-card-desc">{img.desc}</p>

                  <div className="room-chips-row">
                    {img.chips && img.chips.map((chip, ci) => (
                      <span key={ci} className="room-chip">{chip}</span>
                    ))}
                  </div>
                </div>

                <div className="room-explore-cta">
                  Explore {img.type} <i className="fas fa-arrow-right"></i>
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className="room-standards-note">
          <i className="fas fa-circle-check" aria-hidden="true"></i>
          <span>Photos show typical room standards. Availability, furnishing, and pricing are confirmed on each property page.</span>
        </div>
      </section>

      {/* ═══════ SEARCH PREVIEW ═══════ */}
      <section className="search-preview-section">
        <div className="search-preview-bg-orb search-preview-bg-orb-one"></div>
        <div className="search-preview-bg-orb search-preview-bg-orb-two"></div>
        <div className="search-preview-bg-grid" aria-hidden="true"></div>
        <Reveal direction="zoom">
          <div className="section-header text-center search-preview-heading">
            <span className="sub-title search-preview-kicker">
              <i className="fas fa-sparkles"></i> Start Your Search
            </span>
            <h2>Find Your Perfect Stay</h2>
            <p>Configure your preferences to see matching PGs instantly</p>
            <div className="search-preview-trust-row" aria-label="Search benefits">
              <span><i className="fas fa-bolt"></i> Instant matches</span>
              <span><i className="fas fa-shield-heart"></i> Verified PGs</span>
              <span><i className="fas fa-route"></i> Smart area fit</span>
            </div>
          </div>
        </Reveal>
        <Reveal direction="up" delay={120}>
          <form onSubmit={handleSearchSubmit} className="search-preview-card glass-card">
            <div className="search-card-glow" aria-hidden="true"></div>
            <div className="preview-grid">
              <div className="input-group-preview location-group">
                <label><i className="fas fa-location-dot"></i> Where do you want to stay?</label>
                <input type="text" placeholder="Search area (e.g. Madhapur, HSR Layout)" value={areaInput} onChange={(e) => { setAreaInput(e.target.value); setSelectedArea(null); setShowSuggestions(true); }} onFocus={() => setShowSuggestions(true)} />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="preview-suggestions-box">{suggestions.map((area, idx) => (
                    <div key={idx} className="suggestion-row" onClick={() => { setSelectedArea(area); setAreaInput(`${area.name}, ${area.city}`); setShowSuggestions(false); }}>
                      <i className="fas fa-location-crosshairs text-green"></i>
                      <div><strong>{area.name}</strong><span>{area.city}</span></div>
                    </div>
                  ))}</div>
                )}
              </div>
              <div className="input-group-preview"><label><i className="fas fa-indian-rupee-sign"></i> Max Budget</label><input type="number" placeholder="e.g. 8000" value={budget} onChange={(e) => setBudget(e.target.value)} /></div>
              <div className="input-group-preview">
                <label><i className="fas fa-user-group"></i> Sharing Preference</label>
                <div className="sharing-selector">{[1, 2, 3, 4, 5].map(n => (<button key={n} type="button" className={`sharing-btn ${sharing === n ? 'active' : ''}`} onClick={() => setSharing(n)}>{n} <span className="sharing-lbl">{n === 1 ? 'Single' : 'Share'}</span></button>))}</div>
              </div>
              <div className="input-group-preview"><label><i className="fas fa-calendar-days"></i> Move-in Date</label><input type="date" min="2026-08-20" value={moveInDate} onChange={(e) => setMoveInDate(e.target.value)} /></div>
            </div>
            <div className="search-preview-action-row">
              <button type="submit" className="btn-search-preview btn-shine"><i className="fas fa-magnifying-glass"></i> FIND MATCHING PGS</button>
              <span className="search-preview-helper"><i className="fas fa-circle-check"></i> We rank PGs by your budget, area, sharing and move-in date.</span>
            </div>
          </form>
        </Reveal>
      </section>



      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="how-it-works-sec-enhanced">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: '16px' }}>
            <span className="how-it-works-badge">
              <i className="fas fa-layer-group" style={{ marginRight: '5px' }}></i> Process
            </span>
            <h2 className="how-it-works-title">HOW IT WORKS</h2>
            <p className="how-it-works-sub">A simple, 3-phase journey to finding and securing your ideal stay</p>
          </div>
        </Reveal>

        <div className="phase-pipeline-container">
          {/* PHASE 1: Discover & Preferences */}
          <Reveal direction="up" delay={80}>
            <div
              className="phase-card"
              style={{
                '--phase-gradient': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
                '--phase-glow': 'rgba(6, 182, 212, 0.25)',
                '--phase-color': '#0284c7',
                '--phase-light-bg': '#ecfeff',
                '--phase-border': 'rgba(6, 182, 212, 0.3)'
              }}
            >
              <div>
                <div className="phase-card-header">
                  <span className="phase-tag">
                    <i className="fas fa-compass"></i> Phase 01
                  </span>
                  <div className="phase-icon-badge">
                    <i className="fas fa-magnifying-glass-location"></i>
                  </div>
                </div>

                <div className="phase-title-block">
                  <h3 className="phase-title">Discover &amp; Target</h3>
                  <p className="phase-subtitle">Define your preferences, locality, and budget parameters</p>
                </div>

                <div className="phase-steps-list">
                  {/* Step 1 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">1</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-location-dot" style={{ color: '#06b6d4' }}></i> Enter Location
                      </h5>
                      <p>Type in your target locality or office hub to find adjacent PGs.</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">2</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-wallet" style={{ color: '#10b981' }}></i> Define Budget
                      </h5>
                      <p>Input your max monthly rental limit without forced minimum entries.</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">3</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-calendar-check" style={{ color: '#f59e0b' }}></i> Select Move-in &amp; Amenities
                      </h5>
                      <p>Input move-in timing and check required amenities like Wi-Fi, Food, and Lift.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="phase-card-footer">
                <span><i className="fas fa-sliders" style={{ marginRight: '4px' }}></i> Steps 01 – 03</span>
                <span>Custom Preferences <i className="fas fa-arrow-right"></i></span>
              </div>
            </div>
          </Reveal>

          {/* PHASE 2: AI Matching & Comparison */}
          <Reveal direction="up" delay={140}>
            <div
              className="phase-card"
              style={{
                '--phase-gradient': 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                '--phase-glow': 'rgba(139, 92, 246, 0.25)',
                '--phase-color': '#7c3aed',
                '--phase-light-bg': '#f5f3ff',
                '--phase-border': 'rgba(139, 92, 246, 0.3)'
              }}
            >
              <div>
                <div className="phase-card-header">
                  <span className="phase-tag">
                    <i className="fas fa-wand-magic-sparkles"></i> Phase 02
                  </span>
                  <div className="phase-icon-badge">
                    <i className="fas fa-scale-balanced"></i>
                  </div>
                </div>

                <div className="phase-title-block">
                  <h3 className="phase-title">Smart Match &amp; Compare</h3>
                  <p className="phase-subtitle">Evaluate dynamic compatibility and review side-by-side</p>
                </div>

                <div className="phase-steps-list">
                  {/* Step 4 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">4</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-chart-pie" style={{ color: '#8b5cf6' }}></i> View Matches
                      </h5>
                      <p>Review dynamic results sorted by an exact requirement matching score.</p>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">5</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-code-compare" style={{ color: '#ec4899' }}></i> Compare PGs
                      </h5>
                      <p>Pick top matching PGs and review amenities side-by-side.</p>
                    </div>
                  </div>

                  {/* Highlight Feature 3 */}
                  <div className="phase-step-item phase-step-item-highlight">
                    <div className="phase-step-number">
                      <i className="fas fa-bolt" style={{ fontSize: '11px' }}></i>
                    </div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-microchip" style={{ color: '#7c3aed' }}></i> Multi-Vector Engine
                      </h5>
                      <p>Scores price elasticity, commute distance, and verified facilities instantly.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="phase-card-footer">
                <span><i className="fas fa-bolt" style={{ marginRight: '4px' }}></i> Steps 04 – 05 + Smart Fit</span>
                <span>Algorithm Fit <i className="fas fa-arrow-right"></i></span>
              </div>
            </div>
          </Reveal>

          {/* PHASE 3: Bed Verification & Instant Booking */}
          <Reveal direction="up" delay={200}>
            <div
              className="phase-card"
              style={{
                '--phase-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                '--phase-glow': 'rgba(16, 185, 129, 0.25)',
                '--phase-color': '#059669',
                '--phase-light-bg': '#ecfdf5',
                '--phase-border': 'rgba(16, 185, 129, 0.3)'
              }}
            >
              <div>
                <div className="phase-card-header">
                  <span className="phase-tag">
                    <i className="fas fa-circle-check"></i> Phase 03
                  </span>
                  <div className="phase-icon-badge">
                    <i className="fas fa-key"></i>
                  </div>
                </div>

                <div className="phase-title-block">
                  <h3 className="phase-title">Select Bed &amp; Reserve</h3>
                  <p className="phase-subtitle">Choose your exact bed from room layouts and confirm</p>
                </div>

                <div className="phase-steps-list">
                  {/* Step 6 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">6</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-bed" style={{ color: '#06b6d4' }}></i> See Available Beds
                      </h5>
                      <p>Click verified room layouts and see exact available beds (marked green).</p>
                    </div>
                  </div>

                  {/* Step 7 */}
                  <div className="phase-step-item">
                    <div className="phase-step-number">7</div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-file-signature" style={{ color: '#10b981' }}></i> Submit Booking
                      </h5>
                      <p>Select a bed, review rent &amp; deposit breakdown, and request instantly.</p>
                    </div>
                  </div>

                  {/* Highlight Feature 3 */}
                  <div className="phase-step-item phase-step-item-highlight">
                    <div className="phase-step-number">
                      <i className="fas fa-shield-halved" style={{ fontSize: '11px' }}></i>
                    </div>
                    <div className="phase-step-content">
                      <h5>
                        <i className="fas fa-lock" style={{ color: '#059669' }}></i> Zero Brokerage Guarantee
                      </h5>
                      <p>Direct owner reservations with transparent deposits and digital receipt.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="phase-card-footer">
                <span><i className="fas fa-shield-halved" style={{ marginRight: '4px' }}></i> Steps 06 – 07 + Direct</span>
                <span>Zero Brokerage <i className="fas fa-check"></i></span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ BED AVAILABILITY VISUAL ═══════ */}
      <section className="bed-map-showcase-section">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: '28px' }}>
            <span className="bed-map-pill-badge">
              <i className="fas fa-bed"></i> Live Inventory Visual
            </span>
            <h2 className="bed-map-main-title">EXACT BED AVAILABILITY GRAPHICS</h2>
            <p className="bed-map-sub-text">
              See open beds inside every verified room photograph in real time before visiting
            </p>
          </div>
        </Reveal>

        <Reveal direction="zoom" delay={100}>
          <div className="bed-map-card-wrapper">
            <div className="bed-map-image-frame">
              <img
                src={PG_ROOM_IMAGES[3].url}
                alt="Room with interactive bed overlays"
              />
              <div className="bed-hotspots-overlay">
                <div className="bed-zone-card bed-zone-available" onClick={() => onNavigateToSearch(null)}>
                  <i className="fas fa-bed bed-zone-icon"></i>
                  <span className="bed-zone-name">Bed 01</span>
                  <span className="bed-zone-status-badge badge-status-available">Available</span>
                </div>
                <div className="bed-zone-card bed-zone-occupied">
                  <i className="fas fa-user bed-zone-icon"></i>
                  <span className="bed-zone-name">Bed 02</span>
                  <span className="bed-zone-status-badge badge-status-occupied">Occupied</span>
                </div>
                <div className="bed-zone-card bed-zone-reserved">
                  <i className="fas fa-clock bed-zone-icon"></i>
                  <span className="bed-zone-name">Bed 03</span>
                  <span className="bed-zone-status-badge badge-status-reserved">Reserved</span>
                </div>
              </div>
            </div>

            <div className="bed-map-legend-bar">
              {[
                { c: '#10b981', l: 'Available (Click to Book)' },
                { c: '#ef4444', l: 'Occupied' },
                { c: '#f59e0b', l: 'Reserved' },
                { c: '#64748b', l: 'Maintenance' },
              ].map((x, i) => (
                <div key={i} className="bed-legend-item">
                  <span className="bed-legend-dot" style={{ background: x.c }}></span>
                  <span>{x.l}</span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="testimonials-section">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: '28px' }}>
            <span className="testimonials-pill-badge">
              <i className="fas fa-comments"></i> Resident &amp; Owner Stories
            </span>
            <h2 className="testimonials-main-title">LOVED BY RESIDENTS &amp; OWNERS</h2>
            <p className="testimonials-sub-text">
              Real stories from verified residents who found their ideal home and owners who filled their rooms
            </p>
          </div>
        </Reveal>

        <div className="testimonials-grid">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} direction="up" delay={i * 110}>
              <div className="testimonial-card">
                <div>
                  <div className="testimonial-quote-icon">
                    <i className="fas fa-quote-left"></i>
                  </div>
                  <p className="testimonial-text">&ldquo;{t.text}&rdquo;</p>
                </div>

                <div>
                  <div className="testimonial-rating-row" aria-label={`${t.rating} out of 5 stars`}>
                    {Array.from({ length: 5 }).map((_, s) => (
                      <i key={s} className={`fas fa-star ${s < t.rating ? 'star-on' : 'star-off'}`}></i>
                    ))}
                  </div>

                  <div className="testimonial-author-row">
                    <div className="testimonial-avatar">
                      {t.initials}
                    </div>
                    <div>
                      <h4 className="testimonial-author-name">
                        {t.name} <i className="fas fa-circle-check" style={{ color: '#10b981', fontSize: '13px' }}></i>
                      </h4>
                      <p className="testimonial-author-role">{t.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════ CTAs ═══════ */}
      <section className="cta-segments">
        <Reveal direction="left">
          <div className="cta-card user-cta-card"><div className="cta-inner"><span className="cta-tag">FOR STUDENTS & PROFESSIONALS</span><h3>Looking for a hassle-free place to stay?</h3><p>Find nearby PGs, filter by sharing counts, select move-in dates, check facilities, compare rooms, check exact bed hotspots on photographs, and reserve your space.</p><button className="cta-btn btn-user-cta btn-shine" onClick={() => onNavigateToSearch(null)}>FIND YOUR PG NOW <i className="fas fa-search"></i></button></div></div>
        </Reveal>
        <Reveal direction="right">
          <div className="cta-card owner-cta-card"><div className="cta-inner"><span className="cta-tag tag-owner">FOR PROPERTY & PG OWNERS</span><h3>Want to list your properties and manage beds?</h3><p>Register your PG, upload room layouts, mark bed hotspots, set pricing packages, manage availability, review booking request logs, and check occupancy metrics.</p><button className="cta-btn btn-owner-cta btn-shine" onClick={() => onNavigateToLogin('owner')}>LIST YOUR PG NOW <i className="fas fa-house-circle-plus"></i></button></div></div>
        </Reveal>
      </section>

      {/* ═══════ SMART MATCHING DEMO ═══════ */}
      <section className="matching-section-wrapper">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: '36px' }}>
            <span className="matching-pill-badge">
              <i className="fas fa-microchip" style={{ marginRight: '5px' }}></i> Technology
            </span>
            <h2 className="matching-main-title">SMART COMPATIBILITY MATCHING</h2>
            <p className="matching-sub-text">See how well each property matches your dynamic preferences instantly</p>
          </div>
        </Reveal>

        <div className="matching-grid-showcase">
          {/* Left Panel: Real-time Algorithm & Simulated Preferences */}
          <Reveal direction="left" delay={80}>
            <div className="matching-left-panel">
              <div>
                <div className="matching-engine-header">
                  <div className="matching-engine-icon">
                    <i className="fas fa-wand-magic-sparkles"></i>
                  </div>
                  <div>
                    <h3 className="matching-engine-title">Smart Compatibility Engine</h3>
                    <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                      Live Preference Scoring
                    </span>
                  </div>
                </div>
                <p className="matching-engine-desc">
                  Our multi-vector algorithm checks price elasticity, verified room layouts, commute distance to your workplace, and desired move-in dates in milliseconds.
                </p>

                {/* Simulated Preferences Matrix */}
                <div className="matching-preferences-box">
                  <div className="matching-pref-header">
                    <span><i className="fas fa-sliders" style={{ marginRight: '6px' }}></i> Active Target Filters</span>
                    <span style={{ color: '#059669', fontWeight: 800 }}>6 Factors Evaluated</span>
                  </div>
                  <div className="matching-pref-row">
                    <span className="matching-pref-label"><i className="fas fa-wallet" style={{ color: '#6366f1' }}></i> Monthly Budget</span>
                    <span className="matching-pref-tag"><i className="fas fa-check"></i> Max ₹9,000 / mo</span>
                  </div>
                  <div className="matching-pref-row">
                    <span className="matching-pref-label"><i className="fas fa-bed" style={{ color: '#06b6d4' }}></i> Room Preference</span>
                    <span className="matching-pref-tag"><i className="fas fa-check"></i> 3-Sharing Luxury</span>
                  </div>
                  <div className="matching-pref-row">
                    <span className="matching-pref-label"><i className="fas fa-location-dot" style={{ color: '#ec4899' }}></i> Max Commute</span>
                    <span className="matching-pref-tag"><i className="fas fa-check"></i> &lt; 1.5 KM (Madhapur)</span>
                  </div>
                </div>

                {/* 3 Value Metrics */}
                <div className="matching-features-trio">
                  <div className="matching-mini-feature">
                    <span className="matching-mini-icon">⚡</span>
                    <div className="matching-mini-title">&lt; 50ms</div>
                    <div className="matching-mini-sub">Instant Match</div>
                  </div>
                  <div className="matching-mini-feature">
                    <span className="matching-mini-icon">🎯</span>
                    <div className="matching-mini-title">98.4%</div>
                    <div className="matching-mini-sub">Accuracy Rate</div>
                  </div>
                  <div className="matching-mini-feature">
                    <span className="matching-mini-icon">🛡️</span>
                    <div className="matching-mini-title">100%</div>
                    <div className="matching-mini-sub">Verified Beds</div>
                  </div>
                </div>
              </div>

              <button className="matching-cta-btn" onClick={() => onNavigateToSearch(null)}>
                <i className="fas fa-magnifying-glass-location"></i> Explore Matching PGs Now
              </button>
            </div>
          </Reveal>

          {/* Right Panel: Top Matched Property Card */}
          <Reveal direction="right" delay={120}>
            <div className="matching-card-visual">
              {/* Image & Header Overlay */}
              <div className="matching-image-wrapper">
                <img src={PG_ROOM_IMAGES[0].url} alt="Matched PG" />
                <div className="matching-image-overlay">
                  <div className="matching-top-floating-row">
                    <span className="matching-verified-chip">
                      <i className="fas fa-shield-halved"></i> Top Match
                    </span>
                    <div className="matching-badge-circle">
                      <div>96%</div>
                      <span className="matching-badge-label">Match</span>
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#ffffff', fontSize: '18px', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.4)' }}>
                      Sri Sai Luxury PG
                    </div>
                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <i className="fas fa-map-pin" style={{ color: '#38bdf8' }}></i> Madhapur, Hyderabad
                    </span>
                  </div>
                </div>
              </div>

              {/* Match Details & Progress Breakdown */}
              <div className="matching-details-box">
                {/* Visual Category Match Bars */}
                <div className="matching-bars-container">
                  <div className="matching-bar-row">
                    <span>Budget &amp; Pricing Match</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="matching-bar-track"><div className="matching-bar-fill" style={{ width: '99%' }}></div></div>
                      <span style={{ color: '#059669', fontWeight: 750 }}>99%</span>
                    </div>
                  </div>
                  <div className="matching-bar-row">
                    <span>Location &amp; Commute Match</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="matching-bar-track"><div className="matching-bar-fill" style={{ width: '95%' }}></div></div>
                      <span style={{ color: '#059669', fontWeight: 750 }}>95%</span>
                    </div>
                  </div>
                  <div className="matching-bar-row">
                    <span>Amenities &amp; Sharing Fit</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="matching-bar-track"><div className="matching-bar-fill" style={{ width: '94%' }}></div></div>
                      <span style={{ color: '#059669', fontWeight: 750 }}>94%</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Compatibility Reasons */}
                <div>
                  <div className="matching-suits-title">
                    <i className="fas fa-circle-check"></i> WHY THIS PG SUITS YOU:
                  </div>
                  <div className="matching-suits-list">
                    {[
                      'Within your budget max limit',
                      'Preferred 3-sharing bunk available',
                      'Available on your selected move-in date',
                      'Free Wi-Fi access included',
                      'Elevator/Lift access equipped',
                      'Located within 1.2 KM of your office hub'
                    ].map((t, i) => (
                      <div key={i} className="matching-suit-item">
                        <i className="fas fa-circle-check matching-suit-icon"></i>
                        <span>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════ SUPPORT ═══════ */}
      <section id="support-sec" className="support-section-wrapper">
        <Reveal direction="up">
          <div className="section-header text-center" style={{ marginBottom: '32px' }}>
            <span className="support-pill-badge">
              <i className="fas fa-headset" style={{ marginRight: '4px' }}></i> Support
            </span>
            <h2 className="support-main-title">NEED HELP?</h2>
            <p className="support-sub-text">We're here to help you find the right stay or list your property</p>
          </div>
        </Reveal>
        <div className="support-grid-layout support-grid">
          <Reveal direction="left">
            <div className="support-card-user">
              <div className="support-icon-badge-user">
                <i className="fas fa-circle-question"></i>
              </div>
              <h4 className="support-card-heading">
                For Users &amp; Guests
              </h4>
              <p className="support-card-desc">Have questions about booking requests, deposits, refunds, or sharing?</p>
              <a href="mailto:support@smartpg.com" className="support-btn-user">
                <i className="fas fa-envelope"></i> Contact User Support
              </a>
            </div>
          </Reveal>
          <Reveal direction="right">
            <div className="support-card-owner">
              <div className="support-icon-badge-owner">
                <i className="fas fa-screwdriver-wrench"></i>
              </div>
              <h4 className="support-card-heading">
                For PG &amp; Property Owners
              </h4>
              <p className="support-card-desc">Need help with listing, layout mapping, or occupancy logs?</p>
              <a href="mailto:owners@smartpg.com" className="support-btn-owner">
                <i className="fas fa-envelope-open-text"></i> Contact Owner Support
              </a>
            </div>
          </Reveal>
        </div>
        <Reveal direction="up" delay={120}>
          <div className="support-form-card-enhanced">
            <h3 className="support-form-title">Have a question or suggestion?</h3>
            <p className="support-form-subtitle">Fill out the form below and our team will get back to you shortly.</p>
            {querySubmitted ? (
              <div className="support-success-badge">
                <i className="fas fa-circle-check" style={{ marginRight: '8px', fontSize: '18px' }}></i> Message sent successfully! Thank you.
              </div>
            ) : (
              <form onSubmit={handleQuerySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div className="input-g" style={{ flex: '1 1 200px', margin: 0 }}>
                    <label className="support-form-label">Your Name *</label>
                    <input
                      type="text"
                      className="support-custom-input"
                      placeholder="Rahul Sharma"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="input-g" style={{ flex: '1 1 200px', margin: 0 }}>
                    <label className="support-form-label">Your Email *</label>
                    <input
                      type="email"
                      className="support-custom-input"
                      placeholder="rahul@example.com"
                      value={queryEmail}
                      onChange={(e) => setQueryEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <div className="input-g" style={{ flex: '1 1 200px', margin: 0 }}>
                    <label className="support-form-label">User Type</label>
                    <select
                      className="support-custom-select"
                      value={queryUserType}
                      onChange={(e) => setQueryUserType(e.target.value)}
                    >
                      <option value="User">User / Guest</option>
                      <option value="PG Owner">PG Owner</option>
                    </select>
                  </div>
                  <div className="input-g" style={{ flex: '1 1 200px', margin: 0 }}>
                    <label className="support-form-label">Subject</label>
                    <input
                      type="text"
                      className="support-custom-input"
                      placeholder="Feature Suggestion"
                      value={querySubject}
                      onChange={(e) => setQuerySubject(e.target.value)}
                    />
                  </div>
                </div>
                <div className="input-g" style={{ margin: 0 }}>
                  <label className="support-form-label">Message *</label>
                  <textarea
                    className="support-custom-textarea"
                    placeholder="Type your message..."
                    value={queryMessage}
                    onChange={(e) => setQueryMessage(e.target.value)}
                    required
                    style={{ minHeight: '90px', resize: 'vertical' }}
                  />
                </div>
                <button type="submit" className="support-submit-btn-vibrant">
                  SEND MESSAGE <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
