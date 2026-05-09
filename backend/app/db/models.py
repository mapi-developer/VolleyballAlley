from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import Field, Relationship, SQLModel

# --- Enums / Constants ---
class UserRole(str):
    MEMBER = "member"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class PlayLevel(str):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    ALL = "All"

# --- Models ---

class RSVP(SQLModel, table=True):
    user_id: int = Field(foreign_key="user.id", primary_key=True)
    event_id: UUID = Field(foreign_key="event.id", primary_key=True)
    status: str = Field(default="confirmed")  # confirmed, waitlisted
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    attended: bool = Field(default=True)  # Marked by host after game
    
    user: "User" = Relationship(back_populates="registrations")
    event: "Event" = Relationship(back_populates="attendees")

class User(SQLModel, table=True):
    id: int = Field(primary_key=True)  # Telegram User ID
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: str = Field(default=UserRole.MEMBER)
    verified_level: str = Field(default=PlayLevel.BEGINNER)
    reliability_score: float = Field(default=5.0)
    last_evaluation_at: Optional[datetime] = None
    
    # Relationships
    registrations: List[RSVP] = Relationship(back_populates="user")
    hosted_events: List["Event"] = Relationship(back_populates="host")
    behavior_logs: List["BehaviorLog"] = Relationship(back_populates="user")

class Event(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str
    description: str
    type: str  # Indoor/Outdoor
    level_required: str
    start_time: datetime
    end_time: datetime
    location_name: str
    address: Optional[str] = None
    price: int  # HUF or EUR
    revolut_tag: Optional[str] = None
    max_players: int
    host_id: int = Field(foreign_key="user.id")
    status: str = Field(default="Open")  # Open, Full, Completed, Cancelled
    
    # Relationships
    host: User = Relationship(back_populates="hosted_events")
    attendees: List[RSVP] = Relationship(back_populates="event")

class BehaviorLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    admin_id: int = Field(foreign_key="user.id") # Admin who issued the fine
    penalty_points: float
    reason: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    user: User = Relationship(back_populates="behavior_logs")