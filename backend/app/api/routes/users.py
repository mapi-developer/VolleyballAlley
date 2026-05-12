from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.db.database import get_session
from app.db.models import User, Event, RSVP, UserRole, UserPreferencesUpdate
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
    """Calculates stats. Keys now exactly match frontend ProfilePage expectations."""
    games_played = session.exec(
        select(RSVP).where(RSVP.user_id == current_user.id, RSVP.attended == True)
    ).all()
    
    return {
        "games_count": len(games_played),
        "reliability_score": current_user.reliability_score, 
        "verified_level": current_user.verified_level 
    }

@router.patch("/me/role")
async def update_my_role(
    new_role: UserRole, 
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Allows development role switching."""
    current_user.role = new_role
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return {"detail": "Role updated", "role": current_user.role}

# --- NEW: Update Preferences Endpoint ---
@router.patch("/me/preferences")
async def update_my_preferences(
    prefs: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Updates user notification toggles and Revolut tag."""
    
    if prefs.revolut_tag is not None:
        current_user.revolut_tag = prefs.revolut_tag
    if prefs.notif_new_events is not None:
        current_user.notif_new_events = prefs.notif_new_events
    if prefs.notif_waitlist is not None:
        current_user.notif_waitlist = prefs.notif_waitlist
    if prefs.notif_reminders is not None:
        current_user.notif_reminders = prefs.notif_reminders
    if prefs.notif_admin is not None:
        current_user.notif_admin = prefs.notif_admin

    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    
    return {"detail": "Preferences updated successfully", "user": current_user}

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