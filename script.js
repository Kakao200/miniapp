let username = "";
let tg = window.Telegram.WebApp;
let currentView = 'login'; 
let currentMode = 'home'; // 'home' (Кейсы) или 'rocket'
let userBalance = parseFloat(localStorage.getItem('userBalance')) || 1000; 

// Логика игры "Ракета"
let isRocketGameActive = false;
let rocketInterval;
let crashTimeout;
let multiplier = 1.00;
const INITIAL_ROCKET_Y = 280; // Начальная позиция ракеты (снизу)

// --- МАССИВ ПРИЗОВ ---
// Обновленные шансы: Мишка и Сердце - самые частые. Леденец и Цветок - самые редкие.
const PRIZES = [
    { emoji: "🐻", prob: 0.30, name: "Мишка", image: "assets/mishka.png" },    // 30%
    { emoji: "❤️", prob: 0.25, name: "Сердце", image: "assets/serdce.png" },   // 25%
    { emoji: "🌹", prob: 0.20, name: "Роза", image: "assets/roza.png" },       // 20%
    { emoji: "🎁", prob: 0.15, name: "Подарок", image: "assets/podarok.png" }, // 15%
    { emoji: "🍭", prob: 0.05, name: "Леденец", image: "assets/ledenets.png" },// 5%
    { emoji: "🌼", prob: 0.05, name: "Цветок", image: "assets/cvetok.png" }    // 5%
];

const PRIZE_ITEM_WIDTH = 80; 
const SCROLL_DURATION = 5000; 
const BET_OPTIONS = [5, 25, 100];


// --- Инициализация ---
window.addEventListener("load", () => {
    tg.ready();
    tg.expand();
    
    // Инициализация нижней навигации
    document.getElementById('nav-bar').addEventListener('click', handleNavClick);
    
    updateTgColors();

    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        username = savedUsername;
        showView('home');
        updateHeaderAndProfile();
        // Привязка кнопок ставок
        document.querySelectorAll('.bet-amount-btn').forEach(btn => {
            btn.addEventListener('click', setBetAmount);
        });
        document.getElementById('bet-input').addEventListener('input', updateActionButtonText);
    } else {
        showView('login');
    }
});

function updateTgColors() {
    // Используем стандартные цвета Telegram
    tg.setHeaderColor(tg.themeParams.secondary_bg_color);
    tg.setBackgroundColor(tg.themeParams.bg_color);
}

// --- Обработка кликов в навигации ---
function handleNavClick(event) {
    const navItem = event.target.closest('.nav-item');
    if (navItem) {
        const viewName = navItem.getAttribute('data-view');
        // Обновляем текущий режим в соответствии с нажатой кнопкой
        if (viewName === 'home') currentMode = 'home';
        if (viewName === 'rocket') currentMode = 'rocket';
        
        navigateTo(viewName);
    }
}

// --- Переключение режимов (Кейсы/Ракета) ---
function navigateToMode(mode) {
    currentMode = mode;
    
    document.getElementById('mode-cases').classList.remove('active');
    document.getElementById('mode-rocket').classList.remove('active');

    if (mode === 'home') {
        document.getElementById('mode-cases').classList.add('active');
        navigateTo('home');
    } else if (mode === 'rocket') {
        document.getElementById('mode-rocket').classList.add('active');
        navigateTo('rocket');
    }
}

// --- Навигация ---
function showView(viewName) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));

    if (viewName !== 'login') {
        document.getElementById('main-app').classList.remove('hidden');
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }

    const views = document.querySelectorAll('.content-view');
    views.forEach(v => v.classList.add('hidden'));

    let targetElement = document.getElementById(viewName + '-screen');
    
    if (targetElement) {
        targetElement.classList.remove('hidden');
        currentView = viewName;
    }

    // Обновление активного элемента в нав-баре
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-view') === viewName) {
            item.classList.add('active');
        }
    });

    // Дополнительная логика для режима
    if (viewName === 'home' || viewName === 'rocket') {
        const modeBtn = viewName === 'home' ? 'mode-cases' : 'mode-rocket';
        document.getElementById('mode-cases').classList.remove('active');
        document.getElementById('mode-rocket').classList.remove('active');
        document.getElementById(modeBtn).classList.add('active');
    }
}

