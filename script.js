let username = "";
let tg = window.Telegram.WebApp;
let selectedGiftCost = 25; // Стоимость "покупки" подарка

// --- МАССИВ ПРИЗОВ (6 подарков с шансами) ---
// Шансы: 5% + 10% + 15% + 20% + 25% + 25% = 100%
const PRIZES = [
    // Внимание: Paths к картинкам должны быть актуальны для вашей папки assets!
    { emoji: "🐻", prob: 0.05, name: "Мишка", image: "assets/teddy_bear.png", stars: 100 },
    { emoji: "🎁", prob: 0.10, name: "Подарок", image: "assets/giftbox_red.png", stars: 75 },
    { emoji: "❤️", prob: 0.15, name: "Сердце", image: "assets/heart_gift.png", stars: 50 },
    { emoji: "🌹", prob: 0.20, name: "Роза", image: "assets/rose.png", stars: 25 },
    { emoji: "🌼", prob: 0.25, name: "Цветок", image: "assets/cvetok.png", stars: 15 },
    { emoji: "🍭", prob: 0.25, name: "Леденец", image: "assets/cup.png", stars: 10 } // Использую cup.png как заглушку для Леденца
];


// --- УПРАВЛЕНИЕ ЭКРАНАМИ (Адаптировано под новый HTML) ---
function showScreen(screenId) {
    // Все экраны должны иметь класс 'app-screen'
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    
    // Показываем нужный экран
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
    }
}

// --- ИНИЦИАЛИЗАЦИЯ ---
window.addEventListener("load", () => {
    tg.ready();
    tg.expand();
    
    // Настраиваем цвета Telegram WebApp
    tg.setHeaderColor("#f0f2f5"); 
    tg.setBackgroundColor("#f0f2f5"); 

    const savedUsername = localStorage.getItem("username");
    
    // Проверка аутентификации
    if (!savedUsername) {
        showScreen('login-screen');
    } else {
        username = savedUsername;
        initializeMainScreen();
        showScreen('main-app-screen');
    }
    
    setupEventListeners();
    updateStarBalanceDisplay();
    renderPossibleWinsSection();
});

// --- ВХОД (по коду) ---
function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";

    // Проверяем, что код - 5 цифр
    if (code.length === 5 && /^\d+$/.test(code)) {
        username = tg.initDataUnsafe.user?.username || 
                   tg.initDataUnsafe.user?.first_name || 
                   "User#" + (tg.initDataUnsafe.user?.id || 'GUEST');
        
        localStorage.setItem("username", username);
        initializeMainScreen();
        showScreen('main-app-screen');
        tg.HapticFeedback.notificationOccurred('success');
    } else {
        msgElem.textContent = "❌ Неверный или неполный код!";
        tg.HapticFeedback.notificationOccurred('error');
    }
}

// --- НАСТРОЙКА ГЛАВНОГО ЭКРАНА ---
function initializeMainScreen() {
    // Устанавливаем выбор подарка по умолчанию
    document.querySelectorAll('.gift-card').forEach(c => c.classList.remove('selected'));
    const defaultCard = document.querySelector('.gift-card[data-cost="25"]');
    if (defaultCard) {
        defaultCard.classList.add('selected');
        selectedGiftCost = 25;
    }
}

// --- ОБНОВЛЕНИЕ СТОИМОСТИ ---
function updateStarBalanceDisplay() {
    // Обновляем стоимость на кнопке "Получить подарок"
    document.getElementById('gift-cost-display').textContent = selectedGiftCost;
}

// --- ЛОГИКА КЕЙСА (Моментальное открытие) ---
function spinPrize() {
    // Определяем выигрышный приз по шансам
    let rnd = Math.random();
    let total = 0;
    for (const prize of PRIZES) {
        total += prize.prob;
        if (rnd <= total) return prize;
    }
    return PRIZES[0]; 
}

function openGift() {
    document.getElementById('get-gift-btn').disabled = true;
    
    const winningPrize = spinPrize();
    
    // Имитация задержки перед показом результата (для ощущения открытия)
    setTimeout(() => {
        showResultScreen(winningPrize);
        document.getElementById('get-gift-btn').disabled = false;
    }, 1000); // 1 секунда задержки
    
    tg.HapticFeedback.impactOccurred('medium');
}

function showResultScreen(prize) {
    const resultBox = document.getElementById("result-screen");
    const resultTitle = resultBox.querySelector('h2');
    
    // Обновляем текст и стоимость приза
    resultTitle.innerHTML = `🎉 Вы выиграли: <span class="prize-text">${prize.emoji} ${prize.name}</span>!`;
    resultBox.querySelector('.prize-cost-display').innerHTML = `Стоимость: ${prize.stars} <img src="assets/star.png" alt="Star" class="star-icon-small">`;

    showScreen('result-screen');
    tg.HapticFeedback.notificationOccurred('success');
}

function backToMain() {
    showScreen('main-app-screen');
}

// --- РЕНДЕРИНГ ШАНСОВ В UI ---
function renderPossibleWinsSection() {
    const winGrid = document.querySelector('#possible-wins-section .possible-wins-grid');
    if (!winGrid) return;
    
    winGrid.innerHTML = '';
    
    // Сортируем призы по вероятности и берем топ-3 для отображения
    const topPrizes = PRIZES.sort((a, b) => b.prob - a.prob).slice(0, 3);

    topPrizes.forEach(gift => {
        const item = document.createElement('div');
        item.classList.add('win-item');

        item.innerHTML = `
            <img src="${gift.image}" alt="${gift.name}">
            <div class="win-chance">
                <img src="assets/star.png" alt="Star" class="star-icon">
                <span>${gift.stars}</span>
            </div>
            <span class="win-percentage">${Math.round(gift.prob * 100)}%</span>
        `;
        winGrid.appendChild(item);
    });
}

// --- НАСТРОЙКА СЛУШАТЕЛЕЙ СОБЫТИЙ ---
function setupEventListeners() {
    // 1. Вход по кнопке
    const loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
        loginBtn.addEventListener('click', login);
    }
    
    // 2. Вход по Enter
    const codeInput = document.getElementById('code-input');
    if (codeInput) {
        codeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') login();
        });
    }

    // 3. Кнопка "Получить подарок"
    document.getElementById('get-gift-btn').addEventListener('click', openGift);

    // 4. Выбор подарка Quick Gift
    document.querySelectorAll('.gift-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.gift-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            selectedGiftCost = parseInt(card.dataset.cost);
            updateStarBalanceDisplay();
            tg.HapticFeedback.impactOccurred('light'); 
        });
    });

    // 5. Кнопка "Закрыть" на экране результата
    const backBtn = document.getElementById('result-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', backToMain);
    }
    
    // 6. Закрытие приложения
    const closeIcon = document.querySelector('.close-icon');
    if (closeIcon) {
        closeIcon.addEventListener('click', () => {
            tg.close();
        });
    }
}
