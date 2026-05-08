from aiogram import Router, types
from aiogram.filters import Command
from aiogram.types.web_app_info import WebAppInfo
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from app.core.config import settings # Import settings 

router = Router()

@router.message(Command("events"))
async def cmd_events(message: types.Message):
    markup = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🏐 Open Sports App", 
                    web_app=WebAppInfo(url=settings.web_app_url)
                )
            ]
        ]
    )
    
    await message.answer(
        "Ready to play? Click below to manage events!",
        reply_markup=markup
    )