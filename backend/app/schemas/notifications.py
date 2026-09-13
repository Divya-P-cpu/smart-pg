# pyrefly: ignore [missing-import]
from pydantic import BaseModel

class NotificationOut(BaseModel):
    notification_id: int
    title: str
    message: str | None
    is_read: bool
    created_at: str