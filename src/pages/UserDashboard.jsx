import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../utils/api";
import UserDashboardComponent from "../components/UserDashboard";
import PGDetailModal from "../components/PGDetailModal";
import { calcMatch } from "../utils/calcMatch";

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pgs, setPgs] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [compareIds, setCompareIds] = useState(new Set());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPgId, setSelectedPgId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch PGs
      const pgsRes = await api.get("/api/pgs", { params: { page_size: 100 } });
      const items = Array.isArray(pgsRes.data.items) ? pgsRes.data.items : [];
      
      // Fetch Saved
      const savedRes = await api.get("/api/favorites");
      const savedList = Array.isArray(savedRes.data) ? savedRes.data : [];
      setSavedIds(new Set(savedList.map(f => f.pg_id)));

      // Fetch Bookings
      const bookingsRes = await api.get("/api/bookings");
      const bookingsList = Array.isArray(bookingsRes.data) ? bookingsRes.data : [];

      // Format bookings to match Dashboard component model
      // Component expects: pgName, roomName, bedNumber, rent, date, status
      const mappedBookings = bookingsList.map(b => ({
        id: b.booking_id,
        pgName: b.pgName || "PG Listing",
        roomName: b.roomName || "N/A",
        bedNumber: b.bedNumber || "N/A",
        rent: b.rent || 0,
        date: b.requested_move_in_date || "N/A",
        status: b.status.toLowerCase(), // component expects lowercase: approved, rejected, pending
        userName: b.userName || user?.name || "User"
      }));
      setBookings(mappedBookings);

      // Pre-calculate individualized match scores for recommendations
      const userPrefs = {
        city: user?.city || "Hyderabad",
        area: user?.workLocation || user?.area || "Madhapur",
        gender: user?.gender || user?.preferred_gender || "",
        lat: user?.latitude || 17.4483, // default Madhapur
        lng: user?.longitude || 78.3915,
        budgetMin: Number(user?.budgetMin || 0),
        budgetMax: Number(user?.budgetMax || user?.max_budget || 20000),
        sharing: Number(user?.preferred_sharing || user?.sharing || 3),
        moveIn: user?.moveIn || new Date().toISOString().slice(0, 10),
        facilities: user?.preferred_amenities || ["wifi", "food", "ac"],
        people: 1,
        liftRequired: false
      };

      const itemsWithMatch = items.map(pg => {
        const mockRooms = pg.rooms || [{ beds: [{ current_status: "available" }] }];
        const normalized = {
          ...pg,
          rent: pg.selected_rent || pg.min_rent || pg.rent || 0,
          facilities: pg.amenities || pg.facilities || [],
          sharing: Number.parseInt(pg.selected_sharing || pg.sharing || 3, 10),
          rooms: mockRooms
        };
        const matchResult = calcMatch(normalized, userPrefs);
        return {
          ...pg,
          id: pg.pg_id, // dashboard component uses pg.id
          name: pg.pg_name, // uses pg.name
          location: `${pg.area}, ${pg.city}`, // uses pg.location
          rent: pg.selected_rent || pg.min_rent || 0,
          facilities: pg.amenities || [],
          rooms: pg.rooms || [],
          match: matchResult
        };
      }).sort((a, b) => (b.match?.score || 0) - (a.match?.score || 0));
      setPgs(itemsWithMatch);

    } catch (err) {
      console.error("Failed to load user dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const handleToggleSave = async (pgId) => {
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
      return next;
    });
  };

  const handleViewDetails = (pgId) => {
    setSelectedPgId(pgId);
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "4rem" }}>
        <div className="spinner" style={{ margin: "0 auto 10px" }}></div>
        <p>Loading dashboard metrics...</p>
      </div>
    );
  }

  const selectedPgObj = pgs.find(p => p.id === selectedPgId || p.pg_id === selectedPgId);

  return (
    <>
      <UserDashboardComponent
        user={user}
        pgs={pgs}
        savedIds={savedIds}
        compareIds={compareIds}
        bookingRequests={bookings}
        onToggleSave={handleToggleSave}
        onToggleCompare={handleToggleCompare}
        onViewDetails={handleViewDetails}
        onNavigateToSearch={() => navigate("/explore")}
        onOpenPrefs={() => navigate("/explore")}
      />

      {selectedPgId && (
        <PGDetailModal
          pgId={selectedPgId}
          initialPg={selectedPgObj}
          onClose={() => setSelectedPgId(null)}
          onBookingSuccess={() => {
            loadData();
          }}
        />
      )}
    </>
  );
}
