import { useState } from "react";
import { api } from "../utils/api";

const confirmed = (status) => ["accepted", "completed"].includes(String(status || "").toLowerCase());

export default function JourneyPlanner({ booking }) {
  const unlocked = confirmed(booking.status);
  const [open, setOpen] = useState(false);
  const [journey, setJourney] = useState(null);
  const [origin, setOrigin] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState("");

  const openPlanner = async () => {
    if (!unlocked) return;
    setOpen(true);
    if (journey || loading) return;
    setLoading(true); setError("");
    try { setJourney((await api.get(`/api/transport/booking/${booking.booking_id}`)).data); }
    catch (requestError) { setError(requestError.response?.data?.detail || "Route guidance is unavailable for this booking right now."); }
    finally { setLoading(false); }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { setError("Your browser does not support location access. Enter a starting location instead."); return; }
    setLocating(true); setError("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { setOrigin(`${coords.latitude.toFixed(6)},${coords.longitude.toFixed(6)}`); setLocating(false); },
      () => { setError("We couldn't access your location. You can enter your starting location manually."); setLocating(false); },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const openMap = () => {
    if (!journey || !journey.maps_destination_url) {
      setError("Live directions are not available for this booking yet.");
      return;
    }
    if (!origin.trim()) {
      setError("Add a starting location before opening directions.");
      return;
    }
    const url = new URL(journey.maps_destination_url);
    url.searchParams.set("origin", origin.trim());
    window.open(url.toString(), "_blank", "noopener,noreferrer");
  };

  return <section className={`journey-planner ${unlocked ? "is-unlocked" : "is-locked"}`}>
    <div className="journey-glow journey-glow-one" /><div className="journey-glow journey-glow-two" />
    <div className="journey-heading">
      <div className="journey-icon"><i className={`fas ${unlocked ? "fa-route" : "fa-lock"}`} /></div>
      <div><span className="journey-eyebrow">{unlocked ? "Your PG is ready" : "Available after confirmation"}</span><h3>How to Reach Your PG</h3><p>{unlocked ? "Plan a public-transport journey to your confirmed home." : "Route guidance unlocks when the owner confirms your booking."}</p></div>
      <button type="button" className="journey-toggle" onClick={openPlanner} disabled={!unlocked}>{unlocked ? <><span>Plan journey</span><i className="fas fa-arrow-right" /></> : <><i className="fas fa-lock" /><span>Locked</span></>}</button>
    </div>
    {open && <div className="journey-body">
      {loading && <div className="journey-loading"><span className="spinner" /> Preparing your destination…</div>}
      {!loading && error && <div className="journey-alert"><i className="fas fa-circle-info" />{error}</div>}
      {!loading && journey && <>
        <div className="journey-route-line"><div className="route-point source"><i className="fas fa-location-crosshairs" /></div><div className="route-dashes"><span /><span /><span /></div><div className="route-point destination"><i className="fas fa-house" /></div><div className="route-labels"><span>{origin.trim() ? `From: ${origin.trim()}` : "Your starting point"}</span><strong>{journey.destination.pg_name}</strong></div></div>
        <div className="journey-origin-row"><label htmlFor={`origin-${booking.booking_id}`}>Start from</label><div className="journey-origin-control"><i className="fas fa-location-dot" /><input id={`origin-${booking.booking_id}`} value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder="Enter area, landmark, or address" /><button type="button" onClick={useMyLocation} disabled={locating} title="Use my current location"><i className={`fas ${locating ? "fa-spinner fa-spin" : "fa-crosshairs"}`} /></button></div></div>
        <div className="journey-destination"><i className="fas fa-location-dot" /><div><small>Confirmed destination</small><strong>{journey.destination.address}</strong></div></div>
        <div className="journey-options"><div className="journey-option active"><i className="fas fa-train-subway" /><div><strong>Metro + bus</strong><span>Best balance when local transit is available</span></div><i className="fas fa-star" /></div><div className="journey-option"><i className="fas fa-bus-simple" /><div><strong>Public bus</strong><span>Compare available options in Maps</span></div></div><div className="journey-option"><i className="fas fa-person-walking" /><div><strong>Walking + transit</strong><span>Helpful for first and last mile</span></div></div></div>
        <p className="journey-disclaimer"><i className="fas fa-satellite-dish" /> {journey.message}</p>
        <div className="journey-actions"><button type="button" className="btn btn-primary" onClick={openMap}><i className="fas fa-map-location-dot" /> Open live transit directions</button><button type="button" className="btn btn-secondary" onClick={() => setOpen(false)}>Collapse</button></div>
      </>}
    </div>}
  </section>;
}
