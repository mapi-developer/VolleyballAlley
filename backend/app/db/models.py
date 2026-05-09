from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum
from typing import List, Optional
from sqlmodel import SQLModel, Field, Relationship, BigInteger # Removed Column from here
from sqlalchemy import Column, ForeignKey # Import these from sqlalchemy directly

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

class User(SQLModel, table=True):
    id: int = Field(sa_column=Column(BigInteger(), primary_key=True))
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    photo_url: Optional[str] = None
    role: UserRole = Field(default=UserRole.MEMBER)
    verified_level: PlayLevel = Field(default=PlayLevel.BEGINNER)
    reliability_score: float = Field(default=5.0)
    
    rsvps: List["RSVP"] = Relationship(back_populates="user")

class RSVP(SQLModel, table=True):
    user_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id"), primary_key=True))
    event_id: UUID = Field(foreign_key="event.id", primary_key=True)
    status: RSVPStatus = Field(default=RSVPStatus.CONFIRMED)
    joined_at: datetime = Field(default_factory=datetime.utcnow) 
    attended: bool = Field(default=True)

    user: User = Relationship(back_populates="rsvps")
    event: "Event" = Relationship(back_populates="attendees")

class EventBase(SQLModel):
    title: str
    description: str
    start_time: datetime  # Pydantic will now force-convert strings to objects here
    end_time: datetime
    location_name: str
    price: int
    revolut_tag: Optional[str] = None
    max_players: int = Field(default=12)

class Event(EventBase, table=True):
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    host_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id")))
    status: str = Field(default="Open")

    attendees: List[RSVP] = Relationship(
        back_populates="event", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    id: UUID = Field(default_factory=uuid4, primary_key=True)
    # FIXED: foreign_key="user.id" -> ForeignKey("user.id")
    host_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id")))
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    location_name: str
    price: int
    revolut_tag: Optional[str] = None
    max_players: int = Field(default=12)
    status: str = Field(default="Open")

    host: User = Relationship(back_populates="hosted_events")
    attendees: List[RSVP] = Relationship(
        back_populates="event", 
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

class BehaviorLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    # FIXED: foreign_key="user.id" -> ForeignKey("user.id")
    user_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id")))
    admin_id: int = Field(sa_column=Column(BigInteger(), ForeignKey("user.id")))
    penalty_points: float
    reason: str
    created_at: datetime = Field(default_factory=datetime.utcnow) # Removed parentheses ()

    user: User = Relationship(back_populates="reports_received", sa_relationship_kwargs={"foreign_keys": "[BehaviorLog.user_id]"})
    admin: User = Relationship(back_populates="reports_issued", sa_relationship_kwargs={"foreign_keys": "[BehaviorLog.admin_id]"})