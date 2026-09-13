import { useState, useEffect } from "react";
import { FI, FL } from "../utils/constants";

function getPgImageUrl(pgId) {
  return `https://picsum.photos/seed/${encodeURIComponent(pgId)}/800/500`;
}

function getGenderLabel(gender) {
  if (!gender) return "Unisex";
  return gender;
}

function getAmenityKey(amenity) {
  const value = String(amenity || "").toLowerCase();
  if (value.includes("wi-fi") || value.includes("wifi") || value.includes("internet")) return "wifi";
  if (value.includes("food") || value.includes("meals")) return "food";
  if (value.includes("hot water") || value.includes("geyser")) return "hot_water";
  if (value.includes("washing") || value.includes("laundry")) return "laundry";
  if (value === "ac" || value.includes("air conditioning")) return "ac";
  if (value.includes("parking")) return "parking";
  if (value.includes("cctv")) return "cctv";
  if (value.includes("lift")) return "lift";
  if (value.includes("power backup")) return "power_backup";
  if (value.includes("housekeeping")) return "housekeeping";
  if (value.includes("study")) return "study_table";
  if (value.includes("locker") || value.includes("personal locker")) return "locker";
  if (value.includes("attached bathroom") || value.includes("attached bath")) return "attached_bath";
  if (value.includes("kitchen")) return "kitchen";
  if (value.includes("tv")) return "tv";
  if (value.includes("security")) return "security";
  return "";
}

function buildAmenityChips(amenities) {
  const seen = new Set();
  return amenities.reduce((chips, item) => {
    const key = getAmenityKey(item);
    const label = FL[key] || item;
    const dedupeKey = String(key || label).toLowerCase();
    if (!label || seen.has(dedupeKey)) return chips;
    seen.add(dedupeKey);
    chips.push({ key: key || dedupeKey, label });
    return chips;
  }, []);
}

