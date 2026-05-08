from fastapi import Header, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
import json

from app.core.security import validate_telegram_data
from app.db.session import get_db
from app.models.domain import User, RoleEnum

async def get_current_user(
    x_telegram_init_data: str = Header(..., description="Telegram initData string"),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Validates the Telegram payload and returns the database User.
    Creates a new user in the database if it's their first time opening the app.
    """
    # 1. Validate the payload
    valid_data = validate_telegram_data(x_telegram_init_data)
    if not valid_data or 'user' not in valid_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing Telegram authentication data"
        )
    
    # 2. Parse the user JSON payload
    try:
        tg_user = json.loads(valid_data['user'])
        telegram_id = tg_user.get('id')
        username = tg_user.get('username')
        first_name = tg_user.get('first_name', '')
        last_name = tg_user.get('last_name', '')
        full_name = f"{first_name} {last_name}".strip()
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Malformed user data")

    # 3. Check if user exists in our database
    result = await db.execute(select(User).where(User.telegram_id == telegram_id))
    db_user = result.scalars().first()

    # 4. If new user, create them (Default role is MEMBER)
    if not db_user:
        db_user = User(
            telegram_id=telegram_id,
            username=username,
            full_name=full_name,
            role=RoleEnum.MEMBER
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)

    return db_user