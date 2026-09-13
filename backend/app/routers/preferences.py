from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models import User, Amenity
from app.models.user_preference import UserPreference, UserPreferredArea, UserRequiredAmenity
from app.schemas.preferences import UserPreferencesIn, UserPreferencesOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/preferences", tags=["User Preferences"])

def next_pref_id(db: Session) -> str:
    count = db.query(func.count(UserPreference.preference_id)).scalar() or 0
    return f"UP{int(count) + 1:03d}"

@router.get("", response_model=UserPreferencesOut)
def get_user_preferences(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.user_id).first()
    if not pref:
        # Return default empty preference response
        return UserPreferencesOut(
            user_id=current_user.user_id,
            city="Hyderabad",
            area="",
            areas=[],
            amenities=[],
            lift_required=False
        )

    areas_list = [pa.area_name for pa in pref.preferred_areas] if pref.preferred_areas else []
    if not areas_list and pref.preferred_areas_raw:
        areas_list = [a.strip() for a in pref.preferred_areas_raw.split(",") if a.strip()]

    amenities_list = []
    if pref.required_amenities:
        for ra in pref.required_amenities:
            if ra.amenity:
                amenities_list.append(ra.amenity.amenity_name.lower())

    return UserPreferencesOut(
        preference_id=pref.preference_id,
        user_id=pref.user_id,
        city=pref.preferred_city,
        area=areas_list[0] if areas_list else (pref.preferred_areas_raw or ""),
        areas=areas_list,
        min_budget=float(pref.min_budget) if pref.min_budget is not None else None,
        max_budget=float(pref.max_budget) if pref.max_budget is not None else None,
        sharing=pref.preferred_sharing,
        gender=pref.preferred_gender,
        move_in_date=str(pref.move_in_date) if pref.move_in_date else None,
        amenities=amenities_list,
        lift_required=False,
        food_preference=pref.food_preference,
        ac_preference=pref.ac_preference,
        bathroom_preference=pref.bathroom_preference,
        room_preference=pref.room_preference,
        bed_preference=pref.bed_preference,
        wall_side_preference=pref.wall_side_preference,
        window_side_preference=pref.window_side_preference
    )

@router.post("", response_model=UserPreferencesOut)
def save_user_preferences(prefs_in: UserPreferencesIn, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.user_id).first()
    if not pref:
        new_id = next_pref_id(db)
        # Check collision
        while db.query(UserPreference).filter(UserPreference.preference_id == new_id).first():
            num = int(new_id.replace("UP", "")) + 1
            new_id = f"UP{num:03d}"

        pref = UserPreference(
            preference_id=new_id,
            user_id=current_user.user_id,
            data_status="USER_INPUT"
        )
        db.add(pref)
        db.flush()

    # Update basic fields
    pref.preferred_city = prefs_in.city or "Hyderabad"
    pref.preferred_areas_raw = prefs_in.area or ""
    pref.min_budget = prefs_in.min_budget
    pref.max_budget = prefs_in.max_budget
    pref.preferred_sharing = f"{prefs_in.sharing} Sharing" if prefs_in.sharing and str(prefs_in.sharing).isdigit() else (prefs_in.sharing or "")
    pref.preferred_gender = prefs_in.gender or ""
    pref.move_in_date = prefs_in.move_in_date
    pref.food_preference = prefs_in.food_preference
    pref.ac_preference = prefs_in.ac_preference
    pref.bathroom_preference = prefs_in.bathroom_preference
    pref.room_preference = prefs_in.room_preference
    pref.bed_preference = prefs_in.bed_preference
    pref.wall_side_preference = prefs_in.wall_side_preference
    pref.window_side_preference = prefs_in.window_side_preference

    # Sync preferred areas
    db.query(UserPreferredArea).filter(UserPreferredArea.preference_id == pref.preference_id).delete()
    if prefs_in.area:
        areas = [a.strip() for a in prefs_in.area.split(",") if a.strip()]
        for a in areas:
            db.add(UserPreferredArea(preference_id=pref.preference_id, area_name=a))

    # Sync required amenities
    db.query(UserRequiredAmenity).filter(UserRequiredAmenity.preference_id == pref.preference_id).delete()
    if prefs_in.amenities:
        for am_name in prefs_in.amenities:
            if not am_name:
                continue
            am = db.query(Amenity).filter(Amenity.amenity_name.ilike(am_name)).first()
            if am:
                db.add(UserRequiredAmenity(preference_id=pref.preference_id, amenity_id=am.amenity_id))

    db.commit()
    db.refresh(pref)

    return get_user_preferences(db=db, current_user=current_user)
