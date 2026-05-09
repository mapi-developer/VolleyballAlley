from fastapi import Depends, HTTPException, status
from sqlmodel import Session

# Import our existing base dependencies
from app.db.database import get_session
from app.core.security import get_current_user
from app.db.models import User, UserRole

# ---------------------------------------------------------
# Role-Based Dependencies
# Use these in your routes to automatically block unauthorized users!
# ---------------------------------------------------------

def get_current_organizer(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that enforces the current user must be an Organizer (or Admin).
    Usage in route: (user: User = Depends(get_current_organizer))
    """
    if current_user.role not in [UserRole.ORGANIZER, UserRole.ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The current user does not have organizer privileges."
        )
    return current_user


def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency that enforces the current user must be an Admin.
    Usage in route: (user: User = Depends(get_current_admin))
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The current user does not have administrative privileges."
        )
    return current_user