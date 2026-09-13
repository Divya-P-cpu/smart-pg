import React, { useState } from "react";

export const SHARING_ROOM_IMAGES = {
  1: "https://i.pinimg.com/736x/b8/dd/bb/b8ddbb720728d4a64e6c098dc78aca07.jpg",
  2: "https://i.pinimg.com/1200x/85/b2/72/85b2724df9c5e1c8ec7140b973126724.jpg",
  3: "https://i.pinimg.com/736x/4f/d6/68/4fd668eccd2ff8039636f6447cc1cd45.jpg",
  4: "https://i.pinimg.com/1200x/58/10/b3/5810b3bc845c6a04ff2e9cf904db6972.jpg",
  5: "https://i.pinimg.com/1200x/a6/84/bf/a684bf962467380ae2a75ba5064032ba.jpg",
};

export const SHARING_ROOM_OPTIONS = {
  1: [
    "https://i.pinimg.com/736x/b8/dd/bb/b8ddbb720728d4a64e6c098dc78aca07.jpg",
    "https://i.pinimg.com/736x/90/67/17/906717479c007a88d64ece1b2b220dba.jpg",
    "https://i.pinimg.com/736x/a3/22/4d/a3224dfacf3e8208b2d78859d5d46f43.jpg",
    "https://i.pinimg.com/736x/11/f7/0a/11f70abf5fb52adbfd82f851c2090fc6.jpg",
    "https://i.pinimg.com/1200x/c0/66/89/c06689a27b403352a909c44733d2c8a6.jpg",
    "https://i.pinimg.com/1200x/16/f2/b2/16f2b24b20653b73bb224ee8c36bfcec.jpg",
  ],
  2: [
    "https://i.pinimg.com/1200x/85/b2/72/85b2724df9c5e1c8ec7140b973126724.jpg",
    "https://i.pinimg.com/1200x/93/1a/f9/931af9404efa7dec5b857d10479c1a66.jpg",
    "https://i.pinimg.com/1200x/67/3f/7e/673f7e54ac1b1ad621df7bd3c2d1bf22.jpg",
    "https://i.pinimg.com/736x/40/e1/7c/40e17c327eb395dc0f0dfdb6511ffa37.jpg",
    "https://i.pinimg.com/736x/55/6a/2a/556a2a1425fa583f83e5a32c8a458dc4.jpg",
    "https://i.pinimg.com/1200x/e5/b0/4f/e5b04fe838e4aa6adafc80f59b0491f5.jpg",
    "https://i.pinimg.com/1200x/d3/ad/45/d3ad45c040fc7f3711134d26ec82d4f4.jpg",
  ],
  3: [
    "https://i.pinimg.com/736x/4f/d6/68/4fd668eccd2ff8039636f6447cc1cd45.jpg",
    "https://i.pinimg.com/1200x/c0/ba/ab/c0baab5880c3995b92a6fbe726823c9e.jpg",
    "https://i.pinimg.com/736x/68/8c/38/688c3808674d31688a170116c08334d0.jpg",
    "https://i.pinimg.com/736x/89/bb/02/89bb02b14fbdd435e7199bd6f23c7796.jpg",
    "https://i.pinimg.com/736x/e3/3e/47/e33e478557008427fbe79d47f707679d.jpg",
    "https://i.pinimg.com/736x/45/e8/b6/45e8b6ce74b809036d1c1df912c1c91f.jpg",
    "https://i.pinimg.com/1200x/eb/56/8a/eb568ae6aec3445c4408f76953253206.jpg",
  ],
  4: [
    "https://i.pinimg.com/1200x/58/10/b3/5810b3bc845c6a04ff2e9cf904db6972.jpg",
    "https://i.pinimg.com/736x/aa/be/cc/aabecc02ad2b03f7ca534aa4c95b038f.jpg",
    "https://i.pinimg.com/1200x/60/56/be/6056be407732f723aef475ad5310d149.jpg",
    "https://i.pinimg.com/1200x/2b/a9/2c/2ba92c4885a5e5288645e01b5cd68b41.jpg",
    "https://i.pinimg.com/1200x/a6/84/bf/a684bf962467380ae2a75ba5064032ba.jpg",
    "https://i.pinimg.com/1200x/d3/ad/45/d3ad45c040fc7f3711134d26ec82d4f4.jpg",
    "https://i.pinimg.com/1200x/01/a4/b3/01a4b3d2d3f17bc93b46d0ba0efa4cca.jpg",
  ],
  5: [
    "https://i.pinimg.com/1200x/a6/84/bf/a684bf962467380ae2a75ba5064032ba.jpg",
    "https://i.pinimg.com/1200x/2b/a9/2c/2ba92c4885a5e5288645e01b5cd68b41.jpg",
    "https://z-cdn-media.chatglm.cn/files/efe972bb-e504-4e04-bf38-6b7d3bfd787e.png?auth_key=1887246960-8c537ca97d3f492b89bfcc1a1f111b45-0-23a568271c1578a50f180492be0389ef",
  ],
};

