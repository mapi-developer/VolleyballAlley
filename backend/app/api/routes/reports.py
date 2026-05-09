from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from app.db.database import get_session
from app.db.models import BehaviorLog, User
from app.api.deps import get_current_admin
from app.services.scoring import recalculate_user_reliability

router = APIRouter()

@router.post("/", response_model=BehaviorLog)
async def create_report(
    report_in: BehaviorLog, 
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Admins can issue penalty points to a user for bad behavior."""
    # Ensure the target user actually exists
    target_user = session.get(User, report_in.user_id)
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    report_in.admin_id = admin.id
    session.add(report_in)
    session.commit()
    
    # Recalculate the user's score immediately so the deduction is live
    await recalculate_user_reliability(report_in.user_id, session)
    
    session.refresh(report_in)
    return report_in