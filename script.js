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
const DEFAULT_BALANCE = 1500.50; // Пример баланса

// --- Инициализация ---
window.addEventListener("load", () => {
    tg.ready();
    tg.expand();
    
    // Инициализация темы
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
        document.body.classList.add("light-theme");
        document.getElementById("theme-icon").className = "fas fa-moon";
    }
    
    // Установка цветов для Telegram WebApp
    tg.setHeaderColor("secondary_bg_color");
    tg.setBackgroundColor("bg_color");


    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        username = savedUsername;
        showView('home');
        updateHeaderAndProfile();
        // Привязка навигационной панели
        document.getElementById('nav-bar').addEventListener('click', handleNavClick);
    } else {
        showView('login');
    }
});

// --- Смена Темы ---
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById("theme-icon");
    
    if (body.classList.contains("light-theme")) {
        body.classList.remove("light-theme");
        icon.className = "fas fa-sun";
        localStorage.setItem("theme", "dark");
    } else {
        body.classList.add("light-theme");
        icon.className = "fas fa-moon";
        localStorage.setItem("theme", "light");
    }
    // Обновляем цвета Telegram WebApp
    tg.setHeaderColor("secondary_bg_color");
    tg.setBackgroundColor("bg_color");
}

// --- Обработка кликов в навигации ---
function handleNavClick(event) {
    const navItem = event.target.closest('.nav-item');
    if (navItem) {
        const viewName = navItem.getAttribute('data-view');
        navigateTo(viewName);
    }
}

// --- Навигация ---
function showView(viewName) {
    // Скрываем все экраны и отображаем нужный
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));

    if (viewName !== 'login') {
        document.getElementById('main-app').classList.remove('hidden');
    } else {
        document.getElementById('login-screen').classList.remove('hidden');
    }

    // Скрываем все контент-виды и отображаем нужный
    const views = document.querySelectorAll('.content-view');
    views.forEach(v => v.classList.add('hidden'));

    let targetElement = document.getElementById(viewName + '-screen');
    
    if (viewName === 'login') {
         targetElement = document.getElementById('login-screen');
    } else if (viewName === 'case') {
        targetElement = document.getElementById('case-screen');
        resetCaseScreen();
    }
    
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
}

function navigateTo(viewName) {
    // В случае перехода на главный экран кейса, не меняем активный элемент навигации
    if (viewName !== 'case') { 
        showView(viewName);
        if (viewName === 'profile') updateHeaderAndProfile();
    } else {
        // Логика для экрана кейса, который открывается с "home"
        document.getElementById('case-screen').classList.remove('hidden');
        document.getElementById('home-screen').classList.add('hidden');
        resetCaseScreen();
    }
}

// --- Данные пользователя ---
function updateHeaderAndProfile() {
    const userId = tg.initDataUnsafe.user?.id || 'N/A';
    const balance = DEFAULT_BALANCE.toFixed(2); // Используем пример баланса

    document.getElementById("header-balance").textContent = balance + " руб.";
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-id").textContent = userId;
    document.getElementById("profile-balance").textContent = balance + " руб.";
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
        // Привязка навигационной панели после успешного входа
        document.getElementById('nav-bar').addEventListener('click', handleNavClick);
    } else {
        msgElem.textContent = "❌ Неверный или неполный код!";
    }
}

// --- Выход ---
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("theme"); // Сбрасываем тему при выходе
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
    img.src = "assets/" + prize.image; // Путь к картинке
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

    // Создаем ленту призов
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
        document.getElementById("result-emoji").innerHTML = `<img src="assets/${winningPrize.image}" alt="${winningPrize.name}" class="final-prize-image">`;
        document.getElementById("result-msg").textContent = `Поздравляем! Вы выиграли: ${winningPrize.name}!`;
        document.getElementById("case-result-box").classList.remove('hidden');
        document.getElementById("open-case-btn").disabled = false;
        document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ СНОВА (0 руб)";
        tg.HapticFeedback.notificationOccurred('success');
    }, SCROLL_DURATION);
}

