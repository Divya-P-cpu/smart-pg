import { useState } from 'react';
import { FL, FI } from '../utils/constants';

const ALL_AMENITIES_LIST = [
  { key: "wifi", label: "Wi-Fi / Internet", icon: "fa-wifi" },
  { key: "food", label: "Food / Mess", icon: "fa-utensils" },
  { key: "housekeeping", label: "Housekeeping", icon: "fa-broom" },
  { key: "washing", label: "Washing Machine", icon: "fa-shirt" },
  { key: "geyser", label: "Geyser / Hot Water", icon: "fa-shower" },
  { key: "attached", label: "Attached Bathroom", icon: "fa-bath" },
  { key: "ac", label: "Air Conditioning (AC)", icon: "fa-snowflake" },
  { key: "cctv", label: "CCTV Cameras", icon: "fa-video" },
  { key: "parking", label: "Vehicle Parking", icon: "fa-car" },
  { key: "lift", label: "Lift / Elevator", icon: "fa-arrow-up" },
  { key: "power", label: "Power Backup", icon: "fa-bolt" },
  { key: "security", label: "Security Guard", icon: "fa-shield-halved" },
  { key: "locker", label: "Personal Locker", icon: "fa-lock" },
  { key: "kitchen", label: "Self Cooking Kitchen", icon: "fa-kitchen-set" },
  { key: "tv", label: "TV in Common Area", icon: "fa-tv" },
];

const BED_STATUS_OPTIONS = [
  { value: "Available", label: "Available", icon: "fa-bed" },
  { value: "Reserved", label: "Reserved", icon: "fa-clock" },
  { value: "Occupied", label: "Occupied", icon: "fa-user" },
  { value: "Maintenance", label: "Maintenance", icon: "fa-screwdriver-wrench" },
];

function getSharingCount(sharing) {
  const match = String(sharing || "").match(/\d+/);
  return match ? Number(match[0]) : 3;
}

function buildBedStatuses(sharing, existing = []) {
  const count = getSharingCount(sharing);
  return Array.from({ length: count }, (_, index) => existing[index] || "Available");
}

