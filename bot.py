import random
import asyncio
from aiogram import Bot, Dispatcher, types
from aiogram.filters import Command
from aiogram.types import WebAppInfo, ReplyKeyboardMarkup, KeyboardButton

TOKEN = "8357449113:AAHF_heoj3besQ4YhGeuysHHNDeZjRFVHYc"
WEBAPP_URL = "https://Kakao200.github.io/miniapp/?v=20251201_5"

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(msg: types.Message):
    # Генерация уникального кода для пользователя
    user_id = msg.from_user.id
    code = str(user_id)[-5:].zfill(5)
    
    # Создание клавиатуры с WebApp кнопкой
    kb = ReplyKeyboardMarkup(
        keyboard=[
            [KeyboardButton(text="🚀 Открыть Galaxy Casino", web_app=WebAppInfo(url=WEBAPP_URL))]
        ],
        resize_keyboard=True,
        input_field_placeholder="Нажмите кнопку ниже, чтобы начать!"
    )

    # Отправка приветственного сообщения
    welcome_text = f"""
🌟 *Добро пожаловать в Galaxy Casino!* 🌟

Ваш персональный код доступа:
`{code}`

🎮 *Что вас ждет:*
• 🚀 Космическая ракета (x1 - x100)
• 📦 15+ видов уникальных кейсов
• 🎰 Мини-игры и турниры
• ⭐ Система уровней и достижений
• 💎 NFT коллекции
• 🏆 Ежедневные награды

💫 *Особенности:*
- Режим премиум с бонусами
- Авто-кэшаут в ракете
- Детальная статистика
- Космический дизайн

Нажмите кнопку ниже, чтобы начать космическое приключение! 🪐
    """
    
    await msg.answer_photo(
        photo="https://img.icons8.com/color/480/000000/rocket.png",
        caption=welcome_text,
        parse_mode="Markdown",
        reply_markup=kb
    )

@dp.message(Command("help"))
async def cmd_help(msg: types.Message):
    help_text = """
🆘 *Помощь по Galaxy Casino*

📝 *Основные команды:*
/start - Начать работу с ботом
/help - Показать это сообщение
/profile - Показать ваш профиль
/top - Топ игроков

🎮 *Как играть:*
1. Нажмите кнопку "Открыть Galaxy Casino"
2. Введите код доступа (5 цифр)
3. Выберите игру из меню
4. Следуйте инструкциям в приложении

💰 *Пополнение баланса:*
• В приложении нажмите на баланс
• Выберите пакет для пополнения
• Следуйте инструкциям оплаты

⚠️ *Важно:*
- Минимальная ставка: 5 ⭐
- Максимальная ставка: 10,000 ⭐
- Бесплатные кейсы обновляются ежедневно
- Сохраняйте код доступа!

📞 *Поддержка:*
@KakaoCasiBot_support
    """
    
    await msg.answer(help_text, parse_mode="Markdown")

@dp.message(Command("profile"))
async def cmd_profile(msg: types.Message):
    user = msg.from_user
    profile_text = f"""
👤 *Ваш профиль*

🆔 ID: `{user.id}`
👤 Имя: {user.first_name or "Не указано"}
📛 Фамилия: {user.last_name or "Не указано"}
📧 Юзернейм: @{user.username or "Не указано"}
🌐 Язык: {user.language_code or "Не указано"}

📊 *Статистика Galaxy Casino:*
⭐ Баланс: Обновляется в приложении
📈 Уровень: Зависит от активности
🏆 Победы: Отслеживайте в приложении

🎮 *Откройте приложение для полной статистики!*
    """
    
    await msg.answer(profile_text, parse_mode="Markdown")

@dp.message()
async def handle_other_messages(msg: types.Message):
    # Игнорируем служебные сообщения
    if msg.web_app_data:
        return
    
    # Ответ на другие сообщения
    await msg.answer(
        "🎮 Для игры используйте кнопку в меню или команду /start\n"
        "📋 Список команд: /help",
        reply_markup=ReplyKeyboardMarkup(
            keyboard=[
                [KeyboardButton(text="🚀 Открыть Galaxy Casino", web_app=WebAppInfo(url=WEBAPP_URL))]
            ],
            resize_keyboard=True
        )
    )

async def main():
    print("🚀 Galaxy Casino Bot запущен!")
    print(f"🌐 WebApp URL: {WEBAPP_URL}")
    print("📞 Бот готов к работе...")
    
    await dp.start_polling(bot)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Бот завершает работу...")