function getStatusClass(status) {
  const s = String(status || "unknown").toLowerCase();
  if (s === "available") return "available";
  if (s === "reserved") return "reserved";
  return "occupied";
}

function getBedPosition(bed, bedIndex, capacity) {
  if (bed.notes) {
    try {
      const parsed = typeof bed.notes === "string" ? JSON.parse(bed.notes) : bed.notes;
      if (parsed?.hotspot?.x !== undefined && parsed?.hotspot?.y !== undefined) {
        return {
          left: `${(parsed.hotspot.x * 100).toFixed(1)}%`,
          top: `${(parsed.hotspot.y * 100).toFixed(1)}%`,
          width: `${((parsed.hotspot.width || 0.22) * 100).toFixed(1)}%`,
          height: `${((parsed.hotspot.height || 0.45) * 100).toFixed(1)}%`,
        };
      }
    } catch {
      // ignore
    }
  }

  if (capacity === 1) {
    return { left: "26%", top: "25%", width: "48%", height: "55%" };
  }
  if (capacity === 2) {
    return bedIndex === 0
      ? { left: "8%", top: "28%", width: "38%", height: "55%" }
      : { left: "54%", top: "28%", width: "38%", height: "55%" };
  }
  if (capacity === 3) {
    if (bedIndex === 0) return { left: "4%", top: "32%", width: "28%", height: "55%" };
    if (bedIndex === 1) return { left: "36%", top: "22%", width: "28%", height: "55%" };
    return { left: "68%", top: "32%", width: "28%", height: "55%" };
  }
  if (capacity === 4) {
    const w = 22;
    const l = 2 + bedIndex * 24.5;
    return { left: `${l}%`, top: "32%", width: `${w}%`, height: "55%" };
  }
  if (capacity === 5) {
    const w = 17.5;
    const l = 2 + bedIndex * 19.5;
    return { left: `${l}%`, top: "35%", width: `${w}%`, height: "55%" };
  }

  const cols = capacity > 4 ? 3 : 2;
  const colIndex = bedIndex % cols;
  const rowIndex = Math.floor(bedIndex / cols);
  return {
    left: `${6 + colIndex * 32}%`,
    top: `${20 + rowIndex * 35}%`,
    width: "28%",
    height: "35%",
  };
}

export function resolveDisplayImage(room, capacity) {
  if (room?.layout_image_url) return room.layout_image_url;
  if (room?.image) return room.image;
  return SHARING_ROOM_IMAGES[capacity] || SHARING_ROOM_IMAGES[2];
}

