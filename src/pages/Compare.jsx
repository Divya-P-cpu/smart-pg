import { useMemo } from "react";
import { Link } from "react-router-dom";

export default function Compare() {
  const listings = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("smartPgComparison") || "[]");
    } catch {
      return [];
    }
  }, []);

  if (!listings.length) return (
    <div className="state-card glass-card">
      <i className="fas fa-scale-balanced"></i>
      <h3>No properties selected</h3>
      <p>Select up to three options from Explore PGs to compare their important details.</p>
      <Link className="btn btn-primary" to="/explore">Explore PGs</Link>
    </div>
  );

  const rows = [
    ["Area", pg => `${pg.area || "—"}, ${pg.city || ""}`],
    ["Monthly rent", pg => pg.min_rent ? `₹${Number(pg.min_rent).toLocaleString("en-IN")}` : "—"],
    ["Gender policy", pg => pg.gender_policy || "—"],
    ["Amenities", pg => pg.amenities?.join(", ") || "Not listed"],
    ["Availability", pg => pg.is_active ? "Listing active — open bed map" : "Unavailable"]
  ];

  return (
    <section className="compare-page">
      <div className="page-heading">
        <span className="sub-title">Decision helper</span>
        <h1>Compare your top choices</h1>
        <p>Compare property facts, then open a listing to see its exact live bed positions.</p>
      </div>

      <div className="comparison-table-wrap">
        <div className="comparison-table">
          <div className="comparison-row comparison-header">
            <div className="comparison-cell">Compare</div>
            {listings.map(pg => (
              <div key={pg.pg_id} className="comparison-cell comparison-header-cell">{pg.pg_name}</div>
            ))}
          </div>
          {rows.map(([label, value]) => (
            <div key={label} className="comparison-row">
              <div className="comparison-cell comparison-label">{label}</div>
              {listings.map(pg => (
                <div key={pg.pg_id} className="comparison-cell">{value(pg)}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <Link className="btn btn-primary" to="/explore">Back to results</Link>
    </section>
  );
}