function navigateTo(viewName) {
    showView(viewName);
    if (viewName === 'profile') updateHeaderAndProfile();
}

// --- Данные пользователя ---
function updateHeaderAndProfile() {
    const userId = tg.initDataUnsafe.user?.id || 'N/A';
    
    localStorage.setItem('userBalance', userBalance.toFixed(2));
    const formattedBalance = userBalance.toFixed(2);

    document.getElementById("header-balance").textContent = formattedBalance;
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-id").textContent = userId;
    document.getElementById("profile-balance").innerHTML = `${formattedBalance} <i class="fas fa-star"></i>`;
    
    updateActionButtonText();
}

// --- Вход ---
function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";
    
    if (code.length === 5 && /^\d+$/.test(code)) {
        username = tg.initDataUnsafe.user?.username || 
                   tg.initDataUnsafe.user?.first_name || 
                   "User#" + (tg.initDataUnsafe.user?.id || 'GUEST');
        localStorage.setItem("username", username);
        updateHeaderAndProfile();
        navigateTo('home');
    } else {
        msgElem.textContent = "❌ Неверный или неполный код!";
    }
}

// --- Выход ---
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("userBalance");
    username = "";
    userBalance = 1000;
    showView('login');
    document.getElementById("code-input").value = "";
    tg.close();
}

// --- Кейс Логика ---
function createPrizeElement(prize) {
    const item = document.createElement('div');
    item.classList.add('prize-item');
    const img = document.createElement('img');
    img.src = prize.image; 
    img.alt = prize.name;
    img.classList.add('prize-image');
    item.appendChild(img);
    return item;
}

function resetCaseScreen() {
    document.getElementById("case-result-box").classList.add('hidden');
    document.getElementById("open-case-btn").disabled = false;
    document.getElementById("open-case-btn").innerHTML = '<i class="fas fa-key"></i> ОТКРЫТЬ (25 <i class="fas fa-star"></i>)';

    const reel = document.getElementById("prize-scroll-reel");
    reel.innerHTML = '';
    reel.style.transform = 'translateX(0)';
    reel.style.transition = 'none';

    for (let i = 0; i < 200; i++) {
        let prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
        const item = createPrizeElement(prize); 
        reel.appendChild(item);
    }
}

function spinPrize() {
    let rnd = Math.random();
    let total = 0;
    for (const prize of PRIZES) {
        total += prize.prob;
        if (rnd <= total) return prize;
    }
    return PRIZES[0];
}

function openCase() {
    const CASE_PRICE = 25;
    if (userBalance < CASE_PRICE) {
        alert("Недостаточно звезд!");
        tg.HapticFeedback.notificationOccurred('error');
        return;
    }
    
    userBalance -= CASE_PRICE;
    updateHeaderAndProfile();
    
    document.getElementById("open-case-btn").disabled = true;
    document.getElementById("open-case-btn").textContent = "Крутим...";
    document.getElementById("case-result-box").classList.add('hidden');
    
    const reel = document.getElementById("prize-scroll-reel");
    const winningPrize = spinPrize();
    
    resetCaseScreen();
    
    const stopIndex = 198; 
    const winningItem = createPrizeElement(winningPrize);
    reel.replaceChild(winningItem, reel.children[stopIndex]); 

    const offsetToCenter = (reel.offsetWidth / 2) - (PRIZE_ITEM_WIDTH / 2);
    const totalShift = (stopIndex * PRIZE_ITEM_WIDTH) - offsetToCenter;
    const randomOffset = Math.floor(Math.random() * 40) - 20; 
    const finalShift = totalShift + randomOffset;

    reel.style.transition = `transform ${SCROLL_DURATION / 1000}s cubic-bezier(0.1, 0.9, 0.2, 1)`;
    reel.style.transform = `translateX(-${finalShift}px)`;

    setTimeout(() => {
        document.getElementById("result-emoji").innerHTML = `<img src="${winningPrize.image}" alt="${winningPrize.name}" class="final-prize-image">`;
        document.getElementById("result-msg").textContent = `Поздравляем! Вы выиграли: ${winningPrize.name}!`;
        document.getElementById("case-result-box").classList.remove('hidden');
        document.getElementById("open-case-btn").disabled = false;
        document.getElementById("open-case-btn").innerHTML = 'ОТКРЫТЬ СНОВА (25 <i class="fas fa-star"></i>)';
        tg.HapticFeedback.notificationOccurred('success');
    }, SCROLL_DURATION);
}


