from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.db.models import BehaviorLog, User
from app.api.deps import get_current_admin, get_session
from app.services.scoring import recalculate_user_reliability

router = APIRouter()

@router.post("/", response_model=BehaviorLog)
async def create_report(
    report: BehaviorLog, 
    admin: User = Depends(get_current_admin),
    session: Session = Depends(get_session)
):
    """Admins fine a user, triggering an immediate score recalculation[cite: 82, 225]."""
    report.admin_id = admin.id
    session.add(report)
    session.commit()
    
    # Recalculate score instantly for the penalized user
    await recalculate_user_reliability(report.user_id, session)
    return report