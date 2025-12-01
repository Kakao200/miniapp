let username = "";
let tg = window.Telegram.WebApp;
let currentView = 'login'; 
let userBalance = parseFloat(localStorage.getItem('userBalance')) || 1500; // Баланс в звездах

// --- МАССИВ ПРИЗОВ ---
const PRIZES = [
    { id: 'mishka', name: "Мишка", prob: 0.05, cost: 500, image: "mishka.png", rarity: "Legendary" }, 
    { id: 'podarok', name: "Подарок", prob: 0.10, cost: 200, image: "podarok.png", rarity: "Epic" },
    { id: 'serdce', name: "Сердце", prob: 0.15, cost: 100, image: "serdce.png", rarity: "Rare" },
    { id: 'roza', name: "Роза", prob: 0.20, cost: 50, image: "roza.png", rarity: "Uncommon" },
    { id: 'cvetok', name: "Цветок", prob: 0.25, cost: 25, image: "cvetok.png", rarity: "Common" },
    { id: 'ledenets', name: "Леденец", prob: 0.25, cost: 10, image: "ledenets.png", rarity: "Common" }
];

const CASE_PRICE = 25; 
const PRIZE_ITEM_WIDTH = 110; 
const SCROLL_DURATION = 5000; 

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
    
    // Инициализация демо-режима
    const demoMode = localStorage.getItem('demoMode') === 'true';
    const demoSwitch = document.getElementById('demo-mode-switch');
    if (demoSwitch) {
        demoSwitch.checked = demoMode;
        demoSwitch.addEventListener('change', toggleDemoMode);
    }

    updateTgColors();

    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        username = savedUsername;
        showView('home');
        updateHeaderAndProfile();
        document.getElementById('nav-bar').addEventListener('click', handleNavClick);
    } else {
        showView('login');
    }
});

function updateTgColors() {
    const isLight = document.body.classList.contains("light-theme");
    if (isLight) {
        tg.setHeaderColor('#ffffff'); 
        tg.setBackgroundColor('#f0f2f5');
    } else {
        tg.setHeaderColor('#2c2c44'); 
        tg.setBackgroundColor('#1a1a2e'); 
    }
}

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
    updateTgColors();
}

// --- Демо Режим ---
function toggleDemoMode() {
    const isDemo = document.getElementById('demo-mode-switch').checked;
    localStorage.setItem('demoMode', isDemo);
    
    const openCaseBtn = document.getElementById("open-case-btn-roll");
    if (openCaseBtn) {
        if (isDemo) {
            openCaseBtn.textContent = "КРУТИТЬ (Демо)";
        } else {
            openCaseBtn.innerHTML = `КРУТИТЬ (${CASE_PRICE} <i class="fas fa-star"></i>)`;
        }
    }

    updateHeaderAndProfile(); 
    tg.HapticFeedback.impactOccurred('light');
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
    
    if (viewName === 'login') {
         targetElement = document.getElementById('login-screen');
    } else if (viewName === 'case') {
        targetElement = document.getElementById('case-screen');
        resetCaseScreen();
        renderWinnablePrizes(); // Рендерим призы, когда открываем экран кейса
        toggleDemoMode(); // Обновляем текст кнопки
    } else if (viewName === 'inventory') {
        renderInventory(); // Обновляем инвентарь при открытии
    }
    
    if (targetElement) {
        targetElement.classList.remove('hidden');
        currentView = viewName;
    }

    // Обновление кнопки "Назад" в хедере
    const backButton = document.getElementById('back-button');
    // Показываем "Назад" на всех экранах, кроме Главного и Входа
    if (viewName === 'home' || viewName === 'login') {
        backButton.classList.add('hidden');
    } else {
        backButton.classList.remove('hidden');
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
    showView(viewName);
    if (viewName === 'profile') updateHeaderAndProfile();
}

// --- Данные пользователя ---
function updateHeaderAndProfile() {
    const userId = tg.initDataUnsafe.user?.id || 'N/A';
    
    localStorage.setItem('userBalance', userBalance.toFixed(2));
    
    const formattedBalance = userBalance.toFixed(2).replace(/\.00$/, '');

    document.getElementById("header-balance").textContent = formattedBalance;
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-id").textContent = userId;
    document.getElementById("profile-balance").innerHTML = `${formattedBalance} <i class="fas fa-star"></i>`;
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
        document.getElementById('nav-bar').addEventListener('click', handleNavClick);
    } else {
        msgElem.textContent = "❌ Неверный или неполный код!";
    }
}

// --- Выход ---
function logout() {
    localStorage.removeItem("username");
    localStorage.removeItem("theme"); 
    localStorage.removeItem("demoMode"); 
    username = "";
    showView('login');
    document.getElementById("code-input").value = "";
    tg.close();
}