// --- РАКЕТА ЛОГИКА ---
function setBetAmount(event) {
    const amount = event.target.getAttribute('data-bet');
    document.getElementById('bet-input').value = amount;
    updateActionButtonText();
}

function updateActionButtonText() {
    const betInput = document.getElementById('bet-input');
    const betAmount = parseFloat(betInput.value);
    const actionBtn = document.getElementById('rocket-action-btn');
    
    if (isRocketGameActive) {
        actionBtn.innerHTML = `ЗАБРАТЬ x${multiplier.toFixed(2)} (${(betAmount * multiplier).toFixed(2)} ⭐)`;
        actionBtn.style.backgroundColor = 'var(--star-color)';
    } else {
        if (betAmount > 0) {
            actionBtn.innerHTML = `<i class="fas fa-rocket"></i> СДЕЛАТЬ СТАВКУ (${betAmount.toFixed(2)} ⭐)`;
            actionBtn.style.backgroundColor = 'var(--primary-color)';
        } else {
            actionBtn.innerHTML = 'СДЕЛАТЬ СТАВКУ';
            actionBtn.style.backgroundColor = 'var(--secondary-color)';
            actionBtn.disabled = true;
        }
    }
    actionBtn.disabled = false;
}

function startRocketGame() {
    const actionBtn = document.getElementById('rocket-action-btn');
    const betInput = document.getElementById('bet-input');
    let betAmount = parseFloat(betInput.value);

    if (isRocketGameActive) {
        // Логика ЗАБРАТЬ
        cashOut(betAmount);
        return;
    }
    
    // Проверки перед ставкой
    if (isNaN(betAmount) || betAmount <= 0) {
        alert("Введите корректную сумму ставки.");
        return;
    }
    if (userBalance < betAmount) {
        alert("Недостаточно звезд!");
        tg.HapticFeedback.notificationOccurred('error');
        return;
    }

    // Инициализация игры
    userBalance -= betAmount;
    updateHeaderAndProfile();
    isRocketGameActive = true;
    multiplier = 1.00;
    
    // Обновление UI
    document.getElementById('rocket-multiplier').textContent = 'x1.00';
    document.getElementById('rocket-multiplier').classList.remove('crashed');
    document.getElementById('rocket-info').textContent = 'В ИГРЕ...';
    document.getElementById('rocket-image').classList.remove('hidden');
    document.getElementById('rocket-image').style.transform = `translateY(0) scale(0.6)`;
    
    actionBtn.textContent = 'ЖДИТЕ СТАРТА...';
    actionBtn.disabled = true;
    
    // Блокируем ввод ставки
    betInput.disabled = true;
    document.querySelectorAll('.bet-amount-btn').forEach(btn => btn.disabled = true);

    // Случайный коэффициент краша (например, от 1.01 до 10.00)
    const crashPoint = Math.max(1.01, Math.floor(Math.random() * 900 + 101) / 100); 

    // Ждем небольшой рандомный старт
    setTimeout(() => {
        actionBtn.disabled = false;
        updateActionButtonText();
        rocketInterval = setInterval(() => updateRocket(crashPoint), 100);
        
        // Устанавливаем таймер для краша
        crashTimeout = setTimeout(crashGame, calculateCrashTime(crashPoint));
    }, 1500 + Math.random() * 1000); // Случайная задержка 1.5 - 2.5 сек
}

