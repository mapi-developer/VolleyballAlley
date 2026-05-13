from uuid import UUID
from sqlmodel import Session, select, func
from app.db.models import RSVP, RSVPStatus, Event
from app.services.notifications import dispatch_telegram_notification

async def promote_next_on_waitlist(event_id: UUID, session: Session):
    """Finds waitlisted users and bumps them to Confirmed until capacity is reached."""
    event = session.get(Event, event_id)
    if not event:
        return

    # 1. Calculate how many confirmed players currently exist
    confirmed_count = session.exec(
        select(func.count(RSVP.user_id)).where(
            RSVP.event_id == event_id, 
            RSVP.status == RSVPStatus.CONFIRMED
        )
    ).one()

    # 2. Determine how many open slots we have
    available_slots = event.max_players - confirmed_count

    # 3. Promote the exact number of needed players in FIFO order (oldest joined_at first)
    if available_slots > 0:
        statement = (
            select(RSVP)
            .where(RSVP.event_id == event_id, RSVP.status == RSVPStatus.WAITLISTED)
            .order_by(RSVP.joined_at.asc())
            .limit(available_slots)
        )
        users_to_promote = session.exec(statement).all()
        
        for rsvp in users_to_promote:
            rsvp.status = RSVPStatus.CONFIRMED
            session.add(rsvp)
            
            # ---> NEW: Fire the Notification
            message = (
                f"🎉 *Good news!* A spot opened up.\n\n"
                f"You've been promoted from the waitlist to *CONFIRMED* for the match."
            )
            await dispatch_telegram_notification(
                user_id=rsvp.user_id,
                message=message,
                notif_type="WAITLIST",
                session=session
            )
            
        if users_to_promote:
            session.commit()
