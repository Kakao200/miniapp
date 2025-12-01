// ============================================
// GALAXY CASINO - Основной скрипт
// Версия: 2025.1.0
// ============================================

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let username = "";
let tg = window.Telegram.WebApp;
let currentView = 'login';
let userBalance = parseFloat(localStorage.getItem('galaxyBalance')) || 1000.00;
let userLevel = parseInt(localStorage.getItem('userLevel')) || 1;
let userXP = parseInt(localStorage.getItem('userXP')) || 0;
let levelXP = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000];

// СИСТЕМА КЕЙСОВ
const CASE_DATABASE = {
    // БЕСПЛАТНЫЕ КЕЙСЫ
    'daily': {
        name: 'Ежедневный подарок',
        price: 0,
        type: 'free',
        image: 'assets/cases/free1.png',
        description: 'Открывается раз в 24 часа',
        prizes: [
            { type: 'empty', name: 'Пусто', emoji: '🌌', value: 0, prob: 40 },
            { type: 'heart', name: 'Сердце', emoji: '❤️', value: 10, prob: 30 },
            { type: 'bear', name: 'Мишка', emoji: '🐻', value: 25, prob: 30 }
        ]
    },
    
    'hourly': {
        name: 'Часовой сюрприз',
        price: 0,
        type: 'free',
        image: 'assets/cases/free2.png',
        description: 'Каждый час новый шанс',
        prizes: [
            { type: 'empty', name: 'Пусто', emoji: '🌌', value: 0, prob: 60 },
            { type: 'flower', name: 'Цветок', emoji: '🌼', value: 5, prob: 25 },
            { type: 'lollipop', name: 'Леденец', emoji: '🍭', value: 15, prob: 15 }
        ]
    },
    
    'starter': {
        name: 'Стартовый набор',
        price: 0,
        type: 'free',
        image: 'assets/cases/free3.png',
        description: 'Для новых космонавтов',
        prizes: [
            { type: 'gift', name: 'Подарок', emoji: '🎁', value: 20, prob: 40 },
            { type: 'rose', name: 'Роза', emoji: '🌹', value: 15, prob: 35 },
            { type: 'bear', name: 'Мишка', emoji: '🐻', value: 50, prob: 25 }
        ]
    },
    
    // ОСНОВНЫЕ КЕЙСЫ
    'common': {
        name: 'Обычный звёздный',
        price: 25,
        type: 'basic',
        image: 'assets/cases/common.png',
        description: 'Базовые награды',
        prizes: [
            { type: 'bear', name: 'Мишка', emoji: '🐻', value: 25, prob: 30 },
            { type: 'heart', name: 'Сердце', emoji: '❤️', value: 20, prob: 25 },
            { type: 'rose', name: 'Роза', emoji: '🌹', value: 15, prob: 20 },
            { type: 'gift', name: 'Подарок', emoji: '🎁', value: 10, prob: 15 },
            { type: 'lollipop', name: 'Леденец', emoji: '🍭', value: 5, prob: 5 },
            { type: 'flower', name: 'Цветок', emoji: '🌼', value: 5, prob: 5 }
        ]
    },
    
    'rare': {
        name: 'Редкий галактический',
        price: 100,
        type: 'basic',
        image: 'assets/cases/rare.png',
        description: 'Улучшенные награды',
        prizes: [
            { type: 'bear', name: 'Мишка', emoji: '🐻', value: 100, prob: 25 },
            { type: 'heart', name: 'Сердце', emoji: '❤️', value: 100, prob: 25 },
            { type: 'rose', name: 'Роза', emoji: '🌹', value: 75, prob: 20 },
            { type: 'gift', name: 'Подарок', emoji: '🎁', value: 50, prob: 15 },
            { type: 'star', name: 'Звезда', emoji: '⭐', value: 150, prob: 10 },
            { type: 'crown', name: 'Корона', emoji: '👑', value: 250, prob: 5 }
        ]
    },
    
    'epic': {
        name: 'Эпический космический',
        price: 250,
        type: 'basic',
        image: 'assets/cases/epic.png',
        description: 'Эксклюзивные призы',
        prizes: [
            { type: 'rocket', name: 'Ракета', emoji: '🚀', value: 500, prob: 20 },
            { type: 'planet', name: 'Планета', emoji: '🪐', value: 400, prob: 20 },
            { type: 'star', name: 'Звезда', emoji: '⭐', value: 300, prob: 25 },
            { type: 'crown', name: 'Корона', emoji: '👑', value: 750, prob: 15 },
            { type: 'diamond', name: 'Алмаз', emoji: '💎', value: 1000, prob: 10 },
            { type: 'alien', name: 'Инопланетянин', emoji: '👽', value: 1500, prob: 10 }
        ]
    },
    
    // NFT КЕЙСЫ
    'nft_common': {
        name: 'NFT Стартовый набор',
        price: 500,
        type: 'nft',
        image: 'assets/cases/nft1.png',
        description: 'Базовые NFT-карточки',
        prizes: [
            { type: 'nft_common', name: 'NFT Common', emoji: '🌌', value: 100, prob: 70 },
            { type: 'nft_rare', name: 'NFT Rare', emoji: '✨', value: 250, prob: 20 },
            { type: 'nft_epic', name: 'NFT Epic', emoji: '🌟', value: 500, prob: 8 },
            { type: 'nft_legendary', name: 'NFT Legendary', emoji: '💫', value: 1000, prob: 2 }
        ]
    },
    
    'nft_rare': {
        name: 'NFT Галактическая серия',
        price: 1000,
        type: 'nft',
        image: 'assets/cases/nft2.png',
        description: 'Редкие космические NFT',
        prizes: [
            { type: 'nft_rare', name: 'NFT Rare', emoji: '✨', value: 500, prob: 60 },
            { type: 'nft_epic', name: 'NFT Epic', emoji: '🌟', value: 1000, prob: 25 },
            { type: 'nft_legendary', name: 'NFT Legendary', emoji: '💫', value: 2500, prob: 10 },
            { type: 'nft_mythic', name: 'NFT Mythic', emoji: '👑', value: 5000, prob: 5 }
        ]
    },
    
    'nft_legendary': {
        name: 'NFT Легендарная коллекция',
        price: 2500,
        type: 'nft',
        image: 'assets/cases/nft3.png',
        description: 'Уникальные шедевры',
        prizes: [
            { type: 'nft_epic', name: 'NFT Epic', emoji: '🌟', value: 1000, prob: 50 },
            { type: 'nft_legendary', name: 'NFT Legendary', emoji: '💫', value: 2500, prob: 30 },
            { type: 'nft_mythic', name: 'NFT Mythic', emoji: '👑', value: 5000, prob: 15 },
            { type: 'nft_unique', name: 'NFT Unique', emoji: '🔥', value: 10000, prob: 5 }
        ]
    },
    
    // ПРЕМИУМ КЕЙСЫ
    'premium_weekly': {
        name: 'Недельный премиум',
        price: 750,
        type: 'premium',
        image: 'assets/cases/premium1.png',
        description: 'Эксклюзив на 7 дней',
        prizes: [
            { type: 'star_x10', name: 'x10 Звёзд', emoji: '⭐', value: 250, prob: 30 },
            { type: 'crown_x25', name: 'x25 Корона', emoji: '👑', value: 500, prob: 25 },
            { type: 'diamond_x50', name: 'x50 Алмаз', emoji: '💎', value: 1000, prob: 20 },
            { type: 'rocket_x100', name: 'x100 Ракета', emoji: '🚀', value: 1500, prob: 15 },
            { type: 'alien_x250', name: 'x250 Инопланетянин', emoji: '👽', value: 2500, prob: 10 }
        ]
    },
    
    // СПЕЦИАЛЬНЫЕ КЕЙСЫ
    'mystery': {
        name: 'Мистери кейс',
        price: 150,
        type: 'special',
        image: 'assets/cases/mystery.png',
        description: 'Случайная награда любой редкости',
        prizes: [
            { type: 'common', name: 'Common', emoji: '⚪', value: 50, prob: 40 },
            { type: 'rare', name: 'Rare', emoji: '🔵', value: 150, prob: 30 },
            { type: 'epic', name: 'Epic', emoji: '🟣', value: 500, prob: 20 },
            { type: 'legendary', name: 'Legendary', emoji: '🟡', value: 1500, prob: 10 }
        ]
    },
    
    'jackpot': {
        name: 'Джекпот кейс',
        price: 500,
        type: 'special',
        image: 'assets/cases/jackpot.png',
        description: 'Шанс выиграть джекпот 10,000 ⭐',
        prizes: [
            { type: 'x2', name: 'x2', emoji: '2️⃣', value: 1000, prob: 50 },
            { type: 'x5', name: 'x5', emoji: '5️⃣', value: 2500, prob: 25 },
            { type: 'x10', name: 'x10', emoji: '🔟', value: 5000, prob: 15 },
            { type: 'x100', name: 'x100', emoji: '💯', value: 50000, prob: 9 },
            { type: 'jackpot', name: 'ДЖЕКПОТ', emoji: '🎰', value: 100000, prob: 1 }
        ]
    }
};

