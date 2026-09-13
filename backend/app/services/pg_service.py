from typing import Optional, List, Tuple
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session, joinedload
# pyrefly: ignore [missing-import]
from sqlalchemy import func, or_, and_, select
from app.models import Pg, PgLocation, PgPrice, Room, Bed, Amenity, PgAmenity


BASIC_AMENITIES = {
    "wifi", "wi fi", "internet",
    "food", "mess", "meals", "homely food",
    "housekeeping", "cleaning",
    "washing machine", "washing", "laundry",
    "geyser", "hot water",
    "attached bathroom", "attached bath"
}

PREMIUM_AMENITY_INCREMENTS = {
    "ac": 2000,
    "air conditioning": 2000,
    "parking": 500,
    "bike parking": 400,
    "car parking": 600,
    "lift": 300,
    "elevator": 300,
    "power backup": 500,
    "generator": 500,
    "tv": 300,
    "personal locker": 250,
    "locker": 250,
    "cctv": 200,
    "security": 300,
    "kitchen": 400,
    "study table": 200
}

AMENITY_ALIASES = {
    "wifi": ["Wi-Fi", "Internet", "Internet/Wi-Fi", "Wi-Fi / Internet"],
    "wi fi": ["Wi-Fi", "Internet", "Internet/Wi-Fi", "Wi-Fi / Internet"],
    "internet": ["Wi-Fi", "Internet", "Internet/Wi-Fi", "Wi-Fi / Internet"],
    "wi-fi": ["Wi-Fi", "Internet", "Internet/Wi-Fi", "Wi-Fi / Internet"],
    "geyser": ["Geyser", "Hot Water"],
    "hot water": ["Hot Water", "Geyser"],
    "hot_water": ["Hot Water", "Geyser"],
    "attached bath": ["Attached Bathroom", "Attached Bath"],
    "attached bathroom": ["Attached Bathroom", "Attached Bath"],
    "attached_bathroom": ["Attached Bathroom", "Attached Bath"],
    "attached_bath": ["Attached Bathroom", "Attached Bath"],
    "personal locker": ["Personal Locker", "Locker"],
    "personal_locker": ["Personal Locker", "Locker"],
    "locker": ["Personal Locker", "Locker"],
    "washing machine": ["Washing Machine", "Laundry", "Washing"],
    "washing_machine": ["Washing Machine", "Laundry", "Washing"],
    "washing": ["Washing Machine", "Laundry", "Washing"],
    "laundry": ["Laundry", "Washing Machine"],
    "housekeeping": ["Housekeeping", "Cleaning"],
    "food": ["Food", "Food (Homely Food, Daily Chapathi)", "Mess", "Meals"],
    "ac": ["AC", "Air Conditioning", "Air Conditioner"],
    "air conditioning": ["AC", "Air Conditioning", "Air Conditioner"],
    "air conditioner": ["AC", "Air Conditioning", "Air Conditioner"],
    "cctv": ["CCTV", "Security Camera", "Camera"],
    "lift": ["Lift", "Elevator"],
    "parking": ["Parking", "Bike Parking", "Car Parking"],
    "power backup": ["Power Backup", "Generator"],
    "power_backup": ["Power Backup", "Generator"],
    "security": ["Security", "Guard", "24/7 Security"],
    "tv": ["TV", "Television"],
    "kitchen": ["Kitchen"],
    "study table": ["Study Table"],
    "study_table": ["Study Table"]
}


def normalize_amenity_name(name: str) -> str:
    return " ".join(str(name or "").lower().replace("-", " ").replace("_", " ").split())


def is_basic_amenity(name: str) -> bool:
    norm = normalize_amenity_name(name)
    return any(b in norm for b in BASIC_AMENITIES)


def amenity_names_for_requirement(name: str) -> list[str]:
    """Return equivalent stored amenity names for a user-facing requirement."""
    normalized = normalize_amenity_name(name)
    if normalized in AMENITY_ALIASES:
        return AMENITY_ALIASES[normalized]
    for key, aliases in AMENITY_ALIASES.items():
        if key in normalized or normalized in key:
            return aliases
    return [name]


def pg_has_amenity(pg_amenity_names: list[str], required_amenity: str) -> bool:
    """Check if a PG possesses the required amenity or any of its aliases."""
    expected_variants = [normalize_amenity_name(v) for v in amenity_names_for_requirement(required_amenity)]
    norm_req = normalize_amenity_name(required_amenity)
    if norm_req not in expected_variants:
        expected_variants.append(norm_req)

    for pg_am in pg_amenity_names:
        norm_pg = normalize_amenity_name(pg_am)
        if norm_pg in expected_variants:
            return True
        for v in expected_variants:
            if v and (v in norm_pg or norm_pg in v):
                return True
    return False


