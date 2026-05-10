from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from app.db.database import get_session
from app.db.models import (
    RSVP, Event, User, UserRole, RSVPStatus, 
    EventReadWithAttendees
)
from app.api.deps import get_current_user, get_current_organizer
from app.services.waitlist import promote_next_on_waitlist

router = APIRouter()

@router.post("/{event_id}/join", response_model=RSVP)
async def join_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Player joins a match. Auto-waitlists if full."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Check if already registered
    existing = session.get(RSVP, (current_user.id, event_id))
    if existing:
        raise HTTPException(status_code=400, detail="Already registered")

    # Check capacity
    confirmed_count = session.exec(
        select(func.count(RSVP.user_id)).where(
            RSVP.event_id == event_id, 
            RSVP.status == RSVPStatus.CONFIRMED
        )
    ).one()

    # Determine status (FIFO Logic)
    status = RSVPStatus.CONFIRMED if confirmed_count < event.max_players else RSVPStatus.WAITLISTED
    
    rsvp = RSVP(user_id=current_user.id, event_id=event_id, status=status)
    session.add(rsvp)
    session.commit()
    session.refresh(rsvp)
    return rsvp

@router.delete("/{event_id}/leave")
async def leave_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Player cancels RSVP. Triggers automated waitlist promotion."""
    rsvp = session.get(RSVP, (current_user.id, event_id))
    if not rsvp:
        raise HTTPException(status_code=404, detail="Registration not found")

    was_confirmed = rsvp.status == RSVPStatus.CONFIRMED
    session.delete(rsvp)
    session.commit()

    # CRITICAL: If a confirmed spot opened, promote the next person
    if was_confirmed:
        await promote_next_on_waitlist(event_id, session)

    return {"detail": "Successfully left the match"}

@router.patch("/{event_id}/kick/{target_user_id}")
async def kick_player(
    event_id: UUID,
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Host can remove a player from the roster."""
    event = session.get(Event, event_id)
    if not event or event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host can kick players")

    rsvp = session.get(RSVP, (target_user_id, event_id))
    if not rsvp:
        raise HTTPException(status_code=404)

    was_confirmed = rsvp.status == RSVPStatus.CONFIRMED
    session.delete(rsvp)
    session.commit()

    if was_confirmed:
        await promote_next_on_waitlist(event_id, session)

    return {"detail": "Player removed"}

@router.get("/me", response_model=List[EventReadWithAttendees])
async def get_my_rsvps(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Fetches all events the authenticated user is registered for."""
    statement = (
        select(Event)
        .join(RSVP)
        .where(RSVP.user_id == current_user.id)
        .options(selectinload(Event.attendees))
    )
    return session.exec(statement).all()