export default function PGCard({
  pg,
  isSaved,
  isCompared,
  onToggleSave,
  onToggleCompare,
  onViewDetails,
  rank,
  isWhyOpen = false,
  onToggleWhyMatch
}) {
  const rent = pg?.selected_rent ?? pg?.min_rent;
  const deposit = pg?.selected_security_deposit ?? (rent ? rent : null);
  const amenities = Array.isArray(pg?.amenities) ? pg.amenities : [];
  const availableBeds = Number(pg?.available_bed_count || 0);
  const matchingRooms = Array.isArray(pg?.rooms) ? pg.rooms : [];
  const compatibility = pg?.match?.compatibility || {};
  const compatibilityScore = Number(compatibility.percentage ?? pg?.match?.score ?? 0);
  const compatibilityFactors = Array.isArray(compatibility.factors) ? compatibility.factors : [];
  const recommendationReasons = pg?.match?.reasons || [];
  const compatibilityWarnings = pg?.match?.warnings || [];
  const dbReasons = Array.isArray(pg?.recommendation_reasons) ? pg.recommendation_reasons : [];
  const hasWhyThisMatchData = compatibilityScore > 0 || compatibilityFactors.length > 0 || recommendationReasons.length > 0 || compatibilityWarnings.length > 0 || dbReasons.length > 0;
  const canShowWhyThisMatch = hasWhyThisMatchData && typeof onToggleWhyMatch === "function";
  const sharingType = pg?.selected_sharing || (pg?.sharing ? `${pg.sharing} Sharing` : "3 Sharing");
  const amenityChips = buildAmenityChips(amenities);
  const visibleAmenityChips = amenityChips.slice(0, 4);
  const hiddenAmenityCount = Math.max(0, amenityChips.length - visibleAmenityChips.length);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice(window.matchMedia("(hover: none) and (pointer: coarse)").matches);
  }, []);

  const handleTilt = (event) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || event.pointerType === "touch") return;
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty("--tilt-x", `${(-y * 4).toFixed(2)}deg`);
    card.style.setProperty("--tilt-y", `${(x * 4).toFixed(2)}deg`);
    card.style.setProperty("--pointer-x", `${((x + 0.5) * 100).toFixed(2)}%`);
    card.style.setProperty("--pointer-y", `${((y + 0.5) * 100).toFixed(2)}%`);
  };

  const resetTilt = (event) => {
    event.currentTarget.style.removeProperty("--tilt-x");
    event.currentTarget.style.removeProperty("--tilt-y");
  };

  const matchScore = pg?.match?.score || compatibilityScore || 0;
  const matchClass = matchScore >= 80 ? "match-high" : matchScore >= 50 ? "match-med" : "match-low";

  return (
    <div
      className="pg-card interactive-pg-card glass-card"
      {...(!isTouchDevice ? { onPointerMove: handleTilt, onPointerLeave: resetTilt } : {})}
    >
      <div className="pg-card-image">
        <img src={pg?.images?.[0] || getPgImageUrl(pg?.pg_id)} alt={pg?.pg_name || "PG"} loading="lazy" />
        {pg?.is_active && (
          <span className="status-badge available">
            <i className="fas fa-circle-check"></i> Available
          </span>
        )}
        {matchScore > 0 && (
          <span className="match-badge">
            {rank ? `#${rank} · ` : ""}{matchScore}% Match
          </span>
        )}
        <button
          type="button"
          className={`save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onToggleSave(pg.pg_id)}
          aria-label={isSaved ? "Remove from saved" : "Save PG"}
        >
          <i className={`${isSaved ? "fas" : "far"} fa-heart`}></i>
        </button>
      </div>

      <div className="pg-card-body">
        <h3 className="pg-card-title-main">{pg?.pg_name || "Unnamed PG"}</h3>

        <div className="pg-location">
          <i className="fas fa-location-dot"></i>
          {pg?.area || "Area not available"}
          {pg?.city && ` · ${pg.city}`}
          {sharingType && ` · ${sharingType}`}
        </div>

        <div className="pg-rent">
          {rent !== null && rent !== undefined && rent !== "" ? (
            <>
              <span className="amount">₹{Number(rent).toLocaleString("en-IN")}</span>
              <span className="per">/month</span>
            </>
          ) : (
            <span className="amount muted">Rent not available</span>
          )}
        </div>

        <div className="pg-meta pg-price-subline">
          <span className="meta-gender">{getGenderLabel(pg?.gender_policy)}</span>
          {deposit !== null && deposit !== undefined && (
            <span className="meta-deposit">₹{Number(deposit).toLocaleString("en-IN")} deposit</span>
          )}
        </div>

        <div className="pg-availability-line">
          <i className="fas fa-door-open"></i>
          <span>{matchingRooms.length} matching room{matchingRooms.length === 1 ? "" : "s"} · {availableBeds} bed{availableBeds === 1 ? "" : "s"} available</span>
        </div>

        <div className="pg-amenities">
          {visibleAmenityChips.length > 0 ? (
            <>
              {visibleAmenityChips.map((item, index) => (
                <span className="amenity" key={`${item.key}-${index}`}>
                  <i className={`fas ${FI[item.key] || "fa-check"}`}></i>
                  {item.label}
                </span>
              ))}
              {hiddenAmenityCount > 0 && <span className="amenity more">+{hiddenAmenityCount}</span>}
            </>
          ) : (
            <span className="amenity muted">No amenities listed</span>
          )}
        </div>

        {canShowWhyThisMatch && (
          <button
            type="button"
            className={`why-match-pill ${isWhyOpen ? "open" : ""}`}
            onClick={() => onToggleWhyMatch?.(pg.pg_id)}
            aria-expanded={isWhyOpen}
          >
            <span><i className="fas fa-sparkles"></i> Why This Match</span>
            <span className={`why-match-mini-score ${matchClass}`}>{matchScore}%</span>
            <i className={`fas fa-chevron-${isWhyOpen ? "up" : "down"}`}></i>
          </button>
        )}
      </div>

      <div className="pg-card-footer">
        <label className="compare-check">
          <input
            type="checkbox"
            checked={isCompared}
            onChange={() => onToggleCompare(pg.pg_id)}
          />
          Compare
        </label>
        <button className="btn-details btn-shine" onClick={() => onViewDetails(pg.pg_id)}>
          VIEW DETAILS <i className="fas fa-arrow-right" style={{ fontSize: '10px', marginLeft: '4px' }}></i>
        </button>
      </div>
    </div>
  );
}
