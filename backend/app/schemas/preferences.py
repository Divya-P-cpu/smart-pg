from pydantic import BaseModel
from typing import Optional, List
from datetime import date

class UserPreferencesIn(BaseModel):
    city: Optional[str] = "Hyderabad"
    area: Optional[str] = ""
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    people: Optional[int] = 1
    sharing: Optional[str] = ""
    gender: Optional[str] = ""
    move_in_date: Optional[date] = None
    amenities: Optional[List[str]] = []
    lift_required: Optional[bool] = False
    food_preference: Optional[str] = None
    ac_preference: Optional[str] = None
    bathroom_preference: Optional[str] = None
    room_preference: Optional[str] = None
    bed_preference: Optional[str] = None
    wall_side_preference: Optional[str] = None
    window_side_preference: Optional[str] = None

class UserPreferencesOut(BaseModel):
    preference_id: Optional[str] = None
    user_id: str
    city: Optional[str] = None
    area: Optional[str] = None
    areas: List[str] = []
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    people: Optional[int] = 1
    sharing: Optional[str] = None
    gender: Optional[str] = None
    move_in_date: Optional[str] = None
    amenities: List[str] = []
    lift_required: bool = False
    food_preference: Optional[str] = None
    ac_preference: Optional[str] = None
    bathroom_preference: Optional[str] = None
    room_preference: Optional[str] = None
    bed_preference: Optional[str] = None
    wall_side_preference: Optional[str] = None
    window_side_preference: Optional[str] = None
