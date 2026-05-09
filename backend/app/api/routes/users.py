from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.database import get_session
from app.db.models import User, Event, RSVP, UserRole
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()

@router.get("/me", response_model=User)
async def get_my_profile(current_user: User = Depends(get_current_user)):
    """Returns the authenticated user's profile."""
    return current_user

@router.get("/me/stats")
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Calculates real-time stats for the user journey."""
    games_played = session.exec(
        select(RSVP).where(RSVP.user_id == current_user.id, RSVP.attended == True)
    ).all()
    
    return {
        "games_count": len(games_played),
        "reliability": current_user.reliability_score,
        "level": current_user.verified_level
    }

@router.patch("/me", response_model=User)
async def update_profile(
    user_data: dict, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Allows users to update their own data like username or photo."""
    for key, value in user_data.items():
        setattr(current_user, key, value)
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user

@router.patch("/{user_id}/role")
async def update_user_role(
    user_id: int, 
    new_role: UserRole, 
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    target_user = session.get(User, user_id)
    if not target_user: raise HTTPException(status_code=404)
    target_user.role = new_role
    session.add(target_user)
    session.commit()
    return {"detail": "Role updated"}