// ПЕРЕМЕННЫЕ ДЛЯ РАКЕТЫ
let isRocketGameActive = false;
let rocketInterval;
let crashTimeout;
let multiplier = 1.00;
let currentBet = 5.00;
let autoCashoutEnabled = false;
let autoCashoutValue = 2.0;
let flightHistory = ['x1.24', 'x3.45', 'x2.12', 'x5.67', 'x1.89'];
let currentCase = null;

// СИСТЕМА УВЕДОМЛЕНИЙ
let notifications = [
    { id: 1, title: 'Ежедневный бонус готов!', type: 'success', read: false, time: '2 минуты назад' },
    { id: 2, title: 'Новый турнир начинается', type: 'info', read: true, time: '1 час назад' },
    { id: 3, title: 'Заканчивается премиум', type: 'warning', read: true, time: '3 часа назад' }
];

// ============================================
// ОСНОВНЫЕ ФУНКЦИИ
// ============================================

// ИНИЦИАЛИЗАЦИЯ
window.addEventListener("load", () => {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
    
    // Инициализация звёздного фона
    initStarBackground();
    
    // Проверка сохранённого пользователя
    const savedUsername = localStorage.getItem("galaxyUsername");
    if (savedUsername) {
        username = savedUsername;
        showView('home');
        updateUI();
        setupEventListeners();
    } else {
        showView('login');
    }
    
    // Обновление статистики онлайн
    updateOnlineCount();
    
    // Запуск таймеров
    setInterval(updateTimers, 1000);
    setInterval(updateJackpot, 5000);
});

