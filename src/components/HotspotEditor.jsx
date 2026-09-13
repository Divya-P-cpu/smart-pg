import { useState, useRef, useEffect } from 'react';

// Dedicated room images matching real sharing capacities:
export const SHARING_ROOM_IMAGES = {
  1: 'https://i.pinimg.com/736x/b8/dd/bb/b8ddbb720728d4a64e6c098dc78aca07.jpg',
  2: 'https://i.pinimg.com/1200x/85/b2/72/85b2724df9c5e1c8ec7140b973126724.jpg',
  3: 'https://i.pinimg.com/736x/4f/d6/68/4fd668eccd2ff8039636f6447cc1cd45.jpg',
  4: 'https://i.pinimg.com/1200x/58/10/b3/5810b3bc845c6a04ff2e9cf904db6972.jpg',
  5: 'https://i.pinimg.com/1200x/a6/84/bf/a684bf962467380ae2a75ba5064032ba.jpg',
};

export const SHARING_ROOM_OPTIONS = {
  1: [
    'https://i.pinimg.com/736x/b8/dd/bb/b8ddbb720728d4a64e6c098dc78aca07.jpg',
    'https://i.pinimg.com/736x/90/67/17/906717479c007a88d64ece1b2b220dba.jpg',
    'https://i.pinimg.com/736x/a3/22/4d/a3224dfacf3e8208b2d78859d5d46f43.jpg',
    'https://i.pinimg.com/736x/11/f7/0a/11f70abf5fb52adbfd82f851c2090fc6.jpg',
    'https://i.pinimg.com/1200x/c0/66/89/c06689a27b403352a909c44733d2c8a6.jpg',
    'https://i.pinimg.com/1200x/16/f2/b2/16f2b24b20653b73bb224ee8c36bfcec.jpg',
  ],
  2: [
    'https://i.pinimg.com/1200x/85/b2/72/85b2724df9c5e1c8ec7140b973126724.jpg',
    'https://i.pinimg.com/1200x/93/1a/f9/931af9404efa7dec5b857d10479c1a66.jpg',
    'https://i.pinimg.com/1200x/67/3f/7e/673f7e54ac1b1ad621df7bd3c2d1bf22.jpg',
    'https://i.pinimg.com/736x/40/e1/7c/40e17c327eb395dc0f0dfdb6511ffa37.jpg',
    'https://i.pinimg.com/736x/55/6a/2a/556a2a1425fa583f83e5a32c8a458dc4.jpg',
    'https://i.pinimg.com/1200x/e5/b0/4f/e5b04fe838e4aa6adafc80f59b0491f5.jpg',
    'https://i.pinimg.com/1200x/d3/ad/45/d3ad45c040fc7f3711134d26ec82d4f4.jpg',
  ],
  3: [
    'https://i.pinimg.com/736x/4f/d6/68/4fd668eccd2ff8039636f6447cc1cd45.jpg',
    'https://i.pinimg.com/1200x/c0/ba/ab/c0baab5880c3995b92a6fbe726823c9e.jpg',
    'https://i.pinimg.com/736x/68/8c/38/688c3808674d31688a170116c08334d0.jpg',
    'https://i.pinimg.com/736x/89/bb/02/89bb02b14fbdd435e7199bd6f23c7796.jpg',
    'https://i.pinimg.com/736x/e3/3e/47/e33e478557008427fbe79d47f707679d.jpg',
    'https://i.pinimg.com/736x/45/e8/b6/45e8b6ce74b809036d1c1df912c1c91f.jpg',
    'https://i.pinimg.com/1200x/eb/56/8a/eb568ae6aec3445c4408f76953253206.jpg',
  ],
  4: [
    'https://i.pinimg.com/1200x/58/10/b3/5810b3bc845c6a04ff2e9cf904db6972.jpg',
    'https://i.pinimg.com/736x/aa/be/cc/aabecc02ad2b03f7ca534aa4c95b038f.jpg',
    'https://i.pinimg.com/1200x/60/56/be/6056be407732f723aef475ad5310d149.jpg',
    'https://i.pinimg.com/1200x/2b/a9/2c/2ba92c4885a5e5288645e01b5cd68b41.jpg',
    'https://i.pinimg.com/1200x/a6/84/bf/a684bf962467380ae2a75ba5064032ba.jpg',
    'https://i.pinimg.com/1200x/d3/c3/5d/d3c35d8b1c933821efe2aa00bcd69382.jpg',
    'https://i.pinimg.com/1200x/01/a4/b3/01a4b3d2d3f17bc93b46d0ba0efa4cca.jpg',
  ],
  5: [
    'https://i.pinimg.com/1200x/a6/84/bf/a684bf962467380ae2a75ba5064032ba.jpg',
    'https://i.pinimg.com/1200x/2b/a9/2c/2ba92c4885a5e5288645e01b5cd68b41.jpg',
    'https://z-cdn-media.chatglm.cn/files/efe972bb-e504-4e04-bf38-6b7d3bfd787e.png?auth_key=1887246960-8c537ca97d3f492b89bfcc1a1f111b45-0-23a568271c1578a50f180492be0389ef',
  ],
};

