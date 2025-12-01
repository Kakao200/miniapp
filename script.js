let username = "";

// Проверка сохранённого кода при загрузке
window.addEventListener("load", () => {
    const savedUsername = localStorage.getItem("username");
    if (savedUsername) {
        username = savedUsername;
        document.getElementById("username").textContent = username;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-screen").style.display = "block";

        Telegram.WebApp.ready();
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

    // В WebApp мы не отправляем код боту
    // Просто показываем основной экран
    username = Telegram.WebApp.initDataUnsafe.user?.username || Telegram.WebApp.initDataUnsafe.user?.id;
    document.getElementById("username").textContent = username;

    localStorage.setItem("username", username);

    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-screen").style.display = "block";

    Telegram.WebApp.ready();
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
}