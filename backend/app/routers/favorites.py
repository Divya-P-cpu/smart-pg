from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import Favorite, User, Pg
from app.schemas.favorites import FavoriteCreate, FavoriteOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

@router.get("", response_model=list[FavoriteOut])
def get_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.user_id).order_by(Favorite.created_at.desc()).all()
    out = []
    for f in favorites:
        pg = db.query(Pg).filter(Pg.pg_id == f.pg_id).first()
        min_rent = None
        if pg and pg.prices:
            min_rent = float(pg.prices[0].monthly_rent) if pg.prices[0].monthly_rent is not None else None
        
        images = []
        if pg and pg.images:
            images = [img.image_url for img in pg.images if img.image_url]
        if not images:
            images = [f"https://picsum.photos/seed/{f.pg_id}/800/500"]

        amenities = []
        if pg and pg.amenities:
            for pa in pg.amenities:
                if pa.amenity:
                    amenities.append(pa.amenity.amenity_name)

        out.append(FavoriteOut(
            favorite_id=f.favorite_id,
            pg_id=f.pg_id,
            pg_name=pg.pg_name if pg else "Unknown PG",
            area=pg.location.area if pg and pg.location else None,
            city=pg.location.city if pg and pg.location else None,
            address=pg.location.address if pg and pg.location else None,
            min_rent=min_rent,
            property_type=pg.property_type if pg else "PG",
            gender_policy=pg.gender_policy if pg else "Unisex",
            image_url=images[0] if images else None,
            images=images,
            amenities=amenities,
            created_at=str(f.created_at)
        ))
    return out

@router.post("", response_model=FavoriteOut)
def add_favorite(fav: FavoriteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    exists = db.query(Favorite).filter(Favorite.user_id == current_user.user_id, Favorite.pg_id == fav.pg_id).first()
    if exists:
        return FavoriteOut(
            favorite_id=exists.favorite_id,
            pg_id=exists.pg_id,
            created_at=str(exists.created_at)
        )
    new_fav = Favorite(user_id=current_user.user_id, pg_id=fav.pg_id)
    db.add(new_fav)
    db.commit()
    db.refresh(new_fav)

    pg = db.query(Pg).filter(Pg.pg_id == fav.pg_id).first()
    min_rent = float(pg.prices[0].monthly_rent) if pg and pg.prices and pg.prices[0].monthly_rent else None
    images = [img.image_url for img in pg.images if img.image_url] if pg and pg.images else []

    return FavoriteOut(
        favorite_id=new_fav.favorite_id,
        pg_id=new_fav.pg_id,
        pg_name=pg.pg_name if pg else "PG Listing",
        area=pg.location.area if pg and pg.location else None,
        city=pg.location.city if pg and pg.location else None,
        min_rent=min_rent,
        images=images,
        created_at=str(new_fav.created_at)
    )

@router.delete("/{pg_id}")
def remove_favorite(pg_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fav = db.query(Favorite).filter(Favorite.user_id == current_user.user_id, Favorite.pg_id == pg_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return {"message": "Removed from favorites", "pg_id": pg_id, "success": True}
    return {"message": "Not in favorites", "pg_id": pg_id, "success": False}