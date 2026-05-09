from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime, timedelta
from uuid import UUID

from app.db.database import get_session
from app.db.models import RSVP, Event, User
from app.core.security import get_current_user

router = APIRouter()

@router.post("/{event_id}", response_model=RSVP, status_code=status.HTTP_201_CREATED)
def join_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Join an event. Automatically handles 'confirmed' vs 'waitlisted' 
    based on the event's max_players limit.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if event.status != "Open":
        raise HTTPException(status_code=400, detail="Registration is closed for this event")

    # Check if user is already registered
    existing_rsvp = session.get(RSVP, {"user_id": current_user.id, "event_id": event_id})
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="You are already registered for this event")

    # Count current confirmed attendees
    statement = select(RSVP).where(RSVP.event_id == event_id, RSVP.status == "confirmed")
    confirmed_attendees = session.exec(statement).all()
    
    # Determine status based on capacity
    assigned_status = "confirmed" if len(confirmed_attendees) < event.max_players else "waitlisted"
    
    new_rsvp = RSVP(
        user_id=current_user.id,
        event_id=event_id,
        status=assigned_status
    )
    
    session.add(new_rsvp)
    session.commit()
    session.refresh(new_rsvp)
    
    return new_rsvp

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def leave_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Leave an event. Enforces a 2-hour cancellation lock.
    If the user was 'confirmed', automatically promotes the next person on the waitlist.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    rsvp = session.get(RSVP, {"user_id": current_user.id, "event_id": event_id})
    if not rsvp:
        raise HTTPException(status_code=404, detail="You are not registered for this event")

    # Business Logic: 2-Hour Cancellation Lock
    now = datetime.utcnow()
    time_until_start = event.start_time.replace(tzinfo=None) - now 
    if time_until_start < timedelta(hours=2):
        raise HTTPException(
            status_code=400, 
            detail="You cannot cancel within 2 hours of the match start time. This will negatively impact your Reliability Score."
        )

    was_confirmed = (rsvp.status == "confirmed")
    
    # Remove the user's RSVP
    session.delete(rsvp)
    session.commit()

    # --- AUTOMATED WAITLIST PROMOTION ---
    if was_confirmed:
        # Find the person who has been on the waitlist the longest (Earliest joined_at)
        waitlist_statement = (
            select(RSVP)
            .where(RSVP.event_id == event_id, RSVP.status == "waitlisted")
            .order_by(RSVP.joined_at)
        )
        next_in_line = session.exec(waitlist_statement).first()

        if next_in_line:
            next_in_line.status = "confirmed"
            session.add(next_in_line)
            session.commit()
            
            # TODO: Here is where you would trigger the Telegram Bot API 
            # to send a push notification to `next_in_line.user_id`
            print(f"Waitlist Promotion: User {next_in_line.user_id} is now confirmed for event {event_id}!")

    return None

@router.get("/my-games", response_model=List[RSVP])
def get_my_rsvps(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Fetch all events the current user has joined (for the 'My Games' tab).
    Includes the event details.
    """
    statement = select(RSVP).where(RSVP.user_id == current_user.id)
    return session.exec(statement).all()

@router.get("/{event_id}/attendees", response_model=List[RSVP])
def get_event_attendees(
    event_id: UUID,
    session: Session = Depends(get_session)
):
    """
    Fetch all attendees (confirmed and waitlisted) for a specific event.
    Used by the Organizer to view the roster.
    """
    statement = select(RSVP).where(RSVP.event_id == event_id).order_by(RSVP.joined_at)
    return session.exec(statement).all()

@router.delete("/{event_id}/attendees/{target_user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_attendee_as_organizer(
    event_id: UUID,
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Organizer Tool: Manually remove (kick) a user from an event.
    Triggers automatic waitlist promotion if the removed user was confirmed.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Security: Only the host (or an admin) can kick people
    if event.host_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only the organizer can manage the roster")

    rsvp = session.get(RSVP, {"user_id": target_user_id, "event_id": event_id})
    if not rsvp:
        raise HTTPException(status_code=404, detail="User is not registered for this event")

    was_confirmed = (rsvp.status == "confirmed")
    
    # Kick the user
    session.delete(rsvp)
    session.commit()

    # --- AUTOMATED WAITLIST PROMOTION ---
    if was_confirmed:
        waitlist_statement = (
            select(RSVP)
            .where(RSVP.event_id == event_id, RSVP.status == "waitlisted")
            .order_by(RSVP.joined_at)
        )
        next_in_line = session.exec(waitlist_statement).first()

        if next_in_line:
            next_in_line.status = "confirmed"
            session.add(next_in_line)
            session.commit()
            print(f"Organizer kicked someone. Waitlist Promotion: User {next_in_line.user_id} is now confirmed!")

    return None


@router.post("/{event_id}/attendees/{target_user_id}", response_model=RSVP, status_code=status.HTTP_201_CREATED)
def add_attendee_as_organizer(
    event_id: UUID,
    target_user_id: int,
    force_confirm: bool = False, # Query param: ?force_confirm=true
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Organizer Tool: Manually add a user to the event.
    The organizer can optionally bypass the max_players limit using force_confirm.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Security: Only the host can add people manually
    if event.host_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only the organizer can manage the roster")

    # Ensure the target user actually exists in the database
    target_user = session.get(User, target_user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user does not exist in the app database")

    # Check if already registered
    existing_rsvp = session.get(RSVP, {"user_id": target_user_id, "event_id": event_id})
    if existing_rsvp:
        raise HTTPException(status_code=400, detail="User is already on the roster")

    # Logic: Should we bypass the player limit?
    if force_confirm:
        assigned_status = "confirmed"
    else:
        statement = select(RSVP).where(RSVP.event_id == event_id, RSVP.status == "confirmed")
        confirmed_attendees = session.exec(statement).all()
        assigned_status = "confirmed" if len(confirmed_attendees) < event.max_players else "waitlisted"

    new_rsvp = RSVP(
        user_id=target_user_id,
        event_id=event_id,
        status=assigned_status
    )
    
    session.add(new_rsvp)
    session.commit()
    session.refresh(new_rsvp)
    
    return new_rsvp