from app.db.models import Event, RSVP, RSVPStatus

def test_create_event_and_auto_rsvp(client):
    # 1. Define match data
    event_data = {
        "title": "Test Power Play",
        "description": "Weekly 6v6",
        "start_time": "2026-10-10T18:00:00",
        "end_time": "2026-10-10T20:00:00",
        "location_name": "Arena 1",
        "price": 2000,
        "max_players": 12
    }

    # 2. Call the Create Event endpoint
    response = client.post("/api/events/", json=event_data)
    assert response.status_code == 200
    data = response.json()
    event_id = data["id"]

    # 3. Check if the event exists
    assert data["title"] == "Test Power Play"
    assert data["host_id"] == 12345 # Matches our Mock User ID

    # 4. CRITICAL: Verify Auto-RSVP logic
    # We check if exactly 1 attendee (the host) is returned
    assert "attendees" in data
    assert len(data["attendees"]) == 1
    assert data["attendees"][0]["user_id"] == 12345
    assert data["attendees"][0]["status"] == RSVPStatus.CONFIRMED

def test_get_events_list(client):
    # Verify we can fetch the newly created matches
    response = client.get("/api/events/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)