import os
import httpx
from sqlmodel import Session
from app.db.models import User

BOT_TOKEN = os.getenv("BOT_TOKEN")
TELEGRAM_API_URL = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"

async def dispatch_telegram_notification(
    user_id: int, 
    message: str, 
    notif_type: str, 
    session: Session
):
    """
    Checks user preferences and sends a Telegram DM if allowed.
    notif_type must be: 'WAITLIST', 'NEW_EVENT', 'REMINDER', or 'ADMIN'
    """
    if not BOT_TOKEN:
        print("Warning: BOT_TOKEN not set. Cannot send notification.")
        return False

    # 1. Fetch user to check their specific preferences
    user = session.get(User, user_id)
    if not user:
        return False

    # 2. Gatekeeper: Block notification if user opted out
    if notif_type == "WAITLIST" and not user.notif_waitlist:
        return False
    elif notif_type == "NEW_EVENT" and not user.notif_new_events:
        return False
    elif notif_type == "REMINDER" and not user.notif_reminders:
        return False
    elif notif_type == "ADMIN" and not user.notif_admin:
        return False

    # 3. Fire the message out via Telegram API
    # Note: In Telegram, the user's Telegram ID is also their private chat_id
    payload = {
        "chat_id": user.id,
        "text": message,
        "parse_mode": "HTML" # Change this from Markdown to HTML
    }
    
    async with httpx.AsyncClient() as client:
        try:
            print(f"📡 Sending notification to {user_id}...")
            response = await client.post(TELEGRAM_API_URL, json=payload)
            
            if response.status_code != 200:
                print(f"❌ Telegram API Error for user {user_id}: {response.text}")
                return False
            
            print(f"✅ Notification sent to {user_id}")
            return True
        except Exception as e:
            print(f"🔥 Error: {e}")
            return False
        