def extract_area_keywords(area_str: str) -> list[str]:
    if not area_str:
        return []
    parts = [p.strip() for p in area_str.split(",") if p.strip()]
    return parts


def build_gender_filter(gender: Optional[str]):
    if not gender:
        return None
    gender_value = gender.lower().strip()
    if gender_value in ["female", "female only", "women", "womens", "girls"]:
        return or_(
            Pg.gender_policy.ilike("%female%"),
            Pg.gender_policy.ilike("%women%"),
            Pg.gender_policy.ilike("%girls%"),
            Pg.gender_policy.ilike("%unisex%"),
            Pg.gender_policy.ilike("%co-ed%"),
            Pg.gender_policy.ilike("%co living%"),
            Pg.gender_policy.ilike("%coliving%"),
            Pg.gender_policy.ilike("%any%"),
            Pg.gender_policy.is_(None),
        )
    elif gender_value in ["male", "male only", "men", "mens", "boys"]:
        return and_(
            or_(
                Pg.gender_policy.ilike("%male%"),
                Pg.gender_policy.ilike("%men%"),
                Pg.gender_policy.ilike("%boys%"),
                Pg.gender_policy.ilike("%unisex%"),
                Pg.gender_policy.ilike("%co-ed%"),
                Pg.gender_policy.ilike("%co living%"),
                Pg.gender_policy.ilike("%coliving%"),
                Pg.gender_policy.ilike("%any%"),
                Pg.gender_policy.is_(None),
            ),
            ~Pg.gender_policy.ilike("%female%"),
            ~Pg.gender_policy.ilike("%women%"),
            ~Pg.gender_policy.ilike("%girls%"),
        )
    elif gender_value in ["unisex", "co-ed", "co-living", "coliving"]:
        return or_(
            Pg.gender_policy.ilike("%unisex%"),
            Pg.gender_policy.ilike("%co-ed%"),
            Pg.gender_policy.ilike("%co living%"),
            Pg.gender_policy.ilike("%coliving%"),
            Pg.gender_policy.ilike("%any%"),
            Pg.gender_policy.is_(None),
        )
    return Pg.gender_policy.ilike(f"%{gender}%")


def calculate_dynamic_pg_pricing(
    pg_prices: list[PgPrice],
    pg_amenity_names: list[str],
    requested_amenities: Optional[list[str]] = None,
    sharing: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None
) -> Tuple[Optional[float], Optional[str], Optional[float], list[str]]:
    """
    Computes dynamic pricing based on:
    1. Base PG amenities (included in base price)
    2. Selected premium amenities (AC, Parking, Lift, Power Backup, TV, Locker, etc.)
    3. Stored DB price tiers for matching sharing type
    Returns: (selected_rent, selected_sharing, selected_deposit, price_reasons)
    """
    req_amenities = requested_amenities or []
    req_premium = [am for am in req_amenities if not is_basic_amenity(am)]
    pg_premium = [am for am in pg_amenity_names if not is_basic_amenity(am)]

    requested_sharing = "".join(ch for ch in str(sharing or "") if ch.isdigit())

    # Filter prices by sharing if specified
    matching_prices = [
        p for p in pg_prices
        if p.monthly_rent is not None and (
            not requested_sharing
            or (p.sharing_type and requested_sharing in str(p.sharing_type))
        )
    ]

    if not matching_prices:
        matching_prices = [p for p in pg_prices if p.monthly_rent is not None]

    reasons: list[str] = []

    if not matching_prices:
        base_rent = 7500.0
        sharing_label = f"{sharing} Sharing" if sharing else "3 Sharing"
        deposit = base_rent
        return base_rent, sharing_label, deposit, ["Standard pricing"]

    has_ac_req = any("ac" in am.lower() or "air condition" in am.lower() for am in req_premium)

    ac_prices = [
        p for p in matching_prices
        if "ac" in str(p.room_type or "").lower() or "deluxe" in str(p.room_type or "").lower()
    ]
    standard_prices = [
        p for p in matching_prices
        if "standard" in str(p.room_type or "").lower() or "basic" in str(p.room_type or "").lower() or "non-ac" in str(p.room_type or "").lower()
    ]

    selected_price_row: Optional[PgPrice] = None
    if has_ac_req and ac_prices:
        selected_price_row = min(ac_prices, key=lambda p: float(p.monthly_rent))
        reasons.append("Deluxe/AC room tier included")
    elif not has_ac_req and standard_prices:
        selected_price_row = min(standard_prices, key=lambda p: float(p.monthly_rent))
        reasons.append("Base amenities included in standard tier")
    else:
        # Pick price that best fits budget if provided
        if max_budget is not None:
            fit_prices = [p for p in matching_prices if float(p.monthly_rent) <= max_budget]
            if fit_prices:
                selected_price_row = max(fit_prices, key=lambda p: float(p.monthly_rent))
            else:
                selected_price_row = min(matching_prices, key=lambda p: float(p.monthly_rent))
        else:
            selected_price_row = min(matching_prices, key=lambda p: float(p.monthly_rent))

    calculated_rent = float(selected_price_row.monthly_rent)
    sharing_label = selected_price_row.sharing_type or (f"{sharing} Sharing" if sharing else "3 Sharing")

    # Dynamic price increment calculation for extra requested premium amenities
    premium_addon_total = 0.0
    for am in req_premium:
        norm_am = normalize_amenity_name(am)
        if any(norm_am in normalize_amenity_name(pg_am) for pg_am in pg_premium):
            if ("ac" in norm_am or "air" in norm_am) and selected_price_row in ac_prices:
                continue
            for k, cost in PREMIUM_AMENITY_INCREMENTS.items():
                if k in norm_am:
                    premium_addon_total += cost
                    reasons.append(f"+₹{cost} for {am}")
                    break

    final_rent = calculated_rent + premium_addon_total
    deposit = float(selected_price_row.security_deposit) if selected_price_row.security_deposit is not None else final_rent

    return final_rent, sharing_label, deposit, reasons


