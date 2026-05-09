from sqlmodel import Session, select, func
from app.db.models import User, RSVP, BehaviorLog

async def recalculate_user_reliability(user_id: int, session: Session):
    user = session.get(User, user_id)
    if not user: return

    # Get last 10 games
    statement = (
        select(RSVP)
        .where(RSVP.user_id == user_id)
        .order_by(RSVP.joined_at.desc())
        .limit(10)
    )
    recent_games = session.exec(statement).all()
    
    if not recent_games:
        base_score = 5.0
    else:
        # 5 points for attending, 0 for no-show [cite: 37, 38]
        total_attendance_points = sum(5.0 if g.attended else 0.0 for g in recent_games)
        base_score = total_attendance_points / len(recent_games)

    # Deduct admin fines [cite: 22, 155, 225]
    fines_statement = select(func.sum(BehaviorLog.penalty_points)).where(BehaviorLog.user_id == user_id)
    total_fines = session.exec(fines_statement).one() or 0.0
    
    user.reliability_score = max(0.0, base_score - total_fines)
    session.add(user)
    session.commit()