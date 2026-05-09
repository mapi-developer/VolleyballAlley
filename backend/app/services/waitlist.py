from uuid import UUID
from sqlmodel import Session, select
from typing import Optional

from app.db.models import RSVP

def promote_next_on_waitlist(event_id: UUID, session: Session) -> Optional[RSVP]:
    """
    Finds the user who has been on the waitlist the longest for a specific event
    and promotes them to 'confirmed'.
    
    Returns the promoted RSVP record, or None if the waitlist was empty.
    """
    # 1. Find the next person in line (earliest joined_at)
    statement = (
        select(RSVP)
        .where(RSVP.event_id == event_id, RSVP.status == "waitlisted")
        .order_by(RSVP.joined_at)
    )
    next_in_line = session.exec(statement).first()

    # 2. Promote them if someone exists
    if next_in_line:
        next_in_line.status = "confirmed"
        session.add(next_in_line)
        session.commit()
        session.refresh(next_in_line)
        
        # --- TELEGRAM NOTIFICATION HOOK ---
        # Here is where we will eventually call our Telegram bot to send a message:
        # bot.send_message(next_in_line.user_id, "You've been promoted off the waitlist!")
        print(f"✅ Waitlist Promotion: User {next_in_line.user_id} is now confirmed for event {event_id}!")
        
        return next_in_line
        
    return None