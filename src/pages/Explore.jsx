import { Fragment, useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import PGCard from "../components/PGCard";
import Comparison from "../components/Comparison";
import { fetchPGs } from "../utils/pgApi";
import { api } from "../utils/api";
import { AMENITIES, AREAS, CITIES } from "../utils/constants";
import { calcMatch } from "../utils/calcMatch";
import { useAuth } from "../context/AuthContext";
import RoomBedLayout from "../components/RoomBedLayout";

function getFactorIcon(factor) {
  const key = String(factor?.key || factor?.label || "").toLowerCase();
  if (key.includes("location")) return "fa-location-dot";
  if (key.includes("budget")) return "fa-indian-rupee-sign";
  if (key.includes("sharing")) return "fa-bed";
  if (key.includes("gender")) return "fa-user";
  if (key.includes("amenit")) return "fa-wifi";
  if (key.includes("room") || key.includes("bed")) return "fa-door-open";
  if (key.includes("move")) return "fa-calendar-check";
  return "fa-circle-check";
}

function WhyThisMatchExpandRow({ pg }) {
  const compatibility = pg?.match?.compatibility || {};
  const score = Number(compatibility.percentage ?? pg?.match?.score ?? 0);
  const matchClass = score >= 80 ? "match-high" : score >= 50 ? "match-med" : "match-low";
  const factors = Array.isArray(compatibility.factors) ? compatibility.factors.slice(0, 4) : [];
  const dbReasons = Array.isArray(pg?.recommendation_reasons) ? pg.recommendation_reasons : [];
  const reasons = Array.from(new Set([
    ...dbReasons,
    ...(pg?.match?.reasons || []),
    ...(pg?.match?.warnings || [])
  ])).slice(0, 5);

  return (
    <div className="why-match-expand-row open">
      <div className="why-match-expand-panel">
        <div className="why-match-expand-title">
          <div className="why-match-title-group">
            <span className="why-match-eyebrow">
              <i className="fas fa-wand-magic-sparkles"></i> Smart Recommendation Analysis
            </span>
            <h3 className="why-match-heading">Lifestyle &amp; Preference Match</h3>
          </div>
          <div className={`compatibility-score-badge ${matchClass}`}>
            <span className="score-num">{score}%</span>
            <span className="score-lbl">Overall Match</span>
          </div>
        </div>

        {factors.length > 0 && (
          <div className="why-match-factor-grid">
            {factors.map((factor) => (
              <div className="why-match-factor-card" key={factor.key || factor.label}>
                <div className="why-match-factor-top">
                  <span className="factor-name">
                    <i className={`fas ${getFactorIcon(factor)} factor-icon`}></i> {factor.label}
                  </span>
                  <span className="factor-val">{factor.score}%</span>
                </div>
                <div className="why-match-factor-track">
                  <div className="why-match-factor-fill" style={{ width: `${factor.score}%` }}></div>
                </div>
                <p className="factor-detail">{factor.detail}</p>
              </div>
            ))}
          </div>
        )}

        {reasons.length > 0 && (
          <div className="why-match-reasons-container">
            <div className="reasons-header-tag">
              <i className="fas fa-circle-check" style={{ color: '#10b981' }}></i> Verified Key Highlights:
            </div>
            <div className="why-match-reasons-chips">
              {reasons.map((reason, idx) => (
                <span key={`${reason}-${idx}`} className="why-match-reason-pill">
                  <i className="fas fa-check"></i>
                  {reason}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Explore() {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const pgGridRef = useRef(null);

  const initialFilters = routerLocation.state || {};
  const [city, setCity] = useState(initialFilters.city || "Hyderabad");
  const [area, setArea] = useState(initialFilters.area || "");
  const [minBudget, setMinBudget] = useState(initialFilters.budgetMin || "");
  const [maxBudget, setMaxBudget] = useState(initialFilters.budgetMax || "");
  const [sharing, setSharing] = useState(initialFilters.sharing || "");
  const [gender, setGender] = useState(initialFilters.gender || "");
  const [moveInDate, setMoveInDate] = useState(initialFilters.moveInDate || new Date().toISOString().slice(0, 10));
  const [selectedAmenities, setSelectedAmenities] = useState(initialFilters.amenities || []);
  const [people, setPeople] = useState(initialFilters.people || 1);

  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [selectedAreaObj, setSelectedAreaObj] = useState(null);

  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [savedIds, setSavedIds] = useState(new Set());
  const [compareIds, setCompareIds] = useState(new Set());
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [customComparePgs, setCustomComparePgs] = useState(null);
  const [openWhyPgId, setOpenWhyPgId] = useState(null);
  const [gridColumnCount, setGridColumnCount] = useState(1);

  const [selectedPgDetails, setSelectedPgDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [activeDetailImage, setActiveDetailImage] = useState(0);
  const [bookingStatus, setBookingStatus] = useState("");
  const [roomLayoutSelections, setRoomLayoutSelections] = useState({});
  const [directionsStatus, setDirectionsStatus] = useState("");
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    if (user) {
      api.get("/api/favorites")
        .then((res) => setSavedIds(new Set(res.data.map(f => f.pg_id))))
        .catch(err => console.error(err));
    }
  }, [user]);

  const areaSuggestions = useMemo(() => {
    const query = area.trim().toLowerCase();
    let list = AREAS.filter(a => a.city.toLowerCase() === city.toLowerCase());
    if (query === "madhapur") {
      const related = ["HITEC City", "Kondapur", "Kavuri Hills", "Ayyappa Society", "Durgam Cheruvu"];
      const nearbyList = AREAS.filter(a => related.some(r => a.name.toLowerCase().includes(r.toLowerCase())));
      list = [...list.filter(a => a.name.toLowerCase().includes("madhapur")), ...nearbyList];
    } else if (query) {
      list = list.filter(a => a.name.toLowerCase().includes(query));
    }
    return list.slice(0, 8);
  }, [city, area]);

  const loadPGs = async () => {
    try {
      setLoading(true);
      setError("");

      const requestedFilters = {
        city: city || "",
        area: area || "",
        min_budget: minBudget !== "" ? Number(minBudget) : "",
        max_budget: maxBudget !== "" ? Number(maxBudget) : "",
        gender: gender || "",
        sharing: sharing || "",
        amenity: selectedAmenities,
        beds_required: Number(people) || 1,
        page: 1,
        page_size: 100
      };

      const data = await fetchPGs(requestedFilters);
      setPgs(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      const message = Array.isArray(detail)
        ? detail.map((item) => item.msg).join("; ")
        : detail;
      setError(message || "Failed to retrieve listings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPGs();
    const targetPgId = initialFilters.selectedPgId || initialFilters.pgId;
    if (targetPgId) {
      handleViewDetails(targetPgId);
    }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setShowAreaSuggestions(false);
    loadPGs();
  };

  const handleResetFilters = () => {
    setArea("");
    setMinBudget("");
    setMaxBudget("");
    setSharing("");
    setGender("");
    setSelectedAmenities([]);
    setSelectedAreaObj(null);
    setPgs([]);
  };

  const handleToggleSave = async (pgId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    try {
      if (savedIds.has(pgId)) {
        await api.delete(`/api/favorites/${pgId}`);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(pgId);
          return next;
        });
      } else {
        await api.post("/api/favorites", { pg_id: pgId });
        setSavedIds(prev => new Set([...prev, pgId]));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCompare = (pgId) => {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(pgId)) next.delete(pgId);
      else if (next.size < 3) next.add(pgId);
      const selected = pgs.filter(pg => next.has(pg.pg_id));
      sessionStorage.setItem("smartPgComparison", JSON.stringify(selected));
      return next;
    });
  };

  // Lock background body scroll when modal is open
  useEffect(() => {
    if (selectedPgDetails || showCompareModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedPgDetails, showCompareModal]);

  const handleViewDetails = async (pgId) => {
    const existing = mappedPgs.find(p => p.pg_id === pgId) || pgs.find(p => p.pg_id === pgId);
    if (existing) {
      setSelectedPgDetails(existing);
      setLoadingDetails(true);
    } else {
      setSelectedPgDetails(null);
      setLoadingDetails(true);
    }
    setBookingStatus("");
    setDirectionsStatus("");
    setRoomLayoutSelections({});
    setSelectedBed(null);
    setActiveDetailImage(0);
    try {
      const response = await api.get(`/api/pgs/${pgId}`);
      if (response?.data) {
        setSelectedPgDetails(response.data);
      }
    } catch (err) {
      console.warn("Background details refresh:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleSelectBed = (bed, room) => {
    setSelectedBed({
      pgId: selectedPgDetails?.pg_id,
      roomId: room.room_id,
      roomNumber: room.room_number,
      bedId: bed.bed_id,
      bedNumber: bed.bed_number,
      status: bed.current_status,
      capacity: room.capacity,
      roomType: room.room_type || `${room.capacity || 2} Sharing`
    });
    setBookingStatus("");
  };

  const handleBookBed = async (pgId, roomId, bedId) => {
    if (!user) {
      alert("Please log in to submit booking requests.");
      return;
    }
    try {
      setBookingStatus("Submitting request...");
      await api.post("/api/bookings", {
        pg_id: pgId,
        room_id: roomId,
        bed_id: bedId,
        requested_move_in_date: moveInDate,
        message: `Requested bed ${bedId} via search engine.`
      });
      setBookingStatus("Booking requested successfully! Pending owner approval.");
    } catch (err) {
      console.error(err);
      setBookingStatus("Failed to submit request.");
    }
  };

  const openLiveDirectionsFromCurrentLocation = () => {
    if (!selectedPgDetails) return;
    const destination = selectedPgDetails.latitude && selectedPgDetails.longitude
      ? `${selectedPgDetails.latitude},${selectedPgDetails.longitude}`
      : `${selectedPgDetails.address || ""} ${selectedPgDetails.area || ""} ${selectedPgDetails.city || ""}`.trim();

    const openDirections = (origin = "") => {
      const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";
      window.open(
        `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destination)}&travelmode=transit`,
        "_blank",
        "noopener,noreferrer"
      );
    };

    if (!navigator.geolocation) {
      setDirectionsStatus("Location access is not available in this browser. Opening transit directions with your destination.");
      openDirections();
      return;
    }

    setDirectionsStatus("Getting your current location for bus and metro directions...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const origin = `${position.coords.latitude},${position.coords.longitude}`;
        setDirectionsStatus("Opening bus and metro directions from your current location.");
        openDirections(origin);
      },
      () => {
        setDirectionsStatus("Could not access current location. Opening transit directions with your destination.");
        openDirections();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const userPreferences = useMemo(() => ({
    city,
    area,
    gender,
    lat: selectedAreaObj?.lat || 17.44,
    lng: selectedAreaObj?.lng || 78.39,
    budgetMin: minBudget !== "" ? Number(minBudget) : 0,
    budgetMax: maxBudget !== "" ? Number(maxBudget) : 100000,
    sharing: sharing !== "" ? Number(sharing) : 3,
    moveIn: moveInDate,
    facilities: selectedAmenities,
    people: Number(people) || 1,
    liftRequired: initialFilters.liftRequired || selectedAmenities.includes("Lift")
  }), [city, area, gender, selectedAreaObj, minBudget, maxBudget, sharing, moveInDate, selectedAmenities, people, initialFilters.liftRequired]);

  const mappedPgs = useMemo(() => {
    return pgs.map(pg => {
      const mockRooms = pg.rooms || [
        { beds: [{ current_status: "available" }, { current_status: "occupied" }] }
      ];
      const normalizedPg = {
        ...pg,
        rent: pg.selected_rent ?? pg.min_rent ?? 0,
        facilities: pg.amenities || [],
        sharing: Number.parseInt(pg.selected_sharing || pg.sharing || userPreferences.sharing, 10),
        rooms: mockRooms
        , lift: (pg.amenities || []).some((amenity) => amenity.toLowerCase().includes("lift"))
      };
      const matchResult = calcMatch(normalizedPg, userPreferences);
      return {
        ...pg,
        rent: normalizedPg.rent,
        facilities: normalizedPg.facilities,
        sharing: normalizedPg.sharing,
        match: matchResult
      };
    }).sort((a, b) => {
      return b.match.score - a.match.score;
    });
  }, [pgs, userPreferences]);

  useEffect(() => {
    const updateGridColumns = () => {
      if (!pgGridRef.current) return;
      const columns = window.getComputedStyle(pgGridRef.current).gridTemplateColumns.split(" ").filter(Boolean).length;
      setGridColumnCount(Math.max(1, columns));
    };

    updateGridColumns();
    window.addEventListener("resize", updateGridColumns);
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateGridColumns) : null;
    if (observer && pgGridRef.current) observer.observe(pgGridRef.current);

    return () => {
      window.removeEventListener("resize", updateGridColumns);
      observer?.disconnect();
    };
  }, [mappedPgs.length]);

  useEffect(() => {
    if (openWhyPgId && !mappedPgs.some((pg) => pg.pg_id === openWhyPgId)) {
      setOpenWhyPgId(null);
    }
  }, [mappedPgs, openWhyPgId]);

  const openWhyIndex = mappedPgs.findIndex((pg) => pg.pg_id === openWhyPgId);
  const openWhyRowEndIndex = openWhyIndex >= 0
    ? Math.min(mappedPgs.length - 1, openWhyIndex + (gridColumnCount - 1 - (openWhyIndex % gridColumnCount)))
    : -1;
  const openWhyPg = openWhyIndex >= 0 ? mappedPgs[openWhyIndex] : null;

  const getVisibleRooms = () => {
    const rooms = selectedPgDetails?.rooms || [];
    const requestedSharing = sharing !== "" ? Number(sharing) : null;
    const requiredBeds = Number(people) || 1;

    const roomScore = (room) => {
      const availableCount = Number(room.available_count) || 0;
      const capacity = Number(room.capacity) || 0;
      let score = 0;
      if (!requestedSharing || capacity === requestedSharing) score += 100;
      if (availableCount >= requiredBeds) score += 40;
      score += Math.min(availableCount, 5);
      return score;
    };

    const relevantRooms = rooms
      .filter((room) => {
        const capacity = Number(room.capacity) || 0;
        const availableCount = Number(room.available_count) || 0;
        return (!requestedSharing || capacity === requestedSharing) && availableCount >= requiredBeds;
      })
      .sort((a, b) => roomScore(b) - roomScore(a));

    if (requestedSharing) return relevantRooms.slice(0, 2);
    return rooms
      .filter((room) => (Number(room.available_count) || 0) >= requiredBeds)
      .sort((a, b) => roomScore(b) - roomScore(a))
      .slice(0, 2);
  };

  const getActiveLayoutImage = (room) => {
    const options = room.layout_image_options || [];
    return roomLayoutSelections[room.room_id] || room.layout_image_url || options[0] || "";
  };

  const getBedZoneStyle = (room, bedIndex) => {
    const capacity = Math.max(Number(room.capacity) || room.beds?.length || 1, 1);
    const layouts = {
      1: [{ left: "31%", top: "28%", width: "34%", height: "42%" }],
      2: [
        { left: "17%", top: "27%", width: "28%", height: "40%" },
        { left: "54%", top: "27%", width: "28%", height: "40%" },
      ],
      3: [
        { left: "8%", top: "27%", width: "25%", height: "38%" },
        { left: "37%", top: "27%", width: "25%", height: "38%" },
        { left: "66%", top: "27%", width: "25%", height: "38%" },
      ],
      4: [
        { left: "0.5%", top: "22%", width: "27%", height: "24%" },
        { left: "32%", top: "18%", width: "27%", height: "25%" },
        { left: "0.5%", top: "54%", width: "27%", height: "29%" },
        { left: "41%", top: "49%", width: "27%", height: "29%" },
      ],
      5: [
        { left: "9%", top: "11%", width: "18%", height: "23%" },
        { left: "31%", top: "11%", width: "18%", height: "23%" },
        { left: "53%", top: "11%", width: "18%", height: "23%" },
        { left: "20%", top: "42%", width: "18%", height: "23%" },
        { left: "45%", top: "42%", width: "18%", height: "23%" },
      ],
    };
    const fallback = Array.from({ length: capacity }, (_, index) => ({
      left: `${10 + (index % 4) * 22}%`,
      top: `${14 + Math.floor(index / 4) * 30}%`,
      width: "19%",
      height: "24%",
    }));

    return (layouts[capacity] || fallback)[bedIndex] || fallback[bedIndex % fallback.length];
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "unknown").toLowerCase();
    if (normalized === "available") return "available";
    if (normalized === "reserved") return "reserved";
    return "occupied";
  };

  const getRoomStatusCounts = (room) => {
    return (room.beds || []).reduce(
      (counts, bed) => {
        const status = getStatusClass(bed.current_status);
        counts[status] += 1;
        return counts;
      },
      { available: 0, reserved: 0, occupied: 0 }
    );
  };

  const floorOrder = (label) => {
    const value = String(label || "").toLowerCase();
    if (value.includes("ground")) return 0;
    const digits = value.match(/\d+/)?.[0];
    return digits ? Number(digits) : 9999;
  };

  const roomOrder = (room) => {
    const value = String(room.room_number || "");
    const digits = value.match(/\d+/)?.[0];
    return digits ? Number(digits) : 999999;
  };

  const getRoomFloorLabel = (room) => {
    const label = String(room.floor_label || "").trim();
    return label && !label.toLowerCase().includes("sample") ? label : "Floor record missing";
  };

  const groupRoomsByFloor = (rooms = []) => {
    const groups = new Map();
    rooms.forEach((room) => {
      const floorLabel = getRoomFloorLabel(room);
      if (!groups.has(floorLabel)) groups.set(floorLabel, []);
      groups.get(floorLabel).push(room);
    });
    return Array.from(groups.entries())
      .map(([floorLabel, floorRooms]) => ({
        floorLabel,
        rooms: floorRooms.slice().sort((a, b) => roomOrder(a) - roomOrder(b)),
      }))
      .sort((a, b) => floorOrder(a.floorLabel) - floorOrder(b.floorLabel));
  };

  return (
    <div className="explore-container">
      {/* Enhanced Hero Title & Live Stats */}
      <section className="explore-hero-enhanced">
        <div className="explore-pill-badge">
          <span className="dot dot-green animate-pulse" style={{ width: '7px', height: '7px' }}></span>
          <i className="fas fa-magnifying-glass-location"></i> Smart PG &amp; Co-Living Search
        </div>
        <h1 className="explore-main-title">Explore Verified PGs &amp; Co-Living</h1>
        <p className="explore-sub-desc">
          Instant multi-vector matching by rent, sharing count, exact move-in date, gender policy, and verified room amenities.
        </p>
        <div className="explore-stats-pill-row">
          <span className="explore-stat-capsule"><i className="fas fa-building" style={{ color: '#6366f1' }}></i> 140+ Verified Properties</span>
          <span className="explore-stat-capsule"><i className="fas fa-bed" style={{ color: '#10b981' }}></i> 420+ Available Beds</span>
          <span className="explore-stat-capsule"><i className="fas fa-bolt" style={{ color: '#f59e0b' }}></i> Sub-Second Matching</span>
          <span className="explore-stat-capsule"><i className="fas fa-shield-halved" style={{ color: '#06b6d4' }}></i> Zero Brokerage</span>
        </div>
      </section>

      {/* Advanced search panel */}
      <div className="search-panel-wrapper">
        <form onSubmit={handleSearchSubmit} className="search-panel-enhanced">
          <div className="filter-group-enhanced">
            <label><i className="fas fa-city" style={{ color: '#6366f1' }}></i> City</label>
            <select value={city} onChange={(e) => { setCity(e.target.value); setArea(""); setSelectedAreaObj(null); }}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="filter-group-enhanced location-group">
            <label><i className="fas fa-location-dot" style={{ color: '#06b6d4' }}></i> Area / Landmark</label>
            <input
              type="text"
              placeholder="Search area (e.g. Madhapur)"
              value={area}
              onChange={(e) => { setArea(e.target.value); setSelectedAreaObj(null); setShowAreaSuggestions(true); }}
              onFocus={() => setShowAreaSuggestions(true)}
            />
            {showAreaSuggestions && areaSuggestions.length > 0 && (
              <div className="autocomplete-list">
                {areaSuggestions.map((a, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setArea(a.name);
                      setSelectedAreaObj(a);
                      setShowAreaSuggestions(false);
                    }}
                  >
                    <i className="fas fa-location-crosshairs text-green"></i>
                    <div>
                      <strong>{a.name}</strong>
                      <span style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "5px" }}>({a.city})</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-group-enhanced">
            <label><i className="fas fa-indian-rupee-sign" style={{ color: '#f59e0b' }}></i> Min Rent</label>
            <input
              type="number"
              placeholder="₹ No minimum"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />
          </div>

          <div className="filter-group-enhanced">
            <label><i className="fas fa-indian-rupee-sign" style={{ color: '#10b981' }}></i> Max Rent</label>
            <input
              type="number"
              placeholder="₹ No limit"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />
          </div>

          <div className="filter-group-enhanced">
            <label><i className="fas fa-user-group" style={{ color: '#ec4899' }}></i> Sharing Preference</label>
            <select value={sharing} onChange={(e) => setSharing(e.target.value)}>
              <option value="">Any Sharing</option>
              <option value="1">1 Sharing (Single)</option>
              <option value="2">2 Sharing</option>
              <option value="3">3 Sharing</option>
              <option value="4">4 Sharing</option>
              <option value="5">5 Sharing</option>
            </select>
          </div>

          <div className="filter-group-enhanced">
            <label><i className="fas fa-calendar-days" style={{ color: '#8b5cf6' }}></i> Move-in Date</label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
            />
          </div>

          <div className="filter-group-enhanced">
            <label><i className="fas fa-venus-mars" style={{ color: '#0284c7' }}></i> Gender Policy</label>
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">All Genders</option>
              <option value="Male">Male Only</option>
              <option value="Female">Female Only</option>
              <option value="Unisex">Unisex Co-living</option>
            </select>
          </div>

          {/* Amenities Checklist */}
          <div className="filter-amenities-section">
            <label><i className="fas fa-screwdriver-wrench" style={{ color: '#6366f1' }}></i> Preferred Amenities (Filter Results)</label>
            <div className="amenities-pill-grid">
              {AMENITIES.map((a) => {
                const isSelected = selectedAmenities.includes(a.value);
                return (
                  <button
                    type="button"
                    key={a.value}
                    className={`amenity-chip-enhanced ${isSelected ? "active" : ""}`}
                    onClick={() => {
                      setSelectedAmenities(prev =>
                        isSelected ? prev.filter(v => v !== a.value) : [...prev, a.value]
                      );
                    }}
                  >
                    <i className={`fas ${a.icon}`} style={{ marginRight: "4px" }}></i> {a.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="explore-btn-group">
            <button type="button" className="btn-reset-filters" onClick={handleResetFilters}>
              <i className="fas fa-rotate-left"></i> RESET
            </button>
            <button type="submit" className="btn-apply-filters btn-shine">
              <i className="fas fa-magnifying-glass"></i> APPLY SEARCH
            </button>
          </div>
        </form>
      </div>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-header-left">
          <h2>Smart Recommended PGs</h2>
          <span className="count">
            {`Showing top ${mappedPgs.length} matching accommodation${mappedPgs.length === 1 ? "" : "s"}`}
          </span>
        </div>
        {mappedPgs.length >= 2 && (
          <div className="results-header-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setCustomComparePgs(mappedPgs.slice(0, 3));
                setShowCompareModal(true);
              }}
            >
              <i className="fas fa-scale-balanced" style={{ color: "var(--primary)" }}></i> Compare Top {Math.min(3, mappedPgs.length)} PGs
            </button>
            {compareIds.size >= 2 && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setCustomComparePgs(mappedPgs.filter(p => compareIds.has(p.pg_id)));
                  setShowCompareModal(true);
                }}
              >
                <i className="fas fa-columns"></i> Compare Selected ({compareIds.size})
              </button>
            )}
          </div>
        )}
      </div>

      {/* Loading & Error notifications */}
      {loading && (
        <div className="state-card loading-state">
          <div className="spinner"></div>
          <p>Searching best matching accommodations...</p>
        </div>
      )}

      {!loading && error && (
        <div className="state-card error-message" style={{ margin: "20px auto" }}>
          <i className="fas fa-circle-exclamation text-red" style={{ fontSize: "3rem" }}></i>
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={loadPGs}>Retry Search</button>
        </div>
      )}

      {/* No results card */}
      {!loading && !error && mappedPgs.length === 0 && (
        <div className="state-card" style={{ margin: "20px auto" }}>
          <i className="fas fa-house-circle-xmark"></i>
          <h3>No matching PGs found</h3>
          <p>There is no property that meets every selected requirement with a live available bed. Try adjusting a filter.</p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>Clear Filters</button>
        </div>
      )}

      {/* Listings Grid */}
      {!loading && !error && mappedPgs.length > 0 && (
        <div className="pg-grid" ref={pgGridRef} style={{ paddingBottom: "4rem" }}>
          {mappedPgs.map((pg, index) => (
            <Fragment key={pg.pg_id}>
              <div className="pg-card-wrapper">
                <PGCard
                  pg={pg}
                  rank={index + 1}
                  isSaved={savedIds.has(pg.pg_id)}
                  isCompared={compareIds.has(pg.pg_id)}
                  onToggleSave={handleToggleSave}
                  onToggleCompare={handleToggleCompare}
                  onViewDetails={handleViewDetails}
                  isWhyOpen={openWhyPgId === pg.pg_id}
                  onToggleWhyMatch={(pgId) => setOpenWhyPgId((current) => current === pgId ? null : pgId)}
                />
              </div>
              {openWhyPg && index === openWhyRowEndIndex && (
                <WhyThisMatchExpandRow pg={openWhyPg} />
              )}
            </Fragment>
          ))}
        </div>
      )}

      {/* View Details Visual beds overlay modal */}
      {selectedPgDetails && createPortal(
        <div className="modal-overlay pg-details-modal-overlay" onClick={() => setSelectedPgDetails(null)}>
          <div className="modal-content pg-details-modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPgDetails(null)} className="modal-close-btn"><i className="fas fa-times"></i></button>

            {loadingDetails ? (
              <div className="modal-loading">
                <div className="spinner"></div>
                <p>Loading PG details...</p>
              </div>
            ) : (
              <div className="modal-two-col-layout">
                {/* Left Column: Gallery, Header, Bed Map, Commute */}
                <div className="modal-left-col">
                  {selectedPgDetails?.images?.length > 0 && (
                    <div className="modal-gallery">
                      <img
                        src={selectedPgDetails.images[activeDetailImage]}
                        alt={selectedPgDetails.pg_name}
                        className="modal-gallery-main"
                      />
                      {selectedPgDetails.images.length > 1 && (
                        <div className="modal-gallery-thumbs">
                          {selectedPgDetails.images.map((img, idx) => (
                            <button
                              key={idx}
                              type="button"
                              className={`modal-thumb ${idx === activeDetailImage ? "active" : ""}`}
                              onClick={() => setActiveDetailImage(idx)}
                            >
                              <img src={img} alt="" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="modal-header">
                    <div>
                      <h2 className="modal-title">{selectedPgDetails.pg_name}</h2>
                      <p className="modal-location"><i className="fas fa-location-dot"></i> {selectedPgDetails.area}, {selectedPgDetails.city}</p>
                    </div>
                    <div className="modal-badges">
                      <span className="badge badge-blue">{selectedPgDetails.gender_policy}</span>
                      {selectedPgDetails.min_rent && <span className="badge badge-green">₹{selectedPgDetails.min_rent.toLocaleString()}/mo</span>}
                    </div>
                  </div>

                  {/* Visual Bed Layout Map */}
                  <div className="modal-section">
                    <h3 className="modal-section-title"><i className="fas fa-bed text-primary"></i> Live Room &amp; Bed Availability Layout</h3>
                    <p className="modal-section-desc">Select a green highlighted bed position to reserve your exact spot.</p>

                    {getVisibleRooms().length === 0 ? (
                      <div className="empty-room-state">No rooms configured for this property.</div>
                    ) : (
                      <div className="modal-rooms-list">
                        {groupRoomsByFloor(getVisibleRooms()).map((floorGroup) => (
                          <div key={floorGroup.floorLabel} className="modal-floor-section">
                            <div className="modal-floor-heading">
                              <i className="fas fa-layer-group"></i>
                              <span>{floorGroup.floorLabel}</span>
                              <small>{floorGroup.rooms.length} room{floorGroup.rooms.length === 1 ? "" : "s"}</small>
                            </div>

                            {floorGroup.rooms.map((room) => (
                              <div key={room.room_id} className="modal-room-card glass-card">
                                <div className="modal-room-header">
                                  <div>
                                    <strong>{room.room_number || "Unnamed Room"}</strong>
                                    <span className="modal-room-type">({room.room_type || "Standard"})</span>
                                  </div>
                                  <div className="modal-room-badges">
                                    <span className="badge badge-green">{getRoomStatusCounts(room).available} Available</span>
                                    <span className="badge badge-amber">{getRoomStatusCounts(room).reserved} Reserved</span>
                                    <span className="badge badge-red">{getRoomStatusCounts(room).occupied} Occupied</span>
                                  </div>
                                </div>

                                <RoomBedLayout
                                  room={room}
                                  selectedBed={selectedBed}
                                  onSelectBed={handleSelectBed}
                                />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Nearby Places & Transportation Guidance */}
                  <div className="modal-location-section">
                    <div className="modal-location-header">
                      <h3 className="modal-section-title"><i className="fas fa-route text-primary"></i> How to Reach &amp; Nearby Essentials</h3>
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={openLiveDirectionsFromCurrentLocation}
                      >
                        <i className="fas fa-location-crosshairs" style={{ color: "var(--primary)" }}></i> Open Live Directions
                      </button>
                    </div>
                    {directionsStatus && (
                      <div className="modal-location-status">
                        <i className="fas fa-circle-info" style={{ color: "var(--primary)", marginRight: "6px" }}></i>
                        {directionsStatus}
                      </div>
                    )}
                    <div className="modal-location-grid">
                      <div><i className="fas fa-train text-primary"></i> Metro route &bull; <strong>Calculated in Google Maps</strong></div>
                      <div><i className="fas fa-bus-simple text-primary"></i> Bus route &bull; <strong>Nearest bus stops &amp; frequency</strong></div>
                      <div><i className="fas fa-basket-shopping text-primary"></i> Supermarket &bull; <strong>600 Meters away</strong></div>
                      <div><i className="fas fa-hospital text-primary"></i> Pharmacy &bull; <strong>800 Meters away</strong></div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Sticky Booking / Move-In Registration Card */}
                <div className="modal-right-col">
                  <div className="modal-booking-sticky-card">
                    <h3 className="modal-section-title"><i className="fas fa-paper-plane text-primary"></i> Make a Request / Register</h3>
                    <p className="modal-section-desc">Submit your move-in request directly to the owner with zero brokerage.</p>

                    <div className="modal-booking-price-tag">
                      <span className="price-amount">₹{selectedPgDetails.min_rent ? selectedPgDetails.min_rent.toLocaleString() : '6,500'}</span>
                      <span className="price-period">/ month</span>
                    </div>

                    <div className="modal-booking-form">
                      <div className="modal-booking-field">
                        <label>Move-in Date</label>
                        <input
                          type="date"
                          value={moveInDate}
                          onChange={(e) => setMoveInDate(e.target.value)}
                        />
                      </div>
                      <div className="modal-booking-field">
                        <label>Preferred Sharing</label>
                        <div className="modal-booking-sharing">
                          {sharing ? `${sharing} Sharing` : (selectedPgDetails.price_options?.[0]?.sharing_type || "Standard Sharing")}
                        </div>
                      </div>
                    </div>

                    {bookingStatus && (
                      <div className={`booking-status ${bookingStatus.includes("successfully") ? "success" : "info"}`}>
                        <i className={`fas ${bookingStatus.includes("successfully") ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: "6px" }}></i> {bookingStatus}
                      </div>
                    )}

                    <div className="selected-bed-summary-card">
                      <div className="selected-bed-summary-header">
                        <i className="fas fa-bed text-primary"></i>
                        <span>Target Bed Reservation</span>
                      </div>
                      {selectedBed ? (
                        <div className="selected-bed-details">
                          <div className="selected-bed-main">
                            <strong>Room {selectedBed.roomNumber || "Standard"} &bull; Bed {selectedBed.bedNumber}</strong>
                            <span className="badge badge-green"><i className="fas fa-check"></i> Selected</span>
                          </div>
                          <p className="selected-bed-sub">
                            {selectedBed.roomType} &bull; Ready for Request
                          </p>
                        </div>
                      ) : (
                        <div className="no-bed-selected-prompt">
                          <i className="fas fa-hand-pointer"></i>
                          <span>Click any available bed (green) on the room layout to select your spot, or click below to submit.</span>
                        </div>
                      )}
                    </div>

                    <div className="modal-booking-actions">
                      {user ? (
                        <button
                          type="button"
                          className="btn-apply-filters btn-shine"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={() => {
                            let targetRoomId = selectedBed?.roomId;
                            let targetBedId = selectedBed?.bedId;

                            if (!targetRoomId || !targetBedId) {
                              const visibleRooms = getVisibleRooms();
                              const firstAvailableRoom = visibleRooms.find(r => (r.beds || []).some(b => (b.current_status || "").toLowerCase() === "available"));
                              const firstAvailableBed = firstAvailableRoom?.beds?.find(b => (b.current_status || "").toLowerCase() === "available");
                              if (!firstAvailableRoom || !firstAvailableBed) {
                                setBookingStatus("No available bed found for the selected sharing requirement.");
                                return;
                              }
                              targetRoomId = firstAvailableRoom.room_id;
                              targetBedId = firstAvailableBed.bed_id;
                              setSelectedBed({
                                pgId: selectedPgDetails.pg_id,
                                roomId: targetRoomId,
                                roomNumber: firstAvailableRoom.room_number,
                                bedId: targetBedId,
                                bedNumber: firstAvailableBed.bed_number,
                                status: firstAvailableBed.current_status,
                                capacity: firstAvailableRoom.capacity,
                                roomType: firstAvailableRoom.room_type || `${firstAvailableRoom.capacity || 2} Sharing`
                              });
                            }

                            handleBookBed(
                              selectedPgDetails.pg_id,
                              targetRoomId,
                              targetBedId
                            );
                          }}
                        >
                          <i className="fas fa-paper-plane"></i> {selectedBed ? `Send Request for Bed ${selectedBed.bedNumber}` : "Send Request to Owner"}
                        </button>
                      ) : (
                        <div className="modal-booking-guest">
                          <button
                            type="button"
                            className="btn-apply-filters btn-shine"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => navigate("/login", { state: { returnTo: "/explore", pgId: selectedPgDetails.pg_id } })}
                          >
                            <i className="fas fa-right-to-bracket"></i> Login to Send Request
                          </button>
                          <button
                            type="button"
                            className="btn-reset-filters"
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => navigate("/register", { state: { returnTo: "/explore", pgId: selectedPgDetails.pg_id } })}
                          >
                            <i className="fas fa-user-plus"></i> Register New Account
                          </button>
                        </div>
                      )}
                      <span className="modal-booking-trust">
                        <i className="fas fa-shield-halved" style={{ color: "#10b981", marginRight: "6px" }}></i> Direct owner contact with zero brokerage.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Side-by-Side PG Comparison Modal */}
      {showCompareModal && (
        <Comparison
          comparedPgs={customComparePgs || mappedPgs.slice(0, 3)}
          onClose={() => setShowCompareModal(false)}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
}
