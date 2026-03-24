let score = 0;
let time = 30;
let gameRunning = false;
let startTime;
let combo = 0;
let speed = 1000;
let spawnTimeout;
let gameTimer;

// Elements
const target = document.getElementById("target");
const scoreEl = document.getElementById("score");
const timeEl = document.getElementById("time");
const reactionEl = document.getElementById("reaction");
const startBtn = document.getElementById("startBtn");
const leaderboardEl = document.getElementById("leaderboard");
const gameArea = document.getElementById("gameArea");

// Canvas
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");

canvas.width = 600;
canvas.height = 400;

let particles = [];

// Sounds
const hitSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.wav");
const missSound = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-player-losing-or-failing-2042.wav");

// 🎮 START BUTTON
startBtn.onclick = () => {
  if (gameRunning) {
    // 🔁 If game is already running → end first
    endGame(true);
  }
  startGame();
};

function startGame() {
  score = 0;
  time = 30;
  combo = 0;
  speed = 1000;
  gameRunning = true;

  updateUI();
  spawnTarget();

  gameTimer = setInterval(() => {
    time--;
    timeEl.textContent = time;

    if (time <= 0) {
      endGame(false);
    }
  }, 1000);
}

// 🛑 END GAME (WITH OPTIONAL RESTART FLAG)
function endGame(isRestart) {
  gameRunning = false;

  clearInterval(gameTimer);
  clearTimeout(spawnTimeout);

  target.style.display = "none";

  saveScore(score);
  updateLeaderboard();

  // 🔥 End screen
  if (isRestart) {
    alert(`⚠️ Game Restarted!\nPrevious Score: ${score}`);
  } else {
    alert(`🔥 Game Over!\nFinal Score: ${score}`);
  }
}

function updateUI() {
  scoreEl.textContent = score;
  timeEl.textContent = time;
}

// 🎯 SPAWN TARGET (FIXED)
function spawnTarget() {
  if (!gameRunning) return;

  clearTimeout(spawnTimeout);

  const x = Math.random() * 550;
  const y = Math.random() * 350;

  target.style.left = x + "px";
  target.style.top = y + "px";
  target.style.display = "block";

  startTime = Date.now();

  spawnTimeout = setTimeout(() => {
    if (gameRunning) {
      combo = 0;
      missSound.play();
      spawnTarget();
    }
  }, speed);
}

// 🎯 CLICK
target.onclick = (e) => {
  clearTimeout(spawnTimeout);

  const reactionTime = Date.now() - startTime;
  reactionEl.textContent = reactionTime;

  hitSound.play();

  combo++;
  let multiplier = Math.min(combo, 5);
  score += multiplier;

  speed = Math.max(300, speed - 20);

  showFeedback(e, reactionTime);
  createParticles(e.offsetX + target.offsetLeft, e.offsetY + target.offsetTop);

  updateUI();
  spawnTarget();
};

// 🧠 FEEDBACK
function showFeedback(e, reactionTime) {
  let text = "OK";

  if (reactionTime < 200) text = "PERFECT ⚡";
  else if (reactionTime < 400) text = "GOOD 🔥";
  else text = "SLOW 🐢";

  const feedback = document.createElement("div");
  feedback.className = "feedback";
  feedback.innerText = text;

  feedback.style.left = e.offsetX + target.offsetLeft + "px";
  feedback.style.top = e.offsetY + target.offsetTop + "px";

  gameArea.appendChild(feedback);

  setTimeout(() => feedback.remove(), 600);
}

// 💥 PARTICLES
function createParticles(x, y) {
  for (let i = 0; i < 20; i++) {
    particles.push({
      x,
      y,
      dx: (Math.random() - 0.5) * 6,
      dy: (Math.random() - 0.5) * 6,
      life: 40
    });
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;

    ctx.fillStyle = `rgba(255,165,0,${p.life / 40})`;
    ctx.fillRect(p.x, p.y, 4, 4);

    if (p.life <= 0) particles.splice(i, 1);
  });

  requestAnimationFrame(animateParticles);
}

animateParticles();

// 🏆 LEADERBOARD
function saveScore(newScore) {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];
  scores.push(newScore);
  scores.sort((a, b) => b - a);
  scores = scores.slice(0, 5);

  localStorage.setItem("scores", JSON.stringify(scores));
}

function updateLeaderboard() {
  let scores = JSON.parse(localStorage.getItem("scores")) || [];

  leaderboardEl.innerHTML = "";
  scores.forEach((s, i) => {
    let li = document.createElement("li");
    li.textContent = `#${i + 1} - ${s}`;
    leaderboardEl.appendChild(li);
  });
}

updateLeaderboard();