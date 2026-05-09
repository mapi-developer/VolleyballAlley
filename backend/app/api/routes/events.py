from typing import Optional
from datetime import datetime, timedelta
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.db.database import get_session
from app.db.models import Event, User, UserRole, RSVP, RSVPStatus, PlayLevel, EventBase
from app.api.deps import get_current_user, get_current_organizer

router = APIRouter()

@router.get("/", response_model=list[Event])
async def get_events(session: Session = Depends(get_session)):
    return session.exec(select(Event)).all()

@router.get("/", response_model=List[Event])
async def get_filtered_events(
    level: Optional[PlayLevel] = None,
    location: Optional[str] = None,
    session: Session = Depends(get_session)
):
    """Fetches upcoming events with optional filtering."""
    statement = select(Event).where(Event.status == "Open")
    if level:
        statement = statement.where(Event.level_required == level)
    if location:
        statement = statement.where(Event.location_name.contains(location))
    
    return session.exec(statement).all()

@router.post("/", response_model=Event)
async def create_event(
    event_in: EventBase,  # Use the Base schema to ensure string-to-datetime coercion
    current_user: User = Depends(get_current_organizer),
    session: Session = Depends(get_session)
):
    # 1. Create the Event object from the validated schema
    db_event = Event.model_validate(event_in)
    db_event.host_id = current_user.id
    
    session.add(db_event)
    session.commit()
    session.refresh(db_event)

    # 2. AUTOMATION: Auto-register the host as the first attendee
    host_rsvp = RSVP(
        user_id=current_user.id, 
        event_id=db_event.id, 
        status=RSVPStatus.CONFIRMED
    )
    session.add(host_rsvp)
    session.commit()
    
    # 3. Refresh one last time to include the attendees list in the response
    session.refresh(db_event)
    return db_event

@router.delete("/{event_id}")
async def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Secured deletion (Host only). Cascade handles RSVPs."""
    event = session.get(Event, event_id)
    if not event or event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    session.delete(event)
    session.commit()
    return {"detail": "Event deleted"}