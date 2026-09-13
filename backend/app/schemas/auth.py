# pyrefly: ignore [missing-import]
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    full_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    user_id: str
    full_name: str | None
    email: str | None
    phone: str | None
    is_sample_user: bool

class OwnerCreate(BaseModel):
    owner_name: str
    email: EmailStr
    password: str = Field(min_length=6)
    phone: str | None = None
    notes: str | None = None

class OwnerOut(BaseModel):
    owner_id: str
    owner_name: str | None
    email: str | None
    phone: str | None
    verification_status: str
    data_status: str
    notes: str | None