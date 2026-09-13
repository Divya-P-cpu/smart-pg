import React from "react";
import { createPortal } from "react-dom";

function hasAmenity(amenities = [], searchKey) {
  const key = String(searchKey).toLowerCase().replace(/[^a-z0-9]/g, "");
  return (amenities || []).some((a) => {
    const val = String(a).toLowerCase().replace(/[^a-z0-9]/g, "");
    if (val.includes(key) || key.includes(val)) return true;
    if (key === "wifi" && (val.includes("wifi") || val.includes("internet"))) return true;
    if (key === "food" && (val.includes("food") || val.includes("mess") || val.includes("chapathi") || val.includes("meal"))) return true;
    if (key === "geyser" && (val.includes("geyser") || val.includes("hotwater") || val.includes("waterheater"))) return true;
    if (key === "washing" && (val.includes("wash") || val.includes("laundry"))) return true;
    if (key === "attached" && (val.includes("attached") || val.includes("bath"))) return true;
    if (key === "powerbackup" && (val.includes("power") || val.includes("backup") || val.includes("inverter") || val.includes("generator"))) return true;
    if (key === "cctv" && (val.includes("cctv") || val.includes("surveillance") || val.includes("camera"))) return true;
    if (key === "housekeeping" && (val.includes("clean") || val.includes("housekeeping") || val.includes("maid"))) return true;
    if (key === "security" && (val.includes("security") || val.includes("guard"))) return true;
    if (key === "lift" && (val.includes("lift") || val.includes("elevator"))) return true;
    if (key === "parking" && (val.includes("park") || val.includes("bike") || val.includes("car"))) return true;
    return false;
  });
}

