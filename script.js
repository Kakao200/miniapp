let username = "";
let tg = window.Telegram.WebApp;
let currentView = 'login'; // 'login', 'home', 'case', 'profile'

const PRIZES = [
    { emoji: "🍎", prob: 0.5, name: "Яблоко" },
    { emoji: "🍌", prob: 0.3, name: "Банан" },
    { emoji: "🍒", prob: 0.2, name: "Вишня" }
];
const PRIZE_ITEM_WIDTH = 80; // Ширина одного элемента в пикселях (из CSS: 40px + 2*20px padding)
const SCROLL_DURATION = 5000; // 5 секунд анимация

// --- Инициализация ---
window.addEventListener("load", () => {
    tg.ready();
    // Настройка основного контейнера для лучшего вида в WebApp
    tg.expand();
    tg.setHeaderColor("secondary_bg_color");
    tg.setBackgroundColor("bg_color");

    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        username = savedUsername;
        showView('home');
        updateHeaderAndProfile();
    } else {
        showView('login');
    }
});

// --- Навигация ---
function showView(viewName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));

    // Показываем главный контейнер приложения или только экран входа
    if (viewName !== 'login') {
        document.getElementById('main-app').classList.remove('hidden');
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }

    // Управление внутренними разделами
    const views = document.querySelectorAll('.content-view');
    views.forEach(v => v.classList.add('hidden'));

    let targetElement;
    if (viewName === 'login') {
        targetElement = document.getElementById('login-screen');
    } else if (viewName === 'home') {
        targetElement = document.getElementById('home-screen');
    } else if (viewName === 'case') {
        targetElement = document.getElementById('case-screen');
        resetCaseScreen();
    } else if (viewName === 'profile') {
        targetElement = document.getElementById('profile-screen');
    }

    if (targetElement) {
        targetElement.classList.remove('hidden');
        currentView = viewName;
    }
}

function navigateTo(viewName) {
    showView(viewName);
    if (viewName === 'profile') {
        updateHeaderAndProfile(); // Обновляем данные на странице профиля
    }
}

// --- Обновление данных пользователя ---
function updateHeaderAndProfile() {
    // Получение ID для профиля (если доступно)
    const userId = tg.initDataUnsafe.user?.id || 'N/A';
    
    // Обновление заголовка
    document.getElementById("header-username").textContent = username;

    // Обновление профиля
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-id").textContent = userId;
}


// --- Логика Входа ---
function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";
    
    // Проверка кода: 5 цифр
    if (code.length === 5 && /^\d+$/.test(code)) {
        // !!! В РЕАЛЬНОМ ПРИЛОЖЕНИИ ТУТ ДОЛЖНА БЫТЬ ОТПРАВКА КОДА НА БЕКЕНД
        // Для этого демо, мы просто проверяем формат и логинимся

        // Определение имени пользователя
        username = tg.initDataUnsafe.user?.username || 
                   tg.initDataUnsafe.user?.first_name || 
                   "User#" + (tg.initDataUnsafe.user?.id || 'GUEST');
        
        localStorage.setItem("username", username);
        updateHeaderAndProfile();
        navigateTo('home');
    } else {
        msgElem.textContent = "❌ Неверный или неполный код! Введите 5 цифр.";
    }
}

// --- Логика Выхода ---
function logout() {
    localStorage.removeItem("username");
    username = "";
    showView('login');
    document.getElementById("code-input").value = "";
    tg.close(); // Опционально: закрыть WebApp при выходе
}

// --- Логика Кейса ---

// Сброс и подготовка экрана кейса
function resetCaseScreen() {
    document.getElementById("case-result-box").classList.add('hidden');
    document.getElementById("open-case-btn").disabled = false;
    document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ (0 руб)";

    // Инициализация ленты призов
    const reel = document.getElementById("prize-scroll-reel");
    reel.innerHTML = '';
    reel.style.transform = 'translateX(0)';
    reel.style.transition = 'none';

    // Заполнение ленты: 200+ элементов для длинной прокрутки
    for (let i = 0; i < 200; i++) {
        const item = document.createElement('div');
        // Случайный приз, но чаще всего 'Apple' в начале ленты
        let prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
        item.classList.add('prize-item');
        item.textContent = prize.emoji;
        reel.appendChild(item);
    }
}

// Выбор приза на основе вероятности
function spinPrize() {
    let rnd = Math.random();
    let total = 0;

    for (const prize of PRIZES) {
        total += prize.prob;
        if (rnd <= total) {
            return prize;
        }
    }
    // Fallback в случае ошибки
    return PRIZES[0];
}

// Открытие кейса с анимацией
function openCase() {
    document.getElementById("open-case-btn").disabled = true;
    document.getElementById("open-case-btn").textContent = "Крутим...";
    document.getElementById("case-result-box").classList.add('hidden');
    
    const reel = document.getElementById("prize-scroll-reel");
    const winningPrize = spinPrize();
    
    // 1. Сначала сбрасываем ленту (чтобы анимация начиналась с 0)
    resetCaseScreen();
    
    // 2. Вставляем выигрышный приз в позицию, где остановится прокрутка (например, 198-й элемент)
    const stopIndex = 198; 
    reel.children[stopIndex].textContent = winningPrize.emoji;

    // 3. Вычисляем смещение для остановки
    // Общее смещение = (stopIndex * PRIZE_ITEM_WIDTH) - (Reel_Width / 2) + (Prize_Item_Width / 2)
    // - (Reel_Width / 2) + (Prize_Item_Width / 2) - это для центрирования 
    
    // Смещение до центра выигрышного элемента
    const offsetToCenter = (reel.offsetWidth / 2) - (PRIZE_ITEM_WIDTH / 2);
    // Общий сдвиг, чтобы остановить элемент stopIndex под индикатором
    const totalShift = (stopIndex * PRIZE_ITEM_WIDTH) - offsetToCenter;
    
    // Добавляем немного случайности (до 40 пикселей) для реализма
    const randomOffset = Math.floor(Math.random() * 40) - 20; 
    const finalShift = totalShift + randomOffset;

    // Устанавливаем анимацию
    reel.style.transition = `transform ${SCROLL_DURATION / 1000}s cubic-bezier(0.1, 0.9, 0.2, 1)`;
    reel.style.transform = `translateX(-${finalShift}px)`;

    // 4. После анимации показываем результат
    setTimeout(() => {
        document.getElementById("result-emoji").textContent = winningPrize.emoji;
        document.getElementById("result-msg").textContent = `Поздравляем! Вы выиграли: ${winningPrize.name}!`;
        document.getElementById("case-result-box").classList.remove('hidden');
        document.getElementById("open-case-btn").disabled = false;
        document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ СНОВА (0 руб)";
        
        // Вибрация (для мобильных устройств, если разрешено Telegram)
        tg.HapticFeedback.notificationOccurred('success');

    }, SCROLL_DURATION);
}
