let username = "";

// Проверяем, есть ли код в localStorage при загрузке
window.addEventListener("load", () => {
    const savedCode = localStorage.getItem("userCode");
    if (savedCode) {
        loginWithCode(savedCode);
    }
});

// Функция входа
function login() {
    const code = document.getElementById("code-input").value.trim();
    const msgElem = document.getElementById("login-msg");
    msgElem.textContent = "";

    if (!code) {
        msgElem.textContent = "Введите код!";
        return;
    }

    // Сохраняем код в localStorage
    localStorage.setItem("userCode", code);

    loginWithCode(code);
}

// Вход с кодом (используется и при повторном заходе)
function loginWithCode(code) {
    // Отправка кода боту через Telegram WebApp
    Telegram.WebApp.sendData(code);

    // Показываем основной экран
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("main-screen").style.display = "block";

    // username пока заглушкой
    username = "Вы вошли!";
    document.getElementById("username").textContent = username;

    // Предотвращаем закрытие WebApp
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

// Кнопка "Назад"
function back() {
    document.getElementById("result").style.display = "none";
}

// Кнопка "Выйти"
function logout() {
    localStorage.removeItem("userCode");
    document.getElementById("main-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
}