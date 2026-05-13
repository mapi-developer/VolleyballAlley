from typing import Optional, List
from uuid import UUID
from datetime import datetime, timezone, timedelta
from app.services.waitlist import promote_next_on_waitlist
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from app.services.notifications import dispatch_telegram_notification
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

async def notify_users_of_new_event(event: Event, host_name: str, session: Session):
    """Background task to broadcast new matches."""
    # Find all users who want new event alerts (excluding the host)
    users = session.exec(select(User).where(User.notif_new_events == True, User.id != event.host_id)).all()
    
    for user in users:
        msg = f"🏐 *New Match Posted!*\n\n{host_name} just scheduled a game at {event.location_name}.\nSpots are limited, open the app to join!"
        await dispatch_telegram_notification(user.id, msg, "NEW_EVENT", session)

@router.post("/", response_model=EventReadWithAttendees)
async def create_event(
    event_in: EventBase, 
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_organizer),
    session: Session = Depends(get_session)
):
    # 1. Normalize times to UTC 
    if event_in.start_time.tzinfo is None:
        event_in.start_time = event_in.start_time.replace(tzinfo=timezone.utc)
    if event_in.end_time.tzinfo is None:
        event_in.end_time = event_in.end_time.replace(tzinfo=timezone.utc)

    # 2. Create the Event
    db_event = Event.model_validate(event_in, update={"host_id": current_user.id})
    session.add(db_event)
    session.commit()
    
    # CRITICAL FIX: Refresh the object so the DB assigns the UUID properly before the next step
    session.refresh(db_event) 

    # 3. Automation: Host auto-registration
    host_rsvp = RSVP(user_id=current_user.id, event_id=db_event.id, status=RSVPStatus.CONFIRMED)
    session.add(host_rsvp)
    session.commit()
    
    # 4. Trigger Background Notification
    background_tasks.add_task(notify_users_of_new_event, db_event, current_user.first_name, session)
    
    # 5. Reload for response with Attendees array attached
    statement = select(Event).where(Event.id == db_event.id).options(selectinload(Event.attendees))
    return session.exec(statement).first()

@router.patch("/{event_id}", response_model=EventReadWithAttendees)
async def update_event(
    event_id: UUID,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Updates event details. Enforces 24-hour lock & triggers promotions if capacity increases."""
    db_event = session.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host can update this event")

    # 1. Enforce the 24-Hour Edit Lock
    event_time = db_event.start_time
    
    # CRITICAL FIX: Make sure the existing DB time is timezone-aware before doing math
    if event_time.tzinfo is None:
        event_time = event_time.replace(tzinfo=timezone.utc)
        
    time_until_match = event_time - datetime.now(timezone.utc)
    
    if time_until_match < timedelta(hours=24):
        raise HTTPException(
            status_code=400, 
            detail="Event logistics are locked 24 hours before start time."
        )

    # 2. Normalize incoming updates to UTC
    if event_update.start_time and event_update.start_time.tzinfo is None:
        event_update.start_time = event_update.start_time.replace(tzinfo=timezone.utc)
    if event_update.end_time and event_update.end_time.tzinfo is None:
        event_update.end_time = event_update.end_time.replace(tzinfo=timezone.utc)

    # 3. Track old capacity before applying updates
    old_max_players = db_event.max_players

    # 4. Apply updates
    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
    
    session.add(db_event)
    session.commit()
    
    # 5. Trigger Waitlist Promotion if capacity was increased
    new_max_players = getattr(db_event, "max_players", old_max_players)
    if new_max_players > old_max_players:
        await promote_next_on_waitlist(event_id, session)
    
    session.refresh(db_event)
    
    # 6. Reload with attendees for consistent response
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