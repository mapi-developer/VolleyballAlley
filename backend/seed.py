"""Seed script for VolleyballAlley.

Populates the database with realistic fixture data:
- 12 users (admins, organizers, members) across skill levels
- 12 events spread across past/present/future at multiple locations
- RSVPs with confirmed/waitlisted status, attended/no-show history
- Behavior logs for realism

Run:
    python seed.py          # from backend/ directory
    docker compose exec backend python seed.py
"""

from datetime import datetime, timezone, timedelta
from uuid import uuid4
from sqlmodel import Session, select, SQLModel
from sqlalchemy import text
from app.db.database import engine
from app.db.models import (
    User, UserRole, PlayLevel,
    Event, RSVP, RSVPStatus,
    BehaviorLog,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

ADMIN_ID = 7745729852
ADMIN_USERNAME = "victor"
ADMIN_FIRST_NAME = "Victor"
ADMIN_LAST_NAME = "Karpovich"

# ---------------------------------------------------------------------------
# Users
# ---------------------------------------------------------------------------

MEMBERS = [
    {
        "id": 1_000_000_001,
        "username": "alex_p",
        "first_name": "Alex",
        "last_name": "Petrov",
        "role": UserRole.ORGANIZER,
        "verified_level": PlayLevel.ADVANCED,
        "reliability_score": 4.5,
        "photo_url": "https://i.pravatar.cc/150?u=alex",
    },
    {
        "id": 1_000_000_002,
        "username": "maria_s",
        "first_name": "Maria",
        "last_name": "Sidorova",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.INTERMEDIATE,
        "reliability_score": 5.0,
        "photo_url": "https://i.pravatar.cc/150?u=maria",
    },
    {
        "id": 1_000_000_003,
        "username": "dmitry_k",
        "first_name": "Dmitry",
        "last_name": "Kuznetsov",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.BEGINNER,
        "reliability_score": 3.8,
        "photo_url": "https://i.pravatar.cc/150?u=dmitry",
    },
    {
        "id": 1_000_000_004,
        "username": "elena_v",
        "first_name": "Elena",
        "last_name": "Volkova",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.ADVANCED,
        "reliability_score": 4.2,
        "photo_url": "https://i.pravatar.cc/150?u=elena",
    },
    {
        "id": 1_000_000_005,
        "username": "ivan_m",
        "first_name": "Ivan",
        "last_name": "Morozov",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.INTERMEDIATE,
        "reliability_score": 5.0,
        "photo_url": "https://i.pravatar.cc/150?u=ivan",
    },
    {
        "id": 1_000_000_006,
        "username": "olga_r",
        "first_name": "Olga",
        "last_name": "Romanova",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.INTERMEDIATE,
        "reliability_score": 2.5,
        "photo_url": "https://i.pravatar.cc/150?u=olga",
    },
    {
        "id": 1_000_000_007,
        "username": "sergey_n",
        "first_name": "Sergey",
        "last_name": "Novikov",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.ADVANCED,
        "reliability_score": 4.0,
        "photo_url": "https://i.pravatar.cc/150?u=sergey",
    },
    {
        "id": 1_000_000_008,
        "username": "natasha_l",
        "first_name": "Natasha",
        "last_name": "Lebedeva",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.BEGINNER,
        "reliability_score": 4.8,
        "photo_url": "https://i.pravatar.cc/150?u=natasha",
    },
    {
        "id": 1_000_000_009,
        "username": "pavel_d",
        "first_name": "Pavel",
        "last_name": "Dubrov",
        "role": UserRole.ORGANIZER,
        "verified_level": PlayLevel.ADVANCED,
        "reliability_score": 4.6,
        "photo_url": "https://i.pravatar.cc/150?u=pavel",
    },
    {
        "id": 1_000_000_010,
        "username": "katya_b",
        "first_name": "Katya",
        "last_name": "Belyaeva",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.INTERMEDIATE,
        "reliability_score": 3.0,
        "photo_url": "https://i.pravatar.cc/150?u=katya",
    },
    {
        "id": 1_000_000_011,
        "username": "andrey_g",
        "first_name": "Andrey",
        "last_name": "Gromov",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.ADVANCED,
        "reliability_score": 5.0,
        "photo_url": "https://i.pravatar.cc/150?u=andrey",
    },
    {
        "id": 1_000_000_012,
        "username": "tanya_f",
        "first_name": "Tanya",
        "last_name": "Frolova",
        "role": UserRole.MEMBER,
        "verified_level": PlayLevel.BEGINNER,
        "reliability_score": 1.5,
        "photo_url": "https://i.pravatar.cc/150?u=tanya",
    },
]


def create_users(session: Session) -> User:
    """Create all fixture users. Returns the admin user."""
    admin = User(
        id=ADMIN_ID,
        username=ADMIN_USERNAME,
        first_name=ADMIN_FIRST_NAME,
        last_name=ADMIN_LAST_NAME,
        role=UserRole.ADMIN,
        verified_level=PlayLevel.ADVANCED,
        reliability_score=5.0,
        photo_url="https://i.pravatar.cc/150?u=admin",
    )
    session.add(admin)

    for data in MEMBERS:
        user = User(**data)
        session.add(user)

    session.commit()
    return admin


# ---------------------------------------------------------------------------
# Events
# ---------------------------------------------------------------------------

EVENTS_DATA = [
    # --- Past events (already happened) ---
    {
        "title": "Indoor Warm-up – Beginner Friendly",
        "description": "Casual indoor session for beginners and intermediates. Bring water and court shoes.",
        "type": "Indoor",
        "level_required": PlayLevel.BEGINNER,
        "offset_hours": -72,
        "location_name": "Sport Palace",
        "price": 0,
        "max_players": 10,
        "host_index": 0,  # index into MEMBERS
    },
    {
        "title": "Advanced Beach Volleyball",
        "description": "Sand session – expect lots of running. Sunscreen recommended.",
        "type": "Beach",
        "level_required": PlayLevel.ADVANCED,
        "offset_hours": -48,
        "location_name": "Beach Court",
        "price": 5000,
        "max_players": 12,
        "host_index": 8,
    },
    {
        "title": "Evening League Practice",
        "description": "Team practice ahead of Saturday's league match.",
        "type": "Indoor",
        "level_required": PlayLevel.INTERMEDIATE,
        "offset_hours": -24,
        "location_name": "Sport Palace",
        "price": 0,
        "max_players": 12,
        "host_index": 0,
    },
    # --- Today / upcoming soon ---
    {
        "title": "Saturday Morning Indoor",
        "description": "Quick game before the weekend gets busy. All levels welcome.",
        "type": "Indoor",
        "level_required": PlayLevel.ALL,
        "offset_hours": 4,
        "location_name": "City Gym",
        "price": 2000,
        "max_players": 8,
        "host_index": 8,
    },
    {
        "title": "Advanced Evening Session",
        "description": "Serious play – tournament-level intensity. Intermediate players welcome but may be waitlisted.",
        "type": "Indoor",
        "level_required": PlayLevel.ADVANCED,
        "offset_hours": 26,
        "location_name": "Sport Palace",
        "price": 3000,
        "max_players": 12,
        "host_index": 0,
    },
    {
        "title": "Beach Day – Sun & Sand",
        "description": "Beach volleyball under the sun. Great for beginners who want to try the sand.",
        "type": "Beach",
        "level_required": PlayLevel.ALL,
        "offset_hours": 48,
        "location_name": "Beach Court",
        "price": 5000,
        "max_players": 12,
        "host_index": 8,
    },
    # --- Future events (next week) ---
    {
        "title": "Beginner Workshop",
        "description": "Learn the basics: serving, passing, and rotation. First-timers encouraged.",
        "type": "Indoor",
        "level_required": PlayLevel.BEGINNER,
        "offset_hours": 72,
        "location_name": "City Gym",
        "price": 0,
        "max_players": 10,
        "host_index": 0,
    },
    {
        "title": "Intermediates Round-robin",
        "description": "Mini tournament with rotating teams. Must know basic rotation.",
        "type": "Indoor",
        "level_required": PlayLevel.INTERMEDIATE,
        "offset_hours": 96,
        "location_name": "Sport Palace",
        "price": 2500,
        "max_players": 12,
        "host_index": 8,
    },
    {
        "title": "Advanced Open Play",
        "description": "High-level open gym. RSVP early – fills up fast.",
        "type": "Indoor",
        "level_required": PlayLevel.ADVANCED,
        "offset_hours": 120,
        "location_name": "City Gym",
        "price": 3000,
        "max_players": 10,
        "host_index": 0,
    },
    {
        "title": "Weekend Beach Social",
        "description": "Casual beach volleyball – meet new players, have fun.",
        "type": "Beach",
        "level_required": PlayLevel.INTERMEDIATE,
        "offset_hours": 144,
        "location_name": "Beach Court",
        "price": 4000,
        "max_players": 12,
        "host_index": 8,
    },
    {
        "title": "Night Indoor – Last Chance",
        "description": "Late-night session for night owls. No drop-ins past 24h before start.",
        "type": "Indoor",
        "level_required": PlayLevel.ALL,
        "offset_hours": 168,
        "location_name": "Sport Palace",
        "price": 1500,
        "max_players": 8,
        "host_index": 0,
    },
    {
        "title": "Monthly Tournament Qualifier",
        "description": "Top players only. Winners advance to the monthly tournament.",
        "type": "Indoor",
        "level_required": PlayLevel.ADVANCED,
        "offset_hours": 192,
        "location_name": "City Gym",
        "price": 10000,
        "max_players": 16,
        "host_index": 0,
    },
]


def create_events(session: Session, admin: User, members: list[dict]) -> list[Event]:
    """Create fixture events with realistic timing and host assignments."""
    now = datetime.now(timezone.utc)
    events: list[Event] = []

    for data in EVENTS_DATA:
        start_time = now + timedelta(hours=data["offset_hours"])
        duration_hours = 2
        event = Event(
            id=uuid4(),
            title=data["title"],
            description=data["description"],
            type=data["type"],
            level_required=data["level_required"],
            start_time=start_time,
            end_time=start_time + timedelta(hours=duration_hours),
            location_name=data["location_name"],
            price=data["price"],
            max_players=data["max_players"],
            host_id=members[data["host_index"]]["id"],
            status="Open" if start_time > now else "Closed",
        )
        session.add(event)
        events.append(event)

    session.commit()
    return events


# ---------------------------------------------------------------------------
# RSVPs
# ---------------------------------------------------------------------------

# RSVP patterns keyed by event index.
# Each pattern is a list of (member_index, status, attended) tuples.
# member_index -1 = admin, -2 = first member, etc.
RSVP_PATTERNS: list[list[tuple[int, RSVPStatus | None, bool | None]]] = [
    # Event 0 – past beginner indoor (3 attendees, 1 no-show)
    [
        (0, RSVPStatus.CONFIRMED, True),   # admin attended
        (1, RSVPStatus.CONFIRMED, True),   # Alex
        (2, RSVPStatus.CONFIRMED, True),   # Maria
        (3, RSVPStatus.CONFIRMED, False),  # Dmitry – no-show
        (7, RSVPStatus.CONFIRMED, True),   # Natasha
    ],
    # Event 1 – past advanced beach (2 attended, 1 waitlisted)
    [
        (8, RSVPStatus.CONFIRMED, True),   # Pavel
        (4, RSVPStatus.CONFIRMED, True),   # Ivan
        (6, RSVPStatus.CONFIRMED, True),   # Sergey
        (3, RSVPStatus.WAITLISTED, None),  # Dmitry – waitlisted
    ],
    # Event 2 – past league practice (all confirmed, some attended)
    [
        (0, RSVPStatus.CONFIRMED, True),   # Alex
        (1, RSVPStatus.CONFIRMED, True),   # Maria
        (4, RSVPStatus.CONFIRMED, True),   # Ivan
        (5, RSVPStatus.CONFIRMED, True),   # Olga
        (9, RSVPStatus.CONFIRMED, False),  # Katya – no-show
    ],
    # Event 3 – today's morning game (near capacity, 1 waitlisted)
    [
        (8, RSVPStatus.CONFIRMED, None),   # Pavel (host)
        (1, RSVPStatus.CONFIRMED, None),   # Alex
        (3, RSVPStatus.CONFIRMED, None),   # Elena
        (6, RSVPStatus.CONFIRMED, None),   # Sergey
        (4, RSVPStatus.CONFIRMED, None),   # Ivan
        (2, RSVPStatus.WAITLISTED, None),  # Dmitry – waitlisted
    ],
    # Event 4 – advanced evening (full)
    [
        (0, RSVPStatus.CONFIRMED, None),   # Alex (host)
        (3, RSVPStatus.CONFIRMED, None),   # Elena
        (6, RSVPStatus.CONFIRMED, None),   # Sergey
        (8, RSVPStatus.CONFIRMED, None),   # Pavel
        (10, RSVPStatus.CONFIRMED, None),  # Andrey
        (5, RSVPStatus.WAITLISTED, None),  # Olga
    ],
    # Event 5 – beach day (lots of interest)
    [
        (8, RSVPStatus.CONFIRMED, None),   # Pavel (host)
        (1, RSVPStatus.CONFIRMED, None),   # Alex
        (7, RSVPStatus.CONFIRMED, None),   # Natasha
        (2, RSVPStatus.CONFIRMED, None),   # Dmitry
        (9, RSVPStatus.CONFIRMED, None),   # Katya
        (11, RSVPStatus.CONFIRMED, None),  # Tanya
        (4, RSVPStatus.WAITLISTED, None),  # Ivan
    ],
    # Event 6 – beginner workshop (few sign-ups)
    [
        (0, RSVPStatus.CONFIRMED, None),   # Alex (host)
        (2, RSVPStatus.CONFIRMED, None),   # Dmitry
        (7, RSVPStatus.CONFIRMED, None),   # Natasha
        (11, RSVPStatus.CONFIRMED, None),  # Tanya
    ],
    # Event 7 – intermediates round-robin
    [
        (8, RSVPStatus.CONFIRMED, None),   # Pavel (host)
        (1, RSVPStatus.CONFIRMED, None),   # Alex
        (2, RSVPStatus.CONFIRMED, None),   # Dmitry
        (4, RSVPStatus.CONFIRMED, None),   # Ivan
        (5, RSVPStatus.CONFIRMED, None),   # Olga
        (9, RSVPStatus.CONFIRMED, None),   # Katya
    ],
    # Event 8 – advanced open play
    [
        (0, RSVPStatus.CONFIRMED, None),   # Alex (host)
        (3, RSVPStatus.CONFIRMED, None),   # Elena
        (6, RSVPStatus.CONFIRMED, None),   # Sergey
        (10, RSVPStatus.CONFIRMED, None),  # Andrey
    ],
    # Event 9 – weekend beach social
    [
        (8, RSVPStatus.CONFIRMED, None),   # Pavel (host)
        (1, RSVPStatus.CONFIRMED, None),   # Alex
        (4, RSVPStatus.CONFIRMED, None),   # Ivan
        (7, RSVPStatus.CONFIRMED, None),   # Natasha
    ],
    # Event 10 – night indoor
    [
        (0, RSVPStatus.CONFIRMED, None),   # Alex (host)
        (1, RSVPStatus.CONFIRMED, None),   # Alex
        (5, RSVPStatus.CONFIRMED, None),   # Olga
    ],
    # Event 11 – tournament qualifier (top players)
    [
        (0, RSVPStatus.CONFIRMED, None),   # Alex (host)
        (3, RSVPStatus.CONFIRMED, None),   # Elena
        (6, RSVPStatus.CONFIRMED, None),   # Sergey
        (8, RSVPStatus.CONFIRMED, None),   # Pavel
        (10, RSVPStatus.CONFIRMED, None),  # Andrey
    ],
]


def fill_rsvps(session: Session, events: list[Event]) -> None:
    """Create RSVP records with realistic attendance patterns."""
    now = datetime.now(timezone.utc)

    for event_idx, event in enumerate(events):
        pattern = RSVP_PATTERNS[event_idx]
        for member_idx, status, attended in pattern:
            # Resolve member index: -1 = admin, -2 = first member, etc.
            if member_idx == -1:
                user_id = ADMIN_ID
            elif member_idx < 0:
                user_id = MEMBERS[member_idx]["id"]
            else:
                user_id = MEMBERS[member_idx]["id"]

            # Determine attended flag for past events
            if event.start_time < now:
                if attended is None:
                    # Default: confirmed = attended for past events
                    attended = status == RSVPStatus.CONFIRMED
            else:
                attended = None

            rsvp = RSVP(
                user_id=user_id,
                event_id=event.id,
                status=status if status else RSVPStatus.CONFIRMED,
                attended=attended,
            )
            session.add(rsvp)

    session.commit()


# ---------------------------------------------------------------------------
# Behavior Logs
# ---------------------------------------------------------------------------

BEHAVIOR_LOGS = [
    {
        "user_id": 1_000_000_006,  # Olga
        "admin_id": ADMIN_ID,
        "penalty_points": 2.5,
        "reason": "Repeated no-shows without cancellation (3x)",
    },
    {
        "user_id": 1_000_000_012,  # Tanya
        "admin_id": ADMIN_ID,
        "penalty_points": 1.5,
        "reason": "Arrived 30 min late without notice",
    },
    {
        "user_id": 1_000_000_010,  # Katya
        "admin_id": ADMIN_ID,
        "penalty_points": 1.0,
        "reason": "Left event without informing host",
    },
]


def create_behavior_logs(session: Session) -> None:
    """Add admin behavior logs for realism."""
    for data in BEHAVIOR_LOGS:
        log = BehaviorLog(**data)
        session.add(log)
    session.commit()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def populate() -> None:
    """Seed the database with fixture data."""
    # Drop ENUM types that may have been partially created by a previous failed run
    with engine.connect() as conn:
        for enum_name in ["userrole", "playlevel", "rsvpstatus"]:
            conn.execute(text(f"DROP TYPE IF EXISTS {enum_name}"))
        conn.commit()

    SQLModel.metadata.create_all(engine)

    with Session(engine) as session:
        if session.exec(select(User)).first():
            print("Data already exists. Skipping.")
            return

        print("Creating users…")
        admin = create_users(session)

        print("Creating events…")
        events = create_events(session, admin, MEMBERS)

        print("Filling RSVPs…")
        fill_rsvps(session, events)

        print("Adding behavior logs…")
        create_behavior_logs(session)

    print("Successfully populated database!")


if __name__ == "__main__":
    populate()
