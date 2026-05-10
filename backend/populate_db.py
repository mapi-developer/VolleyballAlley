import random
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, SQLModel # Added SQLModel import
from app.db.database import engine
# Import models to ensure they are registered with SQLModel.metadata
from app.db.models import (
    User, Event, RSVP, 
    UserRole, PlayLevel, RSVPStatus
)

def populate():
    # --- NEW: GENERATE TABLES IF THEY DON'T EXIST ---
    print("Initializing database tables...")
    SQLModel.metadata.create_all(engine)
    
    print("Starting database population...")
    
    with Session(engine) as session:
        # ---------------------------------------------------------
        # 1. CREATE USERS
        # ---------------------------------------------------------
        print("Creating users...")
        
        # Check if users already exist to avoid primary key conflicts if you run it twice
        existing_admin = session.get(User, 100000001)
        if existing_admin:
            print("⚠️ Data already exists. Skipping population.")
            return

        # Admins & Organizers
        admin = User(id=100000001, username="admin_alex", first_name="Alex", role=UserRole.ADMIN, verified_level=PlayLevel.ADVANCED, reliability_score=5.0)
        org1 = User(id=200000001, username="org_sarah", first_name="Sarah", role=UserRole.ORGANIZER, verified_level=PlayLevel.INTERMEDIATE, reliability_score=4.9)
        org2 = User(id=200000002, username="org_mike", first_name="Mike", role=UserRole.ORGANIZER, verified_level=PlayLevel.ADVANCED, reliability_score=4.8)
        
        session.add_all([admin, org1, org2])
        
        # Regular Members (Create 15 members)
        members = []
        for i in range(1, 16):
            member = User(
                id=300000000 + i,
                username=f"player_{i}",
                first_name=f"Player{i}",
                role=UserRole.MEMBER,
                verified_level=random.choice(list(PlayLevel)),
                reliability_score=round(random.uniform(3.5, 5.0), 1)
            )
            members.append(member)
            session.add(member)
            
        session.commit()

        # ---------------------------------------------------------
        # 2. CREATE EVENTS
        # ---------------------------------------------------------
        print("Creating events...")
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        
        events = []
        
        past_event_1 = Event(
            title="Sunday Social Volley",
            description="Casual game that already happened.",
            start_time=now - timedelta(days=7),
            end_time=now - timedelta(days=7) + timedelta(hours=2),
            location_name="Margaret Island Sand",
            max_players=12,
            price=0,
            level_required=PlayLevel.ALL,
            host_id=org1.id,
            revolut_tag="sarahvolley"
        )
        
        past_event_2 = Event(
            title="Advanced Indoor Clash",
            description="Intense match from last week.",
            start_time=now - timedelta(days=3),
            end_time=now - timedelta(days=3) + timedelta(hours=2),
            location_name="City Sports Center",
            max_players=12,
            price=2500,
            level_required=PlayLevel.ADVANCED,
            host_id=org2.id,
            revolut_tag="mike_vball"
        )
        
        upcoming_event_1 = Event( 
            title="Beach Sunset Training",
            description="Practicing serves and receives. Open to everyone.",
            start_time=now + timedelta(days=2),
            end_time=now + timedelta(days=2) + timedelta(hours=2),
            location_name="Beach Arena Court 1",
            max_players=12,
            price=1500,
            level_required=PlayLevel.BEGINNER,
            host_id=org1.id,
            revolut_tag="sarahvolley"
        )
        
        upcoming_event_2 = Event( 
            title="Pro League Scrimmage",
            description="Strictly for advanced players. We will run a 6v6 format.",
            start_time=now + timedelta(days=5),
            end_time=now + timedelta(days=5) + timedelta(hours=2),
            location_name="Downtown Indoor Arena",
            max_players=12,
            price=3000,
            level_required=PlayLevel.ADVANCED,
            host_id=admin.id,
            revolut_tag="alex_admin"
        )
        events.extend([past_event_1, past_event_2, upcoming_event_1, upcoming_event_2])
        
        session.add_all(events)
        session.commit()

        # ---------------------------------------------------------
        # 3. CREATE RSVPs
        # ---------------------------------------------------------
        print("Populating RSVPs and Waitlists...")
        
        def auto_rsvp_host(event):
            evt_start = event.start_time.replace(tzinfo=None) if event.start_time.tzinfo else event.start_time
            session.add(RSVP(user_id=event.host_id, event_id=event.id, status=RSVPStatus.CONFIRMED, attended=(evt_start < now)))
            
        for ev in events:
            auto_rsvp_host(ev)

        # Populate Past Event 1 (10 players)
        for m in members[:9]:
            session.add(RSVP(user_id=m.id, event_id=past_event_1.id, status=RSVPStatus.CONFIRMED, attended=True))
            
        # Populate Past Event 2 (12 players)
        for m in members[:11]:
            session.add(RSVP(user_id=m.id, event_id=past_event_2.id, status=RSVPStatus.CONFIRMED, attended=True))
            
        # Populate Upcoming Event 1 (6 players)
        for m in members[8:13]:
            session.add(RSVP(user_id=m.id, event_id=upcoming_event_1.id, status=RSVPStatus.CONFIRMED, attended=False))
            
        # Populate Upcoming Event 2 (Full + Waitlist)
        for m in members[:11]:
            session.add(RSVP(user_id=m.id, event_id=upcoming_event_2.id, status=RSVPStatus.CONFIRMED, attended=False))
        for m in members[11:14]:
            session.add(RSVP(user_id=m.id, event_id=upcoming_event_2.id, status=RSVPStatus.WAITLISTED, attended=False))

        session.commit()
        print("✅ Database successfully populated!")

if __name__ == "__main__":
    try:
        populate()
    except Exception as e:
        print(f"❌ Error populating database: {e}")