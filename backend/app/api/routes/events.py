from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID

from app.db.database import get_session
from app.db.models import Event, User, UserRole
from app.core.security import get_current_user

router = APIRouter()

# --- Schemas ---
class EventCreate(BaseModel):
    title: str
    description: str
    type: str  # Indoor/Outdoor
    level_required: str
    start_time: datetime
    end_time: datetime
    location_name: str
    address: Optional[str] = None
    price: int
    revolut_tag: Optional[str] = None
    max_players: int

# All fields are optional so the frontend only sends what actually changed
class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    level_required: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    price: Optional[int] = None
    revolut_tag: Optional[str] = None
    max_players: Optional[int] = None
    status: Optional[str] = None

# --- Routes ---

@router.post("/", response_model=Event, status_code=status.HTTP_201_CREATED)
def create_event(
    event_in: EventCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Create a new volleyball event. 
    Only users with the 'organizer' or 'admin' role can do this.
    """
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="You must be an Organizer to create events."
        )
        
    new_event = Event(
        **event_in.model_dump(),
        host_id=current_user.id,
        status="Open"
    )
    
    session.add(new_event)
    session.commit()
    session.refresh(new_event)
    
    return new_event

@router.get("/", response_model=List[Event])
def get_upcoming_events(session: Session = Depends(get_session)):
    """Fetch all 'Open' events for the Browse tab, sorted by start time."""
    statement = select(Event).where(Event.status == "Open").order_by(Event.start_time)
    return session.exec(statement).all()

@router.get("/hosted", response_model=List[Event])
def get_hosted_events(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Fetch events hosted by the currently logged-in user."""
    statement = select(Event).where(Event.host_id == current_user.id).order_by(Event.start_time)
    return session.exec(statement).all()

@router.patch("/{event_id}", response_model=Event)
def update_event(
    event_id: UUID,
    event_update: EventUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Update an existing event. Only the host or an admin can modify it.
    Enforces a 24-hour lock on changing time and location.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Security: Verify ownership
    if event.host_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to edit this event")

    # Business Logic: 24-Hour Edit Lock check
    now = datetime.utcnow()
    # Strip timezone info if any for safe subtraction, depending on how your DB stores it
    time_until_start = event.start_time.replace(tzinfo=None) - now 
    
    if time_until_start < timedelta(hours=24):
        # Prevent changing critical logistics if the game is soon
        if event_update.start_time or event_update.location_name:
            raise HTTPException(
                status_code=400, 
                detail="Cannot change start time or location less than 24 hours before the event."
            )

    # Apply the updates to the database model
    update_data = event_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)
        
    session.add(event)
    session.commit()
    session.refresh(event)
    
    return event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_event(
    event_id: UUID,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Permanently delete an event. Only the host or an admin can delete.
    Alternatively, organizers can update the status to 'Cancelled' via the PATCH route.
    """
    event = session.get(Event, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Security: Verify ownership
    if event.host_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this event")
        
    session.delete(event)
    session.commit()
    
    return None