// --- Рендер призов на Экране Кейса ---
function renderWinnablePrizes() {
    const container = document.getElementById('winnable-prizes-list');
    container.innerHTML = '';

    PRIZES.forEach(prize => {
        const card = document.createElement('div');
        card.classList.add('prize-display-card');
        
        const img = document.createElement('img');
        img.src = `assets/${prize.image}`;
        img.alt = prize.name;
        
        const name = document.createElement('p');
        name.classList.add('prize-name');
        name.textContent = prize.name;

        const prob = document.createElement('p');
        prob.classList.add('prize-prob');
        prob.innerHTML = `${(prize.prob * 100).toFixed(1).replace(/\.0$/, '')}%`; 
        
        card.appendChild(img);
        card.appendChild(name);
        card.appendChild(prob);
        container.appendChild(card);
    });
}

// --- Инвентарь (логика исправлена) ---
function getInventory() {
    const inventory = localStorage.getItem('inventory');
    return inventory ? JSON.parse(inventory) : {};
}

function saveToInventory(prize) {
    const inventory = getInventory();
    const id = prize.id;

    if (inventory[id]) {
        inventory[id].count += 1;
    } else {
        inventory[id] = {
            id: prize.id,
            name: prize.name,
            image: prize.image,
            count: 1
        };
    }
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

function renderInventory() {
    const inventory = getInventory();
    const grid = document.getElementById('inventory-grid');
    grid.innerHTML = '';
    
    const items = Object.values(inventory).sort((a, b) => b.count - a.count);

    const emptyMessage = document.getElementById('inventory-empty');
    if (items.length === 0) {
        if (emptyMessage) emptyMessage.classList.remove('hidden');
        return;
    }
    if (emptyMessage) emptyMessage.classList.add('hidden');


    items.forEach(item => {
        const invItem = document.createElement('div');
        invItem.classList.add('inventory-item');
        
        const img = document.createElement('img');
        img.src = `assets/${item.image}`;
        img.alt = item.name;

        const countSpan = document.createElement('span');
        countSpan.classList.add('item-count');
        countSpan.textContent = item.count;
        
        const name = document.createElement('p');
        name.textContent = item.name;

        invItem.appendChild(img);
        invItem.appendChild(countSpan);
        invItem.appendChild(name);
        grid.appendChild(invItem);
    });
}


// --- Логика Кейса ---
function createPrizeElement(prize) {
    const item = document.createElement('div');
    item.classList.add('prize-item');
    const img = document.createElement('img');
    img.src = `assets/${prize.image}`; 
    img.alt = prize.name;
    img.classList.add('prize-image');
    item.appendChild(img);
    return item;
}

function resetCaseScreen() {
    document.getElementById("case-result-box").classList.add('hidden');
    
    const openCaseBtn = document.getElementById("open-case-btn-roll");
    openCaseBtn.disabled = false;
    toggleDemoMode(); // Устанавливаем правильный текст кнопки
    
    const reel = document.getElementById("prize-scroll-reel");
    reel.innerHTML = '';
    reel.style.transform = 'translateX(0)';
    reel.style.transition = 'none';

    // Создаем ленту призов (200 элементов)
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


// Запускается с экрана кручения (кнопка "КРУТИТЬ")
function startCaseRoll() {
    const isDemo = localStorage.getItem('demoMode') === 'true';
    
    if (!isDemo && userBalance < CASE_PRICE) {
        alert("Недостаточно звезд (25 ⭐️) для открытия кейса!");
        tg.HapticFeedback.notificationOccurred('error');
        return;
    }
    
    document.getElementById("open-case-btn-roll").disabled = true;
    document.getElementById("open-case-btn-roll").textContent = "Крутим...";
    document.getElementById("case-result-box").classList.add('hidden');
    
    const reel = document.getElementById("prize-scroll-reel");
    const winningPrize = spinPrize();
    
    if (!isDemo) {
        userBalance -= CASE_PRICE;
        updateHeaderAndProfile();
    }
    
    resetCaseScreen();
    
    // Вставляем выигрышный приз
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
        // СОХРАНЕНИЕ В ИНВЕНТАРЬ
        saveToInventory(winningPrize);
        
        document.getElementById("result-emoji").innerHTML = `<img src="assets/${winningPrize.image}" alt="${winningPrize.name}" class="final-prize-image">`;
        document.getElementById("result-msg").textContent = `Поздравляем! Вы выиграли: ${winningPrize.name} (Стоимость: ${winningPrize.cost} ⭐️)!`;
        document.getElementById("case-result-box").classList.remove('hidden');
        
        tg.HapticFeedback.notificationOccurred('success');
    }, SCROLL_DURATION);
}

