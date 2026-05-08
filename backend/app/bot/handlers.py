from aiogram import Router, types
from aiogram.filters import Command
from aiogram.types.web_app_info import WebAppInfo
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

router = Router()

# TODO: Paste your actual ngrok URL here!
WEB_APP_URL = "https://smelting-helpline-botanist.ngrok-free.dev"

@router.message(Command("events"))
async def cmd_events(message: types.Message):
    # Use InlineKeyboardMarkup to avoid BUTTON_TYPE_INVALID
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
    
    await message.answer(
        "Ready to play? Click below to manage events!",
        reply_markup=markup
    )