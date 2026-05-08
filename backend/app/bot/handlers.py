from aiogram import Router, types
from aiogram.filters import Command
from aiogram.types.web_app_info import WebAppInfo
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

router = Router()

# TODO: Paste your actual ngrok URL here!
WEB_APP_URL = "https://smelting-helpline-botanist.ngrok-free.dev"

@router.message(Command("events"))
async def cmd_events(message: types.Message):
    # We define the button explicitly as an InlineKeyboardButton
    # This is the ONLY way to open a Mini App from a Group Chat
    markup = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🏐 Open Sports App", 
                    web_app=WebAppInfo(url=WEB_APP_URL)
                )
            ]
        ]
    )
    
    try:
        await message.answer(
            "Ready to play? Click below to manage events!",
            reply_markup=markup
        )
    except Exception as e:
        print(f"Failed to send message: {e}")