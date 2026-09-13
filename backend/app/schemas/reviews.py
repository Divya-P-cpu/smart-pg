from pydantic import BaseModel, Field
from typing import Optional, Union

class ReviewCreate(BaseModel):
    pg_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = None

class ReviewOut(BaseModel):
    review_id: int
    pg_id: str
    pg_name: Optional[str] = None
    user_id: str
    user_name: Optional[str] = None
    rating: Union[int, float]
    comment: Optional[str] = None
    created_at: str