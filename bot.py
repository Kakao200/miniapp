import random
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

TOKEN = "8357449113:AAHF_heoj3besQ4YhGeuysHHNDeZjRFVHYc"
WEBAPP_URL = "https://Kakao200.github.io/miniapp/"

bot = Bot(TOKEN)
dp = Dispatcher()

# Хранилище кодов
codes = {}

# ================== Бот ==================
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    code = str(random.randint(10000, 99999))
    codes[code] = message.from_user.username or message.from_user.first_name

    kb = types.ReplyKeyboardMarkup(
        keyboard=[
            [types.KeyboardButton(text="Открыть App", web_app=types.WebAppInfo(url=WEBAPP_URL))]
        ],
        resize_keyboard=True
    )

    await message.answer(f"Привет! Вот твой код входа:\n**{code}**",
                         parse_mode="Markdown",
                         reply_markup=kb)

# ================== FastAPI для WebApp ==================
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/login")
def login(code: str):
    if code in codes:
        return {"ok": True, "username": codes[code]}
    return {"ok": False}

# ================== Главная функция ==================
async def main():
    # Запуск бота и FastAPI параллельно
    bot_task = asyncio.create_task(dp.start_polling(bot))
    # uvicorn.run не является корутиной, поэтому используем loop.run_in_executor
    loop = asyncio.get_event_loop()
    api_task = loop.run_in_executor(
        None, lambda: uvicorn.run(app, host="0.0.0.0", port=9090, log_level="info")
    )
    await asyncio.gather(bot_task, api_task)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Выход...")