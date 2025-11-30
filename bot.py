import random
import asyncio
from aiogram import Bot, Dispatcher, types, Router, F
from aiogram.types import WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from aiogram.enums import ParseMode
from fastapi import FastAPI
from fastapi.responses import JSONResponse
import uvicorn


# ------------------------------
# Настройки
# ------------------------------
TOKEN = "8357449113:AAHF_heoj3besQ4YhGeuysHHNDeZjRFVHYc"
WEBAPP_URL = "https://username.github.io/miniapp/"


# ------------------------------
# Telegram bot
# ------------------------------
bot = Bot(token=TOKEN)
dp = Dispatcher()
router = Router()

codes = {}  # временное хранение кодов


@router.message(F.text == "/start")
async def cmd_start(message: types.Message):
    code = str(random.randint(10000, 99999))
    codes[code] = message.from_user.username or message.from_user.first_name

    kb = ReplyKeyboardMarkup(
        resize_keyboard=True,
        keyboard=[
            [
                KeyboardButton(
                    text="Открыть App",
                    web_app=WebAppInfo(url=WEBAPP_URL)
                )
            ]
        ]
    )

    await message.answer(
        f"Привет! Вот твой код входа:\n**{code}**",
        parse_mode=ParseMode.MARKDOWN,
        reply_markup=kb
    )


dp.include_router(router)


# ------------------------------
# FastAPI
# ------------------------------
app = FastAPI()


@app.get("/login")
async def login(code: str):
    if code in codes:
        return {"ok": True, "username": codes[code]}
    return {"ok": False}


# ------------------------------
# Объединённый запуск
# ------------------------------
async def main():
    # Запускаем aiogram-поллинг в фоне
    asyncio.create_task(dp.start_polling(bot))

    # Запускаем API-сервер uvicorn
    config = uvicorn.Config(app, host="0.0.0.0", port=8000, loop="asyncio")
    server = uvicorn.Server(config)

    await server.serve()


if __name__ == "__main__":
    asyncio.run(main())