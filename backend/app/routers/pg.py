# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.security import OAuth2PasswordBearer
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import bindparam, text
from typing import Optional, List, Union
from pydantic import BaseModel
from app.db.database import get_db
from app.core.config import settings
from app.schemas.pg import PgListItem, PgListResponse, PgDetailOut, RoomDetailOut, BedDetailOut, PriceOptionOut
from app.services.pg_service import search_pgs, calculate_dynamic_pg_pricing
from app.routers.auth import get_current_owner
from app.models import Pg, Room, Bed, Floor, PgLocation, PgPrice, PgAmenity, Amenity, OwnerPg, BedAvailabilityHistory, PgImage, RoomLayoutImage, Booking

router = APIRouter(prefix="/api/pgs", tags=["PG Search & Management"])
optional_oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

DEFAULT_PG_GALLERIES = [
    "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1661412466/Website/CMS-Uploads/trksxemmeilapifse0lc.jpg",
    "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/f_auto,q_auto/v1661412459/Website/CMS-Uploads/hezryvuswmc2by0bdh0o.jpg",
    "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/v1584973747/Website/CMS-Uploads/mkhmegqaljej989w0grw.jpg",
    "https://asset-cdn.stanzaliving.com/stanza-living/image/upload/f_auto,q_80/e_improve/e_sharpen:10/e_saturation:10/v1580397865/Website/CMS-Uploads/cuhunf9igyyzccexsjwg.jpg",
    "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Apr/03/full_photo/GR2-488691-2439109.jpeg",
    "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Feb/27/full_photo/GR2-484063-2406205.jpg",
    "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2025/Nov/07/full_photo/GR2-514793-2625167.jpg",
    "https://img.staticmb.com/mbphoto/pg/grd2/cropped_images/2024/Jul/24/full_photo/GR2-436171-2200637.jpg"
]

def resolve_pg_images(pg: Pg) -> list[str]:
    urls = [img.image_url for img in pg.images if img.image_url]
    if len(urls) >= 3:
        return urls
    idx = abs(hash(pg.pg_id or "PG")) % len(DEFAULT_PG_GALLERIES)
    extras = [
        DEFAULT_PG_GALLERIES[(idx + 0) % len(DEFAULT_PG_GALLERIES)],
        DEFAULT_PG_GALLERIES[(idx + 1) % len(DEFAULT_PG_GALLERIES)],
        DEFAULT_PG_GALLERIES[(idx + 2) % len(DEFAULT_PG_GALLERIES)],
    ]
    for ext in extras:
        if ext not in urls:
            urls.append(ext)
        if len(urls) >= 4:
            break
    return urls

def get_optional_user_id(token: Optional[str] = Depends(optional_oauth2_scheme)) -> Optional[str]:
    if not token:
        return None
    try:
        from jose import jwt
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("role") != "user":
            return None
        return payload.get("sub")
    except Exception:
        return None

def load_recommendation_reasons(db: Session, user_id: Optional[str], pg_ids: list[str]) -> dict[str, list[str]]:
    if not user_id or not pg_ids:
        return {}

    rows = db.execute(
        text(
            """
            SELECT pg_id, reason_text
            FROM recommendation_reasons
            WHERE user_id = :user_id
              AND pg_id IN :pg_ids
              AND reason_text IS NOT NULL
            ORDER BY generated_at ASC, recommendation_id ASC
            """
        ).bindparams(bindparam("pg_ids", expanding=True)),
        {"user_id": user_id, "pg_ids": pg_ids},
    ).mappings().all()

    reasons_by_pg: dict[str, list[str]] = {}
    for row in rows:
        reasons = reasons_by_pg.setdefault(row["pg_id"], [])
        if len(reasons) < 4:
            reasons.append(row["reason_text"])
    return reasons_by_pg

class PgCreate(BaseModel):
    pg_name: str
    property_type: Optional[str] = "PG"
    gender_policy: Optional[str] = "Unisex"
    city: str
    area: str
    address: str
    rent: float
    deposit: Optional[float] = None
    amenities: List[str] = []
    sharing_type: str = "3 Sharing"
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RoomCreate(BaseModel):
    room_number: str
    floor_number: int
    sharing: int
    bed_statuses: Optional[List[str]] = None

