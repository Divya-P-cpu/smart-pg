from sqlalchemy import Column, String, Integer, Numeric, Date, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class UserPreference(Base):
    __tablename__ = "user_preferences"

    preference_id = Column(String(20), primary_key=True)
    user_id = Column(String(20), ForeignKey("users.user_id"), nullable=False, unique=True)
    preferred_city = Column(String(100), nullable=True)
    preferred_areas_raw = Column(Text, nullable=True)
    min_budget = Column(Numeric(10, 2), nullable=True)
    max_budget = Column(Numeric(10, 2), nullable=True)
    preferred_sharing = Column(String(50), nullable=True)
    preferred_gender = Column(String(20), nullable=True)
    move_in_date = Column(Date, nullable=True)
    food_preference = Column(String(50), nullable=True)
    ac_preference = Column(String(50), nullable=True)
    bathroom_preference = Column(String(50), nullable=True)
    room_preference = Column(String(50), nullable=True)
    bed_preference = Column(String(50), nullable=True)
    wall_side_preference = Column(String(20), nullable=True)
    window_side_preference = Column(String(20), nullable=True)
    floor_preference = Column(String(50), nullable=True)
    max_distance_km = Column(Numeric(5, 2), nullable=True)
    data_status = Column(String(50), default="USER_INPUT")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    preferred_areas = relationship("UserPreferredArea", back_populates="preference", cascade="all, delete-orphan")
    required_amenities = relationship("UserRequiredAmenity", back_populates="preference", cascade="all, delete-orphan")

class UserPreferredArea(Base):
    __tablename__ = "user_preferred_areas"

    preference_id = Column(String(20), ForeignKey("user_preferences.preference_id"), primary_key=True)
    area_name = Column(String(100), primary_key=True)

    preference = relationship("UserPreference", back_populates="preferred_areas")

class UserRequiredAmenity(Base):
    __tablename__ = "user_required_amenities"

    preference_id = Column(String(20), ForeignKey("user_preferences.preference_id"), primary_key=True)
    amenity_id = Column(Integer, ForeignKey("amenities.amenity_id"), primary_key=True)

    preference = relationship("UserPreference", back_populates="required_amenities")
    amenity = relationship("Amenity")
