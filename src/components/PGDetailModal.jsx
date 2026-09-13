import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { api } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import RoomBedLayout from "./RoomBedLayout";

export default function PGDetailModal({ pgId, initialPg = null, onClose, onBookingSuccess }) {
  const { user } = useAuth();
  const [pgDetails, setPgDetails] = useState(initialPg);
  const [loading, setLoading] = useState(!initialPg);
  const [activeImage, setActiveImage] = useState(0);
  const [bookingStatus, setBookingStatus] = useState("");
  const [directionsStatus, setDirectionsStatus] = useState("");
  const [moveInDate, setMoveInDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedBed, setSelectedBed] = useState(null);

  useEffect(() => {
    if (!pgId) return;
    let isMounted = true;
    setLoading(!initialPg);
    api.get(`/api/pgs/${pgId}`)
      .then((res) => {
        if (isMounted && res.data) {
          setPgDetails(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch PG details:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pgId]);

  // Lock body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  if (!pgId) return null;

  const handleBookBed = async (roomId, bedId) => {
    if (!user) {
      alert("Please log in to submit booking requests.");
      return;
    }
    try {
      setBookingStatus("Submitting booking request...");
      const res = await api.post("/api/bookings", {
        pg_id: pgId,
        room_id: roomId,
        bed_id: bedId,
        requested_move_in_date: moveInDate,
        message: `Requested bed ${bedId} from Resident Dashboard.`
      });
      setBookingStatus("Booking requested successfully! Pending owner approval.");
      if (onBookingSuccess) {
        onBookingSuccess(res.data);
      }
    } catch (err) {
      console.error(err);
      setBookingStatus(err.response?.data?.detail || "Failed to submit request.");
    }
  };

  const handleSelectBed = (bed, room) => {
    setSelectedBed({
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

  const getStatusClass = (status) => {
    const s = String(status || "unknown").toLowerCase();
    if (s === "available") return "available";
    if (s === "reserved") return "reserved";
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

  const groupRoomsByFloor = (rooms = []) => {
    const groups = new Map();
    rooms.forEach((room) => {
      const label = room.floor_label || (room.floor ? room.floor.floor_label : "Main Floor");
      if (!groups.has(label)) groups.set(label, []);
      groups.get(label).push(room);
    });
    return Array.from(groups.entries()).map(([floorLabel, floorRooms]) => ({
      floorLabel,
      rooms: floorRooms
    }));
  };

  const openLiveDirections = () => {
    if (!pgDetails) return;
    const destination = pgDetails.latitude && pgDetails.longitude
      ? `${pgDetails.latitude},${pgDetails.longitude}`
      : `${pgDetails.address || ""} ${pgDetails.area || ""} ${pgDetails.city || ""}`.trim();

    const openMaps = (origin = "") => {
      const originParam = origin ? `&origin=${encodeURIComponent(origin)}` : "";
      window.open(
        `https://www.google.com/maps/dir/?api=1${originParam}&destination=${encodeURIComponent(destination)}&travelmode=transit`,
        "_blank",
        "noopener,noreferrer"
      );
    };

    if (!navigator.geolocation) {
      openMaps();
      return;
    }
    setDirectionsStatus("Fetching your current location for transit directions...");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setDirectionsStatus("Opening bus and metro directions...");
        openMaps(`${pos.coords.latitude},${pos.coords.longitude}`);
      },
      () => {
        openMaps();
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const rooms = pgDetails?.rooms || [];
  const images = pgDetails?.images || (pgDetails?.image_url ? [pgDetails.image_url] : []);
  const minRent = pgDetails?.min_rent ?? pgDetails?.rent ?? pgDetails?.starting_price ?? 6500;

  return createPortal(
    <div
      className="modal-overlay pg-details-modal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <div
        className="modal-content pg-details-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "min(1280px, 94vw)",
          maxWidth: "1280px",
          maxHeight: "90vh",
          margin: "auto",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "2.2rem 2.4rem",
          boxShadow: "0 25px 70px -12px rgba(15, 23, 42, 0.5)",
          border: "1.5px solid rgba(226, 232, 240, 0.9)",
          boxSizing: "border-box",
          overflowY: "auto",
        }}
      >
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <i className="fas fa-times"></i>
        </button>

        {loading ? (
          <div className="modal-loading" style={{ textAlign: "center", padding: "4rem" }}>
            <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
            <p style={{ fontWeight: 600, color: "#475569" }}>Loading PG Details &amp; Live Inventory...</p>
          </div>
        ) : !pgDetails ? (
          <div style={{ textAlign: "center", padding: "3rem" }}>
            <i className="fas fa-triangle-exclamation" style={{ fontSize: "2rem", color: "#ef4444", marginBottom: "1rem" }}></i>
            <p>Property details could not be loaded.</p>
          </div>
        ) : (
          <div className="modal-two-col-layout">
            {/* Left Column: Gallery, Header, Bed Map, Commute */}
            <div className="modal-left-col">
              {images.length > 0 && (
                <div className="modal-gallery">
                  <img
                    src={images[activeImage] || images[0]}
                    alt={pgDetails.pg_name || "PG Property"}
                    className="modal-gallery-main"
                  />
                  {images.length > 1 && (
                    <div className="modal-gallery-thumbs">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`modal-thumb ${idx === activeImage ? "active" : ""}`}
                          onClick={() => setActiveImage(idx)}
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
                  <h2 className="modal-title">{pgDetails.pg_name}</h2>
                  <p className="modal-location">
                    <i className="fas fa-location-dot" style={{ color: "#ef4444" }}></i> {pgDetails.area}, {pgDetails.city}
                  </p>
                  {pgDetails.address && (
                    <p style={{ fontSize: "0.82rem", color: "#64748b", marginTop: "4px" }}>
                      {pgDetails.address}
                    </p>
                  )}
                </div>
                <div className="modal-badges">
                  <span className="badge badge-blue">{pgDetails.gender_policy || "Unisex"}</span>
                  <span className="badge badge-green">₹{Number(minRent).toLocaleString("en-IN")}/mo</span>
                </div>
              </div>

              {/* Amenities Bar */}
              {Array.isArray(pgDetails.amenities) && pgDetails.amenities.length > 0 && (
                <div style={{ margin: "1rem 0" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "#334155", marginBottom: "0.5rem" }}>
                    <i className="fas fa-check-circle" style={{ color: "#10b981", marginRight: "6px" }}></i> Included Amenities
                  </h4>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {pgDetails.amenities.map((am, i) => (
                      <span key={i} className="amenity" style={{ padding: "4px 10px", fontSize: "0.78rem" }}>
                        {am}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Room & Bed Availability Layout */}
              <div className="modal-section">
                <h3 className="modal-section-title">
                  <i className="fas fa-bed text-primary"></i> Live Room &amp; Bed Availability Layout
                </h3>
                <p className="modal-section-desc">
                  Select an interactive green bed to request your reservation in real-time.
                </p>

                {rooms.length === 0 ? (
                  <div className="empty-room-state">No rooms configured for this property.</div>
                ) : (
                  <div className="modal-rooms-list">
                    {groupRoomsByFloor(rooms).map((floorGroup) => (
                      <div key={floorGroup.floorLabel} className="modal-floor-section">
                        <div className="modal-floor-heading">
                          <i className="fas fa-layer-group"></i>
                          <span>{floorGroup.floorLabel}</span>
                          <small>{floorGroup.rooms.length} room{floorGroup.rooms.length === 1 ? "" : "s"}</small>
                        </div>

                        {floorGroup.rooms.map((room) => {
                          const statusCounts = getRoomStatusCounts(room);
                          return (
                            <div key={room.room_id} className="modal-room-card glass-card">
                              <div className="modal-room-header">
                                <div>
                                  <strong>{room.room_number || "Room"}</strong>
                                  <span className="modal-room-type">({room.capacity || 2} Sharing)</span>
                                </div>
                                <div className="modal-room-badges">
                                  <span className="badge badge-green">{statusCounts.available} Available</span>
                                  <span className="badge badge-amber">{statusCounts.reserved} Reserved</span>
                                  <span className="badge badge-red">{statusCounts.occupied} Occupied</span>
                                </div>
                              </div>

                              <RoomBedLayout
                                room={room}
                                selectedBed={selectedBed}
                                onSelectBed={handleSelectBed}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Transit & Commute Section */}
              <div className="modal-location-section">
                <div className="modal-location-header">
                  <h3 className="modal-section-title">
                    <i className="fas fa-route text-primary"></i> How to Reach &amp; Nearby Essentials
                  </h3>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={openLiveDirections}
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
                  <div><i className="fas fa-train text-primary"></i> Metro route &bull; <strong>Direct in Google Maps</strong></div>
                  <div><i className="fas fa-bus-simple text-primary"></i> Bus route &bull; <strong>Nearby bus stops</strong></div>
                  <div><i className="fas fa-basket-shopping text-primary"></i> Supermarket &bull; <strong>Walking distance</strong></div>
                  <div><i className="fas fa-hospital text-primary"></i> Healthcare &bull; <strong>Nearby clinics</strong></div>
                </div>
              </div>
            </div>

            {/* Right Column: Sticky Booking / Move-In Request Card */}
            <div className="modal-right-col">
              <div className="modal-booking-sticky-card">
                <h3 className="modal-section-title">
                  <i className="fas fa-paper-plane text-primary"></i> Make a Request / Register
                </h3>
                <p className="modal-section-desc">
                  Submit your move-in request directly to the PG owner with zero brokerage.
                </p>

                <div className="modal-booking-price-tag">
                  <span className="price-amount">₹{Number(minRent).toLocaleString("en-IN")}</span>
                  <span className="price-period">/ month</span>
                </div>

                <div className="modal-booking-form">
                  <div className="modal-booking-field">
                    <label>Target Move-in Date</label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                    />
                  </div>
                  <div className="modal-booking-field">
                    <label>Pricing / Sharing Options</label>
                    <div className="modal-booking-sharing">
                      {pgDetails.price_options?.length > 0 ? (
                        pgDetails.price_options.map((po, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", margin: "3px 0" }}>
                            <span>{po.sharing_type}:</span>
                            <strong>₹{Number(po.monthly_rent || 0).toLocaleString("en-IN")}/mo</strong>
                          </div>
                        ))
                      ) : (
                        <span>Standard Sharing Tiers</span>
                      )}
                    </div>
                  </div>
                </div>

                {bookingStatus && (
                  <div className={`booking-status ${bookingStatus.includes("successfully") ? "success" : "info"}`} style={{ marginTop: "1rem" }}>
                    <i className={`fas ${bookingStatus.includes("successfully") ? "fa-circle-check" : "fa-circle-info"}`} style={{ marginRight: "6px" }}></i>
                    {bookingStatus}
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
                      <span>Click an available bed (green) on the room layout to select your spot.</span>
                    </div>
                  )}
                </div>

                <div className="modal-booking-actions" style={{ marginTop: "1.2rem" }}>
                  {user ? (
                    <button
                      type="button"
                      className="btn-apply-filters btn-shine"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => {
                        let targetRoomId = selectedBed?.roomId;
                        let targetBedId = selectedBed?.bedId;

                        if (!targetRoomId || !targetBedId) {
                          const firstAvailableRoom = rooms.find(r => (r.beds || []).some(b => (b.current_status || "").toLowerCase() === "available"));
                          const firstAvailableBed = firstAvailableRoom?.beds?.find(b => (b.current_status || "").toLowerCase() === "available");
                          if (!firstAvailableRoom || !firstAvailableBed) {
                            setBookingStatus("No available bed found in this property currently.");
                            return;
                          }
                          targetRoomId = firstAvailableRoom.room_id;
                          targetBedId = firstAvailableBed.bed_id;
                          setSelectedBed({
                            roomId: targetRoomId,
                            roomNumber: firstAvailableRoom.room_number,
                            bedId: targetBedId,
                            bedNumber: firstAvailableBed.bed_number,
                            status: firstAvailableBed.current_status,
                            capacity: firstAvailableRoom.capacity,
                            roomType: firstAvailableRoom.room_type || `${firstAvailableRoom.capacity || 2} Sharing`
                          });
                        }

                        handleBookBed(targetRoomId, targetBedId);
                      }}
                    >
                      <i className="fas fa-paper-plane"></i> {selectedBed ? `Send Request for Bed ${selectedBed.bedNumber}` : "Send Request to Owner"}
                    </button>
                  ) : (
                    <p style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center" }}>
                      Please log in to submit a direct booking request.
                    </p>
                  )}
                  <span className="modal-booking-trust" style={{ display: "block", textAlign: "center", marginTop: "8px", fontSize: "0.75rem", color: "#94a3b8" }}>
                    <i className="fas fa-shield-check" style={{ color: "#10b981" }}></i> Verified PG &bull; Zero Brokerage Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
