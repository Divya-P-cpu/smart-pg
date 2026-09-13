import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import OwnerDashboardComponent from "../components/OwnerDashboard";
import HotspotEditor from "../components/HotspotEditor";

export default function OwnerDashboard({ initialTab }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getDefaultTab = () => {
    if (initialTab) return initialTab;
    if (location.pathname === "/owner/add-pg") return "add-pg";
    if (location.pathname === "/owner/manage-pg") return "pgs";
    return "profile";
  };

  const [pgs, setPgs] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(getDefaultTab);
  const [requestNotice, setRequestNotice] = useState("");

  useEffect(() => {
    if (location.pathname === "/owner/add-pg") {
      setActiveTab("add-pg");
    } else if (location.pathname === "/owner/manage-pg") {
      setActiveTab("pgs");
    }
  }, [location.pathname]);

  // Hotspot Editor states
  const [selectedPgId, setSelectedPgId] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const readHotspot = (notes) => {
    if (!notes) return {};
    try {
      const parsed = JSON.parse(notes);
      return parsed?.hotspot || {};
    } catch {
      return {};
    }
  };

  const loadData = async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setLoading(true);
      }
      // Fetch owner listings
      const pgsRes = await api.get("/api/pgs/owner/listings");
      // Map properties to match mockup structure
      const mappedPgs = (pgsRes.data || []).map(p => ({
        ...p,
        id: p.pg_id,
        name: p.pg_name,
        location: `${p.area}, ${p.city}`,
        rent: p.min_rent || 0,
        rooms: (p.rooms || []).map(r => {
          const floorLabel = r.floor_label || (r.floor?.floor_label) || "";
          return {
            ...r,
            id: r.room_id,
            name: r.room_number || `Room ${r.room_id}`,
            sharing: r.capacity || 3,
            floor_label: floorLabel,
            floor: floorLabel,
            beds: (r.beds || []).map((b, idx) => {
              const hotspot = readHotspot(b.notes);
              return {
                ...b,
                id: b.bed_id,
                number: b.bed_number || `Bed ${idx + 1}`,
                status: String(b.current_status || "available").toLowerCase(),
                type: b.bed_position || "Standard",
                window: b.near_window === "Yes",
                locker: true,
                table: true,
                x: typeof hotspot.x === "number" ? hotspot.x : undefined,
                y: typeof hotspot.y === "number" ? hotspot.y : undefined,
                width: typeof hotspot.width === "number" ? hotspot.width : undefined,
                height: typeof hotspot.height === "number" ? hotspot.height : undefined,
              };
            })
          };
        })
      }));
      setPgs(mappedPgs);

      // Fetch owner bookings
      const bookingsRes = await api.get("/api/bookings/owner");
      const mappedBookings = (bookingsRes.data || []).map(b => ({
        id: b.booking_id,
        userName: b.userName || "Guest",
        userPhone: b.userPhone || "N/A",
        userEmail: b.userEmail || "N/A",
        pgName: b.pgName || "PG Listing",
        roomName: b.roomName || "N/A",
        bedNumber: b.bedNumber || "N/A",
        rent: b.rent || 0,
        deposit: b.deposit || 0,
        date: b.requested_move_in_date || b.date || "N/A",
        status: String(b.status || "pending").toLowerCase(),
        message: b.message || ""
      }));
      setBookings(mappedBookings);

    } catch (err) {
      console.error("Failed to load owner metrics:", err);
      setError("We couldn't load your dashboard data. Please try again.");
    } finally {
      if (showSpinner) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (user && user.role === "owner") {
      loadData(true);
    }
  }, [user]);

  // Handle addition of a PG Property
  const handleSetPgs = async (updater) => {
    let newList = [];
    if (typeof updater === "function") {
      newList = updater(pgs);
    } else {
      newList = updater;
    }

    if (newList.length > pgs.length) {
      const addedPg = newList[0];
      try {
        await api.post("/api/pgs", {
          pg_name: addedPg.name,
          property_type: addedPg.propertyType || "PG",
          gender_policy: addedPg.gender || "Unisex",
          city: addedPg.location.split(",")[1]?.trim() || "Hyderabad",
          area: addedPg.location.split(",")[0]?.trim() || "Madhapur",
          address: addedPg.address || addedPg.location,
          rent: addedPg.rent,
          deposit: addedPg.deposit || addedPg.rent,
          sharing_type: addedPg.sharing || "3 Sharing",
          image_url: addedPg.imageUrl && addedPg.imageUrl.startsWith("http") ? addedPg.imageUrl : undefined,
          amenities: addedPg.facilities || [],
          latitude: addedPg.latitude,
          longitude: addedPg.longitude
        }).then(async (res) => {
          const createdPgId = res?.data?.pg_id;
          if (createdPgId && addedPg.initialRoom) {
            await api.post(`/api/pgs/${createdPgId}/rooms`, {
              room_number: addedPg.initialRoom.name,
              floor_number: addedPg.initialRoom.floor,
              sharing: addedPg.initialRoom.sharing,
              bed_statuses: addedPg.initialRoom.bed_statuses
            });
          }
        });
        await loadData(false);
      } catch (err) {
        console.error("Failed to persist new PG:", err);
        const detail = err.response?.data?.detail;
        alert(typeof detail === "string" ? detail : "Error saving PG to database.");
      }
    }
  };

  // Handle adding room to PG
  const handleAddRoom = async (pgId, roomObj) => {
    try {
      await api.post(`/api/pgs/${pgId}/rooms`, {
        room_number: roomObj.name,
        floor_number: roomObj.floor,
        sharing: roomObj.sharing,
        bed_statuses: roomObj.bed_statuses
      });
      await loadData(false);
    } catch (err) {
      console.error(err);
      alert("Failed to add room.");
    }
  };

  // Handle Room Selection for Designer
  const handleSelectRoom = (pgId, roomId) => {
    const pg = pgs.find(p => p.id === pgId);
    const room = pg?.rooms.find(r => r.id === roomId);
    if (pg && room) {
      setSelectedPgId(pgId);
      setSelectedRoom(room);
    }
  };

  // Save Hotspot Layout beds statuses
  const handleSaveHotspotLayout = async (bedsList) => {
    try {
      for (const bed of bedsList) {
        if (bed.id) {
          const capStatus = bed.status.charAt(0).toUpperCase() + bed.status.slice(1);
          await api.patch(`/api/pgs/beds/${bed.id}/status`, {
            current_status: capStatus,
            notes: JSON.stringify({
              hotspot: {
                x: bed.x,
                y: bed.y,
                width: bed.width,
                height: bed.height,
              }
            })
          }).catch(err => console.warn(`Could not update bed ${bed.id}:`, err));
        }
      }
      setSelectedRoom(null);
      setSelectedPgId(null);
      await loadData(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save layout.");
    }
  };

  // Approve / Reject User Booking
  const handleProcessRequest = async (bookingId, approve) => {
    try {
      const nextStatus = approve ? "Accepted" : "Rejected";
      setRequestNotice(`${approve ? "Accepting" : "Rejecting"} request...`);
      const response = await api.patch(`/api/bookings/${bookingId}`, { status: nextStatus });
      const updated = response.data;
      setBookings(prev => prev.map(item => (
        item.id === bookingId
          ? { ...item, status: String(updated.status || nextStatus).toLowerCase() }
          : item
      )));
      setRequestNotice(`Request ${approve ? "accepted" : "rejected"} successfully.`);
      // Background refresh so activeTab stays right on 'requests'
      await loadData(false);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setRequestNotice(typeof detail === "string" ? detail : "Failed to process booking request.");
      alert("Failed to process booking request.");
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ margin: "0 auto 10px" }}></div>
        <p>Loading owner dashboard metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <p style={{ color: "#b91c1c", fontWeight: 700 }}>{error}</p>
        <button className="btn btn-primary" style={{ marginTop: "12px" }} onClick={() => { setError(""); loadData(true); }}>
          Retry
        </button>
      </div>
    );
  }

  // Render Hotspot Designer if a room is active
  if (selectedRoom) {
    const pg = pgs.find(p => p.id === selectedPgId);
    return (
      <HotspotEditor
        pg={pg}
        room={selectedRoom}
        onSave={handleSaveHotspotLayout}
        onCancel={() => { setSelectedRoom(null); setSelectedPgId(null); }}
        isOwner={true}
      />
    );
  }

  // Handle direct Bed Status update (Available / Reserved / Occupied)
  const handleUpdateBedStatus = async (pgId, roomId, bedId, newStatus) => {
    try {
      await api.patch(`/api/pgs/beds/${bedId}/status`, {
        current_status: newStatus
      });
      await loadData(false);
    } catch (err) {
      console.error("Failed to update bed status:", err);
      alert("Error updating bed status in database.");
    }
  };

  return (
    <OwnerDashboardComponent
      pgs={pgs}
      ownerName={user?.name || user?.owner_name || "Owner"}
      setPgs={handleSetPgs}
      bookingRequests={bookings}
      onProcessRequest={handleProcessRequest}
      onBackToCustomer={() => navigate("/")}
      onSelectRoom={handleSelectRoom}
      onAddRoom={handleAddRoom}
      onUpdateBedStatus={handleUpdateBedStatus}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      requestNotice={requestNotice}
    />
  );
}