export default function RoomBedLayout({
  room,
  selectedBed,
  onSelectBed,
}) {
  const beds = room.beds || [];
  const capacity = Math.max(Number(room.capacity) || beds.length || 1, 1);
  const displayImage = resolveDisplayImage(room, capacity);
  const [activePhoto, setActivePhoto] = useState(displayImage);

  const photoOptions = room?.layout_image_options?.length > 0
    ? room.layout_image_options
    : (SHARING_ROOM_OPTIONS[capacity] || [displayImage]);

  return (
    <div className="room-bed-layout-container">
      {/* Real Room Header Bar */}
      <div className="room-layout-toolbar">
        <div className="layout-toolbar-title">
          <i className="fas fa-camera text-primary"></i>
          <span>Room Photo &amp; Live Bed Spots</span>
          <span className="layout-capacity-pill">{capacity} Sharing Room</span>
        </div>

        {photoOptions.length > 1 && (
          <div className="layout-view-toggle">
            {photoOptions.slice(0, 4).map((url, idx) => (
              <button
                key={idx}
                type="button"
                className={`toggle-btn ${activePhoto === url ? "active" : ""}`}
                onClick={() => setActivePhoto(url)}
              >
                <i className="fas fa-image"></i> Photo {idx + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Real Room Photo with Interactive Bed Markers */}
      <div
        className="room-photo-interactive-wrap"
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "14px",
          overflow: "hidden",
          border: "2px solid #cbd5e1",
          background: "#0f172a",
          aspectRatio: "16/10",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        }}
      >
        <img
          src={activePhoto}
          alt={`Room ${room.room_number || ""} photography`}
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />

        {/* Interactive Clickable Bed Markers Placed Directly on the Real Photo */}
        {beds.map((bed, bedIndex) => {
          const status = getStatusClass(bed.current_status);
          const isAvailable = status === "available";
          const isSelected =
            selectedBed &&
            selectedBed.roomId === room.room_id &&
            selectedBed.bedId === bed.bed_id;
          const pos = getBedPosition(bed, bedIndex, capacity);
          const bedLabel = bed.bed_number || `B${bedIndex + 1}`;

          const borderColor = isSelected
            ? "#2563eb"
            : isAvailable
            ? "#16a34a"
            : status === "reserved"
            ? "#d97706"
            : "#dc2626";

          const bgColor = isSelected
            ? "rgba(37, 99, 235, 0.38)"
            : isAvailable
            ? "rgba(22, 163, 74, 0.28)"
            : status === "reserved"
            ? "rgba(217, 119, 6, 0.32)"
            : "rgba(220, 38, 38, 0.32)";

          return (
            <button
              type="button"
              key={bed.bed_id || bedIndex}
              disabled={!isAvailable}
              onClick={() => {
                if (isAvailable && onSelectBed) {
                  onSelectBed(bed, room);
                }
              }}
              style={{
                position: "absolute",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                height: pos.height,
                border: `3px solid ${borderColor}`,
                borderRadius: "10px",
                background: bgColor,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                padding: "6px",
                cursor: isAvailable ? "pointer" : "not-allowed",
                boxShadow: isSelected
                  ? "0 0 0 4px #ffffff, 0 8px 24px rgba(37, 99, 235, 0.6)"
                  : "0 4px 12px rgba(0,0,0,0.3)",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                transform: isSelected ? "scale(1.05)" : "scale(1)",
                zIndex: isSelected ? 15 : 5,
              }}
              title={`Bed ${bedLabel} - ${status.toUpperCase()}${
                isAvailable ? " (Click to select for reservation)" : ""
              }`}
            >
              {/* Bed Label Pill */}
              <div
                style={{
                  background: isSelected ? "#2563eb" : "rgba(15, 23, 42, 0.88)",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                }}
              >
                <i className="fas fa-bed"></i> {bedLabel}
              </div>

              {/* Status Badge */}
              <div
                style={{
                  background: isSelected
                    ? "#ffffff"
                    : isAvailable
                    ? "#16a34a"
                    : status === "reserved"
                    ? "#d97706"
                    : "#dc2626",
                  color: isSelected ? "#2563eb" : "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                {isSelected ? (
                  <>
                    <i className="fas fa-check-circle"></i> SELECTED ✓
                  </>
                ) : isAvailable ? (
                  <>
                    <i className="fas fa-sparkles"></i> AVAILABLE
                  </>
                ) : status === "reserved" ? (
                  <>
                    <i className="fas fa-clock"></i> RESERVED
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-slash"></i> OCCUPIED
                  </>
                )}
              </div>
            </button>
          );
        })}

        {/* Legend Overlay at Bottom of Real Photo */}
        <div
          style={{
            position: "absolute",
            bottom: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(15, 23, 42, 0.82)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            padding: "6px 16px",
            borderRadius: "30px",
            display: "flex",
            gap: "14px",
            alignItems: "center",
            fontSize: "11px",
            color: "#ffffff",
            fontWeight: 600,
            zIndex: 20,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#16a34a" }}></span>
            Available (Click to Select)
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#2563eb" }}></span>
            Selected Bed
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#d97706" }}></span>
            Reserved
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#dc2626" }}></span>
            Occupied
          </span>
        </div>
      </div>

      {/* Bed Status Selection Cards (Synchronized List) */}
      <div className="bed-selection-section" style={{ marginTop: "16px" }}>
        <div className="bed-selection-heading">
          <i className="fas fa-hand-pointer text-primary"></i>
          <span>Select an Available Bed to Book:</span>
        </div>

        <div className="bed-selection-grid">
          {beds.map((bed, bedIndex) => {
            const status = getStatusClass(bed.current_status);
            const isAvailable = status === "available";
            const isSelected =
              selectedBed &&
              selectedBed.roomId === room.room_id &&
              selectedBed.bedId === bed.bed_id;
            const bedLabel = bed.bed_number || `B${bedIndex + 1}`;

            return (
              <button
                type="button"
                key={bed.bed_id || bedIndex}
                className={`bed-selection-card ${status} ${isSelected ? "selected" : ""}`}
                disabled={!isAvailable}
                onClick={() => {
                  if (isAvailable && onSelectBed) {
                    onSelectBed(bed, room);
                  }
                }}
              >
                <div className="bed-card-icon-col">
                  <i
                    className={`fas ${
                      isSelected
                        ? "fa-circle-check"
                        : isAvailable
                        ? "fa-bed"
                        : status === "reserved"
                        ? "fa-clock"
                        : "fa-user"
                    }`}
                  ></i>
                </div>

                <div className="bed-card-info-col">
                  <span className="bed-card-title">{bedLabel}</span>
                  <span className="bed-card-substatus">
                    {isSelected
                      ? "Selected Spot ✓"
                      : isAvailable
                      ? "Available to Reserve"
                      : status === "reserved"
                      ? "Currently Reserved"
                      : "Occupied"}
                  </span>
                </div>

                <div className="bed-card-action-col">
                  {isSelected ? (
                    <span className="action-pill selected">Selected ✓</span>
                  ) : isAvailable ? (
                    <span className="action-pill select">Select Bed</span>
                  ) : (
                    <span className="action-pill taken">Unavailable</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
