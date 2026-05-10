import hashlib
import hmac
import json
from urllib.parse import parse_qs
from fastapi import Header, HTTPException, Depends, status
from sqlmodel import Session, select
from app.core.config import settings
from app.db.database import get_session
from app.db.models import User, UserRole

def validate_telegram_data(init_data: str) -> dict:
    try:
        # 1. Use keep_blank_values=True and handle the list unpacking manually
        parsed_data = parse_qs(init_data)
        if 'hash' not in parsed_data:
            raise HTTPException(status_code=401, detail="Hash missing")
            
        auth_hash = parsed_data.pop('hash')[0]
        
        # 2. Build the string using the first element of each list (the actual raw string)
        # Telegram expects: key1=value1\nkey2=value2
        items = sorted([f"{k}={v[0]}" for k, v in parsed_data.items()])
        data_check_string = "\n".join(items)
        
        secret_key = hmac.new(b"WebAppData", settings.BOT_TOKEN.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash != auth_hash:
            print(f"DEBUG: Hash mismatch. Calc: {calculated_hash} != Recv: {auth_hash}")
            raise HTTPException(status_code=401, detail="Invalid signature")
            
        return {k: v[0] for k, v in parsed_data.items()}
    except Exception as e:
        print(f"DEBUG: Auth Error: {str(e)}") # SEE THE REAL ERROR HERE
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(e)}")

def get_current_user(
    x_telegram_init_data: str = Header(...), 
    session: Session = Depends(get_session)
) -> User:
    """Dependency that validates user and auto-registers them if missing."""
    data = validate_telegram_data(x_telegram_init_data)
    user_data = json.loads(data.get('user', '{}'))
    tg_id = user_data.get('id')
    
    if not tg_id:
        raise HTTPException(status_code=400, detail="User ID missing in data")

    user = session.get(User, tg_id)
    
    if not user:
        user = User(
            id=tg_id,
            username=user_data.get('username'),
            first_name=user_data.get('first_name', 'Guest'),
            last_name=user_data.get('last_name'),
            photo_url=user_data.get('photo_url'),
            role=UserRole.MEMBER
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
    return user