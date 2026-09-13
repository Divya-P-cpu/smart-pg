from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import Pg, PgSourceListing, User, Review
from app.schemas.reviews import ReviewCreate, ReviewOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/reviews", tags=["Reviews"])

@router.get("", response_model=list[ReviewOut])
def get_my_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user_reviews = db.query(Review).filter(Review.user_id == current_user.user_id).order_by(Review.review_id.desc()).all()
    results = []
    for r in user_reviews:
        pg = db.query(Pg).filter(Pg.pg_id == r.pg_id).first()
        results.append(
            ReviewOut(
                review_id=r.review_id,
                pg_id=r.pg_id,
                pg_name=pg.pg_name if pg else "PG Property",
                user_id=r.user_id,
                user_name=current_user.full_name or "Verified Resident",
                rating=r.rating,
                comment=r.comment,
                created_at=str(r.created_at)
            )
        )
    return results

@router.get("/pg/{pg_id}", response_model=list[ReviewOut])
def get_pg_reviews(pg_id: str, db: Session = Depends(get_db)):
    pg = db.query(Pg).filter(Pg.pg_id == pg_id).first()
    if not pg:
        return []
    
    results = []
    # 1. Fetch real user reviews from MySQL
    user_reviews = db.query(Review).filter(Review.pg_id == pg_id).order_by(Review.review_id.desc()).all()
    for r in user_reviews:
        user = db.query(User).filter(User.user_id == r.user_id).first()
        results.append(
            ReviewOut(
                review_id=r.review_id,
                pg_id=pg_id,
                pg_name=pg.pg_name,
                user_id=r.user_id,
                user_name=user.full_name if user else "Verified Resident",
                rating=r.rating,
                comment=r.comment,
                created_at=str(r.created_at)
            )
        )

    # 2. Add verified source listing summary if available
    listing = db.query(PgSourceListing).filter(PgSourceListing.pg_id == pg_id).first()
    if listing and listing.rating:
        results.append(
            ReviewOut(
                review_id=100000 + (listing.listing_id or 1),
                pg_id=pg_id,
                pg_name=pg.pg_name,
                user_id="COMMUNITY",
                user_name="Community Aggregate",
                rating=float(listing.rating),
                comment=listing.verification_notes or f"Rated {listing.rating}/5.0 based on {listing.review_count or 12} resident reviews.",
                created_at=str(listing.fetched_at)
            )
        )
    return results

@router.post("", response_model=ReviewOut)
def create_review(review_in: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pg = db.query(Pg).filter(Pg.pg_id == review_in.pg_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="PG not found")
    
    new_review = Review(
        pg_id=review_in.pg_id,
        user_id=current_user.user_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)

    return ReviewOut(
        review_id=new_review.review_id,
        pg_id=new_review.pg_id,
        pg_name=pg.pg_name,
        user_id=current_user.user_id,
        user_name=current_user.full_name or "Verified Resident",
        rating=new_review.rating,
        comment=new_review.comment,
        created_at=str(new_review.created_at)
    )

@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    review = db.query(Review).filter(Review.review_id == review_id, Review.user_id == current_user.user_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found or unauthorized")
    
    db.delete(review)
    db.commit()
    return {"message": "Review deleted successfully", "review_id": review_id, "success": True}