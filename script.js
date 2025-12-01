let username = "";

async function login() {
    const code = document.getElementById("code-input").value;
    const res = await fetch(`https://your-server-ip:8080/login?code=${code}`);
    const data = await res.json();
    const msg = document.getElementById("login-msg");

    if (data.ok) {
        username = data.username;
        document.getElementById("username").textContent = username;
        document.getElementById("login-screen").style.display = "none";
        document.getElementById("main-screen").style.display = "block";
    } else {
        msg.textContent = "Неверный код!";
    }
}

function openCase() {
    document.getElementById("result").style.display = "block";
    const emojis = ["🍎", "🍌", "🍒"];
    const probs = [0.5, 0.3, 0.2];
    let rnd = Math.random();
    let total = 0;
    for (let i=0;i<emojis.length;i++){
        total += probs[i];
        if(rnd <= total){
            document.getElementById("emoji").textContent = emojis[i];
            break;
        }
    }
}

function back() {
    document.getElementById("result").style.display = "none";
}