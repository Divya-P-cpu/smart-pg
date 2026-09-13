from sqlalchemy import func

from app.db.database import SessionLocal
from app.models import Amenity, Bed, Floor, Pg, PgAmenity, PgLocation, PgPrice, Room


BASIC_AMENITIES = [
    "Wi-Fi",
    "Housekeeping",
    "Washing Machine",
    "Food",
    "Geyser",
    "Attached Bathroom",
]

EXTRA_AMENITIES = [
    "CCTV",
    "Laundry",
    "Lift",
    "Parking",
    "Power Backup",
    "AC",
    "Personal Locker",
    "Kitchen",
    "TV",
    "Security",
    "Hot Water",
    "Wi-Fi / Internet",
]

PG_FIXTURES = {
    # 1. Madhapur - The Legacy Co Live (Male / Unisex)
    "PG006": {
        "gender_policy": "Male",
        "prices": [
            ("PRC0063", "Basic 3 Sharing", "3 Sharing", 7000, 7000),
            ("PRC0064", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0065", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0066", "Executive 3 Sharing", "3 Sharing", 9000, 9000),
            ("PRC0067", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Laundry", "Parking", "AC", "Power Backup"],
        "rooms": [
            ("ROOM120", "201", "Executive 3 Sharing AC", 3, ["Occupied", "Available", "Available"]),
            ("ROOM121", "202", "Executive 3 Sharing", 3, ["Occupied", "Occupied", "Available"]),
            ("ROOM122", "203", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM123", "204", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
        ],
    },
    # 2. Madhapur - Madhapur Metro Living (Unisex / Male / Female friendly)
    "PG017": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0173", "Standard 3 Sharing", "3 Sharing", 8000, 8000),
            ("PRC0174", "Standard 4 Sharing", "4 Sharing", 7500, 7500),
            ("PRC0175", "Standard 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0176", "Deluxe 3 Sharing AC", "3 Sharing", 9500, 9500),
            ("PRC0177", "Deluxe 3 Sharing Premium", "3 Sharing", 10000, 10000),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Laundry", "Lift", "Hot Water", "Power Backup", "AC", "Parking"],
        "rooms": [
            ("ROOM078", "101", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM079", "102", "Standard 3 Sharing", 3, ["Occupied", "Occupied", "Available"]),
            ("ROOM080", "104", "Standard 4 Sharing", 4, ["Occupied", "Available", "Available", "Available"]),
            ("ROOM081", "105", "Standard 4 Sharing", 4, ["Reserved", "Occupied", "Available", "Available"]),
            ("ROOM113", "106", "Deluxe 3 Sharing AC", 3, ["Occupied", "Available", "Available"]),
        ],
    },
    # 3. Madhapur - Madhapur All-Inclusive Living (Unisex)
    "PG024": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0243", "Facility Plus 3 Sharing", "3 Sharing", 10000, 10000),
            ("PRC0244", "Facility Plus 4 Sharing", "4 Sharing", 9000, 9000),
            ("PRC0245", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0246", "Basic 3 Sharing", "3 Sharing", 7000, 7000),
            ("PRC0247", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + EXTRA_AMENITIES,
        "rooms": [
            ("ROOM082", "201", "Facility Plus 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM083", "202", "Facility Plus 3 Sharing", 3, ["Reserved", "Occupied", "Available"]),
            ("ROOM084", "203", "Facility Plus 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM085", "204", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
        ],
    },
    # 4. Madhapur - Sri Syam Luxury Stay (Female / Unisex sections)
    "PG004": {
        "gender_policy": "Female",
        "prices": [
            ("PRC0043", "Basic 3 Sharing", "3 Sharing", 7000, 7000),
            ("PRC0044", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0045", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0046", "Deluxe 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Laundry", "Lift", "AC", "Parking"],
        "rooms": [
            ("ROOM074", "301", "Basic 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM075", "302", "Basic 3 Sharing", 3, ["Occupied", "Occupied", "Available"]),
            ("ROOM076", "401", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM077", "402", "Basic 4 Sharing", 4, ["Reserved", "Occupied", "Available", "Available"]),
            ("ROOM112", "303", "Deluxe 3 Sharing AC", 3, ["Occupied", "Available", "Available"]),
        ],
    },
    # 5. Gachibowli - Bhanu Guest House (Male / Unisex)
    "PG005": {
        "gender_policy": "Male",
        "prices": [
            ("PRC0055", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0054", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0053", "Basic 3 Sharing", "3 Sharing", 7000, 7000),
            ("PRC0056", "Executive 3 Sharing", "3 Sharing", 9000, 9000),
            ("PRC0057", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Security", "Parking", "AC"],
        "rooms": [
            ("ROOM086", "501", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Reserved", "Available", "Available"]),
            ("ROOM087", "502", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
            ("ROOM090", "503", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM091", "504", "Basic 3 Sharing", 3, ["Occupied", "Available", "Available"]),
        ],
    },
    # 6. Gachibowli - WorkNest PG (Male / Unisex)
    "PG018": {
        "gender_policy": "Male",
        "prices": [
            ("PRC0185", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0184", "Standard 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0183", "Standard 3 Sharing", "3 Sharing", 7500, 7500),
            ("PRC0186", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
            ("PRC0182", "Standard 2 Sharing", "2 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Parking", "Security", "AC"],
        "rooms": [
            ("ROOM088", "601", "Basic 5 Sharing", 5, ["Occupied", "Reserved", "Available", "Available", "Available"]),
            ("ROOM089", "602", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
            ("ROOM092", "603", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM093", "604", "Standard 2 Sharing", 2, ["Occupied", "Available"]),
        ],
    },
    # 7. Gachibowli - Comfort Homes (PG025)
    "PG025": {
        "gender_policy": "Male",
        "prices": [
            ("PRC0255", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0254", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0253", "Standard 3 Sharing", "3 Sharing", 7500, 7500),
            ("PRC0256", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Parking", "Security", "Power Backup", "AC"],
        "rooms": [
            ("ROOM114", "1301", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Available", "Available", "Available"]),
            ("ROOM115", "1302", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM116", "1303", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
        ],
    },
    # 8. Kondapur - Lakeview Stay (Unisex)
    "PG019": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0195", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0194", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0193", "Standard 3 Sharing", "3 Sharing", 7500, 7500),
            ("PRC0196", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["CCTV", "Hot Water", "Power Backup", "AC", "Parking"],
        "rooms": [
            ("ROOM094", "701", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM095", "702", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM096", "703", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Reserved", "Available", "Available"]),
        ],
    },
    # 9. Bangalore - Koramangala Green House (Unisex)
    "PG020": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0205", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0204", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0203", "Standard 3 Sharing", "3 Sharing", 8000, 8000),
            ("PRC0206", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["Laundry", "Power Backup", "CCTV", "Lift", "AC", "Parking"],
        "rooms": [
            ("ROOM097", "801", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM098", "802", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM099", "803", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
        ],
    },
    # 10. Bangalore - HSR Layout Urban Nest (Unisex / Female)
    "PG021": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0215", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0214", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0213", "Standard 3 Sharing", "3 Sharing", 7500, 7500),
            ("PRC0216", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
            ("PRC0212", "Standard 2 Sharing", "2 Sharing", 10500, 10500),
        ],
        "amenities": BASIC_AMENITIES + ["Food", "Security", "AC", "Parking", "CCTV"],
        "rooms": [
            ("ROOM100", "901", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM101", "902", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM102", "903", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
        ],
    },
    # 11. Bangalore - Whitefield TechStay (Male / Unisex)
    "PG022": {
        "gender_policy": "Male",
        "prices": [
            ("PRC0225", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0224", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0223", "Standard 3 Sharing", "3 Sharing", 7500, 7500),
            ("PRC0226", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["Lift", "AC", "Power Backup", "Security", "CCTV", "Parking"],
        "rooms": [
            ("ROOM103", "1001", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM104", "1002", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM105", "1003", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Reserved", "Available", "Available"]),
        ],
    },
    # 12. Bangalore - Koramangala Value Stay (Unisex)
    "PG026": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0265", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0264", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0263", "Basic 3 Sharing", "3 Sharing", 7000, 7000),
            ("PRC0266", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["Laundry", "Power Backup", "CCTV", "AC", "Parking"],
        "rooms": [
            ("ROOM106", "1101", "Basic 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM107", "1102", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM108", "1103", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Occupied", "Available", "Available"]),
        ],
    },
    # 13. Bangalore - HSR Complete Comfort PG (Unisex)
    "PG027": {
        "gender_policy": "Unisex",
        "prices": [
            ("PRC0275", "Basic 5 Sharing", "5 Sharing", 6500, 6500),
            ("PRC0274", "Basic 4 Sharing", "4 Sharing", 7000, 7000),
            ("PRC0273", "Standard 3 Sharing", "3 Sharing", 7500, 7500),
            ("PRC0276", "Executive 3 Sharing AC", "3 Sharing", 9500, 9500),
        ],
        "amenities": BASIC_AMENITIES + ["AC", "Lift", "Security", "CCTV", "Laundry", "Parking"],
        "rooms": [
            ("ROOM109", "1201", "Standard 3 Sharing", 3, ["Occupied", "Available", "Available"]),
            ("ROOM110", "1202", "Basic 4 Sharing", 4, ["Occupied", "Occupied", "Available", "Available"]),
            ("ROOM111", "1203", "Basic 5 Sharing", 5, ["Occupied", "Occupied", "Reserved", "Available", "Available"]),
        ],
    },
}


def ensure_amenity(db, name):
    amenity = db.query(Amenity).filter(func.lower(Amenity.amenity_name) == name.lower()).first()
    if amenity:
        return amenity
    amenity = Amenity(amenity_name=name)
    db.add(amenity)
    db.flush()
    return amenity


def ensure_pg_amenity(db, pg_id, amenity):
    existing = (
        db.query(PgAmenity)
        .filter(PgAmenity.pg_id == pg_id, PgAmenity.amenity_id == amenity.amenity_id)
        .first()
    )
    if existing:
        existing.data_status = "SAMPLE"
        existing.amenity_source = "Affordable recommendation sample data"
        return

    link = PgAmenity(
        pg_amenity_id=f"AR{pg_id[-3:]}{amenity.amenity_id:05d}",
        pg_id=pg_id,
        amenity_id=amenity.amenity_id,
        data_status="SAMPLE",
        amenity_source="Affordable recommendation sample data",
    )
    db.add(link)


def upsert_price(db, pg_id, price_id, room_type, sharing_type, rent, deposit):
    price = db.query(PgPrice).filter(PgPrice.price_id == price_id).first()
    if not price:
        price = PgPrice(price_id=price_id, pg_id=pg_id)
        db.add(price)
    price.pg_id = pg_id
    price.room_type = room_type
    price.sharing_type = sharing_type
    price.monthly_rent = rent
    price.monthly_rent_raw = f"Rs.{rent}/month"
    price.security_deposit = deposit
    price.security_deposit_raw = f"Rs.{deposit}"
    price.data_status = "SAMPLE"
    price.price_source = "Affordable recommendation sample data"


def ensure_floor(db, pg_id):
    floor = db.query(Floor).filter(Floor.pg_id == pg_id, Floor.floor_label == "Sample Recommendation Floor").first()
    if floor:
        return floor
    floor = Floor(pg_id=pg_id, floor_label="Sample Recommendation Floor", data_status="SAMPLE")
    db.add(floor)
    db.flush()
    return floor


def upsert_room_with_beds(db, pg_id, floor_id, room_id, room_number, room_type, statuses):
    capacity = len(statuses)
    available_count = sum(1 for status in statuses if status.lower() == "available")
    occupied_count = capacity - available_count

    room = db.query(Room).filter(Room.room_id == room_id).first()
    if not room:
        room = Room(room_id=room_id, pg_id=pg_id, floor_id=floor_id)
        db.add(room)
    room.pg_id = pg_id
    room.floor_id = floor_id
    room.room_number = room_number
    room.room_type = room_type
    room.capacity = capacity
    room.occupied_count = occupied_count
    room.available_count = available_count
    room.room_status = "Available" if available_count > 0 else "Full"
    room.ac_type = "AC" if ("Facility Plus" in room_type or "AC" in room_type) else "Non-AC"
    room.bathroom_type = "Attached"
    room.data_status = "SAMPLE"

    for index, status in enumerate(statuses, start=1):
        bed_id = f"BD{room_id[-3:]}{index:02d}"
        bed = db.query(Bed).filter(Bed.bed_id == bed_id).first()
        if not bed:
            bed = Bed(bed_id=bed_id, room_id=room_id)
            db.add(bed)
        bed.room_id = room_id
        bed.bed_number = f"B{index}"
        bed.bed_position = "Mapped Bed"
        bed.near_wall = "No"
        bed.near_window = "No"
        bed.near_door = "No"
        bed.current_status = status
        bed.data_status = "SAMPLE"


def main():
    db = SessionLocal()
    try:
        for pg_id, fixture in PG_FIXTURES.items():
            pg = db.query(Pg).filter(Pg.pg_id == pg_id).first()
            if not pg:
                continue
            pg.gender_policy = fixture["gender_policy"]
            pg.is_active = True
            pg.data_status = "SAMPLE"

            for price in fixture["prices"]:
                upsert_price(db, pg_id, *price)

            for amenity_name in fixture["amenities"]:
                ensure_pg_amenity(db, pg_id, ensure_amenity(db, amenity_name))

            floor = ensure_floor(db, pg_id)
            for room_id, room_number, room_type, capacity, statuses in fixture["rooms"]:
                if capacity != len(statuses):
                    raise ValueError(f"{room_id} capacity/status mismatch")
                upsert_room_with_beds(db, pg_id, floor.floor_id, room_id, room_number, room_type, statuses)

        db.commit()
        print("Seeded affordable recommendation sample data successfully with multi-price tiers.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