def score_pg_candidate(
    pg: Pg,
    city: Optional[str] = None,
    area: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    gender: Optional[str] = None,
    amenities: Optional[List[str]] = None,
    sharing: Optional[str] = None,
    beds_required: int = 1
) -> Tuple[float, bool, dict]:
    """
    Computes multi-factor match score (0-100+) for a PG against user filters.
    Returns: (score, is_exact_match, details)
    """
    score = 0.0
    details = {
        "area_matched": False,
        "budget_matched": False,
        "sharing_matched": False,
        "gender_matched": False,
        "matched_amenities": [],
        "missing_amenities": [],
        "available_beds": 0
    }

    # 1. Location Scoring
    pg_area = pg.location.area.lower() if pg.location and pg.location.area else ""
    pg_addr = pg.location.address.lower() if pg.location and pg.location.address else ""
    if area:
        area_keywords = [k.lower().strip() for k in extract_area_keywords(area)]
        area_match = any(k in pg_area or k in pg_addr for k in area_keywords if k)
        if area_match:
            score += 35.0
            details["area_matched"] = True
        else:
            # Same city fallback score
            score += 15.0
    else:
        score += 25.0
        details["area_matched"] = True

    # 2. Gender Scoring
    pg_gender = (pg.gender_policy or "").lower()
    req_gender = (gender or "").lower().strip()
    if req_gender:
        if req_gender in ["female", "women", "girls"]:
            if any(w in pg_gender for w in ["female", "women", "girls"]):
                score += 20.0
                details["gender_matched"] = True
            elif any(w in pg_gender for w in ["unisex", "co-ed", "co living", "coliving"]) or not pg_gender:
                score += 18.0
                details["gender_matched"] = True
        elif req_gender in ["male", "men", "boys"]:
            if any(w in pg_gender for w in ["male", "men", "boys"]) and not any(w in pg_gender for w in ["female", "women"]):
                score += 20.0
                details["gender_matched"] = True
            elif any(w in pg_gender for w in ["unisex", "co-ed", "co living", "coliving"]) or not pg_gender:
                score += 18.0
                details["gender_matched"] = True
        else:
            score += 18.0
            details["gender_matched"] = True
    else:
        score += 18.0
        details["gender_matched"] = True

    # 3. Sharing Scoring
    req_sharing_digits = "".join(ch for ch in str(sharing or "") if ch.isdigit())
    pg_sharings = [str(p.sharing_type or "") for p in pg.prices if p.sharing_type]
    pg_room_capacities = [r.capacity for r in pg.rooms if r.capacity]

    if req_sharing_digits:
        has_sharing_price = any(req_sharing_digits in s for s in pg_sharings)
        has_sharing_room = int(req_sharing_digits) in pg_room_capacities
        if has_sharing_price or has_sharing_room:
            score += 20.0
            details["sharing_matched"] = True
        elif pg_sharings or pg_room_capacities:
            score += 8.0
    else:
        score += 15.0
        details["sharing_matched"] = True

    # 4. Budget Scoring
    pg_rents = [float(p.monthly_rent) for p in pg.prices if p.monthly_rent is not None]
    min_rent = min(pg_rents) if pg_rents else None

    if max_budget is not None and pg_rents:
        # Check if any price fits in budget
        fit_rents = [r for r in pg_rents if r <= max_budget and (min_budget is None or r >= min_budget)]
        if fit_rents:
            score += 25.0
            details["budget_matched"] = True
        elif min_rent is not None and min_rent <= max_budget * 1.15:
            # Within 15% comfort margin
            score += 15.0
        elif min_rent is not None:
            score += 5.0
    elif pg_rents:
        score += 20.0
        details["budget_matched"] = True
    else:
        score += 10.0

    # 5. Amenities Scoring (Basic + Additional)
    pg_amenities_list = [pa.amenity.amenity_name for pa in pg.amenities if pa.amenity]
    req_amenities = [am for am in (amenities or []) if am]

    if req_amenities:
        matched = []
        missing = []
        for am in req_amenities:
            if pg_has_amenity(pg_amenities_list, am):
                matched.append(am)
            else:
                missing.append(am)

        details["matched_amenities"] = matched
        details["missing_amenities"] = missing

        ratio = len(matched) / len(req_amenities)
        score += ratio * 30.0

        # Exact amenity match bonus
        if len(missing) == 0:
            score += 10.0
    else:
        score += 20.0
        details["matched_amenities"] = pg_amenities_list[:4]

    # 6. Room and Bed Availability Scoring
    avail_beds = sum(
        sum(1 for b in r.beds if (b.current_status or "").lower() == "available")
        for r in pg.rooms
    )
    details["available_beds"] = avail_beds
    if avail_beds >= beds_required:
        score += 15.0
    elif avail_beds > 0:
        score += 8.0

    # Exact Match Criteria:
    # Matches area, gender, budget (if specified), sharing (if specified), and >= 80% amenities
    is_exact = (
        details["area_matched"]
        and details["gender_matched"]
        and (max_budget is None or details["budget_matched"])
        and (not req_sharing_digits or details["sharing_matched"])
        and (not req_amenities or len(details["missing_amenities"]) == 0)
    )

    return score, is_exact, details


