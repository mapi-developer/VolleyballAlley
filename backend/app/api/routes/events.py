from typing import Optional, List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from app.db.database import get_session
from app.db.models import (
    Event, User, RSVP, RSVPStatus, PlayLevel, 
    EventBase, EventReadWithAttendees, EventUpdate
)
from app.api.deps import get_current_user, get_current_organizer

router = APIRouter()

@router.get("/", response_model=List[EventReadWithAttendees])
async def get_events(
    level: Optional[PlayLevel] = None,
    location: Optional[str] = None,
    name: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Fetches matches with optional filtering by level, location, or name."""
    statement = select(Event).options(selectinload(Event.attendees))
    
    if level:
        statement = statement.where(Event.level_required == level)
    if location:
        statement = statement.where(Event.location_name.contains(location))
    if name:
        statement = statement.where(Event.title.contains(name))
        
    return session.exec(statement).all()

@router.post("/", response_model=EventReadWithAttendees)
async def create_event(
    event_in: EventBase, 
    current_user: User = Depends(get_current_organizer),
    session: Session = Depends(get_session)
):
    # 1. Create event object
    db_event = Event.model_validate(event_in, update={"host_id": current_user.id})
    session.add(db_event)
    session.commit()

    # 2. Automation: Host auto-registration
    host_rsvp = RSVP(user_id=current_user.id, event_id=db_event.id, status=RSVPStatus.CONFIRMED)
    session.add(host_rsvp)
    session.commit()
    
    # 3. Reload for response
    statement = select(Event).where(Event.id == db_event.id).options(selectinload(Event.attendees))
    return session.exec(statement).first()

@router.patch("/{event_id}", response_model=EventReadWithAttendees)
async def update_event(
    event_id: UUID,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Updates event details (Secured: Host only)."""
    db_event = session.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host can update this event")

    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    session.add(db_event)
    session.commit()
    session.refresh(db_event)
    
    # Reload with attendees for consistent response
    statement = select(Event).where(Event.id == event_id).options(selectinload(Event.attendees))
    return session.exec(statement).first()

@router.delete("/{event_id}")
async def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Secured deletion (Host only). Cascade handles RSVP cleanup."""
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.delete(event)
    session.commit()
    return {"detail": "Event deleted"}