class PgUpdate(BaseModel):
    pg_name: Optional[str] = None
    property_type: Optional[str] = None
    gender_policy: Optional[str] = None
    city: Optional[str] = None
    area: Optional[str] = None
    address: Optional[str] = None
    rent: Optional[float] = None
    deposit: Optional[float] = None
    amenities: Optional[List[str]] = None
    sharing_type: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_active: Optional[bool] = None

class BedStatusUpdate(BaseModel):
    current_status: str
    notes: Optional[str] = None

class BedSyncItem(BaseModel):
    id: Optional[Union[str, int]] = None
    number: Optional[str] = None
    status: Optional[str] = "available"
    type: Optional[str] = "Standard"
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    notes: Optional[str] = None

class RoomLayoutSyncIn(BaseModel):
    beds: List[BedSyncItem] = []
    layout_image_url: Optional[str] = None

def display_floor_label(floor_number: int) -> str:
    if floor_number <= 0:
        return "Ground Floor"
    if floor_number == 1:
        return "1st Floor"
    if floor_number == 2:
        return "2nd Floor"
    if floor_number == 3:
        return "3rd Floor"
    return f"{floor_number}th Floor"

def normalize_bed_status(status: Optional[str]) -> str:
    value = str(status or "Available").strip().lower()
    if value == "reserved":
        return "Reserved"
    if value == "occupied":
        return "Occupied"
    if value == "maintenance":
        return "Maintenance"
    return "Available"

def next_code_id(db: Session, model, field_name: str, prefix: str, width: int) -> str:
    field = getattr(model, field_name)
    rows = db.query(field).filter(field.like(f"{prefix}%")).all()
    max_num = 0
    for (value,) in rows:
        suffix = str(value or "").replace(prefix, "", 1)
        if suffix.isdigit():
            max_num = max(max_num, int(suffix))
    return f"{prefix}{max_num + 1:0{width}d}"

def room_matches_requirement(room: Room, sharing: Optional[str], beds_required: int) -> bool:
    if sharing and sharing.isdigit() and room.capacity != int(sharing):
        return False
    return sum(1 for bed in room.beds if (bed.current_status or "").lower() == "available") >= beds_required

def floor_sort_value(label: Optional[str], floor_id: Optional[int] = None) -> int:
    value = str(label or "").lower()
    if "ground" in value:
        return 0
    digits = "".join(ch for ch in value if ch.isdigit())
    if digits:
        return int(digits)
    return int(floor_id or 9999)

def room_sort_value(room_number: Optional[str]) -> tuple[int, str]:
    value = str(room_number or "")
    digits = "".join(ch for ch in value if ch.isdigit())
    return (int(digits) if digits else 999999, value)

def sort_rooms(rooms: list[Room]) -> list[Room]:
    return sorted(
        rooms,
        key=lambda room: (
            floor_sort_value(room.floor.floor_label if room.floor else None, room.floor_id),
            room_sort_value(room.room_number),
        ),
    )

def get_room_layouts_by_capacity(db: Session) -> dict[int, list[str]]:
    rows = (
        db.query(RoomLayoutImage)
        .order_by(RoomLayoutImage.sharing_capacity, RoomLayoutImage.layout_image_id)
        .all()
    )
    layouts: dict[int, list[str]] = {}
    for row in rows:
        layouts.setdefault(row.sharing_capacity, []).append(row.image_url)
    return layouts

def build_room_detail(room: Room, layout_map: dict[int, list[str]]) -> RoomDetailOut:
    layout_options = layout_map.get(room.capacity or 0, [])
    floor_lbl = room.floor.floor_label if room.floor and room.floor.floor_label else "Floor record missing"
    return RoomDetailOut(
        room_id=room.room_id,
        pg_id=room.pg_id,
        floor_id=room.floor_id,
        floor_label=floor_lbl,
        room_number=room.room_number,
        room_type=room.room_type,
        capacity=room.capacity,
        occupied_count=room.occupied_count,
        available_count=room.available_count,
        room_status=room.room_status,
        ac_type=room.ac_type,
        bathroom_type=room.bathroom_type,
        layout_image_url=layout_options[0] if layout_options else None,
        layout_image_options=layout_options,
        beds=[
            BedDetailOut(
                bed_id=bed.bed_id,
                room_id=bed.room_id,
                bed_number=bed.bed_number,
                bed_position=bed.bed_position,
                near_wall=bed.near_wall,
                near_window=bed.near_window,
                near_door=bed.near_door,
                current_status=bed.current_status,
                notes=bed.notes,
            )
            for bed in room.beds
        ],
    )