def search_pgs(
    db: Session,
    city: Optional[str] = None,
    area: Optional[str] = None,
    min_budget: Optional[float] = None,
    max_budget: Optional[float] = None,
    gender: Optional[str] = None,
    amenities: Optional[List[str]] = None,
    sharing: Optional[str] = None,
    beds_required: int = 1,
    page: int = 1,
    page_size: int = 10,
) -> Tuple[List[Pg], int]:
    """
    Dynamic PG search with multi-tier ranking.
    Always recommends at least 2-3 distinct quality PGs from the database
    by prioritizing exact matches followed by closest compatible partial matches.
    Additional amenities contribute positively to ranking without causing zero results.
    """
    # 1. Base Query for Active PGs with all relationships loaded
    query = (
        select(Pg)
        .where(Pg.is_active == True)
        .options(
            joinedload(Pg.location),
            joinedload(Pg.prices),
            joinedload(Pg.amenities).joinedload(PgAmenity.amenity),
            joinedload(Pg.images),
            joinedload(Pg.rooms).joinedload(Room.beds),
            joinedload(Pg.rooms).joinedload(Room.floor),
        )
    )

    # 2. Hard constraint: City filter (if specified)
    if city:
        query = query.join(PgLocation, Pg.pg_id == PgLocation.pg_id).where(
            PgLocation.city.ilike(f"%{city.strip()}%")
        )

    # 3. Hard constraint: Gender filter (if specified)
    gender_cond = build_gender_filter(gender)
    if gender_cond is not None:
        query = query.where(gender_cond)

    candidates = db.execute(query).scalars().unique().all()
    if not candidates:
        # If city had no matches, check without city restriction if needed, or return empty
        return [], 0

    # 4. Score and Rank all candidates dynamically
    scored_candidates = []
    for pg in candidates:
        score, is_exact, details = score_pg_candidate(
            pg=pg,
            city=city,
            area=area,
            min_budget=min_budget,
            max_budget=max_budget,
            gender=gender,
            amenities=amenities,
            sharing=sharing,
            beds_required=beds_required
        )
        scored_candidates.append((score, is_exact, details, pg))

    # Sort descending by score
    scored_candidates.sort(key=lambda item: item[0], reverse=True)

    # 5. Build Result List (Exact matches first, then strongest partial matches)
    final_pgs: List[Pg] = []
    seen_ids = set()

    for score, is_exact, details, pg in scored_candidates:
        if pg.pg_id in seen_ids:
            continue
        seen_ids.add(pg.pg_id)

        # Set dynamic match metadata on PG model object
        setattr(pg, "_is_exact", is_exact)
        if is_exact:
            setattr(pg, "_match_category", "Exact Match")
        elif score >= 80:
            setattr(pg, "_match_category", "Best Match")
        elif score >= 60:
            setattr(pg, "_match_category", "Strong Match")
        else:
            setattr(pg, "_match_category", "Closest Match")

        setattr(pg, "_compatibility_score", min(99, max(45, int(score))))
        final_pgs.append(pg)

    total = len(final_pgs)
    offset = (page - 1) * page_size
    return final_pgs[offset : offset + page_size], total

