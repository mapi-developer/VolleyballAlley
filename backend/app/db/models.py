from datetime import datetime, timezone
from uuid import UUID, uuid4
from enum import Enum
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship, BigInteger
from sqlalchemy import Column, ForeignKey
from pydantic import BaseModel

# --- Enums ---
class UserRole(str, Enum):
    MEMBER = "member"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class PlayLevel(str, Enum):
    BEGINNER = "Beginner"
    INTERMEDIATE = "Intermediate"
    ADVANCED = "Advanced"
    ALL = "All"

class RSVPStatus(str, Enum):
    CONFIRMED = "confirmed"
    WAITLISTED = "waitlisted"

# --- USER ---
class User(SQLModel, table=True):
    id: int = Field(sa_column=Column(BigInteger(), primary_key=True))
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: UserRole = Field(default=UserRole.MEMBER)
    verified_level: PlayLevel = Field(default=PlayLevel.BEGINNER)
    reliability_score: float = Field(default=5.0)
    last_evaluation_at: Optional[datetime] = None
    
    # --- NEW PREFERENCES ---
    revolut_tag: Optional[str] = None
    notif_new_events: bool = Field(default=True)
    notif_waitlist: bool = Field(default=True)
    notif_reminders: bool = Field(default=True)
    notif_admin: bool = Field(default=False)
    
    hosted_events: List["Event"] = Relationship(back_populates="host")
    rsvps: List["RSVP"] = Relationship(back_populates="user")
    
    reports_received: List["BehaviorLog"] = Relationship(
        back_populates="user", 
        sa_relationship_kwargs={"foreign_keys": "BehaviorLog.user_id"}
    )
    reports_issued: List["BehaviorLog"] = Relationship(
        back_populates="admin", 
        sa_relationship_kwargs={"foreign_keys": "BehaviorLog.admin_id"}
    )

# --- NEW: Preference Update Schema ---
class UserPreferencesUpdate(BaseModel):
    revolut_tag: Optional[str] = None
    notif_new_events: Optional[bool] = None
    notif_waitlist: Optional[bool] = None
    notif_reminders: Optional[bool] = None
    notif_admin: Optional[bool] = None

# --- RSVP ---
class RSVP(SQLModel, table=True):
    user_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id"), primary_key=True))
    event_id: UUID = Field(foreign_key="event.id", primary_key=True)
    status: RSVPStatus = Field(default=RSVPStatus.CONFIRMED)
    joined_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc)) 
    attended: bool = Field(default=True)

    user: User = Relationship(back_populates="rsvps")
    event: "Event" = Relationship(back_populates="attendees")

# --- EVENT SCHEMAS ---
class EventBase(SQLModel):
    title: str
    description: str
    type: str = Field(default="Indoor")
    start_time: datetime
    end_time: datetime
    location_name: str
    price: int
    revolut_tag: Optional[str] = None
    max_players: int = Field(default=12)
    level_required: PlayLevel = Field(default=PlayLevel.ALL)

class EventUpdate(SQLModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location_name: Optional[str] = None
    price: Optional[int] = None
    max_players: Optional[int] = None
    level_required: Optional[PlayLevel] = None
    revolut_tag: Optional[str] = None

class Event(EventBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    host_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id"), nullable=False))
    status: str = Field(default="Open")

    host: User = Relationship(back_populates="hosted_events")
    attendees: List[RSVP] = Relationship(
        back_populates="event", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class EventReadWithAttendees(EventBase):
    id: UUID
    host_id: int
    status: str
    attendees: List[RSVP] = []

# --- BEHAVIOR LOG ---
class BehaviorLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id"), nullable=False))
    admin_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id"), nullable=False))
    penalty_points: float
    reason: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: User = Relationship(back_populates="reports_received", sa_relationship_kwargs={"foreign_keys": "BehaviorLog.user_id"})
    admin: User = Relationship(back_populates="reports_issued", sa_relationship_kwargs={"foreign_keys": "BehaviorLog.admin_id"})