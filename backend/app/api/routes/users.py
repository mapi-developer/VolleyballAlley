from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from app.db.database import get_session
from app.db.models import User, RSVP
from app.core.security import get_current_user

router = APIRouter()

@router.get("/me", response_model=User)
def get_my_profile(current_user: User = Depends(get_current_user)):
    """
    Returns the profile of the currently authenticated user based on their 
    Telegram initData. (If they are new, get_current_user auto-registers them!)
    """
    return current_user

@router.get("/me/stats")
def get_my_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """
    Returns basic stats for the 'Your Journey' tab.
    """
    # Count how many games the user has joined
    statement = select(RSVP).where(RSVP.user_id == current_user.id)
    all_rsvps = session.exec(statement).all()
    
    games_attended = sum(1 for rsvp in all_rsvps if rsvp.attended)
    
    return {
        "reliability_score": current_user.reliability_score,
        "verified_level": current_user.verified_level,
        "total_games_joined": len(all_rsvps),
        "games_attended": games_attended
    }