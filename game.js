// Oyun Değişkenleri
let playerName = "";
let gold = 0;
let round = 1;
let players = [];
let enemies = [];
let isGameRunning = false;

// Canvas Ayarları
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

// Oyun Başlatma
function startGame() {
    playerName = document.getElementById("player-name").value;
    if (!playerName) {
        alert("Lütfen bir isim girin!");
        return;
    }
    document.getElementById("login-screen").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    players = [{ name: playerName, health: 100, kills: 0 }];
    updatePlayersCount();
    spawnEnemies();
    gameLoop();
}

// Oyun Döngüsü
function gameLoop() {
    if (!isGameRunning) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawPlayers();
    drawEnemies();
    drawUI();
    requestAnimationFrame(gameLoop);
}

// Raunt Başlatma
function startRound() {
    isGameRunning = true;
    round++;
    if (round % 5 === 0) spawnBoss();
    spawnEnemies();
}

// Market İşlevleri
function openMarket() {
    document.getElementById("market").style.display = "block";
}

function closeMarket() {
    document.getElementById("market").style.display = "none";
}

function buyItem(item, cost) {
    if (gold >= cost) {
        gold -= cost;
        alert(`${item} satın alındı!`);
    } else {
        alert("Yeterli gold yok!");
    }
}

// Yardımcı Fonksiyonlar
function updatePlayersCount() {
    document.getElementById("count").textContent = players.length;
}

function spawnEnemies() {
    enemies = [];
    for (let i = 0; i < round * 2; i++) {
        enemies.push({
            x: Math.random() * canvas.width,
            y: -50,
            health: 50 + round * 10
        });
    }
}

function spawnBoss() {
    enemies.push({
        x: canvas.width / 2,
        y: -100,
        health: 500 + round * 50,
        isBoss: true
    });
}

// Çizim Fonksiyonları
function drawBackground() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawPlayers() {
    ctx.fillStyle = "blue";
    players.forEach(player => {
        ctx.fillRect(canvas.width / 2 - 25, canvas.height - 50, 50, 30);
    });
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.isBoss ? "red" : "green";
        ctx.fillRect(enemy.x - 20, enemy.y, 40, 40);
    });
}

function drawUI() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Raunt: ${round}`, 20, 30);
    ctx.fillText(`Gold: ${gold}`, 20, 60);
    ctx.fillText(`Kills: ${players[0].kills}`, 20, 90);
}