// ПОКАЗАТЬ ЭКРАН
function showView(viewName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));
    
    if (viewName === 'login') {
        document.getElementById('login-screen').classList.remove('hidden');
    } else {
        document.getElementById('main-app').classList.remove('hidden');
        const views = document.querySelectorAll('.content-view');
        views.forEach(v => v.classList.add('hidden'));
        
        const targetView = document.getElementById(viewName + '-screen');
        if (targetView) {
            targetView.classList.remove('hidden');
        }
        
        // Обновить активную навигацию
        document.querySelectorAll('.nav-orb').forEach(orb => {
            orb.classList.remove('active');
            if (orb.dataset.view === viewName) {
                orb.classList.add('active');
            }
        });
        
        currentView = viewName;
    }
}

// ОБНОВЛЕНИЕ ИНТЕРФЕЙСА
function updateUI() {
    // Баланс
    document.getElementById('header-balance').textContent = formatNumber(userBalance);
    document.getElementById('welcome-username').textContent = username;
    
    // Уровень
    document.getElementById('user-level').textContent = userLevel;
    const nextLevelXP = levelXP[userLevel] || levelXP[levelXP.length - 1];
    const progress = (userXP / nextLevelXP) * 100;
    document.querySelector('.progress-fill').style.width = `${Math.min(progress, 100)}%`;
    document.querySelector('.level-xp').textContent = `${userXP}/${nextLevelXP} XP`;
    
    // Уведомления
    const unreadCount = notifications.filter(n => !n.read).length;
    document.getElementById('notification-count').textContent = unreadCount;
    document.getElementById('notification-count').style.display = unreadCount > 0 ? 'block' : 'none';
    
    // Статистика
    updateStatistics();
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ
function updateStatistics() {
    const todayWins = parseInt(localStorage.getItem('todayWins')) || 0;
    const totalWins = parseInt(localStorage.getItem('totalWins')) || 1245;
    const winRate = localStorage.getItem('winRate') || '67%';
    
    document.getElementById('today-wins').textContent = todayWins;
    document.getElementById('total-wins').textContent = formatNumber(totalWins);
    document.getElementById('win-rate').textContent = winRate;
}

// ФОРМАТИРОВАНИЕ ЧИСЕЛ
function formatNumber(num) {
    return num.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// ============================================
// АВТОРИЗАЦИЯ
// ============================================

function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";
    
    if (code.length === 5 && /^\d+$/.test(code)) {
        username = tg.initDataUnsafe.user?.username || 
                   tg.initDataUnsafe.user?.first_name || 
                   "Cosmo#" + (tg.initDataUnsafe.user?.id || Math.floor(Math.random() * 10000));
        
        localStorage.setItem("galaxyUsername", username);
        localStorage.setItem("galaxyBalance", userBalance.toString());
        
        // Анимация успешного входа
        document.querySelector('.login-card').classList.add('animate__bounceOut');
        setTimeout(() => {
            showView('home');
            updateUI();
            setupEventListeners();
            
            // Эффект появления
            document.querySelector('.welcome-card').classList.add('animate__bounceIn');
            
            // Запуск звёздного дождя
            createStarRain(50);
            
            // Вибрация успеха
            tg.HapticFeedback.notificationOccurred('success');
        }, 500);
        
    } else {
        msgElem.textContent = "🚫 Неверный код! Введите 5 цифр";
        tg.HapticFeedback.notificationOccurred('error');
        
        // Анимация ошибки
        document.getElementById('code-input').classList.add('shake');
        setTimeout(() => {
            document.getElementById('code-input').classList.remove('shake');
        }, 500);
    }
}

// ВЫХОД
function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem("galaxyUsername");
        localStorage.removeItem("galaxyBalance");
        username = "";
        userBalance = 1000;
        
        // Анимация выхода
        document.getElementById('main-app').classList.add('fade-out');
        setTimeout(() => {
            showView('login');
            document.getElementById('code-input').value = "";
        }, 500);
        
        tg.HapticFeedback.notificationOccurred('warning');
    }
}

// ============================================
// СИСТЕМА КЕЙСОВ
// ============================================

