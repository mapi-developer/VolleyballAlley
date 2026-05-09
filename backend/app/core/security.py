import hashlib
import hmac
import json
from urllib.parse import parse_qsl
from fastapi import Header, HTTPException, status, Depends
from sqlmodel import Session
from typing import Dict, Any

from app.core.config import settings
from app.db.database import get_session
from app.db.models import User

def validate_telegram_data(init_data: str) -> Dict[str, Any]:
    """
    Validates the initData received from the Telegram Mini App.
    """
    try:
        # Parse the initData string into a dictionary
        parsed_data = dict(parse_qsl(init_data))
        
        # Extract the hash and remove it from the data to check
        received_hash = parsed_data.pop('hash')
        
        # Sort the remaining key-value pairs alphabetically by key
        data_check_string = '\n'.join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        # Create the secret key using the bot token
        secret_key = hmac.new(
            key=b"WebAppData", 
            msg=settings.BOT_TOKEN.encode('utf-8'), 
            digestmod=hashlib.sha256
        ).digest()
        
        # Calculate the expected hash
        calculated_hash = hmac.new(
            key=secret_key, 
            msg=data_check_string.encode('utf-8'), 
            digestmod=hashlib.sha256
        ).hexdigest()
        
        if calculated_hash != received_hash:
            raise ValueError("Hash mismatch")
            
        # Parse and return the user JSON string
        return json.loads(parsed_data.get('user', '{}'))
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Telegram authentication data",
        )

def get_current_user(
    x_telegram_init_data: str = Header(...),
    session: Session = Depends(get_session)
) -> User:
    """
    FastAPI dependency to get the current authenticated user.
    If the user doesn't exist in the database, it creates them.
    """
    tg_user_data = validate_telegram_data(x_telegram_init_data)
    
    tg_id = tg_user_data.get('id')
    if not tg_id:
        raise HTTPException(status_code=401, detail="User ID missing from Telegram data")
        
    # Check if user exists in the database
    user = session.get(User, tg_id)
    
    # Auto-register the user if they are opening the app for the first time
    if not user:
        user = User(
            id=tg_id,
            username=tg_user_data.get('username'),
            first_name=tg_user_data.get('first_name', 'Player'),
            last_name=tg_user_data.get('last_name'),
            photo_url=tg_user_data.get('photo_url')
        )
        session.add(user)
        session.commit()
        session.refresh(user)
        
    return user