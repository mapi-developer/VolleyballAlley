from uuid import UUID
from sqlmodel import Session, select
from app.db.models import RSVP, RSVPStatus

async def promote_next_on_waitlist(event_id: UUID, session: Session):
    """Automatically promotes the oldest waitlisted user when a confirmed spot opens."""
    # Find the oldest waitlisted user for this specific event
    statement = (
        select(RSVP)
        .where(RSVP.event_id == event_id, RSVP.status == RSVPStatus.WAITLISTED)
        .order_by(RSVP.joined_at.asc())
    )
    next_user = session.exec(statement).first()
    
    if next_user:
        next_user.status = RSVPStatus.CONFIRMED
        session.add(next_user)
        session.commit()
        # Note: In production, trigger a Telegram Bot DM notification here [cite: 165, 212, 221]