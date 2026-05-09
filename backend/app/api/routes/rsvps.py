from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from app.db.database import get_session
from app.db.models import RSVP, Event, User, RSVPStatus
from app.api.deps import get_current_user
from app.services.waitlist import promote_next_on_waitlist

router = APIRouter()

@router.post("/{event_id}/join")
async def join_event(
    event_id: UUID,  # FastAPI now correctly recognizes this as a standard UUID
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    event = session.get(Event, event_id)
    if not event: raise HTTPException(status_code=404)

    # Check capacity
    confirmed_count = session.exec(
        select(func.count(RSVP.user_id)).where(RSVP.event_id == event_id, RSVP.status == RSVPStatus.CONFIRMED)
    ).one()

    new_status = RSVPStatus.CONFIRMED if confirmed_count < event.max_players else RSVPStatus.WAITLISTED
    
    rsvp = RSVP(user_id=current_user.id, event_id=event_id, status=new_status)
    session.add(rsvp)
    session.commit()
    return {"status": rsvp.status}

@router.delete("/{event_id}/leave")
async def leave_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    rsvp = session.get(RSVP, (current_user.id, event_id))
    if not rsvp: raise HTTPException(status_code=404)

    was_confirmed = rsvp.status == RSVPStatus.CONFIRMED
    session.delete(rsvp)
    session.commit()

    # Trigger FIFO promotion if a spot opened up
    if was_confirmed:
        await promote_next_on_waitlist(event_id, session)

    return {"detail": "Left event"}