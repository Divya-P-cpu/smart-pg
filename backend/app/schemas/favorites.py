from pydantic import BaseModel
from typing import Optional, List

class FavoriteCreate(BaseModel):
    pg_id: str

class FavoriteOut(BaseModel):
    favorite_id: Optional[int] = None
    pg_id: str
    pg_name: Optional[str] = "PG Listing"
    area: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    min_rent: Optional[float] = None
    property_type: Optional[str] = None
    gender_policy: Optional[str] = None
    image_url: Optional[str] = None
    images: List[str] = []
    amenities: List[str] = []
    created_at: str