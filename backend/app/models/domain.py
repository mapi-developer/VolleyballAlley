from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import declarative_base, relationship
import enum
from datetime import datetime, timezone

Base = declarative_base()

class RoleEnum(enum.Enum):
    MEMBER = "member"
    ORGANIZER = "organizer"
    ADMIN = "admin"

class EventStatus(enum.Enum):
    OPEN = "open"
    FULL = "full"
    CANCELLED = "cancelled"
    COMPLETED = "completed"

class RegistrationStatus(enum.Enum):
    ATTENDING = "attending"
    WAITLISTED = "waitlisted"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = 'users'
    telegram_id = Column(Integer, primary_key=True, index=True)
    username = Column(String, nullable=True)
    full_name = Column(String, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.MEMBER, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    registrations = relationship("Registration", back_populates="user")
    events_created = relationship("Event", back_populates="creator")

class Event(Base):
    __tablename__ = 'events'
    id = Column(Integer, primary_key=True, autoincrement=True)
    creator_id = Column(Integer, ForeignKey('users.telegram_id'), nullable=False)
    sport_type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    start_time = Column(DateTime, nullable=False)
    max_participants = Column(Integer, nullable=False)
    status = Column(Enum(EventStatus), default=EventStatus.OPEN, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    creator = relationship("User", back_populates="events_created")
    registrations = relationship("Registration", back_populates="event")

class Registration(Base):
    __tablename__ = 'registrations'
    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey('events.id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.telegram_id'), nullable=False)
    status = Column(Enum(RegistrationStatus), default=RegistrationStatus.ATTENDING, nullable=False)
    registered_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    event = relationship("Event", back_populates="registrations")
    user = relationship("User", back_populates="registrations")