export default function OwnerDashboard({
  pgs,
  setPgs,
  ownerName = 'Owner',
  bookingRequests,
  onProcessRequest,
  onBackToCustomer,
  onSelectRoom,
  onAddRoom,
  onUpdateBedStatus,
  activeTab: controlledActiveTab,
  setActiveTab: setControlledActiveTab,
  requestNotice = '',
}) {
  const [localActiveTab, setLocalActiveTab] = useState('profile');
  const activeTab = controlledActiveTab || localActiveTab;
  const setActiveTab = setControlledActiveTab || setLocalActiveTab;

  const normalizeStatus = (value) => {
    const status = String(value || 'available').toLowerCase();
    return ['available', 'reserved', 'occupied', 'maintenance'].includes(status) ? status : 'available';
  };

  const floorOrder = (label) => {
    const value = String(label || '').toLowerCase();
    if (value.includes('ground')) return 0;
    const digits = value.match(/\d+/)?.[0];
    return digits ? Number(digits) : 9999;
  };

  const roomOrder = (room) => {
    const value = String(room.name || room.room_number || '');
    const digits = value.match(/\d+/)?.[0];
    return digits ? Number(digits) : 999999;
  };

  const formatFloorLabel = (room) => {
    const label = String(room.floor_label || room.floor || '').trim();
    if (label && !/^\d+$/.test(label) && !label.toLowerCase().includes('sample')) return label;
    return 'Floor record missing';
  };

  const getRoomCounts = (room) => {
    const beds = room.beds || [];
    return beds.reduce((acc, bed) => {
      acc[normalizeStatus(bed.status || bed.current_status)] += 1;
      return acc;
    }, { available: 0, reserved: 0, occupied: 0, maintenance: 0 });
  };

  const groupRoomsByFloor = (rooms = []) => {
    const floorMap = new Map();
    rooms.forEach((room) => {
      const floorLabel = formatFloorLabel(room);
      if (!floorMap.has(floorLabel)) {
        floorMap.set(floorLabel, []);
      }
      floorMap.get(floorLabel).push(room);
    });

    return Array.from(floorMap.entries())
      .map(([floorLabel, floorRooms]) => ({
        floorLabel,
        rooms: floorRooms.slice().sort((a, b) => roomOrder(a) - roomOrder(b)),
      }))
      .sort((a, b) => floorOrder(a.floorLabel) - floorOrder(b.floorLabel));
  };

  let totalBeds = 0;
  let occupiedBeds = 0;
  let reservedBeds = 0;
  let availableBeds = 0;
  let totalRooms = 0;

  pgs.forEach(pg => {
    totalRooms += pg.rooms?.length || 0;
    (pg.rooms || []).forEach(r => {
      (r.beds || []).forEach(b => {
        totalBeds++;
        const s = normalizeStatus(b.status || b.current_status);
        if (s === 'occupied') occupiedBeds++;
        else if (s === 'reserved' || s === 'maintenance') reservedBeds++;
        else availableBeds++;
      });
    });
  });

  const occupancyRate = totalBeds > 0 ? Math.round(((occupiedBeds + reservedBeds) / totalBeds) * 100) : 0;
  const pendingRequestsCount = (bookingRequests || []).filter(r => String(r.status || '').toLowerCase() === 'pending').length;

  const [newPg, setNewPg] = useState({
    name: '',
    city: 'Hyderabad',
    area: '',
    address: '',
    description: '',
    rent: '',
    deposit: '',
    sharing: '3 Sharing',
    gender: 'Unisex',
    floors: 3,
    lift: true,
    facilities: ['wifi', 'food', 'housekeeping', 'washing', 'geyser', 'attached'],
    imageUrl: '',
    imagePreview: null,
    rules: 'No smoking, gate closes at 10:30 PM.',
    contact: '+91 98765 43210',
    latitude: 17.4480,
    longitude: 78.3900,
    locationDetected: false,
    locating: false,
    initialFloor: 1,
    initialRoomNumber: '101',
    bedStatuses: buildBedStatuses('3 Sharing'),
  });

  const [showAddRoomModal, setShowAddRoomModal] = useState(null);
  const [newRoom, setNewRoom] = useState({
    name: '',
    floor: 1,
    sharing: 3,
    imageUrl: '',
  });

  const [updatingBedId, setUpdatingBedId] = useState(null);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setNewPg(prev => ({ ...prev, locating: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNewPg(prev => ({
          ...prev,
          latitude: Number(pos.coords.latitude.toFixed(5)),
          longitude: Number(pos.coords.longitude.toFixed(5)),
          locationDetected: true,
          locating: false,
        }));
      },
      () => {
        const defaultLat = newPg.city === "Bangalore" ? 12.9716 : 17.4480;
        const defaultLng = newPg.city === "Bangalore" ? 77.5946 : 78.3900;
        setNewPg(prev => ({
          ...prev,
          latitude: defaultLat,
          longitude: defaultLng,
          locationDetected: true,
          locating: false,
        }));
      },
      { timeout: 8000 }
    );
  };

  const handleToggleAmenity = (key) => {
    setNewPg(prev => {
      const exists = prev.facilities.includes(key);
      const updated = exists ? prev.facilities.filter(k => k !== key) : [...prev.facilities, key];
      return { ...prev, facilities: updated };
    });
  };

  const handleImageFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPg(prev => ({ ...prev, imagePreview: reader.result, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSharingChange = (sharingValue) => {
    setNewPg(prev => ({
      ...prev,
      sharing: sharingValue,
      bedStatuses: buildBedStatuses(sharingValue, prev.bedStatuses)
    }));
  };

  const handleNewPgBedStatusChange = (index, status) => {
    setNewPg(prev => {
      const nextStatuses = buildBedStatuses(prev.sharing, prev.bedStatuses);
      nextStatuses[index] = status;
      return { ...prev, bedStatuses: nextStatuses };
    });
  };

  const handleAddPgSubmit = (e) => {
    e.preventDefault();
    if (!newPg.name || !newPg.area || !newPg.rent) {
      alert("Please fill in PG Name, Area, and Monthly Rent.");
      return;
    }

    const pgObj = {
      id: `PG_OWN_${Date.now()}`,
      name: newPg.name,
      propertyType: "PG",
      location: `${newPg.area}, ${newPg.city}`,
      address: newPg.address || `${newPg.area}, ${newPg.city}`,
      latitude: newPg.latitude,
      longitude: newPg.longitude,
      rent: Number(newPg.rent),
      deposit: Number(newPg.deposit) || Number(newPg.rent),
      sharing: newPg.sharing,
      gender: newPg.gender,
      floors: Number(newPg.floors) || 1,
      lift: newPg.lift,
      facilities: newPg.facilities,
      images: [newPg.imageUrl || "seed/orch1/800/500"],
      imageUrl: newPg.imageUrl,
      initialRoom: {
        name: newPg.initialRoomNumber || '101',
        floor: Number(newPg.initialFloor) || 1,
        sharing: getSharingCount(newPg.sharing),
        bed_statuses: buildBedStatuses(newPg.sharing, newPg.bedStatuses)
      },
      rooms: []
    };

    setPgs(prev => [pgObj, ...(prev || [])]);
    setActiveTab('my-pgs');
    setNewPg({
      name: '',
      city: 'Hyderabad',
      area: '',
      address: '',
      description: '',
      rent: '',
      deposit: '',
      sharing: '3 Sharing',
      gender: 'Unisex',
      floors: 3,
      lift: true,
      facilities: ['wifi', 'food', 'housekeeping', 'washing', 'geyser', 'attached'],
      imageUrl: '',
      imagePreview: null,
      rules: 'No smoking, gate closes at 10:30 PM.',
      contact: '+91 98765 43210',
      latitude: 17.4480,
      longitude: 78.3900,
      locationDetected: false,
      locating: false,
      initialFloor: 1,
      initialRoomNumber: '101',
      bedStatuses: buildBedStatuses('3 Sharing'),
    });
  };

  const handleAddRoomSubmit = (e) => {
    e.preventDefault();
    if (!showAddRoomModal || !newRoom.name) return;

    if (onAddRoom) {
      onAddRoom(showAddRoomModal, {
        name: newRoom.name,
        floor: Number(newRoom.floor) || 1,
        sharing: Number(newRoom.sharing) || 3,
        imageUrl: newRoom.imageUrl
      });
    }
    setShowAddRoomModal(null);
    setNewRoom({ name: '', floor: 1, sharing: 3, imageUrl: '' });
  };

  const handleStatusChange = async (pgId, roomId, bedId, newStatus) => {
    setUpdatingBedId(bedId);
    if (onUpdateBedStatus) {
      await onUpdateBedStatus(pgId, roomId, bedId, newStatus);
    }
    setUpdatingBedId(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="owner-dashboard-profile">
            {/* Top Metrics Summary */}
            <div className="owner-metrics-grid">
              <div className="card owner-metric-card glass-card">
                <div className="owner-metric-icon owner-metric-blue"><i className="fas fa-building"></i></div>
                <div className="owner-metric-info">
                  <div className="owner-metric-value">{pgs.length}</div>
                  <div className="owner-metric-label">Total Properties</div>
                </div>
              </div>
              <div className="card owner-metric-card glass-card">
                <div className="owner-metric-icon owner-metric-green"><i className="fas fa-bed-pulse"></i></div>
                <div className="owner-metric-info">
                  <div className="owner-metric-value">{availableBeds}</div>
                  <div className="owner-metric-label">Available Beds</div>
                </div>
              </div>
              <div className="card owner-metric-card glass-card">
                <div className="owner-metric-icon owner-metric-orange"><i className="fas fa-user-clock"></i></div>
                <div className="owner-metric-info">
                  <div className="owner-metric-value">{occupiedBeds + reservedBeds}</div>
                  <div className="owner-metric-label">Occupied / Reserved ({occupancyRate}%)</div>
                </div>
              </div>
              <div className="card owner-metric-card glass-card">
                <div className="owner-metric-icon owner-metric-purple"><i className="fas fa-inbox"></i></div>
                <div className="owner-metric-info">
                  <div className="owner-metric-value">{pendingRequestsCount}</div>
                  <div className="owner-metric-label">Pending Requests</div>
                </div>
              </div>
            </div>

            {/* Live Inventory & Occupancy Breakdown */}
            <div className="card owner-inventory-analytics glass-card">
              <div className="inventory-analytics-header">
                <div>
                  <h3 className="inventory-analytics-title"><i className="fas fa-chart-pie"></i> Real-Time Inventory &amp; Bed Occupancy</h3>
                  <p className="inventory-analytics-sub">Live synchronized bed capacity across all your listed properties</p>
                </div>
                <span className="occupancy-rate-pill">
                  <strong>{occupancyRate}%</strong> Active Rate
                </span>
              </div>

              <div className="occupancy-multi-progress-bar">
                <div
                  className="progress-segment segment-available"
                  style={{ width: `${totalBeds ? (availableBeds / totalBeds) * 100 : 0}%` }}
                  title={`Available: ${availableBeds} beds`}
                ></div>
                <div
                  className="progress-segment segment-reserved"
                  style={{ width: `${totalBeds ? (reservedBeds / totalBeds) * 100 : 0}%` }}
                  title={`Reserved: ${reservedBeds} beds`}
                ></div>
                <div
                  className="progress-segment segment-occupied"
                  style={{ width: `${totalBeds ? (occupiedBeds / totalBeds) * 100 : 0}%` }}
                  title={`Occupied: ${occupiedBeds} beds`}
                ></div>
              </div>

              <div className="occupancy-legend-row">
                <div className="legend-item">
                  <span className="legend-dot dot-available"></span>
                  <span className="legend-label">Available: <strong>{availableBeds} beds</strong> ({totalBeds ? Math.round((availableBeds / totalBeds) * 100) : 0}%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-reserved"></span>
                  <span className="legend-label">Reserved: <strong>{reservedBeds} beds</strong> ({totalBeds ? Math.round((reservedBeds / totalBeds) * 100) : 0}%)</span>
                </div>
                <div className="legend-item">
                  <span className="legend-dot dot-occupied"></span>
                  <span className="legend-label">Occupied: <strong>{occupiedBeds} beds</strong> ({totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0}%)</span>
                </div>
              </div>
            </div>

            {/* Quick Actions Hub */}
            <div className="owner-action-cards-grid">
              <div className="card owner-action-hub-card glass-card" onClick={() => setActiveTab('add-pg')}>
                <div className="action-hub-icon hub-icon-blue">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="action-hub-body">
                  <h4>Post / Add New PG</h4>
                  <p>List a new property with pricing, room types, and custom amenities.</p>
                </div>
                <button className="btn btn-primary btn-sm">Add PG <i className="fas fa-arrow-right"></i></button>
              </div>

              <div className="card owner-action-hub-card glass-card" onClick={() => setActiveTab('rooms-beds')}>
                <div className="action-hub-icon hub-icon-green">
                  <i className="fas fa-bed"></i>
                </div>
                <div className="action-hub-body">
                  <h4>Manage Beds &amp; Availability</h4>
                  <p>Toggle real-time bed statuses (Available, Reserved, Occupied).</p>
                </div>
                <button className="btn btn-secondary btn-sm">Manage Beds <i className="fas fa-arrow-right"></i></button>
              </div>

              <div className="card owner-action-hub-card glass-card" onClick={() => setActiveTab('requests')}>
                <div className="action-hub-icon hub-icon-purple">
                  <i className="fas fa-envelope-open-text"></i>
                </div>
                <div className="action-hub-body">
                  <h4>Review Guest Bookings</h4>
                  <p>Approve or reject prospective resident booking requests instantly.</p>
                </div>
                <button className="btn btn-secondary btn-sm">
                  View Requests {pendingRequestsCount > 0 && `(${pendingRequestsCount})`} <i className="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        );

      case 'pgs':
      case 'my-pgs': {
        const totalRoomsAll = pgs.reduce((acc, p) => acc + (p.rooms || []).length, 0);
        const totalBedsAll = pgs.reduce((acc, p) => acc + (p.rooms || []).reduce((ra, r) => ra + (r.beds || []).length, 0), 0);
        const totalAvailBedsAll = pgs.reduce((acc, p) => acc + (p.rooms || []).reduce((ra, r) => ra + (r.beds || []).filter(b => normalizeStatus(b.status || b.current_status) === 'available').length, 0), 0);
        const totalOccupiedAll = totalBedsAll - totalAvailBedsAll;
        const portfolioOccupancy = totalBedsAll > 0 ? Math.round((totalOccupiedAll / totalBedsAll) * 100) : 0;

        return (
          <div className="owner-my-pgs-v2">
            {/* Top Command Bar */}
            <div className="portfolio-command-bar">
              <div className="command-bar-title">
                <h3><i className="fas fa-city"></i> Properties &amp; Inventory Console</h3>
                <p>Real-time oversight of all your managed PG properties, live room inventories, and occupancy.</p>
              </div>
              <button className="btn btn-primary btn-add-pg-glow" onClick={() => setActiveTab('add-pg')}>
                <i className="fas fa-plus-circle"></i> Add New PG Listing
              </button>
            </div>

            {/* Portfolio KPI Ribbon */}
            <div className="portfolio-kpi-ribbon">
              <div className="kpi-ribbon-item">
                <div className="kpi-icon-wrap icon-blue">
                  <i className="fas fa-building"></i>
                </div>
                <div>
                  <span className="kpi-val">{pgs.length}</span>
                  <span className="kpi-lbl">Total Properties</span>
                </div>
              </div>
              <div className="kpi-ribbon-item">
                <div className="kpi-icon-wrap icon-purple">
                  <i className="fas fa-door-open"></i>
                </div>
                <div>
                  <span className="kpi-val">{totalRoomsAll}</span>
                  <span className="kpi-lbl">Configured Rooms</span>
                </div>
              </div>
              <div className="kpi-ribbon-item">
                <div className="kpi-icon-wrap icon-green">
                  <i className="fas fa-bed"></i>
                </div>
                <div>
                  <span className="kpi-val text-green">{totalAvailBedsAll}</span>
                  <span className="kpi-lbl">Vacant Beds Available</span>
                </div>
              </div>
              <div className="kpi-ribbon-item">
                <div className="kpi-icon-wrap icon-amber">
                  <i className="fas fa-chart-pie"></i>
                </div>
                <div>
                  <span className="kpi-val text-amber">{portfolioOccupancy}%</span>
                  <span className="kpi-lbl">Portfolio Occupancy</span>
                </div>
              </div>
            </div>

            {/* Horizontal Property Rows List */}
            <div className="portfolio-rows-list">
              {pgs.map((pg, index) => {
                const totalRooms = (pg.rooms || []).length;
                const totalBedsInPg = (pg.rooms || []).reduce((acc, r) => acc + (r.beds || []).length, 0);
                const availBedsInPg = (pg.rooms || []).reduce((acc, r) => acc + (r.beds || []).filter(b => normalizeStatus(b.status || b.current_status) === 'available').length, 0);
                const occupiedBedsInPg = totalBedsInPg - availBedsInPg;
                const occPercent = totalBedsInPg > 0 ? Math.round((occupiedBedsInPg / totalBedsInPg) * 100) : 0;
                const pgImage = (pg.images && pg.images[0]) || pg.image_url || pg.imageUrl || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=600&q=80';

                return (
                  <div key={pg.id} className="portfolio-row-card">
                    {/* Left: Image & Quick Badges */}
                    <div className="row-card-media">
                      <img src={pgImage} alt={pg.name} className="row-card-img" />
                      <div className="row-card-overlay-top">
                        <span className="row-live-indicator">
                          <span className="live-pulse-dot"></span> Active
                        </span>
                        <span className="row-gender-tag">
                          {pg.gender_policy || pg.gender || 'Co-Ed'}
                        </span>
                      </div>
                      <div className="row-card-overlay-bottom">
                        <span className="row-price-badge">
                          ₹{Number(pg.rent || pg.min_rent || 0).toLocaleString('en-IN')} <small>/mo</small>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Details, Address, Metadata Chips & Live Occupancy */}
                    <div className="row-card-body">
                      <div className="row-card-header-line">
                        <div>
                          <div className="row-pg-index-title">
                            <span className="pg-index-num">#{index + 1}</span>
                            <h4>{pg.name}</h4>
                            <span className="row-quick-badge">
                              <i className="fas fa-door-open"></i> {totalRooms} Rooms
                            </span>
                            <span className="row-quick-badge">
                              <i className="fas fa-shield-halved"></i> Deposit: ₹{Number(pg.deposit || pg.rent || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <p className="row-pg-address">
                            <i className="fas fa-location-dot"></i> {pg.location || `${pg.area}, ${pg.city}`}
                          </p>
                        </div>
                      </div>

                      {/* Live Occupancy Gauge & Progress Bar */}
                      <div className="row-occupancy-container">
                        <div className="row-occ-header">
                          <span className="row-occ-lbl">
                            <i className="fas fa-gauge-high"></i> Live Occupancy: <strong>{occPercent}%</strong>
                          </span>
                          <span className="row-bed-counts">
                            <strong className="text-green">{availBedsInPg} Available</strong> · {occupiedBedsInPg} Occupied · {totalBedsInPg} Total Beds
                          </span>
                        </div>
                        <div className="row-progress-track">
                          <div
                            className="row-progress-fill"
                            style={{ width: `${occPercent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Amenities Pills */}
                      {pg.amenities && pg.amenities.length > 0 && (
                        <div className="row-amenities-tags">
                          {pg.amenities.slice(0, 6).map((am, i) => (
                            <span key={i} className="row-amenity-tag">
                              <i className="fas fa-circle-check"></i> {am}
                            </span>
                          ))}
                          {pg.amenities.length > 6 && (
                            <span className="row-amenity-tag more-tag">
                              +{pg.amenities.length - 6} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Quick Command Action Column */}
                    <div className="row-card-actions-col">
                      <button
                        type="button"
                        className="btn btn-manage-beds-primary"
                        onClick={() => setActiveTab('rooms-beds')}
                      >
                        <i className="fas fa-bed"></i> Manage Beds
                      </button>
                      <button
                        type="button"
                        className="btn btn-add-room-secondary"
                        onClick={() => setShowAddRoomModal(pg.id)}
                      >
                        <i className="fas fa-plus"></i> Add Room
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {pgs.length === 0 && (
              <div className="state-card glass-card empty-portfolio-card">
                <div className="empty-portfolio-icon">
                  <i className="fas fa-city"></i>
                </div>
                <h3>No Properties Listed Yet</h3>
                <p>Add your first PG property to begin managing rooms, floor configurations, and live bed statuses.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('add-pg')}>
                  <i className="fas fa-plus-circle"></i> Add First PG
                </button>
              </div>
            )}

            {showAddRoomModal && (
              <div className="modal-overlay" onClick={() => setShowAddRoomModal(null)}>
                <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
                  <h3>Add Room to Property</h3>
                  <form onSubmit={handleAddRoomSubmit}>
                    <div className="modal-form-group">
                      <label>Room Number / Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Room 201"
                        value={newRoom.name}
                        onChange={(e) => setNewRoom({ ...newRoom, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="modal-form-row">
                      <div className="modal-form-group">
                        <label>Floor Number</label>
                        <input
                          type="number"
                          value={newRoom.floor}
                          onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                          required
                        />
                      </div>
                      <div className="modal-form-group">
                        <label>Sharing (Beds)</label>
                        <select
                          value={newRoom.sharing}
                          onChange={(e) => setNewRoom({ ...newRoom, sharing: Number(e.target.value) })}
                        >
                          <option value={1}>1 Sharing (Single)</option>
                          <option value={2}>2 Sharing</option>
                          <option value={3}>3 Sharing</option>
                          <option value={4}>4 Sharing</option>
                          <option value={5}>5 Sharing</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-form-actions">
                      <button type="submit" className="btn btn-primary">Save Room</button>
                      <button type="button" className="btn btn-secondary" onClick={() => setShowAddRoomModal(null)}>Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      }

      case 'add-pg':
        return (
          <div className="card owner-add-pg-card glass-card">
            <h3><i className="fas fa-plus-circle"></i> Add New PG Listing</h3>
            <form onSubmit={handleAddPgSubmit}>
              <div className="modal-form-group">
                <label>PG Property Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Royal Crown Co-Living"
                  value={newPg.name}
                  onChange={(e) => setNewPg({ ...newPg, name: e.target.value })}
                  required
                />
              </div>

              <div className="modal-form-row">
                <div className="modal-form-group">
                  <label>City *</label>
                  <select
                    value={newPg.city}
                    onChange={(e) => setNewPg({ ...newPg, city: e.target.value })}
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bangalore">Bangalore</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>Area / Locality *</label>
                  <input
                    type="text"
                    placeholder="e.g. Madhapur"
                    value={newPg.area}
                    onChange={(e) => setNewPg({ ...newPg, area: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="modal-form-group">
                <div className="owner-location-header">
                  <label>Complete Address & Exact Location *</label>
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={newPg.locating}
                    className="btn btn-secondary btn-sm"
                  >
                    <i className={`fas ${newPg.locating ? 'fa-spinner fa-spin' : 'fa-crosshairs'}`}></i>
                    {newPg.locating ? "Detecting GPS..." : "📍 Detect / Use My Current Location"}
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Street name, landmark, building number"
                  value={newPg.address}
                  onChange={(e) => setNewPg({ ...newPg, address: e.target.value })}
                  required
                />
                {newPg.locationDetected && (
                  <div className="owner-location-success">
                    <i className="fas fa-circle-check"></i> Exact GPS Coordinates captured: {newPg.latitude}, {newPg.longitude}
                  </div>
                )}
              </div>

              <div className="modal-form-row owner-pricing-row">
                <div className="modal-form-group">
                  <label>Starting Rent (₹/mo) *</label>
                  <input
                    type="number"
                    placeholder="e.g. 7000"
                    value={newPg.rent}
                    onChange={(e) => setNewPg({ ...newPg, rent: e.target.value })}
                    required
                  />
                </div>
                <div className="modal-form-group">
                  <label>Security Deposit (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 7000"
                    value={newPg.deposit}
                    onChange={(e) => setNewPg({ ...newPg, deposit: e.target.value })}
                  />
                </div>
                <div className="modal-form-group">
                  <label>Sharing Type</label>
                  <select
                    value={newPg.sharing}
                    onChange={(e) => handleSharingChange(e.target.value)}
                  >
                    <option value="3 Sharing">3 Sharing</option>
                    <option value="4 Sharing">4 Sharing</option>
                    <option value="5 Sharing">5 Sharing</option>
                    <option value="2 Sharing">2 Sharing</option>
                    <option value="1 Sharing">1 Sharing (Single)</option>
                  </select>
                </div>
                <div className="modal-form-group">
                  <label>Gender Policy</label>
                  <select
                    value={newPg.gender}
                    onChange={(e) => setNewPg({ ...newPg, gender: e.target.value })}
                  >
                    <option value="Unisex">Unisex / Co-Ed</option>
                    <option value="Male">Male Only</option>
                    <option value="Female">Female Only</option>
                  </select>
                </div>
              </div>

              <div className="modal-form-group owner-image-upload">
                <label><i className="fas fa-image"></i> Upload PG / Room Images</label>
                <div className="owner-image-upload-row">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                  />
                  <span>OR enter image URL:</span>
                  <input
                    type="text"
                    placeholder="https://example.com/pg-photo.jpg"
                    value={newPg.imageUrl}
                    onChange={(e) => setNewPg({ ...newPg, imageUrl: e.target.value, imagePreview: e.target.value })}
                  />
                </div>
                {newPg.imagePreview && (
                  <div className="owner-image-preview">
                    <img src={newPg.imagePreview} alt="PG Preview" />
                  </div>
                )}
              </div>

              <div className="owner-initial-room-card">
                <div className="owner-initial-room-heading">
                  <div>
                    <strong>Initial Room & Bed Availability</strong>
                    <p>For {newPg.sharing}, choose the live status for each bed before saving this PG.</p>
                  </div>
                  <span className="badge badge-primary">{getSharingCount(newPg.sharing)} Beds</span>
                </div>

                <div className="modal-form-row">
                  <div className="modal-form-group">
                    <label>Room Number</label>
                    <input
                      type="text"
                      value={newPg.initialRoomNumber}
                      onChange={(e) => setNewPg({ ...newPg, initialRoomNumber: e.target.value })}
                      placeholder="e.g. 101"
                    />
                  </div>
                  <div className="modal-form-group">
                    <label>Floor</label>
                    <select
                      value={newPg.initialFloor}
                      onChange={(e) => setNewPg({ ...newPg, initialFloor: Number(e.target.value) })}
                    >
                      <option value={0}>Ground Floor</option>
                      <option value={1}>1st Floor</option>
                      <option value={2}>2nd Floor</option>
                      <option value={3}>3rd Floor</option>
                      <option value={4}>4th Floor</option>
                      <option value={5}>5th Floor</option>
                    </select>
                  </div>
                </div>

                <div className="owner-new-bed-grid">
                  {buildBedStatuses(newPg.sharing, newPg.bedStatuses).map((status, index) => {
                    const normalized = normalizeStatus(status);
                    return (
                      <div key={index} className={`owner-new-bed-card owner-bed-${normalized}`}>
                        <div className="owner-new-bed-title">
                          <i className="fas fa-bed"></i>
                          <strong>B{index + 1}</strong>
                          <span>{normalized.toUpperCase()}</span>
                        </div>
                        <div className="owner-new-bed-options">
                          {BED_STATUS_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleNewPgBedStatusChange(index, option.value)}
                              className={`owner-bed-btn owner-bed-btn-${option.value.toLowerCase()} ${normalized === option.value.toLowerCase() ? 'active' : ''}`}
                            >
                              <i className={`fas ${option.icon}`}></i>
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="modal-form-group">
                <label><i className="fas fa-list-check"></i> Choose Available Amenities (Click to toggle)</label>
                <div className="owner-amenities-grid">
                  {ALL_AMENITIES_LIST.map(am => {
                    const isSelected = newPg.facilities.includes(am.key);
                    return (
                      <div
                        key={am.key}
                        onClick={() => handleToggleAmenity(am.key)}
                        className={`owner-amenity-choice ${isSelected ? 'selected' : ''}`}
                      >
                        <i className={`fas ${isSelected ? 'fa-square-check' : 'fa-square'}`}></i>
                        <i className={`fas ${am.icon}`}></i>
                        <span>{am.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button className="btn btn-primary owner-submit-btn" type="submit">
                <i className="fas fa-check"></i> Save PG to Inventory
              </button>
            </form>
          </div>
        );

      case 'rooms-beds':
        return (
          <div className="owner-rooms-beds">
            <div className="owner-rooms-beds-header">
              <div>
                <h3>Rooms & Bed Status Management</h3>
                <p>Update live bed availability status (Available / Reserved / Occupied / Maintenance) in real-time.</p>
              </div>
            </div>

            {pgs.map(pg => (
              <div key={pg.id} className="card owner-rooms-card glass-card">
                <div className="owner-rooms-card-header">
                  <div>
                    <h4>{pg.name}</h4>
                    <span>{pg.location || `${pg.area}, ${pg.city}`}</span>
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAddRoomModal(pg.id)}>
                    <i className="fas fa-plus"></i> Add Room
                  </button>
                </div>

                <div className="owner-rooms-list">
                  {groupRoomsByFloor(pg.rooms || []).map((floorGroup) => (
                    <div key={floorGroup.floorLabel} className="owner-floor-section">
                      <div className="owner-floor-heading">
                        <i className="fas fa-layer-group"></i>
                        <span>{floorGroup.floorLabel}</span>
                        <small>{floorGroup.rooms.length} room{floorGroup.rooms.length === 1 ? '' : 's'}</small>
                      </div>

                      {floorGroup.rooms.map(room => {
                        const counts = getRoomCounts(room);
                        const totalRoomBeds = (room.beds || []).length || Number(room.capacity || room.sharing || 0);
                        return (
                    <div key={room.id} className="owner-room-card">
                      <div className="owner-room-header">
                        <div>
                          <div className="owner-room-title">
                            <strong>Room {room.name || room.room_number}</strong>
                            <span className="badge badge-muted">{room.sharing || room.capacity} Sharing</span>
                          </div>
                          <div className="owner-room-badges">
                            <span className="badge badge-green">{counts.available} Available</span>
                            <span className="badge badge-amber">{counts.reserved} Reserved</span>
                            <span className="badge badge-red">{counts.occupied} Occupied</span>
                            <span className="badge badge-muted">{counts.maintenance} Maintenance</span>
                            <span className="badge badge-muted">{totalRoomBeds} Total Beds</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link"
                          onClick={() => onSelectRoom(pg.id, room.id)}
                        >
                          <i className="fas fa-pen-ruler"></i> Visual Layout Designer
                        </button>
                      </div>

                      <div className="owner-beds-grid">
                        {(room.beds || []).map(bed => {
                          const status = normalizeStatus(bed.status || bed.current_status);
                          const isUpdating = updatingBedId === bed.id;
                          return (
                            <div
                              key={bed.id}
                              className={`owner-bed-card owner-bed-${status}`}
                            >
                              <div className="owner-bed-header">
                                <span className="owner-bed-name">
                                  <i className="fas fa-bed"></i>
                                  {bed.number || bed.bed_number || `Bed ${bed.id}`}
                                </span>
                                <span className="badge owner-bed-status">{status.toUpperCase()}</span>
                              </div>

                              <div className="owner-bed-actions">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(pg.id, room.id, bed.id, 'Available')}
                                  className={`owner-bed-btn owner-bed-btn-available ${status === 'available' ? 'active' : ''}`}
                                >
                                  Available
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(pg.id, room.id, bed.id, 'Reserved')}
                                  className={`owner-bed-btn owner-bed-btn-reserved ${status === 'reserved' ? 'active' : ''}`}
                                >
                                  Reserved
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(pg.id, room.id, bed.id, 'Occupied')}
                                  className={`owner-bed-btn owner-bed-btn-occupied ${status === 'occupied' ? 'active' : ''}`}
                                >
                                  Occupied
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleStatusChange(pg.id, room.id, bed.id, 'Maintenance')}
                                  className={`owner-bed-btn owner-bed-btn-maintenance ${status === 'maintenance' ? 'active' : ''}`}
                                >
                                  Maintenance
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );})}
                    </div>
                  ))}

                  {(pg.rooms || []).length === 0 && (
                    <div className="owner-rooms-empty">
                      No rooms added yet. Click "+ Add Room" above.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        );

      case 'requests': {
        const pendingCount = bookingRequests.filter(r => (r.status || '').toLowerCase() === 'pending').length;
        const acceptedCount = bookingRequests.filter(r => ['accepted', 'approved'].includes((r.status || '').toLowerCase())).length;
        const rejectedCount = bookingRequests.filter(r => (r.status || '').toLowerCase() === 'rejected').length;

        return (
          <div className="owner-requests">
            <div className="owner-requests-header">
              <div>
                <h3><i className="fas fa-inbox"></i> Resident Booking Requests &amp; Inquiries</h3>
                <p>Manage incoming move-in applications, review guest profiles, and allocate verified beds.</p>
              </div>
              <div className="owner-requests-stat-pills">
                <span className="req-stat-pill pill-pending">
                  <span className="dot dot-amber animate-pulse"></span>
                  <strong>{pendingCount}</strong> Pending Review
                </span>
                <span className="req-stat-pill pill-accepted">
                  <span className="dot dot-green"></span>
                  <strong>{acceptedCount}</strong> Confirmed Stays
                </span>
                {rejectedCount > 0 && (
                  <span className="req-stat-pill pill-rejected">
                    <strong>{rejectedCount}</strong> Declined
                  </span>
                )}
              </div>
            </div>

            {requestNotice && (
              <div className={`owner-request-notice ${requestNotice.toLowerCase().includes('failed') || requestNotice.toLowerCase().includes('reject') ? 'error' : 'success'}`}>
                <i className={`fas ${requestNotice.toLowerCase().includes('failed') || requestNotice.toLowerCase().includes('reject') ? 'fa-circle-exclamation' : 'fa-circle-check'}`}></i>
                {requestNotice}
              </div>
            )}

            <div className="owner-requests-list-grid">
              {bookingRequests.map(r => {
                const status = String(r.status || 'pending').toLowerCase();
                const isPending = status === 'pending';
                const isAccepted = ['accepted', 'approved'].includes(status);
                const isRejected = status === 'rejected';

                const userName = r.userName || 'Guest Resident';
                const initials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'GR';

                return (
                  <div
                    key={r.id}
                    className={`card owner-request-card glass-card owner-request-border-${status}`}
                  >
                    <div className="owner-request-top">
                      <div className="owner-request-user-info">
                        <div className="owner-user-avatar">
                          {initials}
                        </div>
                        <div>
                          <div className="owner-request-name-row">
                            <h4>{userName}</h4>
                            <span className="badge-verified-resident">
                              <i className="fas fa-shield-check"></i> Verified Resident
                            </span>
                          </div>
                          <div className="owner-request-contacts-row">
                            {r.userPhone && (
                              <a href={`tel:${r.userPhone}`} className="contact-chip">
                                <i className="fas fa-phone"></i> {r.userPhone}
                              </a>
                            )}
                            {r.userEmail && (
                              <a href={`mailto:${r.userEmail}`} className="contact-chip">
                                <i className="fas fa-envelope"></i> {r.userEmail}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="owner-request-status-badge">
                        <span className={`status-pill pill-${status}`}>
                          <i className={`fas ${isAccepted ? 'fa-circle-check' : isRejected ? 'fa-circle-xmark' : 'fa-clock'}`}></i>
                          {isAccepted ? 'Confirmed & Bed Occupied' : isRejected ? 'Declined' : 'Pending Action'}
                        </span>
                      </div>
                    </div>

                    {/* Booking Property & Room Info Details */}
                    <div className="owner-request-details-grid">
                      <div className="req-detail-box">
                        <span className="req-detail-lbl"><i className="fas fa-building"></i> PG Property</span>
                        <span className="req-detail-val">{r.pgName}</span>
                      </div>
                      <div className="req-detail-box">
                        <span className="req-detail-lbl"><i className="fas fa-door-open"></i> Allocated Room &amp; Bed</span>
                        <span className="req-detail-val">{r.roomName} · {r.bedNumber}</span>
                      </div>
                      <div className="req-detail-box">
                        <span className="req-detail-lbl"><i className="fas fa-calendar-days"></i> Requested Move-in</span>
                        <span className="req-detail-val">{r.date || 'Flexible / Immediate'}</span>
                      </div>
                      <div className="req-detail-box">
                        <span className="req-detail-lbl"><i className="fas fa-indian-rupee-sign"></i> Monthly Rent</span>
                        <span className="req-detail-val rent-val">₹{Number(r.rent || 0).toLocaleString('en-IN')}/mo</span>
                      </div>
                    </div>

                    {r.message && (
                      <div className="owner-request-message-bubble">
                        <i className="fas fa-quote-left message-quote-icon"></i>
                        <p>{r.message}</p>
                      </div>
                    )}

                    {isPending && (
                      <div className="owner-request-actions-row">
                        <button
                          type="button"
                          className="btn btn-accept-request"
                          onClick={() => onProcessRequest(r.id, true)}
                        >
                          <i className="fas fa-check-circle"></i> Accept &amp; Confirm Booking
                        </button>
                        <button
                          type="button"
                          className="btn btn-reject-request"
                          onClick={() => onProcessRequest(r.id, false)}
                        >
                          <i className="fas fa-xmark"></i> Decline Request
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {bookingRequests.length === 0 && (
              <div className="state-card glass-card empty-requests-card">
                <div className="empty-icon-circle">
                  <i className="fas fa-inbox"></i>
                </div>
                <h3>No Incoming Requests Yet</h3>
                <p>When prospective residents discover your PG on Explore and submit a move-in request, their booking inquiries will appear here for instant review.</p>
              </div>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="owner-dashboard-wrap">
      <div className="owner-dashboard-header glass-card">
        <div className="owner-header-left">
          <div className="owner-header-icon">
            <i className="fas fa-hotel"></i>
          </div>
          <div>
            <span className="owner-header-title">Owner Property Manager</span>
            <div className="owner-header-subtitle">Inventory, Bed Live Status & Bookings</div>
          </div>
        </div>
      </div>


      <div className="owner-tabs">
        <button
          className={`owner-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <i className="fas fa-chart-pie"></i> Overview
        </button>
        <button
          className={`owner-tab ${activeTab === 'my-pgs' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-pgs')}
        >
          <i className="fas fa-building"></i> My PGs ({pgs.length})
        </button>
        <button
          className={`owner-tab ${activeTab === 'rooms-beds' ? 'active' : ''}`}
          onClick={() => setActiveTab('rooms-beds')}
        >
          <i className="fas fa-bed"></i> Rooms & Beds Status
        </button>
        <button
          className={`owner-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <i className="fas fa-inbox"></i> Requests {pendingRequestsCount > 0 && `(${pendingRequestsCount})`}
        </button>
        <button
          className={`owner-tab ${activeTab === 'add-pg' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-pg')}
        >
          <i className="fas fa-plus"></i> Add PG Listing
        </button>
      </div>

      {renderContent()}
    </div>
  );
}
