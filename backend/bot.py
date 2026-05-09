import telebot
from telebot.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
import os
from dotenv import load_dotenv

# Load variables from your .env file
load_dotenv()

BOT_TOKEN = os.getenv("BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL") # This should be your ngrok/localtunnel HTTPS url pointing to localhost:3000

if not BOT_TOKEN or not WEB_APP_URL:
    raise ValueError("Missing BOT_TOKEN or WEB_APP_URL in .env file")

bot = telebot.TeleBot(BOT_TOKEN)

@bot.message_handler(commands=['start'])
def send_welcome(message):
    """
    Sends a welcome message with a prominent 'Play' button to launch the Mini App.
    """
    # Create an Inline Keyboard with the WebApp button
    markup = InlineKeyboardMarkup()
    web_app = WebAppInfo(url=WEB_APP_URL)
    markup.add(InlineKeyboardButton(text="🏐 Open VolleyballAlley", web_app=web_app))
    
    # We can also add a persistent menu button at the bottom of the chat
    menu_markup = ReplyKeyboardMarkup(resize_keyboard=True)
    menu_markup.add(KeyboardButton(text="🏐 Open App", web_app=web_app))
    
    bot.send_message(
        message.chat.id, 
        "Welcome to *VolleyballAlley*! 🏐\n\nFind local matches, track your stats, and play with verified players.\n\nClick below to enter the app:",
        parse_mode="Markdown",
        reply_markup=markup
    )
    
    # Send a hidden message just to set the persistent keyboard
    bot.send_message(message.chat.id, "Menu updated 👇", reply_markup=menu_markup)

print("🏐 Telegram Bot is running! Waiting for /start commands...")
bot.infinity_polling()