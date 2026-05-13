from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from app.db.database import engine # Assuming engine is defined here
from app.db.models import Event, RSVP, RSVPStatus, User
from app.services.notifications import dispatch_telegram_notification

# Initialize the scheduler
scheduler = AsyncIOScheduler()

async def send_2_hour_reminders():
    """Finds matches starting in ~2 hours and alerts confirmed players."""
    now = datetime.now(timezone.utc)
    # We look for games starting between 1h50m and 2h00m from now 
    # (assuming this job runs every 10 minutes)
    lower_bound = now + timedelta(hours=1, minutes=50)
    upper_bound = now + timedelta(hours=2)

    with Session(engine) as session:
        # Find events matching the time window
        statement = select(Event).where(
            Event.start_time >= lower_bound,
            Event.start_time <= upper_bound
        )
        upcoming_events = session.exec(statement).all()

        for event in upcoming_events:
            # Get confirmed players
            rsvps = session.exec(
                select(RSVP).where(
                    RSVP.event_id == event.id, 
                    RSVP.status == RSVPStatus.CONFIRMED
                )
            ).all()

            for rsvp in rsvps:
                msg = (
                    f"⏰ *Match Reminder!*\n\n"
                    f"Your game at *{event.location_name}* starts in 2 hours.\n"
                    f"Please remember the 2-hour cancellation lock is now active. "
                    f"If you no-show, your reliability score will drop."
                )
                await dispatch_telegram_notification(
                    user_id=rsvp.user_id,
                    message=msg,
                    notif_type="REMINDER",
                    session=session
                )

# Schedule the job to run every 10 minutes
scheduler.add_job(send_2_hour_reminders, 'interval', minutes=10)