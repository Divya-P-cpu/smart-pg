from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models import Booking, Pg, User, Notification
from app.schemas.notifications import NotificationOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])

@router.get("", response_model=list[NotificationOut])
def get_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Fetch persistent notifications from notifications table
    db_notifications = db.query(Notification).filter(Notification.user_id == current_user.user_id).order_by(Notification.notification_id.desc()).all()
    notifications = []
    
    seen_keys = set()
    for n in db_notifications:
        notifications.append(NotificationOut(
            notification_id=n.notification_id,
            title=n.title,
            message=n.message or "",
            is_read=n.is_read,
            created_at=str(n.created_at)
        ))
        seen_keys.add(n.title)

    # 2. Derive notifications from bookings if not already inserted
    bookings = db.query(Booking).filter(Booking.user_id == current_user.user_id).order_by(Booking.booking_id.desc()).all()
    for b in bookings:
        pg = db.query(Pg).filter(Pg.pg_id == b.pg_id).first()
        pg_name = pg.pg_name if pg else "PG Property"
        st = str(b.status or "Pending").strip()
        
        if st.lower() in ["accepted", "approved"]:
            title = f"Booking Confirmed · {pg_name}"
            if title not in seen_keys:
                notifications.append(NotificationOut(
                    notification_id=b.booking_id * 1000 + 1,
                    title=title,
                    message=f"Great news! Your booking request at {pg_name} has been approved by the owner.",
                    is_read=False,
                    created_at=str(b.created_at)
                ))
        elif st.lower() == "rejected":
            title = f"Booking Update · {pg_name}"
            if title not in seen_keys:
                notifications.append(NotificationOut(
                    notification_id=b.booking_id * 1000 + 2,
                    title=title,
                    message=f"The owner was unable to accommodate your request at {pg_name}. Feel free to explore other verified stays.",
                    is_read=True,
                    created_at=str(b.created_at)
                ))
        else:
            title = f"Inquiry Submitted · {pg_name}"
            if title not in seen_keys:
                notifications.append(NotificationOut(
                    notification_id=b.booking_id * 1000 + 3,
                    title=title,
                    message=f"Your move-in request for {pg_name} is under review by the property owner.",
                    is_read=True,
                    created_at=str(b.created_at)
                ))

    return notifications

@router.post("/{notification_id}/read")
def mark_read(notification_id: int, db: Session = Depends(get_db)):
    n = db.query(Notification).filter(Notification.notification_id == notification_id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read", "notification_id": notification_id}