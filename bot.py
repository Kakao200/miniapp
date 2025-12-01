import random
import asyncio
from aiogram import Bot, Dispatcher, types
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

TOKEN = "8357449113:AAHF_heoj3besQ4YhGeuysHHNDeZjRFVHYc"
WEBAPP_URL = "https://Kakao200.github.io/miniapp/"

bot = Bot(TOKEN)
dp = Dispatcher()

# Хранилище кодов
codes = {}

@dp.message(commands=["start"])
async def cmd_start(message: types.Message):
    code = str(random.randint(10000, 99999))
    codes[code] = message.from_user.username or message.from_user.first_name

    kb = types.ReplyKeyboardMarkup(keyboard=[
        [types.KeyboardButton(text="Открыть App", web_app=types.WebAppInfo(url=WEBAPP_URL))]
    ], resize_keyboard=True)

    await message.answer(f"Привет! Вот твой код входа:\n**{code}**",
                         parse_mode="Markdown",
                         reply_markup=kb)

# FastAPI сервер для проверки кода
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

def start_bot():
    asyncio.run(dp.start_polling(bot))

if __name__ == "__main__":
    import threading
    threading.Thread(target=start_bot).start()
    uvicorn.run(app, host="0.0.0.0", port=8080)