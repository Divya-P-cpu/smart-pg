from __future__ import annotations

import re

from app.db.database import SessionLocal
from app.models import Bed, Floor, Room


ORDINAL_LABELS = {
    1: "1st Floor",
    2: "2nd Floor",
    3: "3rd Floor",
}


def floor_label_for_number(number: int) -> str:
    if number <= 0:
        return "Ground Floor"
    return ORDINAL_LABELS.get(number, f"{number}th Floor")


def normalize_existing_floor_label(label: str | None) -> str | None:
    value = (label or "").strip()
    lower = value.lower()
    if not value:
        return None
    if "ground" in lower:
        return "Ground Floor"
    match = re.search(r"(\d+)", lower)
    if match:
        return floor_label_for_number(int(match.group(1)))
    if lower.startswith("1st") or lower.startswith("first"):
        return "1st Floor"
    if lower.startswith("2nd") or lower.startswith("second"):
        return "2nd Floor"
    if lower.startswith("3rd") or lower.startswith("third"):
        return "3rd Floor"
    if lower.startswith("4th") or lower.startswith("fourth"):
        return "4th Floor"
    return value


def infer_floor_label_from_room(room_number: str | None) -> str | None:
    value = (room_number or "").strip()
    lower = value.lower()
    if not value:
        return None
    if lower.startswith("ground") or lower.startswith("g-") or lower.startswith("g0"):
        return "Ground Floor"
    if lower.startswith("1st") or lower.startswith("first"):
        return "1st Floor"
    if lower.startswith("2nd") or lower.startswith("second"):
        return "2nd Floor"
    if lower.startswith("3rd") or lower.startswith("third"):
        return "3rd Floor"
    if lower.startswith("4th") or lower.startswith("fourth"):
        return "4th Floor"

    digits_match = re.match(r"^(\d{3,4})", value)
    if digits_match:
        room_num = int(digits_match.group(1))
        return floor_label_for_number(room_num // 100)

    return None


def get_or_create_floor(db, pg_id: str, floor_label: str) -> Floor:
    floors = db.query(Floor).filter(Floor.pg_id == pg_id).all()
    for floor in floors:
        if normalize_existing_floor_label(floor.floor_label) == floor_label:
            if floor.floor_label != floor_label:
                floor.floor_label = floor_label
            return floor

    floor = Floor(pg_id=pg_id, floor_label=floor_label, data_status="REPAIRED")
    db.add(floor)
    db.flush()
    return floor


def repair_floor_room_mapping() -> None:
    changes: list[str] = []
    renames: list[str] = []
    with SessionLocal() as db:
        rooms = db.query(Room).order_by(Room.pg_id, Room.room_number, Room.room_id).all()

        for room in rooms:
            inferred_label = infer_floor_label_from_room(room.room_number)
            current_label = normalize_existing_floor_label(room.floor.floor_label if room.floor else None)
            target_label = inferred_label or current_label or "Ground Floor"
            target_floor = get_or_create_floor(db, room.pg_id, target_label)

            if room.floor_id != target_floor.floor_id:
                changes.append(
                    f"{room.pg_id} {room.room_number or room.room_id}: floor_id {room.floor_id} -> {target_floor.floor_id} ({target_label})"
                )
                room.floor_id = target_floor.floor_id

            beds = db.query(Bed).filter(Bed.room_id == room.room_id).all()
            room.occupied_count = sum(1 for bed in beds if (bed.current_status or "").lower() != "available")
            room.available_count = sum(1 for bed in beds if (bed.current_status or "").lower() == "available")
            if room.capacity is None:
                room.capacity = len(beds)

        db.flush()

        rooms = db.query(Room).order_by(Room.pg_id, Room.floor_id, Room.room_number, Room.room_id).all()
        used_by_floor: dict[tuple[str, int], set[str]] = {}
        for room in rooms:
            key = (room.pg_id, room.floor_id)
            used_by_floor.setdefault(key, set())
            room_number = str(room.room_number or "").strip()
            if not room_number or room_number not in used_by_floor[key]:
                if room_number:
                    used_by_floor[key].add(room_number)
                continue

            floor_label = normalize_existing_floor_label(room.floor.floor_label if room.floor else None) or ""
            floor_match = re.search(r"(\d+)", floor_label)
            floor_num = int(floor_match.group(1)) if floor_match else 0
            next_index = 1
            while True:
                candidate = f"{floor_num * 100 + next_index:03d}" if floor_num else f"Ground-{next_index:02d}"
                if candidate not in used_by_floor[key]:
                    break
                next_index += 1

            renames.append(f"{room.pg_id} {room.room_id}: duplicate room {room.room_number} -> {candidate}")
            room.room_number = candidate
            used_by_floor[key].add(candidate)

        db.commit()

    print(f"Repaired {len(changes)} room-floor relationship(s).")
    for line in changes:
        print(line)
    print(f"Renamed {len(renames)} duplicate room number(s).")
    for line in renames:
        print(line)


if __name__ == "__main__":
    repair_floor_room_mapping()