// ОТКРЫТЬ МОДАЛЬНОЕ ОКНО КЕЙСА
function openCaseModal(caseId) {
    const caseData = CASE_DATABASE[caseId];
    if (!caseData) return;
    
    currentCase = caseId;
    
    document.getElementById('modal-case-title').textContent = caseData.name;
    document.getElementById('modal-case-image').src = caseData.image;
    document.getElementById('modal-case-price').textContent = caseData.price;
    document.getElementById('modal-case-desc').textContent = caseData.description;
    
    // Заполнение шансов
    const oddsList = document.getElementById('modal-odds-list');
    oddsList.innerHTML = '';
    
    caseData.prizes.forEach(prize => {
        const oddsItem = document.createElement('div');
        oddsItem.className = 'odds-item';
        oddsItem.innerHTML = `
            <span class="odds-emoji">${prize.emoji}</span>
            <span class="odds-name">${prize.name}</span>
            <span class="odds-prob">${prize.prob}%</span>
            <span class="odds-value">${prize.value} ⭐</span>
        `;
        oddsList.appendChild(oddsItem);
    });
    
    // Обновление кнопки
    const openBtn = document.getElementById('modal-open-btn');
    if (caseData.price === 0) {
        openBtn.innerHTML = `<i class="fas fa-gift"></i> ОТКРЫТЬ БЕСПЛАТНО`;
    } else {
        openBtn.innerHTML = `<i class="fas fa-key"></i> ОТКРЫТЬ ЗА ${caseData.price} ⭐`;
    }
    
    // Показать модальное окно
    document.getElementById('case-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ЗАКРЫТЬ МОДАЛЬНОЕ ОКНО КЕЙСА
function closeCaseModal() {
    document.getElementById('case-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentCase = null;
}

// ОТКРЫТЬ ВЫБРАННЫЙ КЕЙС
function openSelectedCase() {
    if (!currentCase) return;
    
    const caseData = CASE_DATABASE[currentCase];
    
    // Проверка баланса для платных кейсов
    if (caseData.price > 0 && userBalance < caseData.price) {
        tg.showAlert('Недостаточно звёзд!');
        tg.HapticFeedback.notificationOccurred('error');
        return;
    }
    
    // Списание средств для платных кейсов
    if (caseData.price > 0) {
        userBalance -= caseData.price;
        localStorage.setItem('galaxyBalance', userBalance.toString());
        updateUI();
    }
    
    closeCaseModal();
    simulateCaseOpening(caseData);
}

// ДЕМО-РЕЖИМ КЕЙСА
function openCaseDemo() {
    if (!currentCase) return;
    
    const caseData = CASE_DATABASE[currentCase];
    closeCaseModal();
    simulateCaseOpening(caseData, true);
}

// СИМУЛЯЦИЯ ОТКРЫТИЯ КЕЙСА
function simulateCaseOpening(caseData, isDemo = false) {
    // Анимация затемнения
    document.body.classList.add('darken');
    
    // Создание анимации открытия
    const openingAnimation = document.createElement('div');
    openingAnimation.className = 'case-opening-animation';
    openingAnimation.innerHTML = `
        <div class="case-glow"></div>
        <img src="${caseData.image}" class="spinning-case">
        <div class="opening-text">Открываем...</div>
    `;
    document.body.appendChild(openingAnimation);
    
    // Вращение кейса
    setTimeout(() => {
        // Определение выигрыша
        const prize = getRandomPrize(caseData.prizes);
        
        // Удаление анимации открытия
        openingAnimation.remove();
        document.body.classList.remove('darken');
        
        // Показ результата
        showResult(prize, caseData, isDemo);
        
        // Обновление статистики если не демо
        if (!isDemo) {
            updateStatisticsAfterWin(prize.value);
            addXP(10);
        }
        
        // Эффекты
        if (prize.value > 0) {
            createStarRain(prize.value / 10);
            tg.HapticFeedback.notificationOccurred('success');
        }
    }, 2000);
}

// ПОЛУЧЕНИЕ СЛУЧАЙНОГО ПРИЗА
function getRandomPrize(prizes) {
    const totalProb = prizes.reduce((sum, prize) => sum + prize.prob, 0);
    let random = Math.random() * totalProb;
    let cumulative = 0;
    
    for (const prize of prizes) {
        cumulative += prize.prob;
        if (random <= cumulative) {
            return prize;
        }
    }
    
    return prizes[0];
}

// ПОКАЗАТЬ РЕЗУЛЬТАТ
function showResult(prize, caseData, isDemo = false) {
    document.getElementById('result-prize-image').src = getPrizeImage(prize.type);
    document.getElementById('result-prize-name').textContent = prize.name;
    document.getElementById('result-prize-value').textContent = `${prize.value} ⭐`;
    
    let message = `Поздравляем! Вы выиграли ${prize.value} звёзд!`;
    if (isDemo) message += ' (ДЕМО-РЕЖИМ)';
    if (prize.value === 0) message = 'Попробуйте ещё раз!';
    
    document.getElementById('result-message').textContent = message;
    
    // Если выигрыш > 0 и не демо, добавляем к балансу
    if (prize.value > 0 && !isDemo) {
        userBalance += prize.value;
        localStorage.setItem('galaxyBalance', userBalance.toString());
        updateUI();
    }
    
    document.getElementById('result-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ЗАКРЫТЬ РЕЗУЛЬТАТ
function closeResultModal() {
    document.getElementById('result-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ПОДЕЛИТЬСЯ РЕЗУЛЬТАТОМ
function shareResult() {
    tg.shareTelegram({
        url: 'https://t.me/KakaoCasiBot',
        text: `🎉 Я только что выиграл в Galaxy Casino! Присоединяйся!`
    });
}

// ОТКРЫТЬ ЕЩЁ РАЗ
function openAgain() {
    closeResultModal();
    if (currentCase) {
        setTimeout(() => openCaseModal(currentCase), 300);
    }
}

// ПОЛУЧИТЬ ИЗОБРАЖЕНИЕ ПРИЗА
function getPrizeImage(type) {
    const imageMap = {
        'bear': 'assets/mishka.png',
        'heart': 'assets/serdce.png',
        'rose': 'assets/roza.png',
        'gift': 'assets/podarok.png',
        'lollipop': 'assets/ledenez.png',
        'flower': 'assets/cvetok.png',
        'star': 'assets/star.png',
        'crown': 'assets/crown.png',
        'rocket': 'assets/rocket.png',
        'planet': 'assets/planet.png',
        'diamond': 'assets/diamond.png',
        'alien': 'assets/alien.png',
        'empty': 'assets/empty.png'
    };
    
    return imageMap[type] || 'assets/star.png';
}

// ============================================
// ИГРА "РАКЕТА"
// ============================================

// ЗАПУСК РАКЕТЫ
function startRocketGame() {
    if (isRocketGameActive) {
        cashOut();
        return;
    }
    
    const betInput = document.getElementById('rocket-bet-input');
    currentBet = parseFloat(betInput.value) || 5;
    
    if (currentBet < 5 || currentBet > 10000) {
        tg.showAlert('Ставка должна быть от 5 до 10,000 звёзд');
        return;
    }
    
    if (userBalance < currentBet) {
        tg.showAlert('Недостаточно звёзд!');
        return;
    }
    
    // Списание ставки
    userBalance -= currentBet;
    localStorage.setItem('galaxyBalance', userBalance.toString());
    updateUI();
    
    // Инициализация игры
    isRocketGameActive = true;
    multiplier = 1.00;
    
    // Сброс графика
    resetGraph();
    
    // Обновление UI
    document.getElementById('rocket-action-btn').innerHTML = `
        <div class="action-content">
            <i class="fas fa-hand-holding-usd"></i>
            <div class="action-text">
                <div class="action-title">ЗАБРАТЬ ВЫИГРЫШ</div>
                <div class="action-subtitle">${(currentBet * multiplier).toFixed(2)} ⭐</div>
            </div>
        </div>
    `;
    
    // Блокировка управления
    document.getElementById('rocket-bet-input').disabled = true;
    document.querySelectorAll('.bet-chip').forEach(chip => chip.disabled = true);
    
    // Определение точки краша
    const crashPoint = generateCrashPoint();
    
    // Запуск анимации
    let time = 0;
    const startTime = Date.now();
    
    rocketInterval = setInterval(() => {
        time = (Date.now() - startTime) / 1000;
        multiplier = calculateMultiplier(time, crashPoint);
        
        // Обновление графика
        updateGraph(time, multiplier);
        
        // Обновление UI
        updateRocketUI(multiplier, time);
        
        // Проверка авто-кэшаута
        if (autoCashoutEnabled && multiplier >= autoCashoutValue) {
            cashOut();
            return;
        }
        
        // Проверка краша
        if (multiplier >= crashPoint) {
            crashGame();
        }
    }, 50);
    
    // Таймер краша (на случай багов)
    crashTimeout = setTimeout(() => crashGame(), 30000);
}

// ГЕНЕРАЦИЯ ТОЧКИ КРАША
function generateCrashPoint() {
    // Формула для реалистичного распределения
    const r = Math.random();
    if (r < 0.5) return 1 + Math.random() * 2; // 50% шанс на 1-3x
    if (r < 0.8) return 1 + Math.random() * 5; // 30% шанс на 1-6x
    if (r < 0.95) return 1 + Math.random() * 10; // 15% шанс на 1-11x
    return 1 + Math.random() * 100; // 5% шанс на 1-101x
}

// РАСЧЁТ МНОЖИТЕЛЯ
function calculateMultiplier(time, crashPoint) {
    const baseGrowth = 0.02;
    const volatility = 0.1;
    
    let m = 1 + (baseGrowth * time) + (volatility * Math.sin(time) * Math.random());
    return Math.min(m, crashPoint);
}

// СБРОС ГРАФИКА
function resetGraph() {
    const graphLine = document.getElementById('graph-line');
    graphLine.setAttribute('d', 'M0,300');
    document.querySelectorAll('.graph-point').forEach(p => p.remove());
}

// ОБНОВЛЕНИЕ ГРАФИКА
function updateGraph(time, multiplier) {
    const graphLine = document.getElementById('graph-line');
    const currentPath = graphLine.getAttribute('d');
    const x = Math.min(time * 40, 450); // Масштаб по X
    const y = 300 - (multiplier * 30); // Масштаб по Y
    
    graphLine.setAttribute('d', `${currentPath} L${x},${y}`);
    
    // Обновление позиции ракеты
    const rocket = document.getElementById('rocket');
    rocket.style.transform = `translate(${x - 20}px, ${y - 20}px)`;
}

// ОБНОВЛЕНИЕ UI РАКЕТЫ
function updateRocketUI(multiplier, time) {
    // Множитель
    document.getElementById('multiplier-value').textContent = `x${multiplier.toFixed(2)}`;
    document.getElementById('current-multiplier').style.bottom = `${(multiplier - 1) * 20}%`;
    
    // Статистика
    document.getElementById('max-multiplier').textContent = `x${multiplier.toFixed(2)}`;
    document.getElementById('flight-time').textContent = `${time.toFixed(1)}s`;
    document.getElementById('altitude').textContent = `${Math.floor(multiplier * 1000)} км`;
    document.getElementById('rocket-speed').textContent = `${Math.floor(multiplier * 100)} км/с`;
    
    // Потенциальный выигрыш
    const potentialWin = currentBet * multiplier;
    document.getElementById('bet-amount').textContent = currentBet.toFixed(2);
    document.getElementById('potential-win').textContent = potentialWin.toFixed(2);
    
    // Обновление кнопки
    const actionBtn = document.getElementById('rocket-action-btn');
    const subtitle = actionBtn.querySelector('.action-subtitle');
    if (subtitle) {
        subtitle.textContent = `${potentialWin.toFixed(2)} ⭐`;
    }
}

// КЭШАУТ
function cashOut() {
    if (!isRocketGameActive) return;
    
    clearInterval(rocketInterval);
    clearTimeout(crashTimeout);
    
    const winAmount = currentBet * multiplier;
    userBalance += winAmount;
    
    // Добавление в историю
    flightHistory.unshift(`x${multiplier.toFixed(2)}`);
    if (flightHistory.length > 10) flightHistory.pop();
    updateFlightHistory();
    
    // Обновление UI
    localStorage.setItem('galaxyBalance', userBalance.toString());
    updateUI();
    
    // Сообщение о победе
    showNotification(`🎉 Вы забрали на x${multiplier.toFixed(2)}! +${winAmount.toFixed(2)} ⭐`, 'success');
    
    resetRocketGame();
    addXP(5);
}

// КРАШ РАКЕТЫ
function crashGame() {
    if (!isRocketGameActive) return;
    
    clearInterval(rocketInterval);
    clearTimeout(crashTimeout);
    
    // Добавление в историю
    flightHistory.unshift(`x${multiplier.toFixed(2)}`);
    if (flightHistory.length > 10) flightHistory.pop();
    updateFlightHistory();
    
    // Взрыв ракеты
    const rocket = document.getElementById('rocket');
    rocket.innerHTML = '<i class="fas fa-fire"></i>';
    rocket.classList.add('explode');
    
    // Сообщение о проигрыше
    showNotification(`💥 Ракета взорвалась на x${multiplier.toFixed(2)}`, 'error');
    
    setTimeout(() => {
        resetRocketGame();
    }, 2000);
}

// СБРОС ИГРЫ РАКЕТЫ
function resetRocketGame() {
    isRocketGameActive = false;
    multiplier = 1.00;
    
    // Восстановление ракеты
    const rocket = document.getElementById('rocket');
    rocket.innerHTML = '<i class="fas fa-rocket rocket-icon"></i>';
    rocket.classList.remove('explode');
    rocket.style.transform = 'translate(0, 300px)';
    
    // Сброс графика
    resetGraph();
    
    // Разблокировка управления
    document.getElementById('rocket-bet-input').disabled = false;
    document.querySelectorAll('.bet-chip').forEach(chip => chip.disabled = false);
    
    // Обновление кнопки
    document.getElementById('rocket-action-btn').innerHTML = `
        <div class="action-content">
            <i class="fas fa-play"></i>
            <div class="action-text">
                <div class="action-title">ЗАПУСТИТЬ РАКЕТУ</div>
                <div class="action-subtitle">Ставка: ${currentBet.toFixed(2)} ⭐</div>
            </div>
        </div>
    `;
    
    // Сброс статистики
    document.getElementById('multiplier-value').textContent = 'x1.00';
    document.getElementById('max-multiplier').textContent = 'x1.00';
    document.getElementById('flight-time').textContent = '0.0s';
    document.getElementById('altitude').textContent = '0 км';
    document.getElementById('rocket-speed').textContent = '0 км/с';
}

// ОБНОВЛЕНИЕ ИСТОРИИ ПОЛЁТОВ
function updateFlightHistory() {
    const historyContainer = document.getElementById('flight-history');
    historyContainer.innerHTML = '';
    
    flightHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${item.includes('cashout') ? 'cashout' : 'crash'}`;
        historyItem.textContent = item;
        historyContainer.appendChild(historyItem);
    });
}

// УПРАВЛЕНИЕ СТАВКАМИ
function modifyBet(amount) {
    const input = document.getElementById('rocket-bet-input');
    let current = parseFloat(input.value) || 5;
    current += amount;
    
    if (current < 5) current = 5;
    if (current > 10000) current = 10000;
    
    input.value = current.toFixed(2);
    currentBet = current;
    
    if (!isRocketGameActive) {
        updateRocketUI(1.00, 0);
    }
}

// УСТАНОВКА СТАВКИ
function setBet(amount) {
    const input = document.getElementById('rocket-bet-input');
    input.value = amount;
    currentBet = amount;
    
    if (!isRocketGameActive) {
        updateRocketUI(1.00, 0);
    }
}

// УДВОИТЬ СТАВКУ
function doubleBet() {
    if (userBalance >= currentBet * 2) {
        modifyBet(currentBet);
    }
}

// УСТАНОВИТЬ МАКСИМАЛЬНУЮ СТАВКУ
function placeMaxBet() {
    const maxBet = Math.min(userBalance, 10000);
    setBet(maxBet);
}

// ПЕРЕКЛЮЧЕНИЕ АВТО-КЭШАУТА
function toggleAutoCashout() {
    autoCashoutEnabled = !autoCashoutEnabled;
    const btn = document.getElementById('toggle-auto-cashout');
    
    if (autoCashoutEnabled) {
        btn.innerHTML = '<i class="fas fa-power-off"></i> Авто-кэшаут: ВКЛ';
        btn.classList.add('active');
    } else {
        btn.innerHTML = '<i class="fas fa-power-off"></i> Включить авто-кэшаут';
        btn.classList.remove('active');
    }
}

// ОБНОВЛЕНИЕ ЗНАЧЕНИЯ АВТО-КЭШАУТА
function updateAutoCashout() {
    const slider = document.getElementById('auto-cashout-slider');
    autoCashoutValue = parseFloat(slider.value);
    document.getElementById('auto-cashout-value').textContent = `x${autoCashoutValue.toFixed(1)}`;
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

// НАВИГАЦИЯ
function navigateTo(view) {
    showView(view);
    tg.HapticFeedback.selectionChanged();
}

// БЫСТРЫЕ ИГРЫ
function quickGame(type) {
    switch(type) {
        case 'rocket':
            navigateTo('rocket');
            break;
        case 'coinflip':
            playCoinflip();
            break;
        case 'dice':
            playDice();
            break;
        case 'wheel':
            playWheel();
            break;
    }
}

// ИГРА В МОНЕТКУ
function playCoinflip() {
    const bet = Math.min(100, userBalance / 2);
    if (bet < 5) {
        tg.showAlert('Минимальная ставка 5 звёзд');
        return;
    }
    
    if (confirm(`Поставить ${bet} ⭐ на орла/решку?`)) {
        const win = Math.random() > 0.5;
        
        if (win) {
            userBalance += bet;
            showNotification(`🎉 Вы выиграли ${bet} ⭐!`, 'success');
        } else {
            userBalance -= bet;
            showNotification(`💸 Вы проиграли ${bet} ⭐`, 'error');
        }
        
        localStorage.setItem('galaxyBalance', userBalance.toString());
        updateUI();
        addXP(1);
    }
}

// НАСТРОЙКА СЛУШАТЕЛЕЙ СОБЫТИЙ
function setupEventListeners() {
    // Вход
    document.getElementById('login-btn').addEventListener('click', login);
    document.getElementById('code-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });
    
    // Кнопки навигации
    document.querySelectorAll('.nav-orb').forEach(orb => {
        orb.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            navigateTo(view);
        });
    });
    
    // Быстрые ставки для ракеты
    document.querySelectorAll('.bet-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            const bet = parseFloat(e.currentTarget.dataset.bet);
            setBet(bet);
        });
    });
    
    // Авто-кэшаут
    document.getElementById('auto-cashout-slider').addEventListener('input', updateAutoCashout);
    document.getElementById('toggle-auto-cashout').addEventListener('click', toggleAutoCashout);
    
    // Фильтры кейсов
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const filter = e.currentTarget.dataset.filter;
            filterCases(filter);
        });
    });
}

// ФИЛЬТРАЦИЯ КЕЙСОВ
function filterCases(filter) {
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    
    const sections = document.querySelectorAll('.category-section');
    
    sections.forEach(section => {
        if (filter === 'all') {
            section.style.display = 'block';
        } else {
            section.style.display = section.id.includes(filter) ? 'block' : 'none';
        }
    });
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ ПОСЛЕ ПОБЕДЫ
function updateStatisticsAfterWin(amount) {
    if (amount <= 0) return;
    
    // Обновление сегодняшних побед
    const today = new Date().toDateString();
    const lastPlayDate = localStorage.getItem('lastPlayDate');
    let todayWins = parseInt(localStorage.getItem('todayWins')) || 0;
    
    if (lastPlayDate !== today) {
        todayWins = 0;
        localStorage.setItem('lastPlayDate', today);
    }
    
    todayWins++;
    localStorage.setItem('todayWins', todayWins.toString());
    
    // Обновление общих побед
    let totalWins = parseInt(localStorage.getItem('totalWins')) || 1245;
    totalWins++;
    localStorage.setItem('totalWins', totalWins.toString());
    
    // Обновление процента побед
    const totalGames = parseInt(localStorage.getItem('totalGames')) || 1858;
    const winRate = Math.round((totalWins / totalGames) * 100);
    localStorage.setItem('winRate', `${winRate}%`);
    
    updateUI();
}

// ДОБАВЛЕНИЕ ОПЫТА
function addXP(amount) {
    userXP += amount;
    const nextLevelXP = levelXP[userLevel] || levelXP[levelXP.length - 1];
    
    if (userXP >= nextLevelXP && userLevel < levelXP.length - 1) {
        userLevel++;
        userXP = userXP - nextLevelXP;
        showNotification(`🎉 Поздравляем! Вы достигли ${userLevel} уровня!`, 'success');
        
        // Награда за уровень
        const levelReward = userLevel * 100;
        userBalance += levelReward;
        showNotification(`🎁 Награда за уровень: +${levelReward} ⭐`, 'info');
    }
    
    localStorage.setItem('userXP', userXP.toString());
    localStorage.setItem('userLevel', userLevel.toString());
    updateUI();
}

// СОЗДАНИЕ ЗВЁЗДНОГО ФОНА
function initStarBackground() {
    const starsBg = document.getElementById('stars-bg');
    for (let i = 0; i < 150; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.top = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 5}s`;
        star.style.animationDuration = `${1 + Math.random() * 3}s`;
        starsBg.appendChild(star);
    }
}

// ЗВЁЗДНЫЙ ДОЖДЬ
function createStarRain(count) {
    const rainContainer = document.getElementById('star-rain');
    rainContainer.innerHTML = '';
    rainContainer.classList.remove('hidden');
    
    for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'falling-star';
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 2}s`;
        rainContainer.appendChild(star);
    }
    
    setTimeout(() => {
        rainContainer.classList.add('hidden');
        rainContainer.innerHTML = '';
    }, 3000);
}

// ОБНОВЛЕНИЕ СТАТИСТИКИ ОНЛАЙН
function updateOnlineCount() {
    const onlineCount = document.getElementById('online-count');
    const base = 1245;
    const variation = Math.floor(Math.random() * 200) - 100;
    onlineCount.textContent = (base + variation).toLocaleString();
    
    setTimeout(updateOnlineCount, 30000);
}

// ОБНОВЛЕНИЕ ДЖЕКПОТА
function updateJackpot() {
    const jackpot = document.getElementById('jackpot-amount');
    const current = parseFloat(jackpot.textContent.replace(/,/g, ''));
    const change = Math.floor(Math.random() * 100) - 30;
    jackpot.textContent = Math.max(10000, current + change).toLocaleString();
}

// ОБНОВЛЕНИЕ ТАЙМЕРОВ
function updateTimers() {
    // Таймер премиума
    const premiumTimer = document.getElementById('premium-timer');
    if (premiumTimer) {
        const now = new Date();
        const seconds = 23 * 3600 + 59 * 60 + 59 - (now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds());
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        premiumTimer.textContent = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    
    // Горячая полоса
    const hotStreak = document.getElementById('hot-streak');
    if (hotStreak) {
        const streak = parseInt(hotStreak.textContent);
        if (Math.random() > 0.7) {
            hotStreak.textContent = Math.min(10, streak + 1);
        } else if (Math.random() > 0.9) {
            hotStreak.textContent = '1';
        }
    }
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЕ
function showNotification(message, type = 'info') {
    // Создание уведомления
    const notification = document.createElement('div');
    notification.className = `floating-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Анимация появления
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Удаление через 3 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
    
    // Вибрация
    if (type === 'success') {
        tg.HapticFeedback.notificationOccurred('success');
    } else if (type === 'error') {
        tg.HapticFeedback.notificationOccurred('error');
    }
}

// ПОКАЗАТЬ УВЕДОМЛЕНИЯ
function showNotifications() {
    const panel = document.getElementById('notifications-panel');
    panel.classList.toggle('hidden');
    
    // Пометить как прочитанные
    notifications.forEach(n => n.read = true);
    updateUI();
}

// ЗАКРЫТЬ УВЕДОМЛЕНИЯ
function closeNotifications() {
    document.getElementById('notifications-panel').classList.add('hidden');
}

// ПОКАЗАТЬ МОДАЛЬНОЕ ОКНО ПОПОЛНЕНИЯ
function showAddBalanceModal() {
    document.getElementById('add-balance-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// ЗАКРЫТЬ МОДАЛЬНОЕ ОКНО ПОПОЛНЕНИЯ
function closeAddBalanceModal() {
    document.getElementById('add-balance-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// ВЫБОР ПАКЕТА
function selectPackage(amount) {
    document.querySelectorAll('.package').forEach(p => p.classList.remove('selected'));
    event.currentTarget.classList.add('selected');
}

// ОБРАБОТКА ПЛАТЕЖА
function processPayment() {
    const selectedPackage = document.querySelector('.package.selected');
    if (!selectedPackage) {
        tg.showAlert('Выберите пакет для пополнения');
        return;
    }
    
    const amount = parseInt(selectedPackage.querySelector('.package-amount').textContent);
    userBalance += amount;
    localStorage.setItem('galaxyBalance', userBalance.toString());
    
    closeAddBalanceModal();
    updateUI();
    
    showNotification(`✅ Баланс пополнен на ${amount} ⭐!`, 'success');
    tg.HapticFeedback.notificationOccurred('success');
    
    // Звёздный дождь
    createStarRain(amount / 10);
}

// ПЕРЕКЛЮЧЕНИЕ МЕНЮ
function toggleMenu() {
    const menu = document.getElementById('main-menu');
    menu.classList.toggle('show');
}

// ПОКАЗАТЬ ПОМОЩЬ
function showHelp() {
    tg.showAlert(`🚀 Galaxy Casino - Помощь

📦 Кейсы:
• Бесплатные - открывайте каждый день
• Основные - стандартные награды
• NFT - коллекционные карточки
• Премиум - эксклюзивные призы
• Специальные - уникальные шансы

🚀 Ракета:
• Запустите ракету и заберите выигрыш до взрыва
• Используйте авто-кэшаут для автоматического вывода
• Следите за статистикой полёта

⭐ Система:
• Уровни - получайте XP за активность
• Достижения - выполняйте задания
• Турниры - соревнуйтесь с другими

💰 Баланс:
• Пополняйте через меню профиля
• Используйте бонусные пакеты
• Участвуйте в акциях

Удачи в космических приключениях! 🌌`);
}

// ПРЕДПРОСМОТР КЕЙСА
function openCasePreview(caseId) {
    tg.showPopup({
        title: 'Быстрый просмотр',
        message: `Откройте кейс в разделе "Кейсы" для полной информации!`,
        buttons: [{ type: 'ok' }]
    });
}

// ============================================
// ЗАПУСК ПРИ ЗАГРУЗКЕ
// ============================================

// Проверка наличия необходимых данных
if (!localStorage.getItem('userLevel')) {
    localStorage.setItem('userLevel', '1');
    localStorage.setItem('userXP', '0');
    localStorage.setItem('todayWins', '0');
    localStorage.setItem('totalWins', '1245');
    localStorage.setItem('winRate', '67%');
    localStorage.setItem('lastPlayDate', new Date().toDateString());
}
