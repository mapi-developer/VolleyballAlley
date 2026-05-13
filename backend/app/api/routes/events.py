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
    
    print(f"DEBUG: Notifying {len(users)} users about NEW event {event.id}")

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
    if event_in.start_time.tzinfo is None:
        event_in.start_time = event_in.start_time.replace(tzinfo=timezone.utc)
    if event_in.end_time.tzinfo is None:
        event_in.end_time = event_in.end_time.replace(tzinfo=timezone.utc)

    db_event = Event.model_validate(event_in, update={"host_id": current_user.id})
    session.add(db_event)
    session.commit()
    
    session.refresh(db_event) 

    host_rsvp = RSVP(user_id=current_user.id, event_id=db_event.id, status=RSVPStatus.CONFIRMED)
    session.add(host_rsvp)
    session.commit()
    
    background_tasks.add_task(notify_users_of_new_event, db_event, current_user.first_name, session)
    
    statement = select(Event).where(Event.id == db_event.id).options(selectinload(Event.attendees))
    return session.exec(statement).first()

async def notify_event_update(event_id: UUID, old_start_time: datetime, old_location: str):
    """
    Safe background task. 
    We fetch a fresh session and the latest event data inside the task.
    """
    from app.db.database import engine # Import here to avoid circular imports
    
    with Session(engine) as session:
        # 1. Fetch fresh event data and its attendees
        event = session.get(Event, event_id)
        if not event:
            return

        # 2. Identify everyone who needs a message
        statement = select(RSVP).where(RSVP.event_id == event.id)
        rsvps = session.exec(statement).all()
        
        if not rsvps:
            return

        # 3. Build the message
        # Convert UTC to a readable string
        new_time_str = event.start_time.strftime("%A, %b %d at %H:%M")
        old_time_str = old_start_time.strftime("%A, %b %d at %H:%M")

        # Determine what changed for a better message
        change_desc = "schedule" if event.start_time != old_start_time else "location"
        if event.start_time != old_start_time and event.location_name != old_location:
            change_desc = "details"

        msg = (
            f"⚠️ *Match {change_desc.capitalize()} Updated!*\n\n"
            f"The match *{event.title}* has been updated by the host.\n\n"
            f"🗓 *New Time:* {new_time_str}\n"
            f"📍 *New Location:* {event.location_name}\n\n"
            f"🕒 *Previous Time:* {old_time_str}\n"
            f"🏠 *Previous Location:* {old_location}\n\n"
            f"Please check the app to confirm you can still attend!"
        )

        print(f"DEBUG: Notifying {len(rsvps)} users about event {event.id}")

        for rsvp in rsvps:
            # ONLY FOR DEVELOPING
            # if rsvp.user_id == event.host_id:
            #     continue
            await dispatch_telegram_notification(rsvp.user_id, msg, "REMINDER", session)

# --- Updated PATCH Route ---
@router.patch("/{event_id}", response_model=EventReadWithAttendees)
async def update_event(
    event_id: UUID,
    event_update: EventUpdate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    db_event = session.get(Event, event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if db_event.host_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the host can update this event")

    # 1. Capture OLD data and FORCE awareness immediately
    old_start_time = db_event.start_time
    if old_start_time.tzinfo is None:
        old_start_time = old_start_time.replace(tzinfo=timezone.utc)
    
    old_location = db_event.location_name

    # 2. Check 24h Lock
    if (old_start_time - datetime.now(timezone.utc)) < timedelta(hours=24):
        raise HTTPException(status_code=400, detail="Logistics locked 24h before start.")

    # 3. Apply updates
    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if key in ["start_time", "end_time"] and value and value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        setattr(db_event, key, value)
    
    # 4. CRITICAL: Compare AFTER normalization but BEFORE commit (or keep old_start_time)
    time_changed = event_update.start_time and event_update.start_time != old_start_time
    location_changed = event_update.location_name and event_update.location_name != old_location

    session.add(db_event)
    session.commit()
    
    # 5. Trigger Notification if critical info changed
    if time_changed or location_changed:
        print(f"DEBUG: Triggering notification for {event_id}. Time: {time_changed}, Loc: {location_changed}")
        # Pass ID and old values to avoid session issues in background
        background_tasks.add_task(notify_event_update, db_event.id, old_start_time, old_location)

    if event_update.max_players and event_update.max_players > db_event.max_players:
        await promote_next_on_waitlist(event_id, session)
    
    session.refresh(db_event)
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