import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AMENITIES, CITIES } from "../utils/constants";
import { api } from "../utils/api";

const initialForm = { pg_name: "", property_type: "PG", gender_policy: "Unisex", city: "Hyderabad", area: "", address: "", sharing_type: "3 Sharing", rent: "", deposit: "" };

export default function AddPG() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [amenities, setAmenities] = useState([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      await api.post("/api/pgs", { ...form, rent: Number(form.rent), deposit: form.deposit ? Number(form.deposit) : undefined, amenities });
      setStatus("Property added. Add rooms and beds from Manage properties.");
      setForm(initialForm);
      setAmenities([]);
    } catch (error) {
      setStatus(error.response?.data?.detail || "Could not add this property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="owner-form-page">
      <div className="page-heading">
        <span className="sub-title">Owner workspace</span>
        <h1>Add a property</h1>
        <p>Create the listing first, then add rooms to generate bed-level availability.</p>
      </div>

      <form className="property-form card glass-card" onSubmit={submit}>
        <div className="property-form-grid">
          <label>Property name<input required value={form.pg_name} onChange={e => update("pg_name", e.target.value)} placeholder="e.g. Maple Nest PG" /></label>
          <label>Property type<select value={form.property_type} onChange={e => update("property_type", e.target.value)}><option>PG</option><option>Co-living</option><option>Serviced Apartment</option></select></label>
          <label>Gender policy<select value={form.gender_policy} onChange={e => update("gender_policy", e.target.value)}><option>Unisex</option><option>Male</option><option>Female</option></select></label>
          <label>City<select value={form.city} onChange={e => update("city", e.target.value)}>{CITIES.map(city => <option key={city}>{city}</option>)}</select></label>
          <label>Area / landmark<input required value={form.area} onChange={e => update("area", e.target.value)} placeholder="e.g. Madhapur" /></label>
          <label className="wide">Address<input required value={form.address} onChange={e => update("address", e.target.value)} placeholder="Building, street, locality" /></label>
          <label>Sharing option<select value={form.sharing_type} onChange={e => update("sharing_type", e.target.value)}>{[3, 4, 5].map(value => <option key={value} value={`${value} Sharing`}>{value} Sharing</option>)}</select></label>
          <label>Monthly rent<input required min="1" type="number" value={form.rent} onChange={e => update("rent", e.target.value)} placeholder="7000" /></label>
          <label>Refundable deposit<input min="0" type="number" value={form.deposit} onChange={e => update("deposit", e.target.value)} placeholder="Optional" /></label>
        </div>

        <fieldset className="wide">
          <legend>Amenities</legend>
          <div className="amenity-picker">
            {AMENITIES.map(item => (
              <button
                type="button"
                key={item.value}
                className={`amenity-choice ${amenities.includes(item.value) ? 'active' : ''}`}
                onClick={() => setAmenities(prev => prev.includes(item.value) ? prev.filter(x => x !== item.value) : [...prev, item.value])}
              >
                <i className={`fas ${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>

        {status && (
          <p className={`${status.startsWith("Property added") ? "form-success" : "form-error"} wide`}>
            {status}
          </p>
        )}

        <div className="wide form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate("/owner/manage-pg")}>Manage properties</button>
          <button disabled={saving} className="btn btn-primary">{saving ? "Saving..." : "Add property"}</button>
        </div>
      </form>
    </section>
  );
}
