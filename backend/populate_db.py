import random
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, SQLModel, select
from app.db.database import engine
from app.db.models import (
    User, Event, RSVP, 
    UserRole, PlayLevel, RSVPStatus
)

# --- CONFIGURATION ---
TOTAL_MEMBERS = 30
PAST_EVENTS_COUNT = 6
UPCOMING_EVENTS_COUNT = 10

EVENT_TEMPLATES = [
    {"title": "Monday Night Spikes", "loc": "City Indoor Arena", "type": "Indoor", "lvl": PlayLevel.INTERMEDIATE, "price": 2000},
    {"title": "Sunset Beach Volley", "loc": "Margaret Island Sand", "type": "Outdoor", "lvl": PlayLevel.ALL, "price": 0},
    {"title": "Advanced Pro 6v6", "loc": "Downtown Pro Center", "type": "Indoor", "lvl": PlayLevel.ADVANCED, "price": 3000},
    {"title": "Beginner Bootcamp", "loc": "University Gym", "type": "Indoor", "lvl": PlayLevel.BEGINNER, "price": 1000},
    {"title": "Weekend Sand Clash", "loc": "Lupa Beach", "type": "Outdoor", "lvl": PlayLevel.INTERMEDIATE, "price": 1500},
    {"title": "Friday Night Draft", "loc": "BME Sport Center", "type": "Indoor", "lvl": PlayLevel.INTERMEDIATE, "price": 2500},
    {"title": "Sunday Morning Drills", "loc": "Kopaszi Gát", "type": "Outdoor", "lvl": PlayLevel.ALL, "price": 1200},
]

def create_users(session: Session):
    print(f"Creating {TOTAL_MEMBERS + 3} users with preferences...")
    
    # Core Staff
    admin = User(
        id=100000001, username="admin_alex", first_name="Alex", 
        role=UserRole.ADMIN, verified_level=PlayLevel.ADVANCED,
        revolut_tag="alex_vball", notif_admin=True
    )
    org1 = User(
        id=200000001, username="org_sarah", first_name="Sarah", 
        role=UserRole.ORGANIZER, verified_level=PlayLevel.INTERMEDIATE,
        revolut_tag="sarah_spikes"
    )
    org2 = User(
        id=200000002, username="org_mike", first_name="Mike", 
        role=UserRole.ORGANIZER, verified_level=PlayLevel.ADVANCED,
        revolut_tag="mike_vball"
    )
    
    staff = [admin, org1, org2]
    session.add_all(staff)
    
    # Generic Members
    members = []
    for i in range(1, TOTAL_MEMBERS + 1):
        member = User(
            id=300000000 + i,
            username=f"player_{i}",
            first_name=f"Player{i}",
            role=UserRole.MEMBER,
            verified_level=random.choice([PlayLevel.BEGINNER, PlayLevel.INTERMEDIATE, PlayLevel.ADVANCED]),
            reliability_score=round(random.uniform(3.8, 5.0), 1),
            revolut_tag=f"pay_me_{i}" if random.random() > 0.5 else None,
            notif_new_events=random.choice([True, False]),
            notif_waitlist=True
        )
        members.append(member)
        session.add(member)
    
    session.commit()
    return staff, members

def create_events(session: Session, hosts: list):
    print(f"Generating {PAST_EVENTS_COUNT} past and {UPCOMING_EVENTS_COUNT} upcoming events...")
    now = datetime.now(timezone.utc)
    all_events = []

    # Generate Past Events
    for i in range(1, PAST_EVENTS_COUNT + 1):
        tpl = random.choice(EVENT_TEMPLATES)
        event_start = now - timedelta(days=i * 3, hours=random.randint(1, 12))
        event = Event(
            title=f"Past: {tpl['title']}",
            description="A completed match. Check out the highlights in the chat!",
            start_time=event_start,
            end_time=event_start + timedelta(hours=2),
            location_name=tpl['loc'],
            type=tpl['type'],
            max_players=random.choice([12, 14]),
            price=tpl['price'],
            level_required=tpl['lvl'],
            host_id=random.choice(hosts).id,
            revolut_tag=random.choice(hosts).revolut_tag
        )
        all_events.append(event)

    # Generate Upcoming Events
    for i in range(1, UPCOMING_EVENTS_COUNT + 1):
        tpl = random.choice(EVENT_TEMPLATES)
        days_ahead = random.randint(1, 30)
        hour_start = random.choice([17, 18, 19, 20])
        event_start = (now + timedelta(days=days_ahead)).replace(hour=hour_start, minute=0, second=0, microsecond=0)
        
        event = Event(
            title=tpl['title'],
            description="Join us for high energy play! Don't forget to pay the fee via Revolut.",
            start_time=event_start,
            end_time=event_start + timedelta(hours=2),
            location_name=tpl['loc'],
            type=tpl['type'], # Populating the new field
            max_players=random.choice([10, 12, 14]),
            price=tpl['price'],
            level_required=tpl['lvl'],
            host_id=random.choice(hosts).id,
            revolut_tag=random.choice(hosts).revolut_tag
        )
        all_events.append(event)

    session.add_all(all_events)
    session.commit()
    for e in all_events: session.refresh(e)
    return all_events

def fill_rsvps(session: Session, events: list, members: list):
    print("Filling rosters and waitlists...")
    now = datetime.now(timezone.utc)
    
    for event in events:
        # 1. Add Host
        session.add(RSVP(
            user_id=event.host_id, 
            event_id=event.id, 
            status=RSVPStatus.CONFIRMED, 
            attended=(event.start_time < now)
        ))
        
        # 2. Determine Fill Level
        if event.start_time < now:
            # Past matches are usually full
            fill_count = event.max_players - 1
        else:
            # Future matches vary
            fill_count = random.randint(2, event.max_players + 5)
            
        # 3. Sample Users
        players = random.sample(members, min(fill_count, len(members)))
        
        for idx, player in enumerate(players):
            # If idx + 1 (for host) < max_players, they are confirmed
            is_confirmed = (idx + 1) < event.max_players
            status = RSVPStatus.CONFIRMED if is_confirmed else RSVPStatus.WAITLISTED
            
            session.add(RSVP(
                user_id=player.id,
                event_id=event.id,
                status=status,
                attended=(event.start_time < now and is_confirmed)
            ))
            
    session.commit()

def populate():
    print("Initializing database...")
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        # Check if users already exist
        if session.exec(select(User)).first():
            print("⚠️ Data already exists. Skipping.")
            return

        staff, members = create_users(session)
        events = create_events(session, staff)
        fill_rsvps(session, events, members)
        
    print(f"✅ Successfully populated database with {len(events)} events!")

if __name__ == "__main__":
    populate()