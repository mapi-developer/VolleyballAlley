import hmac
import hashlib
from urllib.parse import parse_qsl
from app.core.config import settings

def validate_telegram_data(init_data: str) -> dict | None:
    """
    Validates the initData string received from the Telegram Mini App.
    Returns the parsed dictionary if valid, None if forged or invalid.
    """
    try:
        # Parse the query string into a dictionary
        parsed_data = dict(parse_qsl(init_data))
        
        # The hash is what we need to verify against
        if 'hash' not in parsed_data:
            return None
            
        received_hash = parsed_data.pop('hash')
        
        # Sort the remaining pairs alphabetically and join with newlines
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        # Calculate the secret key (HMAC-SHA256 of bot token with key "WebAppData")
        secret_key = hmac.new(
            b"WebAppData", 
            settings.bot_token.encode(), 
            hashlib.sha256
        ).digest()
        
        # Calculate the final hash
        calculated_hash = hmac.new(
            secret_key, 
            data_check_string.encode(), 
            hashlib.sha256
        ).hexdigest()
        
        if calculated_hash == received_hash:
            return parsed_data
        return None
        
    except Exception as e:
        print(f"Validation error: {e}")
        return None