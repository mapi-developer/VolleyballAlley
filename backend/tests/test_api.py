import pytest
from app.db.models import User, UserRole, PlayLevel, RSVPStatus

# --- USER PROFILE & STATS TESTS ---

def test_get_user_profile(client):
    response = client.get("/api/users/me")
    assert response.status_code == 200
    assert response.json()["id"] == 12345

def test_get_user_stats_empty(client):
    response = client.get("/api/users/me/stats")
    assert response.status_code == 200
    # FIX: Changed "reliability" to "reliability_score"
    assert response.json()["reliability_score"] == 5.0

# --- EVENT MANAGEMENT & FILTERING ---

def test_create_event_with_filters(client):
    event_data = {
        "title": "Advanced Pro Game",
        "description": "Invite only",
        "start_time": "2026-12-01T10:00:00",
        "end_time": "2026-12-01T12:00:00",
        "location_name": "Pro Court",
        "price": 3000,
        "level_required": PlayLevel.ADVANCED
    }
    client.post("/api/events/", json=event_data)
    
    # Check if filters find the event
    resp = client.get("/api/events/?level=Advanced")
    assert len(resp.json()) >= 1
    
    # Check if filter correctly excludes different locations
    resp = client.get("/api/events/?location=Beach")
    assert len(resp.json()) == 0

def test_unauthorized_event_creation(client):
    # Set the current user to a normal MEMBER
    client.test_user_data["role"] = UserRole.MEMBER
    
    event_data = {
        "title": "Illegal Game", "description": "...", "start_time": "2026-12-01T10:00:00",
        "end_time": "2026-12-01T12:00:00", "location_name": "...", "price": 0
    }
    
    response = client.post("/api/events/", json=event_data)
    assert response.status_code == 403

# --- BEHAVIOR & REPUTATION SYSTEM ---

def test_admin_report_deducts_points(client, session):
    target_id = 11111
    
    # 1. Manually add the target user to the DB
    target_user = User(id=target_id, first_name="Target", role=UserRole.MEMBER)
    session.add(target_user)
    session.commit()

    # 2. Switch identity to ADMIN and issue a fine
    client.test_user_data["id"] = 12345
    client.test_user_data["role"] = UserRole.ADMIN
    
    report_data = {
        "user_id": target_id,
        "penalty_points": 1.5,
        "reason": "Abusive language"
    }
    client.post("/api/reports/", json=report_data)
    
    # 3. Switch identity to the victim to check their updated stats
    client.test_user_data["id"] = target_id
    client.test_user_data["role"] = UserRole.MEMBER
    
    response = client.get("/api/users/me/stats")
    # FIX: Changed "reliability" to "reliability_score"
    assert response.json()["reliability_score"] == 3.5