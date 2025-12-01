let username = "";

// Вход по коду
function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";

    if (!code) {
        msgElem.textContent = "Введите код!";
        return;
    }

    // Отправка кода боту через Telegram WebApp
    Telegram.WebApp.sendData(code);

    // После отправки можно закрыть экран входа (опционально)
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-screen").style.display = "block";

    // username бот пришлёт через Telegram чат, пока мы можем показать просто "Вы вошли"
    username = "Вы вошли!";
    document.getElementById("username").textContent = username;
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

// Кнопка "Назад" из результата
function back() {
    document.getElementById("result").style.display = "none";
}