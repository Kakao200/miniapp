let username = "";
let tg = window.Telegram.WebApp;
let currentView = 'login'; 

// --- ОБНОВЛЕННЫЙ МАССИВ ПРИЗОВ (с путями к картинкам) ---
const PRIZES = [
    { emoji: "🐻", prob: 0.7, name: "Мишка", image: "assets/Мишка.png" }, 
    { emoji: "💎", prob: 0.2, name: "Алмаз", image: "assets/Алмаз.png" }, 
    { emoji: "🐸", prob: 0.1, name: "Pepe", image: "assets/Pepe.png" } 
];
const PRIZE_ITEM_WIDTH = 80; // (60px width + 2*10px padding)
const SCROLL_DURATION = 5000; // 5 секунд анимация

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
        resetCaseScreen(); // Сброс при переходе на экран кейса
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
        updateHeaderAndProfile(); 
    }
}

// --- Обновление данных пользователя ---
function updateHeaderAndProfile() {
    const userId = tg.initDataUnsafe.user?.id || 'N/A';
    
    document.getElementById("header-username").textContent = username;
    document.getElementById("profile-username").textContent = username;
    document.getElementById("profile-id").textContent = userId;
}


// --- Логика Входа ---
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
        msgElem.textContent = "❌ Неверный или неполный код! Введите 5 цифр.";
    }
}

// --- Логика Выхода ---
function logout() {
    localStorage.removeItem("username");
    username = "";
    showView('login');
    document.getElementById("code-input").value = "";
    tg.close();
}

// --- Вспомогательная функция для создания элемента приза (изображения) ---
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

// Сброс и подготовка экрана кейса
function resetCaseScreen() {
    document.getElementById("case-result-box").classList.add('hidden');
    document.getElementById("open-case-btn").disabled = false;
    document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ (0 руб)";

    const reel = document.getElementById("prize-scroll-reel");
    reel.innerHTML = '';
    reel.style.transform = 'translateX(0)';
    reel.style.transition = 'none';

    // Заполнение ленты: 200+ элементов 
    for (let i = 0; i < 200; i++) {
        let prize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
        const item = createPrizeElement(prize); 
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
    return PRIZES[0];
}

// Открытие кейса с анимацией
function openCase() {
    document.getElementById("open-case-btn").disabled = true;
    document.getElementById("open-case-btn").textContent = "Крутим...";
    document.getElementById("case-result-box").classList.add('hidden');
    
    const reel = document.getElementById("prize-scroll-reel");
    const winningPrize = spinPrize();
    
    resetCaseScreen();
    
    // 2. Вставляем выигрышный приз в позицию, где остановится прокрутка
    const stopIndex = 198; 
    const winningItem = createPrizeElement(winningPrize);
    reel.replaceChild(winningItem, reel.children[stopIndex]); 

    // 3. Вычисляем смещение для остановки
    // PRIZE_ITEM_WIDTH = 80px. Смещение, чтобы элемент stopIndex был под индикатором.
    
    // Область просмотра - 450px, Лента - max-content. 
    // offsetToCenter: Смещение до центра контейнера кейса
    const offsetToCenter = (reel.offsetWidth / 2) - (PRIZE_ITEM_WIDTH / 2);
    // Общий сдвиг, чтобы остановить элемент stopIndex под индикатором
    const totalShift = (stopIndex * PRIZE_ITEM_WIDTH) - offsetToCenter;
    
    // Добавляем немного случайности
    const randomOffset = Math.floor(Math.random() * 40) - 20; 
    const finalShift = totalShift + randomOffset;

    // Устанавливаем анимацию
    reel.style.transition = `transform ${SCROLL_DURATION / 1000}s cubic-bezier(0.1, 0.9, 0.2, 1)`;
    reel.style.transform = `translateX(-${finalShift}px)`;

    // 4. После анимации показываем результат
    setTimeout(() => {
        // Выводим большую картинку в результате
        document.getElementById("result-emoji").innerHTML = `<img src="${winningPrize.image}" alt="${winningPrize.name}" class="final-prize-image">`;
        document.getElementById("result-msg").textContent = `Поздравляем! Вы выиграли: ${winningPrize.name}!`;
        document.getElementById("case-result-box").classList.remove('hidden');
        document.getElementById("open-case-btn").disabled = false;
        document.getElementById("open-case-btn").textContent = "ОТКРЫТЬ СНОВА (0 руб)";
        
        tg.HapticFeedback.notificationOccurred('success');

    }, SCROLL_DURATION);
}

