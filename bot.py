import random
import json
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton

TOKEN = "8357449113:AAHF_heoj3besQ4YhGeuysHHNDeZjRFVHYc"
WEBAPP_URL = "https://Kakao200.github.io/miniapp/"

bot = Bot(token=TOKEN)
dp = Dispatcher()

# Словарь для кодов: code -> {"username": str, "id": int}
codes = {}

# =================== /start ===================
@dp.message(Command("start"))
async def cmd_start(msg: types.Message):
    code = str(random.randint(10000, 99999))
    user_info = msg.from_user.username or str(msg.from_user.id)
    codes[code] = user_info

    kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="Открыть App", web_app=WebAppInfo(url=WEBAPP_URL))]
        ],
        resize_keyboard=True
    )

    await msg.answer(
        f"Привет! Вот твой код входа:\n**{code}**",
        parse_mode="Markdown",
        reply_markup=kb
    )

# =================== Получение кода из WebApp ===================
@dp.message()
async def handle_webapp(msg: types.Message):
    if msg.web_app_data:
        code = msg.web_app_data.data.strip()
        if code in codes:
            user_info = codes[code]
            await msg.answer(f"Вход успешен!\nПрофиль: {user_info}")
        else:
            await msg.answer("Неверный код!")

# =================== Запуск ===================
async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Выход...")