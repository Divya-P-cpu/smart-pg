import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AMENITIES, CITIES } from "../utils/constants";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const DEFAULT_DATE = new Date().toISOString().slice(0, 10);

export default function UserPreferences() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const previous = location.state || {};

  const [form, setForm] = useState({
    city: previous.city || "Hyderabad",
    area: previous.area || "",
    minBudget: previous.budgetMin || "",
    maxBudget: previous.budgetMax || "",
    people: previous.people || 1,
    sharing: previous.sharing || "",
    moveInDate: previous.moveInDate || DEFAULT_DATE,
    gender: previous.gender || "",
    amenities: previous.amenities || [],
    liftRequired: previous.liftRequired || false
  });
  const [saving, setSaving] = useState(false);
  const [dbNotice, setDbNotice] = useState("");

  // Load user preferences from real MySQL database on load
  useEffect(() => {
    if (user) {
      api.get("/api/preferences")
        .then((res) => {
          if (res.data) {
            const d = res.data;
            setForm((curr) => ({
              ...curr,
              city: d.city || curr.city,
              area: d.area || curr.area,
              minBudget: d.min_budget !== null && d.min_budget !== undefined ? d.min_budget : curr.minBudget,
              maxBudget: d.max_budget !== null && d.max_budget !== undefined ? d.max_budget : curr.maxBudget,
              sharing: d.sharing ? d.sharing.replace(/\D/g, "") : curr.sharing,
              gender: d.gender || curr.gender,
              moveInDate: d.move_in_date || curr.moveInDate,
              amenities: Array.isArray(d.amenities) && d.amenities.length > 0 ? d.amenities : curr.amenities,
              liftRequired: Boolean(d.lift_required)
            }));
            if (d.preference_id) {
              setDbNotice(`Loaded saved preferences (${d.preference_id}) from database.`);
            }
          }
        })
        .catch((err) => console.warn("Could not load saved database preferences:", err));
    }
  }, [user]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const toggleAmenity = (value) => {
    setForm((current) => ({
      ...current,
      amenities: current.amenities.includes(value)
        ? current.amenities.filter((item) => item !== value)
        : [...current.amenities, value]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setDbNotice("Saving preferences to database...");

    try {
      if (user) {
        await api.post("/api/preferences", {
          city: form.city,
          area: form.area,
          min_budget: form.minBudget === "" ? null : Number(form.minBudget),
          max_budget: form.maxBudget === "" ? null : Number(form.maxBudget),
          people: Number(form.people),
          sharing: form.sharing,
          gender: form.gender,
          move_in_date: form.moveInDate || null,
          amenities: form.amenities,
          lift_required: form.liftRequired
        });
      }
    } catch (err) {
      console.error("Failed to persist preferences to MySQL:", err);
    } finally {
      setSaving(false);
      navigate("/explore", {
        state: {
          city: form.city,
          area: form.area,
          budgetMin: form.minBudget === "" ? "" : Number(form.minBudget),
          budgetMax: form.maxBudget === "" ? "" : Number(form.maxBudget),
          people: Number(form.people),
          sharing: form.sharing,
          moveInDate: form.moveInDate,
          gender: form.gender,
          amenities: form.amenities,
          liftRequired: form.liftRequired
        }
      });
    }
  };

  return (
    <div className="preferences-page-wrap">
      <div className="preferences-intro">
        <span className="sub-title">Personalized search</span>
        <h1>Tell us what your ideal PG looks like</h1>
        <p>Set your requirements once and we will show stays that fit your budget, move-in plan, sharing needs, and amenities.</p>
        {dbNotice && (
          <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>
            <i className="fas fa-database"></i> {dbNotice}
          </div>
        )}
      </div>

      <form className="preferences-card glass-card" onSubmit={handleSubmit}>
        <div className="preferences-section-heading">
          <span className="preferences-step">01</span>
          <div><h2>Where are you moving?</h2><p>Start with the city and locality closest to your work or college.</p></div>
        </div>
        <div className="preferences-grid two-columns">
          <div className="input-g"><label>City *</label><select value={form.city} onChange={(event) => update("city", event.target.value)}>{CITIES.map((city) => <option key={city}>{city}</option>)}</select></div>
          <div className="input-g"><label>Area / Landmark</label><input type="text" placeholder="e.g. Madhapur, HSR Layout" value={form.area} onChange={(event) => update("area", event.target.value)} /></div>
        </div>

        <div className="preferences-section-heading">
          <span className="preferences-step">02</span>
          <div><h2>What fits your budget?</h2><p>Choose a range that works for your monthly rent.</p></div>
        </div>
        <div className="preferences-grid two-columns">
          <div className="input-g"><label>Minimum Budget</label><input type="number" min="0" placeholder="₹ 5,000" value={form.minBudget} onChange={(event) => update("minBudget", event.target.value)} /></div>
          <div className="input-g"><label>Maximum Budget</label><input type="number" min="0" placeholder="₹ 10,000" value={form.maxBudget} onChange={(event) => update("maxBudget", event.target.value)} /></div>
        </div>

        <div className="preferences-section-heading">
          <span className="preferences-step">03</span>
          <div><h2>Who is moving in?</h2><p>Help us find the right room size and house policy.</p></div>
        </div>
        <div className="preferences-grid three-columns">
          <div className="input-g"><label>Number of People *</label><input type="number" min="1" max="10" value={form.people} onChange={(event) => update("people", event.target.value)} /></div>
          <div className="input-g"><label>Sharing Preference</label><select value={form.sharing} onChange={(event) => update("sharing", event.target.value)}><option value="">Any Sharing</option>{[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value === 1 ? "Single" : `${value} Sharing`}</option>)}</select></div>
          <div className="input-g"><label>Gender Policy</label><select value={form.gender} onChange={(event) => update("gender", event.target.value)}><option value="">All Genders</option><option value="Male">Male Only</option><option value="Female">Female Only</option><option value="Unisex">Unisex Co-living</option></select></div>
        </div>

        <div className="preferences-grid one-column">
          <div className="input-g"><label>Preferred Move-in Date *</label><input type="date" min={DEFAULT_DATE} value={form.moveInDate} onChange={(event) => update("moveInDate", event.target.value)} /></div>
        </div>

        <div className="preferences-section-heading">
          <span className="preferences-step">04</span>
          <div><h2>Which amenities matter?</h2><p>Select everything you expect from your new place.</p></div>
        </div>
        <div className="amenity-preferences">
          {AMENITIES.map((amenity) => (
            <button
              type="button"
              key={amenity.value}
              className={`amenity-preference ${form.amenities.includes(amenity.value) ? "selected" : ""}`}
              onClick={() => toggleAmenity(amenity.value)}
            >
              <i className={`fas ${amenity.icon}`}></i>
              {amenity.label}
              <i className="fas fa-check check-icon"></i>
            </button>
          ))}
        </div>
        <label className="preference-check"><input type="checkbox" checked={form.liftRequired} onChange={(event) => update("liftRequired", event.target.checked)} /> Lift access is required</label>

        <div className="preferences-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/explore")}>Skip for now</button>
          <button type="submit" disabled={saving} className="btn btn-primary btn-shine">
            <i className={`fas ${saving ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`}></i> {saving ? "Saving to Database..." : "Save & Find Matching PGs"}
          </button>
        </div>
      </form>
    </div>
  );
}