export function resolveRoomImage(room) {
  const cap = Number(
    room?.capacity ||
    room?.sharing ||
    (room?.beds ? room.beds.length : null) ||
    (String(room?.room_type || room?.name || '').match(/\d+/)?.[0]) ||
    2
  );
  if (
    room?.layout_image_url &&
    !room.layout_image_url.includes('d43a7cae') &&
    (cap !== 4 || !room.layout_image_url.includes('0e58ab2d')) &&
    (cap !== 5 || !room.layout_image_url.includes('efe972bb')) &&
    (cap !== 2 || !room.layout_image_url.includes('85b2724df9c5e1c8ec7140b973126724'))
  ) {
    return room.layout_image_url;
  }
  if (
    room?.image &&
    !room.image.includes('d43a7cae') &&
    (cap !== 4 || !room.image.includes('0e58ab2d')) &&
    (cap !== 5 || !room.image.includes('efe972bb'))
  ) {
    return room.image;
  }
  return SHARING_ROOM_IMAGES[cap] || SHARING_ROOM_IMAGES[2];
}

export default function HotspotEditor({ pg, room, onSave, onCancel, isOwner = true }) {
  const roomCapacity = Number(
    room?.capacity ||
    room?.sharing ||
    (room?.beds ? room.beds.length : null) ||
    (String(room?.room_type || room?.name || '').match(/\d+/)?.[0]) ||
    2
  );

  const [currentImage, setCurrentImage] = useState(() => resolveRoomImage(room));

  // Normalize beds to lowercase status. Supported statuses: available, reserved, occupied, maintenance.
  const [beds, setBeds] = useState(() => {
    return (room.beds || []).map((b, idx) => {
      let defaultX = 0.1 + (idx % 3) * 0.3;
      let defaultY = 0.15 + Math.floor(idx / 3) * 0.4;
      let defaultWidth = 0.22;
      let defaultHeight = 0.45;

      if (roomCapacity === 2) {
        defaultX = idx === 0 ? 0.08 : 0.54;
        defaultY = 0.22;
        defaultWidth = 0.38;
        defaultHeight = 0.58;
      } else if (roomCapacity === 1) {
        defaultX = 0.28;
        defaultY = 0.22;
        defaultWidth = 0.44;
        defaultHeight = 0.56;
      } else if (roomCapacity === 4) {
        defaultX = 0.02 + idx * 0.245;
        defaultY = 0.32;
        defaultWidth = 0.22;
        defaultHeight = 0.58;
      } else if (roomCapacity === 5) {
        defaultX = 0.02 + idx * 0.195;
        defaultY = 0.40;
        defaultWidth = 0.17;
        defaultHeight = 0.55;
      }

      return {
        id: b.id || idx + 1,
        number: b.number || b.bed_number || `Bed ${idx + 1}`,
        status: String(b.status || b.current_status || 'available').toLowerCase(),
        type: b.type || b.bed_position || 'Single',
        window: b.window ?? (b.near_window === 'Yes'),
        locker: b.locker ?? true,
        table: b.table ?? true,
        rent: b.rent || pg?.rent || 0,
        deposit: b.deposit || pg?.deposit || 0,
        x: typeof b.x === 'number' ? b.x : defaultX,
        y: typeof b.y === 'number' ? b.y : defaultY,
        width: typeof b.width === 'number' ? b.width : defaultWidth,
        height: typeof b.height === 'number' ? b.height : defaultHeight,
      };
    });
  });

  const [selectedBedId, setSelectedBedId] = useState(() => (room.beds && room.beds.length > 0 ? (room.beds[0].id || 1) : null));
  const [activeDrag, setActiveDrag] = useState(false);
  const [hoveredBedId, setHoveredBedId] = useState(null);

  const containerRef = useRef(null);
  const dragStartRef = useRef(null);

  // Drag and resize logic
  useEffect(() => {
    if (!activeDrag) return;
    const handleMouseMove = (e) => {
      if (!dragStartRef.current) return;
      const { startX, startY, bedX, bedY, bedWidth, bedHeight, rect, mode, bedId } = dragStartRef.current;
      const dx = (e.clientX - startX) / rect.width;
      const dy = (e.clientY - startY) / rect.height;
      setBeds((prev) => prev.map((b) => {
        if (b.id !== bedId) return b;
        if (mode === 'move') {
          return {
            ...b,
            x: parseFloat(Math.max(0, Math.min(1 - b.width, bedX + dx)).toFixed(3)),
            y: parseFloat(Math.max(0, Math.min(1 - b.height, bedY + dy)).toFixed(3))
          };
        } else if (mode === 'resize') {
          return {
            ...b,
            width: parseFloat(Math.max(0.08, Math.min(1 - b.x, bedWidth + dx)).toFixed(3)),
            height: parseFloat(Math.max(0.08, Math.min(1 - b.y, bedHeight + dy)).toFixed(3))
          };
        }
        return b;
      }));
    };
    const handleMouseUp = () => {
      setActiveDrag(false);
      dragStartRef.current = null;
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag]);

  const handleMouseDown = (e, bedId, mode) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const bed = beds.find((b) => b.id === bedId);
    if (!bed) return;
    setSelectedBedId(bedId);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      bedX: bed.x,
      bedY: bed.y,
      bedWidth: bed.width,
      bedHeight: bed.height,
      rect,
      mode,
      bedId
    };
    setActiveDrag(true);
  };

  // Canvas click to move selected bed or place hotspot
  const handleCanvasClick = (e) => {
    if (!isOwner || !containerRef.current || selectedBedId === null) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) / rect.width;
    const clickY = (e.clientY - rect.top) / rect.height;
    
    setBeds(prev => prev.map(b => {
      if (b.id !== selectedBedId) return b;
      const targetX = Math.max(0, Math.min(1 - b.width, clickX - b.width / 2));
      const targetY = Math.max(0, Math.min(1 - b.height, clickY - b.height / 2));
      return {
        ...b,
        x: parseFloat(targetX.toFixed(3)),
        y: parseFloat(targetY.toFixed(3))
      };
    }));
  };

  const handleAddBed = () => {
    const newId = beds.length > 0 ? Math.max(...beds.map((b) => (typeof b.id === 'number' ? b.id : 0))) + 1 : 1;
    const newBedNumber = `Bed ${beds.length + 1}`;
    const newBed = {
      id: newId,
      number: newBedNumber,
      status: 'available',
      type: 'Lower',
      window: true,
      locker: true,
      table: true,
      rent: pg?.rent || 7500,
      deposit: pg?.deposit || pg?.rent || 7500,
      x: 0.15 + (beds.length % 3) * 0.25,
      y: 0.2 + Math.floor(beds.length / 3) * 0.3,
      width: 0.22,
      height: 0.45
    };
    setBeds([...beds, newBed]);
    setSelectedBedId(newId);
  };

  const handleDeleteBed = () => {
    if (selectedBedId === null) return;
    const remaining = beds.filter((b) => b.id !== selectedBedId);
    setBeds(remaining);
    setSelectedBedId(remaining.length > 0 ? remaining[0].id : null);
  };

  const handleBedDetailChange = (field, value) => {
    setBeds((prev) => prev.map((b) => b.id !== selectedBedId ? b : { ...b, [field]: value }));
  };

  const selectedBed = beds.find((b) => b.id === selectedBedId);

  // Status color helper (Only 3 states: available, occupied, reserved)
  const getStatusColor = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'occupied') return '#dc2626';
    if (s === 'reserved') return '#d97706';
    if (s === 'maintenance') return '#64748b';
    return '#16a34a'; // available
  };

  const getStatusBg = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'occupied') return 'rgba(220, 38, 38, 0.25)';
    if (s === 'reserved') return 'rgba(217, 119, 6, 0.25)';
    if (s === 'maintenance') return 'rgba(100, 116, 139, 0.25)';
    return 'rgba(22, 163, 74, 0.25)'; // available
  };

  return (
    <div style={{ paddingBottom: '30px' }}>
      {/* Header */}
      <div className="sub-hdr" style={{ borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="back-btn btn btn-secondary" onClick={onCancel} style={{ padding: '6px 12px', fontSize: '13px' }}>
            <i className="fas fa-arrow-left" style={{ marginRight: '6px' }}></i> Back
          </button>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text)' }}>Visual Bed Hotspot Designer</span>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{room.name || `Room ${room.room_number || room.id}`} &middot; {pg?.name || 'PG'}</div>
          </div>
        </div>
        {isOwner && (
          <button
            style={{ background: 'var(--primary)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => onSave(beds)}
          >
            <i className="fas fa-floppy-disk"></i> Save Layout &amp; Beds
          </button>
        )}
      </div>

      <div style={{ padding: '16px 20px' }}>
        {/* Bed Quick Selection Bar for Owner */}
        {isOwner && (
          <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)', marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><i className="fas fa-hand-pointer" style={{ color: 'var(--primary)', marginRight: '6px' }}></i> Choose a Bed to Place / Edit Hotspot:</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{beds.length} Hotspots configured</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {beds.map((b) => {
                const isSel = b.id === selectedBedId;
                const statusColor = getStatusColor(b.status);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setSelectedBedId(b.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: isSel ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                      background: isSel ? '#eff6ff' : '#fff',
                      color: isSel ? 'var(--primary)' : '#334155',
                      fontWeight: isSel ? 800 : 600,
                      fontSize: '12.5px',
                      cursor: 'pointer',
                      boxShadow: isSel ? '0 0 0 3px rgba(79, 70, 229, 0.15)' : 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor }}></span>
                    <span>{b.number}</span>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', opacity: 0.8, background: '#f1f5f9', padding: '1px 5px', borderRadius: '4px' }}>
                      {b.status}
                    </span>
                  </button>
                );
              })}
              <button
                type="button"
                onClick={handleAddBed}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: '1.5px dashed var(--primary)',
                  background: '#fff',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '12.5px',
                  cursor: 'pointer'
                }}
              >
                <i className="fas fa-plus"></i> Add Bed
              </button>
            </div>
          </div>
        )}

        <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <i className="fas fa-circle-info" style={{ color: 'var(--primary)' }}></i>
          {isOwner
            ? 'Select a bed above or click directly on any hotspot. Drag hotspot to re-position on the room image, drag bottom-right corner to resize, or tap anywhere on the image to place.'
            : 'Tap a highlighted bed to view its live details and request it.'
          }
        </div>

        {/* Room Design Photo Switcher (if options exist for this capacity) */}
        {SHARING_ROOM_OPTIONS[roomCapacity]?.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              <i className="fas fa-images" style={{ color: 'var(--primary)', marginRight: '5px' }}></i>
              {roomCapacity} Sharing Layout Photo:
            </span>
            {SHARING_ROOM_OPTIONS[roomCapacity].map((url, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentImage(url)}
                style={{
                  border: currentImage === url ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  background: currentImage === url ? 'rgba(99, 102, 241, 0.12)' : '#fff',
                  color: currentImage === url ? 'var(--primary)' : 'var(--text)',
                  fontSize: '11px',
                  fontWeight: currentImage === url ? 800 : 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Layout Image {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Room Image Container */}
        <div
          ref={containerRef}
          className="room-img-wrap"
          onClick={handleCanvasClick}
          style={{
            width: '100%',
            borderRadius: '12px',
            position: 'relative',
            overflow: 'hidden',
            border: '2px solid #cbd5e1',
            aspectRatio: '4/3',
            cursor: isOwner ? 'crosshair' : 'default',
            background: '#0f172a'
          }}
        >
          <img
            src={currentImage}
            alt={room.name || "Room Layout"}
            style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover', userSelect: 'none', pointerEvents: 'none' }}
          />

          {/* Bed Hotspots */}
          {beds.map((b) => {
            const isSelected = b.id === selectedBedId;
            const statusColor = getStatusColor(b.status);
            const statusBg = getStatusBg(b.status);

            return (
              <div
                key={b.id}
                style={{
                  position: 'absolute',
                  left: `${b.x * 100}%`,
                  top: `${b.y * 100}%`,
                  width: `${b.width * 100}%`,
                  height: `${b.height * 100}%`,
                  border: isSelected ? '3px solid #2563eb' : `2px solid ${statusColor}`,
                  borderRadius: '8px',
                  background: isSelected ? 'rgba(37, 99, 235, 0.35)' : statusBg,
                  cursor: isOwner ? 'move' : 'pointer',
                  zIndex: isSelected ? 20 : 10,
                  boxShadow: isSelected ? '0 0 14px rgba(37, 99, 235, 0.8)' : '0 2px 6px rgba(0,0,0,0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  boxSizing: 'border-box',
                  userSelect: 'none',
                  transition: activeDrag ? 'none' : 'border 0.2s ease, box-shadow 0.2s ease'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedBedId(b.id);
                }}
                onMouseDown={isOwner ? (e) => handleMouseDown(e, b.id, 'move') : undefined}
                onMouseEnter={() => !isOwner && setHoveredBedId(b.id)}
                onMouseLeave={() => !isOwner && setHoveredBedId(null)}
              >
                {/* OWNER: dashed / highlighted border, resize handle, editable label */}
                {isOwner && (
                  <>
                    <div style={{ textAlign: 'center', pointerEvents: 'none' }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}>
                        {b.number}
                      </div>
                      <span
                        style={{
                          fontSize: '8.5px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          background: statusColor,
                          color: '#fff',
                          marginTop: '2px',
                          display: 'inline-block'
                        }}
                      >
                        {b.status}
                      </span>
                    </div>
                    {/* Resize Handle */}
                    <div
                      style={{
                        position: 'absolute',
                        right: '2px',
                        bottom: '2px',
                        width: '12px',
                        height: '12px',
                        backgroundColor: isSelected ? '#2563eb' : statusColor,
                        borderRadius: '2px',
                        cursor: 'nwse-resize',
                        border: '1.5px solid #fff'
                      }}
                      onMouseDown={(e) => handleMouseDown(e, b.id, 'resize')}
                    />
                  </>
                )}

                {/* USER: Semi-transparent overlay & status badge */}
                {!isOwner && (
                  <>
                    <div style={{ position: 'absolute', top: '4px', left: '4px', right: '4px', textAlign: 'center' }}>
                      <span style={{ fontSize: '8px', padding: '2px 5px', borderRadius: '4px', fontWeight: 800, background: statusColor, color: '#fff' }}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>
                    <i className="fas fa-bed" style={{ color: '#fff', fontSize: '14px', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}></i>
                    <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', marginTop: '2px' }}>{b.number}</span>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', padding: '14px 16px', borderTop: '1px solid var(--border)', marginTop: '12px' }}>
          {[
            { c: '#16a34a', l: 'Available' },
            { c: '#dc2626', l: 'Occupied' },
            { c: '#d97706', l: 'Reserved' },
            { c: '#64748b', l: 'Maintenance' }
          ].map((x, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600 }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: x.c, flexShrink: 0 }}></span>
              <span style={{ color: 'var(--text)' }}>{x.l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected Bed Properties (Owner only) */}
      {isOwner && selectedBed && (
        <div className="card" style={{ margin: '0 20px', padding: '18px', background: '#fff', borderRadius: '12px', border: '1.5px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '14px' }}>
            <h4 style={{ fontSize: '15px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>
              <i className="fas fa-sliders" style={{ color: 'var(--primary)', marginRight: '6px' }}></i>
              Edit Properties: {selectedBed.number}
            </h4>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '4px 10px', fontSize: '12px', color: '#dc2626', borderColor: '#fca5a5', fontWeight: 700 }}
              onClick={handleDeleteBed}
            >
              <i className="fas fa-trash-can" style={{ marginRight: '4px' }}></i> Delete Hotspot
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div className="input-g" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Bed Label / Number</label>
              <input
                type="text"
                value={selectedBed.number}
                onChange={(e) => handleBedDetailChange('number', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>

            {/* Status Dropdown */}
            <div className="input-g" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Live Status *</label>
              <select
                value={selectedBed.status}
                onChange={(e) => handleBedDetailChange('status', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 700 }}
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="reserved">Reserved</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>

            <div className="input-g" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Bed Position</label>
              <select
                value={selectedBed.type}
                onChange={(e) => handleBedDetailChange('type', e.target.value)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              >
                <option value="Lower">Lower bunk</option>
                <option value="Upper">Upper bunk</option>
                <option value="Single">Single Bed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div className="input-g" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Monthly Rent (₹)</label>
              <input
                type="number"
                value={selectedBed.rent || ''}
                onChange={(e) => handleBedDetailChange('rent', parseInt(e.target.value, 10) || 0)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
            <div className="input-g" style={{ margin: 0 }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px' }}>Deposit (₹)</label>
              <input
                type="number"
                value={selectedBed.deposit || ''}
                onChange={(e) => handleBedDetailChange('deposit', parseInt(e.target.value, 10) || 0)}
                style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
              />
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--fg)', marginBottom: '8px' }}>Bed Amenities</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {[
                { key: 'window', label: 'Window Access', icon: 'fa-wind' },
                { key: 'locker', label: 'Personal Locker', icon: 'fa-lock' },
                { key: 'table', label: 'Study Table', icon: 'fa-book' }
              ].map(({ key, label, icon }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={!!selectedBed[key]}
                    style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }}
                    onChange={(e) => handleBedDetailChange(key, e.target.checked)}
                  />
                  {icon && <i className={`fas ${icon}`} style={{ fontSize: '12px', color: 'var(--primary)' }}></i>} {label}
                </label>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
