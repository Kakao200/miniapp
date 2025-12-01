let username = "";
let tg = window.Telegram.WebApp;

// Проверка сохранённого логина при загрузке
window.addEventListener("load", () => {
    tg.ready();
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        username = savedUsername;
        showMainScreen();
    }
});

// Функция нажатия кнопки "Войти"
function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";

    if (!code) {
        msgElem.textContent = "Введите код!";
        return;
    }

    // Проверяем код локально (без отправки боту)
    // В реальном приложении здесь должна быть проверка через бекенд
    if (code.length === 5 && /^\d+$/.test(code)) {
        // Используем данные пользователя из Telegram WebApp
        username = tg.initDataUnsafe.user?.username || 
                   tg.initDataUnsafe.user?.first_name || 
                   "User#" + tg.initDataUnsafe.user?.id;
        
        localStorage.setItem("username", username);
        showMainScreen();
    } else {
        msgElem.textContent = "Неверный код!";
    }
}

function showMainScreen() {
    document.getElementById("username").textContent = username;
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-screen").style.display = "block";
}

// Открытие кейса
function openCase() {
    document.getElementById("result").style.display = "block";
    const emojis = ["🍎", "🍌", "🍒"];
    const probs = [0.5, 0.3, 0.2];

    let rnd = Math.random();
    let total = 0;

    for (let i = 0; i < emojis.length; i++) {
        total += probs[i];
        if (rnd <= total) {
            document.getElementById("emoji").textContent = emojis[i];
            break;
        }
    }
}

// Назад из кейса
function back() {
    document.getElementById("result").style.display = "none";
}

// Выйти из профиля
function logout() {
    localStorage.removeItem("username");
    document.getElementById("main-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
    document.getElementById("code-input").value = "";
}