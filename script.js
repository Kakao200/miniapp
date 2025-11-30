// Telegram WebApp API
const tg = window.Telegram.WebApp;

// Элементы UI
const loginScreen = document.getElementById("login-screen");
const mainScreen = document.getElementById("main-screen");
const caseScreen = document.getElementById("case-screen");

const nickname = document.getElementById("nickname");
const codeInput = document.getElementById("codeInput");

const loginBtn = document.getElementById("loginBtn");
const openCaseBtn = document.getElementById("openCaseBtn");
const rollBtn = document.getElementById("rollBtn");
const backBtn = document.getElementById("backBtn");

// ===== 1. ЛОГИН ЧЕРЕЗ КОД =====
loginBtn.onclick = () => {
    const code = codeInput.value.trim();

    if (!code) return alert("Введите код!");

    // Здесь запрос к серверу бота
    fetch(`https://your-server.com/login?code=${code}`)
        .then(r => r.json())
        .then(data => {
            if (!data.ok) return alert("Неверный код!");

            nickname.textContent = data.username;

            loginScreen.classList.add("hidden");
            mainScreen.classList.remove("hidden");
        });
};

// ===== 2. Переход к кейсу =====
openCaseBtn.onclick = () => {
    mainScreen.classList.add("hidden");
    caseScreen.classList.remove("hidden");
};

// ===== 3. "Открытие" кейса =====
rollBtn.onclick = () => {
    const items = ["😀", "😁", "😂", "😎", "🤩"]; // потом заменишь картинками
    const weights = [40, 25, 15, 10, 10];

    let sum = weights.reduce((a,b)=>a+b);
    let r = Math.random() * sum;

    let res;
    for (let i = 0; i < items.length; i++) {
        if (r < weights[i]) { res = items[i]; break; }
        r -= weights[i];
    }

    alert("Выпало: " + res);
};

// ===== 4. Назад =====
backBtn.onclick = () => {
    caseScreen.classList.add("hidden");
    mainScreen.classList.remove("hidden");
};