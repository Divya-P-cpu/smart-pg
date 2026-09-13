# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field
from typing import Optional, List

class PgListItem(BaseModel):
    pg_id: str
    pg_name: str
    property_type: Optional[str] = None
    gender_policy: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    min_rent: Optional[float] = None
    selected_rent: Optional[float] = None
    selected_sharing: Optional[str] = None
    selected_security_deposit: Optional[float] = None
    matching_room_count: int = 0
    available_bed_count: int = 0
    price_options: List["PriceOptionOut"] = Field(default_factory=list)
    amenities: List[str] = Field(default_factory=list)
    images: List[str] = Field(default_factory=list)
    recommendation_reasons: List[str] = Field(default_factory=list)
    rooms: List["RoomDetailOut"] = Field(default_factory=list)
    is_active: bool = True
    data_status: Optional[str] = None
    is_exact_match: bool = True
    match_category: str = "Best Match"
    compatibility_score: Optional[int] = None

class PriceOptionOut(BaseModel):
    sharing_type: Optional[str] = None
    monthly_rent: Optional[float] = None
    security_deposit: Optional[float] = None
class PgListResponse(BaseModel):
    items: List[PgListItem]
    total: int
    page: int
    page_size: int

class BedDetailOut(BaseModel):
    bed_id: str
    room_id: str
    bed_number: Optional[str] = None
    bed_position: Optional[str] = None
    near_wall: str
    near_window: str
    near_door: str
class PgListResponse(BaseModel):
    items: List[PgListItem]
    total: int
    page: int
    page_size: int

class BedDetailOut(BaseModel):
    bed_id: str
    room_id: str
    bed_number: Optional[str] = None
    bed_position: Optional[str] = None
    near_wall: str
    near_window: str
    near_door: str
    current_status: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

class RoomDetailOut(BaseModel):
    room_id: str
    pg_id: str
    floor_id: int
    floor_label: Optional[str] = None
    room_number: Optional[str] = None
    room_type: Optional[str] = None
    capacity: Optional[int] = None
    occupied_count: Optional[int] = None
    available_count: Optional[int] = None
    room_status: Optional[str] = None
    ac_type: Optional[str] = None
    bathroom_type: Optional[str] = None
    layout_image_url: Optional[str] = None
    layout_image_options: List[str] = Field(default_factory=list)
    beds: List[BedDetailOut] = []

    class Config:
        from_attributes = True

class PgDetailOut(BaseModel):
    pg_id: str
    pg_name: str
    property_type: Optional[str] = None
    gender_policy: Optional[str] = None
    area: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    min_rent: Optional[float] = None
    price_options: List[PriceOptionOut] = []
    amenities: List[str] = []
    images: List[str] = []
    rooms: List[RoomDetailOut] = []
    is_active: bool = True
    data_status: Optional[str] = None
    rating: float = 4.5
    review_count: int = 12

    class Config:
        from_attributes = True
