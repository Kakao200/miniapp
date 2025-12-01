import random
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton

TOKEN = "8357449113:AAHF_heoj3besQ4YhGeuysHHNDeZjRFVHYc"
WEBAPP_URL = "https://Kakao200.github.io/miniapp/"

bot = Bot(token=TOKEN)
dp = Dispatcher()

# =================== /start ===================
@dp.message(Command("start"))
async def cmd_start(msg: types.Message):
    code = str(random.randint(10000, 99999))
    
    kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Открыть App", web_app=WebAppInfo(url=WEBAPP_URL))]
        ],
        resize_keyboard=True
    )

    await msg.answer(
        f"Привет! Вот твой код входа:\n**{code}**\n\n"
        f"Используй его в веб-приложении",
        parse_mode="Markdown",
        reply_markup=kb
    )

# =================== Запуск ===================
async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Выход...")