@router.get("", response_model=PgListResponse)
def get_pgs(
    db: Session = Depends(get_db),
    city: Optional[str] = Query(None, description="Filter by city"),
    area: Optional[str] = Query(None, description="Filter by area"),
    location: Optional[str] = Query(None, description="Filter by location (city or area)"),
    min_budget: Optional[float] = Query(None, ge=0, description="Minimum rent"),
    max_budget: Optional[float] = Query(None, ge=0, description="Maximum rent"),
    min_price: Optional[float] = Query(None, ge=0, description="Min price alias"),
    max_price: Optional[float] = Query(None, ge=0, description="Max price alias"),
    gender: Optional[str] = Query(None, description="Gender policy"),
    amenity: Optional[List[str]] = Query(None, description="Required amenity names"),
    amenities: Optional[str] = Query(None, description="Comma-separated amenity names"),
    sharing: Optional[str] = Query(None, description="Sharing type"),
    beds_required: int = Query(1, ge=1, description="Beds required in one room"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Page size"),
    current_user_id: Optional[str] = Depends(get_optional_user_id),
):
    # Normalize aliases
    if location and not city and not area:
        loc_str = location.strip()
        if loc_str.lower() in ["hyderabad", "bangalore", "bengaluru", "pune", "mumbai", "delhi", "chennai", "noida", "gurgaon"]:
            city = loc_str
        else:
            area = loc_str

    if min_price is not None and min_budget is None:
        min_budget = min_price
    if max_price is not None and max_budget is None:
        max_budget = max_price

    merged_amenities: List[str] = list(amenity) if amenity else []
    if amenities:
        for am in amenities.split(","):
            cleaned = am.strip()
            if cleaned and cleaned not in merged_amenities:
                merged_amenities.append(cleaned)

    try:
        pgs, total = search_pgs(
            db=db, city=city, area=area,
            min_budget=min_budget, max_budget=max_budget,
            gender=gender, amenities=merged_amenities if merged_amenities else None, sharing=sharing, beds_required=beds_required,
            page=page, page_size=page_size,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    layout_map = get_room_layouts_by_capacity(db)
    recommendation_reasons_by_pg = load_recommendation_reasons(db, current_user_id, [pg.pg_id for pg in pgs])
    items = []
    for pg in pgs:
        price_options = [
            PriceOptionOut(
                sharing_type=p.sharing_type,
                monthly_rent=float(p.monthly_rent) if p.monthly_rent is not None else None,
                security_deposit=float(p.security_deposit) if p.security_deposit is not None else None
            )
            for p in pg.prices
        ]

        amenity_list = []
        if pg.amenities:
            for pg_amenity in pg.amenities:
                if pg_amenity.amenity:
                    amenity_list.append(pg_amenity.amenity.amenity_name)

        # Dynamic pricing engine calculation based on basic vs requested premium amenities
        selected_rent, selected_sharing, selected_deposit, _ = calculate_dynamic_pg_pricing(
            pg_prices=pg.prices,
            pg_amenity_names=amenity_list,
            requested_amenities=amenity,
            sharing=sharing,
            min_budget=min_budget,
            max_budget=max_budget
        )

        min_rent = float(min((p.monthly_rent for p in pg.prices if p.monthly_rent is not None), default=0)) or selected_rent

        matching_rooms = [room for room in pg.rooms if room_matches_requirement(room, sharing, beds_required)]
        if not matching_rooms:
            matching_rooms = [
                room for room in pg.rooms
                if sum(1 for bed in room.beds if (bed.current_status or "").lower() == "available") >= beds_required
            ]
        if not matching_rooms:
            matching_rooms = list(pg.rooms)

        rooms_for_list = matching_rooms
        rooms_out = [build_room_detail(room, layout_map) for room in sort_rooms(rooms_for_list)]
        total_available_beds = sum(
            sum(1 for bed in room.beds if (bed.current_status or "").lower() == "available")
            for room in pg.rooms
        )
        matching_available_beds = sum(
            sum(1 for bed in room.beds if (bed.current_status or "").lower() == "available")
            for room in matching_rooms
        )

        items.append(
            PgListItem(
                pg_id=pg.pg_id,
                pg_name=pg.pg_name,
                property_type=pg.property_type,
                gender_policy=pg.gender_policy,
                area=pg.location.area if pg.location else None,
                city=pg.location.city if pg.location else None,
                state=pg.location.state if pg.location else None,
                pincode=pg.location.pincode if pg.location else None,
                address=pg.location.address if pg.location else None,
                latitude=pg.location.latitude if pg.location else None,
                longitude=pg.location.longitude if pg.location else None,
                min_rent=min_rent,
                selected_rent=selected_rent,
                selected_sharing=selected_sharing,
                selected_security_deposit=selected_deposit,
                matching_room_count=len(matching_rooms),
                available_bed_count=matching_available_beds if matching_available_beds > 0 else total_available_beds,
                price_options=price_options,
                amenities=amenity_list,
                rooms=rooms_out,
                is_active=pg.is_active,
                data_status=pg.data_status,
                is_exact_match=getattr(pg, "_is_exact", True),
                match_category=getattr(pg, "_match_category", "Best Match"),
                compatibility_score=getattr(pg, "_compatibility_score", 90),
                images=resolve_pg_images(pg),
                recommendation_reasons=recommendation_reasons_by_pg.get(pg.pg_id, []),
            )
        )

    return PgListResponse(items=items, total=total, page=page, page_size=page_size)

@router.get("/owner/listings", response_model=List[PgDetailOut])
def get_owner_listings(db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    owner_pg_rows = db.query(OwnerPg).filter(OwnerPg.owner_id == current_owner.owner_id).all()
    pg_ids = [r.pg_id for r in owner_pg_rows]
    if not pg_ids:
        return []
    
    pgs = db.query(Pg).filter(Pg.pg_id.in_(pg_ids)).options(
        joinedload(Pg.location),
        joinedload(Pg.prices),
        joinedload(Pg.amenities).joinedload(PgAmenity.amenity),
        joinedload(Pg.images),
        joinedload(Pg.rooms).joinedload(Room.beds),
        joinedload(Pg.rooms).joinedload(Room.floor),
    ).all()

    layout_map = get_room_layouts_by_capacity(db)
    result = []
    for pg in pgs:
        min_rent = None
        if pg.prices:
            rents = [p.monthly_rent for p in pg.prices if p.monthly_rent is not None]
            if rents:
                min_rent = min(rents)
        amenity_list = []
        if pg.amenities:
            for pg_amenity in pg.amenities:
                if pg_amenity.amenity:
                    amenity_list.append(pg_amenity.amenity.amenity_name)
        rooms_out = [build_room_detail(r, layout_map) for r in sort_rooms(pg.rooms)]
        result.append(
            PgDetailOut(
                pg_id=pg.pg_id,
                pg_name=pg.pg_name,
                property_type=pg.property_type,
                gender_policy=pg.gender_policy,
                area=pg.location.area if pg.location else None,
                city=pg.location.city if pg.location else None,
                state=pg.location.state if pg.location else None,
                pincode=pg.location.pincode if pg.location else None,
                address=pg.location.address if pg.location else None,
                latitude=pg.location.latitude if pg.location else None,
                longitude=pg.location.longitude if pg.location else None,
                min_rent=min_rent,
                price_options=[PriceOptionOut(sharing_type=p.sharing_type, monthly_rent=float(p.monthly_rent) if p.monthly_rent is not None else None, security_deposit=float(p.security_deposit) if p.security_deposit is not None else None) for p in pg.prices],
                amenities=amenity_list,
                rooms=rooms_out,
                is_active=pg.is_active,
                data_status=pg.data_status,
                rating=4.5,
                review_count=12,
                images=resolve_pg_images(pg)
            )
        )
    return result

@router.get("/{pg_id}", response_model=PgDetailOut)
def get_pg_detail(pg_id: str, db: Session = Depends(get_db)):
    pg = db.query(Pg).filter(Pg.pg_id == pg_id).options(
        joinedload(Pg.location),
        joinedload(Pg.prices),
        joinedload(Pg.amenities).joinedload(PgAmenity.amenity),
        joinedload(Pg.images),
        joinedload(Pg.rooms).joinedload(Room.beds),
        joinedload(Pg.rooms).joinedload(Room.floor),
    ).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    
    min_rent = None
    if pg.prices:
        rents = [p.monthly_rent for p in pg.prices if p.monthly_rent is not None]
        if rents:
            min_rent = min(rents)

    amenity_list = []
    if pg.amenities:
        for pg_amenity in pg.amenities:
            if pg_amenity.amenity:
                amenity_list.append(pg_amenity.amenity.amenity_name)

    layout_map = get_room_layouts_by_capacity(db)
    rooms_out = [build_room_detail(r, layout_map) for r in sort_rooms(pg.rooms)]

    return PgDetailOut(
        pg_id=pg.pg_id,
        pg_name=pg.pg_name,
        property_type=pg.property_type,
        gender_policy=pg.gender_policy,
        area=pg.location.area if pg.location else None,
        city=pg.location.city if pg.location else None,
        state=pg.location.state if pg.location else None,
        pincode=pg.location.pincode if pg.location else None,
        address=pg.location.address if pg.location else None,
        latitude=pg.location.latitude if pg.location else None,
        longitude=pg.location.longitude if pg.location else None,
        min_rent=min_rent,
        price_options=[PriceOptionOut(sharing_type=p.sharing_type, monthly_rent=float(p.monthly_rent) if p.monthly_rent is not None else None, security_deposit=float(p.security_deposit) if p.security_deposit is not None else None) for p in pg.prices],
        amenities=amenity_list,
        rooms=rooms_out,
        is_active=pg.is_active,
        data_status=pg.data_status,
        rating=4.5,
        review_count=12,
        images=resolve_pg_images(pg)
    )

@router.post("", response_model=PgDetailOut)
def create_pg(pg_in: PgCreate, db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    new_pg_id = next_code_id(db, Pg, "pg_id", "PG", 3)
    
    new_pg = Pg(
        pg_id=new_pg_id,
        pg_name=pg_in.pg_name,
        property_type=pg_in.property_type,
        gender_policy=pg_in.gender_policy,
        is_active=True,
        data_status="OWNER_INPUT"
    )
    db.add(new_pg)
    db.flush()

    new_loc = PgLocation(
        pg_id=new_pg_id,
        area=pg_in.area,
        city=pg_in.city,
        address=pg_in.address,
        latitude=pg_in.latitude or 17.448,
        longitude=pg_in.longitude or 78.390,
        data_status="OWNER_INPUT"
    )
    db.add(new_loc)

    new_price = PgPrice(
        price_id=f"PRC{new_pg_id}",
        pg_id=new_pg_id,
        sharing_type=pg_in.sharing_type,
        monthly_rent=pg_in.rent,
        security_deposit=pg_in.deposit or pg_in.rent,
        data_status="OWNER_INPUT"
    )
    db.add(new_price)

    if pg_in.image_url and len(pg_in.image_url) <= 500:
        db.add(PgImage(
            pg_id=new_pg_id,
            image_url=pg_in.image_url,
            caption="Owner uploaded listing image",
            uploaded_by_owner_id=current_owner.owner_id,
            data_status="OWNER_INPUT"
        ))

    assoc = OwnerPg(
        owner_id=current_owner.owner_id,
        pg_id=new_pg_id,
        role="Primary Owner"
    )
    db.add(assoc)

    for name in pg_in.amenities:
        am = db.query(Amenity).filter(Amenity.amenity_name.ilike(name)).first()
        if not am:
            am = Amenity(amenity_name=name)
            db.add(am)
            db.flush()
        
        pg_am = PgAmenity(
            pg_amenity_id=next_code_id(db, PgAmenity, "pg_amenity_id", "OWNAM", 5),
            pg_id=new_pg_id,
            amenity_id=am.amenity_id,
            data_status="OWNER_INPUT"
        )
        db.add(pg_am)
        db.flush()

    db.commit()
    return get_pg_detail(new_pg_id, db)

@router.post("/{pg_id}/rooms", response_model=PgDetailOut)
def create_room(pg_id: str, room_in: RoomCreate, db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    assoc = db.query(OwnerPg).filter(OwnerPg.owner_id == current_owner.owner_id, OwnerPg.pg_id == pg_id).first()
    if not assoc:
        raise HTTPException(status_code=403, detail="Not authorized to edit this PG")

    floor_label = display_floor_label(room_in.floor_number)
    floor = db.query(Floor).filter(Floor.pg_id == pg_id, Floor.floor_label == floor_label).first()
    if not floor:
        floor = Floor(
            pg_id=pg_id,
            floor_label=floor_label,
            data_status="OWNER_INPUT"
        )
        db.add(floor)
        db.flush()

    new_room_id = next_code_id(db, Room, "room_id", "ROOM", 3)

    bed_statuses = [normalize_bed_status(status) for status in (room_in.bed_statuses or [])]
    normalized_statuses = [
        bed_statuses[i] if i < len(bed_statuses) else "Available"
        for i in range(room_in.sharing)
    ]
    available_count = sum(1 for status in normalized_statuses if status == "Available")
    occupied_count = room_in.sharing - available_count

    new_room = Room(
        room_id=new_room_id,
        pg_id=pg_id,
        floor_id=floor.floor_id,
        room_number=room_in.room_number,
        room_type=f"{room_in.sharing} Sharing",
        capacity=room_in.sharing,
        occupied_count=occupied_count,
        available_count=available_count,
        room_status="Available" if available_count > 0 else "Occupied",
        ac_type="Available",
        bathroom_type="Attached",
        data_status="OWNER_INPUT"
    )
    db.add(new_room)
    db.flush()

    first_bed_num = int(next_code_id(db, Bed, "bed_id", "BED", 4).replace("BED", ""))
    for i in range(1, room_in.sharing + 1):
        new_bed_id = f"BED{first_bed_num + i - 1:04d}"
        new_bed = Bed(
            bed_id=new_bed_id,
            room_id=new_room_id,
            bed_number=f"B{i}",
            bed_position="Standard",
            current_status=normalized_statuses[i - 1],
            data_status="OWNER_INPUT"
        )
        db.add(new_bed)

    db.commit()
    return get_pg_detail(pg_id, db)

@router.patch("/beds/{bed_id}/status", response_model=BedDetailOut)
def update_bed_status(bed_id: str, status_in: BedStatusUpdate, db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    from sqlalchemy import func
    bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
    if not bed:
        raise HTTPException(status_code=404, detail="Bed not found")
        
    room = db.query(Room).filter(Room.room_id == bed.room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Associated room not found")

    assoc = db.query(OwnerPg).filter(OwnerPg.owner_id == current_owner.owner_id, OwnerPg.pg_id == room.pg_id).first()
    if not assoc:
        raise HTTPException(status_code=403, detail="Not authorized to update this property")

    old_status = bed.current_status
    bed.current_status = status_in.current_status
    if status_in.notes is not None:
        bed.notes = status_in.notes

    total_beds = len(room.beds)
    occupied = sum(1 for b in room.beds if (b.current_status or "").lower() != "available")
    room.occupied_count = occupied
    room.available_count = max(0, total_beds - occupied)

    history_count = db.query(func.count(BedAvailabilityHistory.history_id)).scalar()
    new_hist_id = f"BH{int(history_count) + 1:03d}"
    history_log = BedAvailabilityHistory(
        history_id=new_hist_id,
        bed_id=bed_id,
        room_id=room.room_id,
        pg_id=room.pg_id,
        status=status_in.current_status,
        changed_by_owner_id=current_owner.owner_id,
        data_status="OWNER_INPUT",
        notes=f"Changed status from {old_status} to {status_in.current_status}"
    )
    db.add(history_log)

    db.commit()
    db.refresh(bed)

    return BedDetailOut(
        bed_id=bed.bed_id,
        room_id=bed.room_id,
        bed_number=bed.bed_number,
        bed_position=bed.bed_position,
        near_wall=bed.near_wall,
        near_window=bed.near_window,
        near_door=bed.near_door,
        current_status=bed.current_status,
        notes=bed.notes
    )

@router.put("/rooms/{room_id}/layout", response_model=RoomDetailOut)
def sync_room_layout_and_beds(
    room_id: str,
    layout_in: RoomLayoutSyncIn,
    db: Session = Depends(get_db),
    current_owner = Depends(get_current_owner)
):
    import json
    from sqlalchemy import func
    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")

    assoc = db.query(OwnerPg).filter(OwnerPg.owner_id == current_owner.owner_id, OwnerPg.pg_id == room.pg_id).first()
    if not assoc:
        # If owner is not explicitly associated yet, associate them
        assoc = OwnerPg(owner_id=current_owner.owner_id, pg_id=room.pg_id, role="Primary Owner")
        db.add(assoc)
        db.flush()

    if layout_in.layout_image_url:
        room.layout_image_url = layout_in.layout_image_url

    existing_beds = {b.bed_id: b for b in room.beds}
    incoming_ids = set()

    for item in layout_in.beds:
        normalized_st = normalize_bed_status(item.status)
        hotspot_data = {
            "x": item.x,
            "y": item.y,
            "width": item.width,
            "height": item.height
        }
        notes_val = json.dumps({"hotspot": hotspot_data})

        item_id_str = str(item.id) if item.id is not None else None
        # Check if item.id matches an existing bed in this room
        if item_id_str and item_id_str in existing_beds:
            bed = existing_beds[item_id_str]
            incoming_ids.add(item_id_str)
            old_status = bed.current_status
            if item.number:
                bed.bed_number = item.number
            if item.type:
                bed.bed_position = item.type
            bed.current_status = normalized_st
            bed.notes = notes_val
            bed.data_status = "OWNER_INPUT"

            if old_status != normalized_st:
                hist_count = db.query(func.count(BedAvailabilityHistory.history_id)).scalar()
                db.add(BedAvailabilityHistory(
                    history_id=f"BH{int(hist_count) + 1:04d}",
                    bed_id=bed.bed_id,
                    room_id=room.room_id,
                    pg_id=room.pg_id,
                    status=normalized_st,
                    changed_by_owner_id=current_owner.owner_id,
                    data_status="OWNER_INPUT",
                    notes=f"Visual Designer: changed status from {old_status} to {normalized_st}"
                ))
        else:
            # New bed added in visual designer
            new_bed_id = next_code_id(db, Bed, "bed_id", "BED", 4)
            bed_num = item.number or f"Bed {len(room.beds) + len(incoming_ids) + 1}"
            new_bed = Bed(
                bed_id=new_bed_id,
                room_id=room.room_id,
                bed_number=bed_num,
                bed_position=item.type or "Standard",
                current_status=normalized_st,
                notes=notes_val,
                data_status="OWNER_INPUT"
            )
            db.add(new_bed)
            db.flush()
            incoming_ids.add(new_bed_id)

            hist_count = db.query(func.count(BedAvailabilityHistory.history_id)).scalar()
            db.add(BedAvailabilityHistory(
                history_id=f"BH{int(hist_count) + 1:04d}",
                bed_id=new_bed_id,
                room_id=room.room_id,
                pg_id=room.pg_id,
                status=normalized_st,
                changed_by_owner_id=current_owner.owner_id,
                data_status="OWNER_INPUT",
                notes="Visual Designer: added new bed"
            ))

    # Delete any beds removed in the visual designer (if not booked)
    for old_bed_id, old_bed in list(existing_beds.items()):
        if old_bed_id not in incoming_ids:
            active_b = db.query(Booking).filter(
                Booking.bed_id == old_bed_id,
                Booking.status.in_(["Approved", "Pending", "Accepted"])
            ).first()
            if not active_b:
                db.delete(old_bed)

    db.flush()

    # Recalculate room counts
    all_current_beds = db.query(Bed).filter(Bed.room_id == room.room_id).all()
    room.capacity = len(all_current_beds)
    room.room_type = f"{len(all_current_beds)} Sharing"
    occ = sum(1 for b in all_current_beds if (b.current_status or "").lower() != "available")
    room.occupied_count = occ
    room.available_count = max(0, len(all_current_beds) - occ)
    room.room_status = "Available" if room.available_count > 0 else "Occupied"

    db.commit()
    db.refresh(room)

    layout_map = get_room_layouts_by_capacity(db)
    return build_room_detail(room, layout_map)

@router.patch("/{pg_id}", response_model=PgDetailOut)
def update_pg(pg_id: str, update_in: PgUpdate, db: Session = Depends(get_db), current_owner = Depends(get_current_owner)):
    pg = db.query(Pg).filter(Pg.pg_id == pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")

    assoc = db.query(OwnerPg).filter(OwnerPg.owner_id == current_owner.owner_id, OwnerPg.pg_id == pg_id).first()
    if not assoc:
        # If no association yet for this owner, associate them if owner is Primary
        new_assoc = OwnerPg(
            owner_id=current_owner.owner_id,
            pg_id=pg_id,
            role="Primary Owner"
        )
        db.add(new_assoc)

    if update_in.pg_name is not None:
        pg.pg_name = update_in.pg_name
    if update_in.property_type is not None:
        pg.property_type = update_in.property_type
    if update_in.gender_policy is not None:
        pg.gender_policy = update_in.gender_policy
    if update_in.is_active is not None:
        pg.is_active = update_in.is_active

    # Location updates
    if update_in.city is not None or update_in.area is not None or update_in.address is not None or update_in.latitude is not None or update_in.longitude is not None:
        loc = db.query(PgLocation).filter(PgLocation.pg_id == pg_id).first()
        if not loc:
            loc = PgLocation(pg_id=pg_id, data_status="OWNER_INPUT")
            db.add(loc)
        if update_in.city is not None:
            loc.city = update_in.city
        if update_in.area is not None:
            loc.area = update_in.area
        if update_in.address is not None:
            loc.address = update_in.address
        if update_in.latitude is not None:
            loc.latitude = update_in.latitude
        if update_in.longitude is not None:
            loc.longitude = update_in.longitude

    # Price / Rent updates
    if update_in.rent is not None or update_in.deposit is not None or update_in.sharing_type is not None:
        price = db.query(PgPrice).filter(PgPrice.pg_id == pg_id).first()
        if not price:
            price = PgPrice(
                price_id=f"PRC{pg_id}",
                pg_id=pg_id,
                sharing_type=update_in.sharing_type or "3 Sharing",
                monthly_rent=update_in.rent or 7000.0,
                security_deposit=update_in.deposit or update_in.rent or 7000.0,
                data_status="OWNER_INPUT"
            )
            db.add(price)
        else:
            if update_in.rent is not None:
                price.monthly_rent = update_in.rent
            if update_in.deposit is not None:
                price.security_deposit = update_in.deposit
            if update_in.sharing_type is not None:
                price.sharing_type = update_in.sharing_type

    # Amenities update
    if update_in.amenities is not None:
        db.query(PgAmenity).filter(PgAmenity.pg_id == pg_id).delete()
        for name in update_in.amenities:
            if not name:
                continue
            am = db.query(Amenity).filter(Amenity.amenity_name.ilike(name)).first()
            if not am:
                am = Amenity(amenity_name=name)
                db.add(am)
                db.flush()
            pg_am = PgAmenity(
                pg_amenity_id=next_code_id(db, PgAmenity, "pg_amenity_id", "OWNAM", 5),
                pg_id=pg_id,
                amenity_id=am.amenity_id,
                data_status="OWNER_INPUT"
            )
            db.add(pg_am)
            db.flush()

    # Image updates
    if update_in.image_url:
        img = db.query(PgImage).filter(PgImage.pg_id == pg_id).first()
        if img:
            img.image_url = update_in.image_url
        else:
            db.add(PgImage(
                pg_id=pg_id,
                image_url=update_in.image_url,
                caption="Owner uploaded listing image",
                uploaded_by_owner_id=current_owner.owner_id,
                data_status="OWNER_INPUT"
            ))

    db.commit()
    return get_pg_detail(pg_id, db)
