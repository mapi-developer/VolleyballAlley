import random
from datetime import datetime, timedelta, timezone
from sqlmodel import Session, SQLModel, select
from app.db.database import engine
from app.db.models import (
    User, Event, RSVP, 
    UserRole, PlayLevel, RSVPStatus
)

def populate():
    print("Initializing database tables...")
    SQLModel.metadata.create_all(engine)
    
    print("Starting database population...")
    
    with Session(engine) as session:
        # 1. Check for existing data
        existing_admin = session.get(User, 100000001)
        if existing_admin:
            print("⚠️ Data already exists. Skipping population.")
            return

        # 2. Create Core Users
        admin = User(id=100000001, username="admin_alex", first_name="Alex", role=UserRole.ADMIN, verified_level=PlayLevel.ADVANCED)
        org1 = User(id=200000001, username="org_sarah", first_name="Sarah", role=UserRole.ORGANIZER, verified_level=PlayLevel.INTERMEDIATE)
        org2 = User(id=200000002, username="org_mike", first_name="Mike", role=UserRole.ORGANIZER, verified_level=PlayLevel.ADVANCED)
        session.add_all([admin, org1, org2])
        
        # Create 30 members to allow for full games and waitlists
        members = []
        for i in range(1, 31):
            member = User(
                id=300000000 + i,
                username=f"player_{i}",
                first_name=f"Player{i}",
                role=UserRole.MEMBER,
                verified_level=random.choice([PlayLevel.BEGINNER, PlayLevel.INTERMEDIATE, PlayLevel.ADVANCED]),
                reliability_score=round(random.uniform(4.0, 5.0), 1)
            )
            members.append(member)
            session.add(member)
        session.commit()

        # 3. Define Event Templates
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        event_templates = [
            {"title": "Monday Night Spikes", "loc": "City Indoor Arena", "type": "Indoor", "lvl": PlayLevel.INTERMEDIATE, "price": 2000},
            {"title": "Sunset Beach Volley", "loc": "Margaret Island Sand", "type": "Outdoor", "lvl": PlayLevel.ALL, "price": 0},
            {"title": "Advanced Pro 6v6", "loc": "Downtown Pro Center", "type": "Indoor", "lvl": PlayLevel.ADVANCED, "price": 3000},
            {"title": "Beginner Bootcamp", "loc": "University Gym", "type": "Indoor", "lvl": PlayLevel.BEGINNER, "price": 1000},
            {"title": "Weekend Sand Clash", "loc": "Lupa Beach", "type": "Outdoor", "lvl": PlayLevel.INTERMEDIATE, "price": 1500},
        ]

        print("Generating 12 diverse events...")
        all_events = []
        
        # Generate Past Events (6 events)
        for i in range(1, 7):
            tpl = random.choice(event_templates)
            event = Event(
                title=f"Past: {tpl['title']}",
                description="A great match that already happened.",
                start_time=now - timedelta(days=i*2),
                end_time=now - timedelta(days=i*2) + timedelta(hours=2),
                location_name=tpl['loc'],
                max_players=random.choice([12, 14]),
                price=tpl['price'],
                level_required=tpl['lvl'],
                host_id=random.choice([org1.id, org2.id]),
                revolut_tag="vball_pay"
            )
            all_events.append(event)

        # Generate Upcoming Events (6 events)
        for i in range(1, 7):
            tpl = random.choice(event_templates)
            event = Event(
                title=tpl['title'],
                description="Join us for this upcoming match! Bring water and good vibes.",
                start_time=now + timedelta(days=i*3),
                end_time=now + timedelta(days=i*3) + timedelta(hours=2),
                location_name=tpl['loc'],
                max_players=random.choice([10, 12]),
                price=tpl['price'],
                level_required=tpl['lvl'],
                host_id=random.choice([org1.id, admin.id]),
                revolut_tag="vball_pay"
            )
            all_events.append(event)

        session.add_all(all_events)
        session.commit()

        # 4. Populate RSVPs
        print("Filing rosters and waitlists...")
        for event in all_events:
            is_past = event.start_time < now
            
            # Add Host
            session.add(RSVP(user_id=event.host_id, event_id=event.id, status=RSVPStatus.CONFIRMED, attended=is_past))
            
            # Fill logic
            if is_past:
                # Past events are usually full
                fill_count = event.max_players - 1
                players = random.sample(members, fill_count)
                for p in players:
                    session.add(RSVP(user_id=p.id, event_id=event.id, status=RSVPStatus.CONFIRMED, attended=True))
            else:
                # Upcoming events: Some empty, some full, some waitlisted
                fill_type = random.choice(["low", "medium", "full", "waitlisted"])
                
                if fill_type == "low":
                    num = random.randint(1, 4)
                elif fill_type == "medium":
                    num = event.max_players // 2
                elif fill_type == "full":
                    num = event.max_players - 1
                else: # Waitlisted
                    num = event.max_players + 3
                
                players = random.sample(members, min(num, len(members)))
                for idx, p in enumerate(players):
                    status = RSVPStatus.CONFIRMED if idx < (event.max_players - 1) else RSVPStatus.WAITLISTED
                    session.add(RSVP(user_id=p.id, event_id=event.id, status=status, attended=False))

        session.commit()
        print("✅ Database successfully populated with 12 events and 30+ users!")

if __name__ == "__main__":
    populate()