function calculateCrashTime(crashPoint) {
    // Очень приблизительная формула для соответствия времени и множителя
    // T = log(M) * 1000 + M * 100
    return Math.log(crashPoint) * 5000 + crashPoint * 50; 
}

function updateRocket(crashPoint) {
    if (!isRocketGameActive) return;

    multiplier += 0.01 * Math.pow(multiplier, 0.5); // Ускорение: быстрее растет, чем выше множитель
    multiplier = Math.min(multiplier, crashPoint);
    
    document.getElementById('rocket-multiplier').textContent = `x${multiplier.toFixed(2)}`;
    updateActionButtonText();
    
    // Визуальное обновление ракеты (0% Y = низ, 100% Y = верх)
    const graphHeight = 300;
    let yOffset = Math.min(graphHeight, Math.log10(multiplier) * 150);
    let scale = Math.min(1, 0.6 + multiplier * 0.05);
    
    document.getElementById('rocket-image').style.transform = `translateY(-${yOffset}px) scale(${scale})`;
    
    if (multiplier >= crashPoint) {
        clearInterval(rocketInterval);
        clearTimeout(crashTimeout);
        crashGame();
    }
}

function crashGame() {
    if (!isRocketGameActive) return; 

    isRocketGameActive = false;
    
    clearInterval(rocketInterval);
    clearTimeout(crashTimeout);
    
    const crashMultiplier = multiplier.toFixed(2);

    document.getElementById('rocket-multiplier').textContent = `x${crashMultiplier}`;
    document.getElementById('rocket-multiplier').classList.add('crashed');
    document.getElementById('rocket-info').textContent = `Улетела на x${crashMultiplier}! Вы проиграли!`;
    document.getElementById('last-multiplier').textContent = `x${crashMultiplier}`;
    document.getElementById('rocket-image').classList.add('hidden');
    
    // Разблокировка управления
    document.getElementById('bet-input').disabled = false;
    document.querySelectorAll('.bet-amount-btn').forEach(btn => btn.disabled = false);
    
    updateActionButtonText();
    tg.HapticFeedback.notificationOccurred('error');
    
    // Возвращаем кнопку в исходное состояние через 3 секунды
    setTimeout(() => {
        document.getElementById('rocket-info').textContent = 'Нажмите "Ставка" для начала';
        updateActionButtonText();
    }, 3000);
}

function cashOut(betAmount) {
    if (!isRocketGameActive) return;

    isRocketGameActive = false;
    
    clearInterval(rocketInterval);
    clearTimeout(crashTimeout);

    const winAmount = betAmount * multiplier;
    userBalance += winAmount;
    
    const cashOutMultiplier = multiplier.toFixed(2);

    document.getElementById('rocket-multiplier').textContent = `x${cashOutMultiplier}`;
    document.getElementById('rocket-multiplier').classList.remove('crashed');
    document.getElementById('rocket-info').textContent = `Вы забрали на x${cashOutMultiplier}! Выигрыш: +${winAmount.toFixed(2)} ⭐`;
    document.getElementById('last-multiplier').textContent = `x${cashOutMultiplier}`;
    document.getElementById('rocket-image').style.transition = 'none';
    
    updateHeaderAndProfile();
    
    // Разблокировка управления
    document.getElementById('bet-input').disabled = false;
    document.querySelectorAll('.bet-amount-btn').forEach(btn => btn.disabled = false);
    
    updateActionButtonText();
    tg.HapticFeedback.notificationOccurred('success');
    
    // Возвращаем ракету на место и обновляем UI
    setTimeout(() => {
        document.getElementById('rocket-image').classList.add('hidden');
        document.getElementById('rocket-image').style.transform = `translateY(0) scale(0.6)`;
        document.getElementById('rocket-info').textContent = 'Нажмите "Ставка" для начала';
        updateActionButtonText();
    }, 3000);
}

