import requests
import time
from datetime import datetime, timedelta, timezone

# CONFIG
API_BASE_URL = "https://smelting-helpline-botanist.ngrok-free.dev/api"
REAL_USER_ID = "1323726603"  # YOU
SIM_USER_1 = "888001"        # Simulated Organizer
SIM_USER_2 = "888002"        # Simulated Player
HEADERS_BASE = {"Content-Type": "application/json", "ngrok-skip-browser-warning": "true"}

def get_headers(user_id):
    return {**HEADERS_BASE, "x-test-user-id": str(user_id)}

def to_utc_iso(dt):
    return dt.strftime("%Y-%m-%dT%H:%M:%SZ")

def run_complex_test():
    print("🔥 Starting Full Spectrum Notification Test...")
    start_time = datetime.now(timezone.utc) + timedelta(hours=30)

    # --- PHASE 1: NEW EVENT BROADCAST ---
    print("\n1️⃣  Simulating User 888001 creating an event...")
    event_payload = {
        "title": "🏆 Champions League Final",
        "description": "Massive game. Everyone invited.",
        "type": "Indoor",
        "start_time": to_utc_iso(start_time),
        "end_time": to_utc_iso(start_time + timedelta(hours=2)),
        "location_name": "Arena Budapest",
        "price": 2000,
        "max_players": 2, # Set small for waitlist test later
        "level_required": "Advanced"
    }
    
    res = requests.post(f"{API_BASE_URL}/events/", json=event_payload, headers=get_headers(SIM_USER_1))
    event_id = res.json()['id']
    print(f"✅ Event Created. [EXPECTATION]: You should receive a 'New Match Posted' DM now.")
    time.sleep(15)

    # --- PHASE 2: JOIN & UPDATE ---
    print(f"\n2️⃣  Joining the event as YOU ({REAL_USER_ID})...")
    requests.post(f"{API_BASE_URL}/rsvps/{event_id}", headers=get_headers(REAL_USER_ID))
    
    print("🔄 Simulating Host (888001) changing the location/time...")
    update_payload = {
        "location_name": "📍 NEW VENUE: BOK Csarnok",
        "start_time": to_utc_iso(start_time + timedelta(hours=1))
    }
    requests.patch(f"{API_BASE_URL}/events/{event_id}", json=update_payload, headers=get_headers(SIM_USER_1))
    print(f"✅ Update sent. [EXPECTATION]: You should receive a 'Match Details Updated' DM now.")
    time.sleep(15)

    # --- PHASE 3: WAITLIST PROMOTION ---
    print("\n3️⃣  Testing Waitlist Promotion...")
    # Current state: 1. Host(SIM1) 2. You(REAL). Total 2/2.
    print(f"👤 Simulated User 888002 joining to get on the Waitlist...")
    requests.post(f"{API_BASE_URL}/rsvps/{event_id}", headers=get_headers(SIM_USER_2))
    
    # Increase max players so waitlist exists
    print("📉 Host increases capacity to 3, but then YOU leave...")
    requests.patch(f"{API_BASE_URL}/events/{event_id}", json={"max_players": 3}, headers=get_headers(SIM_USER_1))
    
    # You leave, User 888002 should be promoted? 
    # Actually, let's test YOU getting promoted.
    
    # New Event: Max 1 player + Host.
    wait_event_payload = {
        "title": "Waitlist Test Match",
        "description": "Max 1 player.",
        "start_time": to_utc_iso(start_time + timedelta(days=1)),
        "end_time": to_utc_iso(start_time + timedelta(days=1, hours=1)),
        "location_name": "Small Court",
        "price": 0,
        "max_players": 1, 
        "level_required": "All"
    }
    res_w = requests.post(f"{API_BASE_URL}/events/", json=wait_event_payload, headers=get_headers(SIM_USER_1))
    wait_id = res_w.json()['id']
    
    print("👤 SIM_USER_2 joins first (Takes the only spot)...")
    requests.post(f"{API_BASE_URL}/rsvps/{wait_id}", headers=get_headers(SIM_USER_2))
    
    print(f"👤 YOU ({REAL_USER_ID}) join (You should be waitlisted)...")
    requests.post(f"{API_BASE_URL}/rsvps/{wait_id}", headers=get_headers(REAL_USER_ID))
    
    print("👋 SIM_USER_2 leaves the match...")
    requests.delete(f"{API_BASE_URL}/rsvps/{wait_id}", headers=get_headers(SIM_USER_2))
    
    print(f"✅ [EXPECTATION]: You should receive a 'You have been promoted to the main list' DM now.")

    print("\n🏁 Complex test complete. Check your Telegram!")

if __name__ == "__main__":
    run_complex_test()