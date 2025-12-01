// script.js
let username = "";
let tg = window.Telegram.WebApp;
let isDarkTheme = false;
let userBalance = 1000;
const CASE_COST = 25;

const PRIZES = [
    { emoji: "🐻", prob: 0.05, name: "Мишка", image: "assets/teddy_bear.png", stars: 100 },
    { emoji: "🎁", prob: 0.10, name: "Подарок", image: "assets/giftbox_red.png", stars: 75 },
    { emoji: "❤️", prob: 0.15, name: "Сердце", image: "assets/heart_gift.png", stars: 50 },
    { emoji: "🌹", prob: 0.20, name: "Роза", image: "assets/rose.png", stars: 25 },
    { emoji: "🌼", prob: 0.25, name: "Цветок", image: "assets/cvetok.png", stars: 15 },
    { emoji: "🍭", prob: 0.25, name: "Леденец", image: "assets/cup.png", stars: 10 }
];

function showScreen(screenId) {
    document.querySelectorAll('.app-screen').forEach(s => s.classList.add('hidden'));
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.remove('hidden');
    }
}

function updateBalanceDisplay() {
    document.getElementById('star-balance').textContent = userBalance;
    document.getElementById('case-cost').textContent = CASE_COST;
}

function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    const themeSwitcher = document.getElementById('theme-switcher');
    
    if (isDarkTheme) {
        document.body.classList.add('dark-theme');
        themeSwitcher.classList.remove('fa-moon');
        themeSwitcher.classList.add('fa-sun');
    } else {
        document.body.classList.remove('dark-theme');
        themeSwitcher.classList.remove('fa-sun');
        themeSwitcher.classList.add('fa-moon');
    }
}

function renderPrizesGrid() {
    const grid = document.getElementById('prizes-grid');
    grid.innerHTML = '';
    
    PRIZES.forEach(prize => {
        const prizeElement = document.createElement('div');
        prizeElement.className = 'prize-item';
        prizeElement.innerHTML = `
            <img src="${prize.image}" alt="${prize.name}">
            <div class="prize-stars">
                <img src="assets/star.png" alt="Star" class="star-icon">
                <span>${prize.stars}</span>
            </div>
        `;
        grid.appendChild(prizeElement);
    });
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

function startCaseOpening() {
    if (userBalance < CASE_COST) {
        tg.showPopup({
            title: "Недостаточно звезд",
            message: "Пополните баланс для открытия кейсов",
            buttons: [{ type: "ok" }]
        });
        return;
    }

    userBalance -= CASE_COST;
    updateBalanceDisplay();
    showScreen('case-screen');
    
    const spinningImg = document.getElementById('spinning-prize-img');
    let spinCount = 0;
    const maxSpins = 20;
    const spinInterval = 100;
    
    const spinAnimation = setInterval(() => {
        const randomPrize = PRIZES[Math.floor(Math.random() * PRIZES.length)];
        spinningImg.src = randomPrize.image;
        spinCount++;
        
        if (spinCount >= maxSpins) {
            clearInterval(spinAnimation);
            const winningPrize = spinPrize();
            showResult(winningPrize);
        }
    }, spinInterval);
}

function showResult(prize) {
    setTimeout(() => {
        document.getElementById('won-prize-img').src = prize.image;
        document.getElementById('won-prize-name').textContent = prize.name;
        document.getElementById('won-prize-value').textContent = prize.stars;
        showScreen('result-screen');
        tg.HapticFeedback.notificationOccurred('success');
    }, 500);
}

function setupNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const navTarget = item.dataset.nav;
            
            document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            switch(navTarget) {
                case 'main':
                    showScreen('main-app-screen');
                    break;
                case 'raffles':
                    tg.showPopup({
                        title: "Розыгрыши",
                        message: "Раздел в разработке",
                        buttons: [{ type: "ok" }]
                    });
                    break;
                case 'top':
                    tg.showPopup({
                        title: "Топ игроков",
                        message: "Раздел в разработке",
                        buttons: [{ type: "ok" }]
                    });
                    break;
                case 'profile':
                    tg.showPopup({
                        title: "Профиль",
                        message: `Имя: ${username}\nБаланс: ${userBalance} звезд`,
                        buttons: [{ type: "ok" }]
                    });
                    break;
            }
        });
    });
}

function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";

    if (code.length === 5 && /^\d+$/.test(code)) {
        username = tg.initDataUnsafe.user?.username || 
                   tg.initDataUnsafe.user?.first_name || 
                   "User#" + (tg.initDataUnsafe.user?.id || 'GUEST');
        
        localStorage.setItem("username", username);
        showScreen('main-app-screen');
        tg.HapticFeedback.notificationOccurred('success');
    } else {
        msgElem.textContent = "❌ Неверный или неполный код!";
        tg.HapticFeedback.notificationOccurred('error');
    }
}

window.addEventListener("load", () => {
    tg.ready();
    tg.expand();
    tg.setHeaderColor("#f0f2f5");
    tg.setBackgroundColor("#f0f2f5");

    const savedUsername = localStorage.getItem("username");
    
    if (!savedUsername) {
        showScreen('login-screen');
    } else {
        username = savedUsername;
        showScreen('main-app-screen');
    }
    
    setupEventListeners();
    updateBalanceDisplay();
    renderPrizesGrid();
    setupNavigation();
});

function setupEventListeners() {
    document.getElementById('login-btn').addEventListener('click', login);
    
    document.getElementById('code-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') login();
    });

    document.getElementById('open-case-btn').addEventListener('click', () => {
        showScreen('case-screen');
    });

    document.getElementById('open-now-btn').addEventListener('click', startCaseOpening);

    document.getElementById('result-back-btn').addEventListener('click', () => {
        showScreen('main-app-screen');
    });

    document.getElementById('theme-switcher').addEventListener('click', toggleTheme);
}
