from uuid import UUID
from sqlmodel import Session, select
from app.db.models import RSVP, RSVPStatus

async def promote_next_on_waitlist(event_id: UUID, session: Session):
    """Finds the oldest waitlisted user and bumps them to Confirmed."""
    statement = (
        select(RSVP)
        .where(RSVP.event_id == event_id, RSVP.status == RSVPStatus.WAITLISTED)
        .order_by(RSVP.joined_at.asc())
    )
    next_up = session.exec(statement).first()
    
    if next_up:
        next_up.status = RSVPStatus.CONFIRMED
        session.add(next_up)
        session.commit()
        # Integration point: Send Telegram notification to user here later