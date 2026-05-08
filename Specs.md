Here are the complete development specifications for your Sports Event Management Telegram Mini App (TMA), formatted for easy copying and use in your development workflow.

---

# PRODUCT & TECHNICAL SPECIFICATIONS: SPORTS EVENT MANAGEMENT TMA

## 1. EXECUTIVE SUMMARY

* This platform is a community-driven sports management tool designed as a Telegram Mini App.


* It facilitates event creation for sports like volleyball, running, and football.


* The system integrates RSVP management and automated notifications within a Telegram group.



## 2. TECHNICAL STACK

* **Frontend:** React or Next.js using `window.Telegram.WebApp` API for native integration.


* **Backend API:** Python with FastAPI for asynchronous performance.


* **Database:** PostgreSQL with SQLAlchemy (Async) ORM.


* **Bot Layer:** `aiogram` (Python) for group commands and direct messaging.


* **Deployment:** Dockerized containers on a Linux environment.



## 3. ROLES AND PERMISSIONS (RBAC)

* **Member (Default):** Can view events, RSVP (Join/Leave), and receive status notifications.


* **Organizer:** Inherits Member rights; can create, edit, and cancel their own events; manages attendee lists and capacities.


* **Admin:** Inherits Organizer rights; possesses global control over all events and users; manages user roles and global settings.



## 4. CORE FEATURES & WORKFLOWS

* **Event Lifecycle:** States include `Draft` -> `Open` -> `Full` -> `In Progress` -> `Completed` or `Cancelled`.


* **Waitlist Engine:** Atomic RSVP transactions; if an event is full, users are waitlisted and automatically promoted if a spot opens.


* **Notification System:** Bot sends group broadcasts for new events and private DMs for registration/waitlist updates.



## 5. DATABASE SCHEMA (SQLAlchemy Models)

```python
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Text, Boolean
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

```

## 6. API ENDPOINTS (FastAPI)

* **Users:** `GET /api/users/me` (Profile), `PATCH /api/users/{telegram_id}/role` (Admin Only).


* **Events:** `GET /api/events/` (List), `POST /api/events/` (Create), `GET /api/events/{id}` (Details), `PATCH /api/events/{id}` (Edit), `DELETE /api/events/{id}` (Cancel).


* **Registrations:** `POST /api/events/{id}/register` (Join), `DELETE /api/events/{id}/register` (Leave).



## 7. SECURITY & AUTHENTICATION

* **Data Validation:** The backend must validate `window.Telegram.WebApp.initData` using the Bot Token.


* **Verification:** HMAC-SHA-256 check is required to ensure requests originate from Telegram.


* **Authorization:** FastAPI dependencies will enforce RBAC on all sensitive endpoints.



---

Since you have your group prepped and these specs ready, do you want to start with the backend boilerplate for the FastAPI server or the frontend setup for the Telegram Mini App?