export default function Comparison({ comparedPgs, onClose, onViewDetails }) {
  if (typeof document === "undefined") return null;

  if (!comparedPgs || comparedPgs.length < 2) {
    return createPortal(
      <div
        className="compare-portal-overlay"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(15, 23, 42, 0.75)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 999999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            padding: "40px 30px",
            textAlign: "center",
            maxWidth: "460px",
            width: "100%",
            background: "#ffffff",
            borderRadius: "20px",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
            border: "1px solid #e2e8f0",
          }}
        >
          <i
            className="fas fa-columns"
            style={{ fontSize: "48px", color: "var(--primary, #4f46e5)", marginBottom: "20px" }}
          ></i>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#1e293b", marginBottom: "8px" }}>
            Select at Least 2 PGs to Compare
          </h2>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px", lineHeight: 1.5 }}>
            Check the "Compare" box on 2 or 3 recommended PG cards to view side-by-side differences.
          </p>
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{
              padding: "10px 24px",
              fontWeight: 700,
              borderRadius: "12px",
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#ffffff",
              border: "none",
              cursor: "pointer",
            }}
          >
            Back to Recommendations
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const basicAmenitiesList = [
    { key: "wifi", label: "Wi-Fi Internet", icon: "fa-wifi" },
    { key: "food", label: "Food / Meals", icon: "fa-utensils" },
    { key: "housekeeping", label: "Housekeeping", icon: "fa-broom" },
    { key: "washing", label: "Washing Machine", icon: "fa-shirt" },
    { key: "geyser", label: "Geyser / Hot Water", icon: "fa-shower" },
    { key: "attached", label: "Attached Bathroom", icon: "fa-bath" },
  ];

  const additionalAmenitiesList = [
    { key: "ac", label: "Air Conditioning (AC)", icon: "fa-snowflake" },
    { key: "cctv", label: "CCTV Surveillance", icon: "fa-video" },
    { key: "powerbackup", label: "Power Backup", icon: "fa-bolt" },
    { key: "parking", label: "Vehicle Parking", icon: "fa-car" },
    { key: "lift", label: "Elevator / Lift", icon: "fa-arrow-up" },
    { key: "security", label: "Security Guard", icon: "fa-shield-halved" },
  ];

  return createPortal(
    <div
      className="compare-portal-overlay"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(15, 23, 42, 0.75)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        boxSizing: "border-box",
      }}
    >
      <div
        className="compare-modal-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "1120px",
          maxHeight: "88vh",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          borderRadius: "20px",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
          position: "relative",
          zIndex: 1000000,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#ffffff",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#0f172a",
                margin: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(79, 70, 229, 0.2))",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#4f46e5",
                  fontSize: "16px",
                }}
              >
                <i className="fas fa-scale-balanced"></i>
              </span>
              Side-by-Side PG Comparison
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
              Comparing {comparedPgs.length} top recommendations based on price, room availability, and verified amenities
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 700,
              color: "#475569",
              background: "#f1f5f9",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <i className="fas fa-times"></i> Close
          </button>
        </div>

        {/* Scrollable Table Area */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto", padding: "0 24px 24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "separate",
              borderSpacing: "0",
              minWidth: "680px",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: "16px",
                    textAlign: "left",
                    width: "22%",
                    background: "#f8fafc",
                    borderBottom: "2px solid #cbd5e1",
                    borderTopLeftRadius: "12px",
                    fontSize: "13px",
                    fontWeight: 800,
                    color: "#475569",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Features & Details
                </th>
                {comparedPgs.map((pg, idx) => {
                  const score = pg.compatibility_score || pg.match?.score || 95;
                  const isLast = idx === comparedPgs.length - 1;
                  return (
                    <th
                      key={pg.pg_id || idx}
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        width: `${78 / comparedPgs.length}%`,
                        background: "#f8fafc",
                        borderBottom: "2px solid #cbd5e1",
                        borderTopRightRadius: isLast ? "12px" : "0",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: "15px",
                          color: "#0f172a",
                          marginBottom: "4px",
                          lineHeight: 1.3,
                        }}
                      >
                        {pg.pg_name || pg.name}
                      </div>
                      <div
                        style={{
                          fontSize: "12px",
                          color: "#64748b",
                          marginBottom: "8px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "4px",
                        }}
                      >
                        <i className="fas fa-location-dot" style={{ color: "#06b6d4" }}></i>
                        {pg.area || pg.city || "Hyderabad"}
                      </div>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                          color: "#ffffff",
                          fontWeight: 800,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          fontSize: "11px",
                          boxShadow: "0 2px 8px rgba(79, 70, 229, 0.25)",
                        }}
                      >
                        <i className="fas fa-bullseye"></i> {score}% Match
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {/* Monthly Rent */}
              <tr>
                <td
                  style={{
                    padding: "14px 16px",
                    fontWeight: 700,
                    color: "#334155",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                >
                  <i className="fas fa-indian-rupee-sign" style={{ color: "#f59e0b", marginRight: "8px" }}></i>
                  Monthly Rent
                </td>
                {comparedPgs.map((pg, idx) => (
                  <td
                    key={pg.pg_id || idx}
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                      fontWeight: 800,
                      color: "#4f46e5",
                      fontSize: "16px",
                    }}
                  >
                    ₹{Number(pg.selected_rent || pg.min_rent || pg.rent || 0).toLocaleString("en-IN")}
                    <span style={{ fontSize: "11px", fontWeight: 500, color: "#94a3b8" }}>/month</span>
                  </td>
                ))}
              </tr>

              {/* Security Deposit */}
              <tr>
                <td
                  style={{
                    padding: "14px 16px",
                    fontWeight: 700,
                    color: "#334155",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                >
                  <i className="fas fa-shield" style={{ color: "#10b981", marginRight: "8px" }}></i>
                  Security Deposit
                </td>
                {comparedPgs.map((pg, idx) => (
                  <td
                    key={pg.pg_id || idx}
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "13px",
                      color: "#059669",
                      fontWeight: 700,
                    }}
                  >
                    ₹{Number(pg.selected_security_deposit || pg.selected_rent || pg.min_rent || pg.rent || 0).toLocaleString("en-IN")}
                  </td>
                ))}
              </tr>

              {/* Sharing Preference */}
              <tr>
                <td
                  style={{
                    padding: "14px 16px",
                    fontWeight: 700,
                    color: "#334155",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                >
                  <i className="fas fa-users" style={{ color: "#ec4899", marginRight: "8px" }}></i>
                  Sharing Type
                </td>
                {comparedPgs.map((pg, idx) => (
                  <td
                    key={pg.pg_id || idx}
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "#1e293b",
                    }}
                  >
                    {pg.selected_sharing || (pg.sharing ? `${pg.sharing} Sharing` : "2 / 3 Sharing")}
                  </td>
                ))}
              </tr>

              {/* Gender Policy */}
              <tr>
                <td
                  style={{
                    padding: "14px 16px",
                    fontWeight: 700,
                    color: "#334155",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                >
                  <i className="fas fa-venus-mars" style={{ color: "#8b5cf6", marginRight: "8px" }}></i>
                  Gender Policy
                </td>
                {comparedPgs.map((pg, idx) => (
                  <td
                    key={pg.pg_id || idx}
                    style={{
                      padding: "14px 16px",
                      textAlign: "center",
                      borderBottom: "1px solid #e2e8f0",
                      fontSize: "13px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 10px",
                        borderRadius: "12px",
                        background: "#f1f5f9",
                        color: "#334155",
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      {pg.gender_policy || pg.gender || "Unisex"}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Available Beds */}
              <tr>
                <td
                  style={{
                    padding: "14px 16px",
                    fontWeight: 700,
                    color: "#334155",
                    background: "#ffffff",
                    borderBottom: "1px solid #e2e8f0",
                    fontSize: "13px",
                  }}
                >
                  <i className="fas fa-bed" style={{ color: "#16a34a", marginRight: "8px" }}></i>
                  Available Beds Live
                </td>
                {comparedPgs.map((pg, idx) => {
                  const beds = pg.available_bed_count || (pg.rooms ? pg.rooms.reduce((acc, r) => acc + (r.available_count || 0), 0) : 1);
                  return (
                    <td
                      key={pg.pg_id || idx}
                      style={{
                        padding: "14px 16px",
                        textAlign: "center",
                        borderBottom: "1px solid #e2e8f0",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#16a34a",
                      }}
                    >
                      <i className="fas fa-circle-check" style={{ marginRight: "4px" }}></i> {beds} bed{beds === 1 ? "" : "s"} live
                    </td>
                  );
                })}
              </tr>

              {/* Standard Amenities Header */}
              <tr style={{ background: "#f8fafc" }}>
                <td
                  colSpan={comparedPgs.length + 1}
                  style={{
                    padding: "10px 16px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#4f46e5",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <i className="fas fa-star" style={{ marginRight: "6px" }}></i> Standard Basic Amenities
                </td>
              </tr>
              {basicAmenitiesList.map((am) => (
                <tr key={am.key}>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#334155",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <i
                      className={`fas ${am.icon}`}
                      style={{ width: "18px", color: "#6366f1", marginRight: "8px" }}
                    ></i>
                    {am.label}
                  </td>
                  {comparedPgs.map((pg, idx) => {
                    const exists = hasAmenity(pg.amenities || pg.facilities, am.key);
                    return (
                      <td
                        key={pg.pg_id || idx}
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {exists ? (
                          <i className="fas fa-circle-check" style={{ color: "#16a34a", fontSize: "16px" }}></i>
                        ) : (
                          <i className="fas fa-circle-xmark" style={{ color: "#cbd5e1", fontSize: "16px" }}></i>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Additional Amenities Header */}
              <tr style={{ background: "#f8fafc" }}>
                <td
                  colSpan={comparedPgs.length + 1}
                  style={{
                    padding: "10px 16px",
                    fontSize: "12px",
                    fontWeight: 800,
                    color: "#4f46e5",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    borderBottom: "1px solid #e2e8f0",
                  }}
                >
                  <i className="fas fa-plus-circle" style={{ marginRight: "6px" }}></i> Additional Facilities
                </td>
              </tr>
              {additionalAmenitiesList.map((am) => (
                <tr key={am.key}>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: "13px",
                      color: "#334155",
                      borderBottom: "1px solid #f1f5f9",
                    }}
                  >
                    <i
                      className={`fas ${am.icon}`}
                      style={{ width: "18px", color: "#06b6d4", marginRight: "8px" }}
                    ></i>
                    {am.label}
                  </td>
                  {comparedPgs.map((pg, idx) => {
                    const exists = hasAmenity(pg.amenities || pg.facilities, am.key);
                    return (
                      <td
                        key={pg.pg_id || idx}
                        style={{
                          padding: "12px 16px",
                          textAlign: "center",
                          borderBottom: "1px solid #f1f5f9",
                        }}
                      >
                        {exists ? (
                          <i className="fas fa-circle-check" style={{ color: "#16a34a", fontSize: "16px" }}></i>
                        ) : (
                          <i className="fas fa-circle-xmark" style={{ color: "#cbd5e1", fontSize: "16px" }}></i>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Action Buttons */}
              <tr>
                <td
                  style={{
                    padding: "16px",
                    background: "#f8fafc",
                    borderTop: "2px solid #cbd5e1",
                    fontWeight: 800,
                    fontSize: "13px",
                    color: "#334155",
                    borderBottomLeftRadius: "12px",
                  }}
                >
                  Actions
                </td>
                {comparedPgs.map((pg, idx) => {
                  const isLast = idx === comparedPgs.length - 1;
                  return (
                    <td
                      key={pg.pg_id || idx}
                      style={{
                        padding: "16px",
                        textAlign: "center",
                        background: "#f8fafc",
                        borderTop: "2px solid #cbd5e1",
                        borderBottomRightRadius: isLast ? "12px" : "0",
                      }}
                    >
                      <button
                        onClick={() => {
                          onClose();
                          if (onViewDetails) {
                            onViewDetails(pg.pg_id);
                          }
                        }}
                        style={{
                          width: "100%",
                          padding: "10px 16px",
                          fontSize: "13px",
                          fontWeight: 700,
                          borderRadius: "10px",
                          background: "linear-gradient(135deg, #4f46e5, #6366f1)",
                          color: "#ffffff",
                          border: "none",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(79, 70, 229, 0.25)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                        }}
                      >
                        <i className="fas fa-eye"></i> View Rooms &amp; Beds
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>,
    document.body
  );
}