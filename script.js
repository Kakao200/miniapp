let username = "";

// Проверка сохранённого кода при загрузке
window.addEventListener("load", () => {
    const savedCode = localStorage.getItem("userCode");
    if (savedCode) {
        loginWithCode(savedCode);
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

    // Сохраняем код
    localStorage.setItem("userCode", code);

    loginWithCode(code);
}

// Вход с кодом
function loginWithCode(code) {
    fetch(`https://your-server-ip:PORT/login?code=${code}`)
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                username = data.username || data.id;
                document.getElementById("username").textContent = username;
                document.getElementById("login-screen").style.display = "none";
                document.getElementById("main-screen").style.display = "block";

                // WebApp готово, не закрываем
                Telegram.WebApp.ready();
            } else {
                alert("Неверный код!");
                localStorage.removeItem("userCode");
            }
        })
        .catch(err => console.error(err));
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
    localStorage.removeItem("userCode");
    document.getElementById("main-screen").style.display = "none";
    document.getElementById("login-screen").style.display = "block";
}