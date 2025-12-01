let username = "";
let tg = window.Telegram.WebApp;
let currentView = 'login'; 

// --- МАССИВ ПРИЗОВ ---
// 6 предметов. Сумма шансов (prob) = 1.0 (100%)
const PRIZES = [
    { emoji: "🐻", prob: 0.05, name: "Мишка", image: "assets/mishka.png" },    // 5% (Легендарный)
    { emoji: "🎁", prob: 0.10, name: "Подарок", image: "assets/podarok.png" }, // 10% (Эпический)
    { emoji: "❤️", prob: 0.15, name: "Сердце", image: "assets/serdce.png" },   // 15% (Редкий)
    { emoji: "🌹", prob: 0.20, name: "Роза", image: "assets/roza.png" },       // 20% (Обычный)
    { emoji: "🌼", prob: 0.25, name: "Цветок", image: "assets/cvetok.png" },   // 25% (Частый)
    { emoji: "🍭", prob: 0.25, name: "Леденец", image: "assets/ledenets.png" } // 25% (Частый)
];

const PRIZE_ITEM_WIDTH = 80; 
const SCROLL_DURATION = 5000; 

// --- Инициализация ---
window.addEventListener("load", () => {
    tg.ready();
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

    if (viewName !== 'login') {
        document.getElementById('main-app').classList.remove('hidden');
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }

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
    if (viewName === 'profile') updateHeaderAndProfile();
}

// --- Данные пользователя ---
function updateHeaderAndProfile() {
    const userId = tg.initDataUnsafe.user?.id || 'N/A';
    document.getElementById("header-username").textContent = username;
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-id").textContent = userId;
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
    username = "";
    showView('login');
    document.getElementById("code-input").value = "";
    tg.close();
}

// --- Создание элемента картинки ---
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

// --- Логика Кейса ---
function resetCaseScreen() {
    document.getElementById("case-result-box").classList.add('hidden');
    document.getElementById("open-case-btn").disabled = false;
    document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ (0 руб)";

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
    document.getElementById("open-case-btn").disabled = true;
    document.getElementById("open-case-btn").textContent = "Крутим...";
    document.getElementById("case-result-box").classList.add('hidden');
    
    const reel = document.getElementById("prize-scroll-reel");
    const winningPrize = spinPrize();
    
    resetCaseScreen();
    
    // Вставляем выигрышный приз в позицию 198
    const stopIndex = 198; 
    const winningItem = createPrizeElement(winningPrize);
    reel.replaceChild(winningItem, reel.children[stopIndex]); 

    // Расчет смещения
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
        document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ СНОВА (0 руб)";
        tg.HapticFeedback.notificationOccurred('success');
    }, SCROLL_DURATION);
}

