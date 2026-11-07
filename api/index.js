const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// In-Memory store (persists across warm serverless invocations)
// Default built-in apps and sample sites
const builtInSites = {
  welcome: {
    name: "welcome",
    title: "Willkommen bei Atlas",
    html: `
<div class="welcome-box">
  <h1>🚀 Willkommen bei Atlas Browser!</h1>
  <p>Du bist auf einer nativen Atlas-Seite (<strong>atlas://site/welcome</strong>).</p>
  <div class="cards">
    <div class="card">
      <h3>💻 Eigene Seiten bauen</h3>
      <p>Öffne den <strong>Atlas Editor</strong> und erstelle HTML, CSS und JavaScript.</p>
    </div>
    <div class="card">
      <h3>🌍 Direkt teilen</h3>
      <p>Klicke im Editor auf <em>Veröffentlichen</em> – deine Seite erhält sofort eine eigene URL!</p>
    </div>
  </div>
  <button id="go-editor" onclick="parent.postMessage({action:'navigate', url:'atlas://editor'}, '*')">Zum Editor wechseln</button>
</div>`,
    css: `
body {
  margin: 0;
  padding: 2rem;
  font-family: system-ui, -apple-system, sans-serif;
  background: radial-gradient(circle at top, #151d33, #070913);
  color: #e4e9ff;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  box-sizing: border-box;
}
.welcome-box {
  background: rgba(18, 24, 43, 0.85);
  border: 1px solid rgba(95, 211, 255, 0.2);
  border-radius: 20px;
  padding: 2.5rem;
  max-width: 600px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  backdrop-filter: blur(10px);
}
h1 {
  color: #5fd3ff;
  margin-top: 0;
  font-size: 2rem;
}
p {
  color: #9aa3c6;
  line-height: 1.6;
}
.cards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 2rem 0;
  text-align: left;
}
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  padding: 1rem;
  border-radius: 12px;
}
.card h3 {
  margin: 0 0 0.5rem;
  color: #3d7cff;
  font-size: 1.1rem;
}
.card p {
  margin: 0;
  font-size: 0.9rem;
}
#go-editor {
  background: linear-gradient(135deg, #3d7cff, #5fd3ff);
  border: none;
  color: #fff;
  padding: 0.8rem 1.6rem;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
#go-editor:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(61, 124, 255, 0.4);
}`,
    js: `console.log("Atlas Welcome Site geladen!");`,
    author: "Atlas Core Team",
    date: new Date().toISOString()
  },
  snake: {
    name: "snake",
    title: "Retro Snake Game",
    html: `
<div class="game-container">
  <h2>🐍 Retro Snake</h2>
  <div class="score-board">Punkte: <span id="score">0</span> | Highscore: <span id="highscore">0</span></div>
  <canvas id="game" width="360" height="360"></canvas>
  <div class="controls-hint">Steuerung: Pfeiltasten oder WASD</div>
  <button id="restart-btn" onclick="initGame()">Neustart</button>
</div>`,
    css: `
body {
  margin: 0;
  background: #05070b;
  color: #00ff88;
  font-family: 'Courier New', monospace;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}
.game-container {
  text-align: center;
  background: #0a101f;
  border: 2px solid #00ff88;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 0 30px rgba(0, 255, 136, 0.2);
}
h2 { margin: 0 0 0.5rem; font-size: 1.8rem; text-shadow: 0 0 10px #00ff88; }
.score-board { margin-bottom: 1rem; font-size: 1.1rem; color: #fff; }
canvas {
  background: #020408;
  border: 1px solid #1a2844;
  border-radius: 8px;
  display: block;
  margin: 0 auto;
}
.controls-hint { margin: 1rem 0; font-size: 0.85rem; color: #8899b7; }
#restart-btn {
  background: #00ff88;
  color: #05070b;
  border: none;
  font-family: inherit;
  font-weight: bold;
  padding: 0.6rem 1.4rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}
#restart-btn:hover { background: #5fffae; transform: scale(1.05); }`,
    js: `
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const grid = 18;
let count = 0;
let score = 0;
let highscore = parseInt(localStorage.getItem("atlas_snake_high") || "0");
document.getElementById("highscore").textContent = highscore;

let snake = { x: 144, y: 144, dx: grid, dy: 0, cells: [], maxCells: 4 };
let apple = { x: 288, y: 288 };

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function initGame() {
  score = 0;
  document.getElementById("score").textContent = score;
  snake.x = 144;
  snake.y = 144;
  snake.cells = [];
  snake.maxCells = 4;
  snake.dx = grid;
  snake.dy = 0;
  apple.x = getRandomInt(0, 20) * grid;
  apple.y = getRandomInt(0, 20) * grid;
}

function loop() {
  requestAnimationFrame(loop);
  if (++count < 6) return;
  count = 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  snake.x += snake.dx;
  snake.y += snake.dy;

  if (snake.x < 0) snake.x = canvas.width - grid;
  else if (snake.x >= canvas.width) snake.x = 0;
  if (snake.y < 0) snake.y = canvas.height - grid;
  else if (snake.y >= canvas.height) snake.y = 0;

  snake.cells.unshift({ x: snake.x, y: snake.y });
  if (snake.cells.length > snake.maxCells) snake.cells.pop();

  // Draw apple
  ctx.fillStyle = '#ff3366';
  ctx.shadowColor = '#ff3366';
  ctx.shadowBlur = 10;
  ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

  // Draw snake
  ctx.fillStyle = '#00ff88';
  ctx.shadowColor = '#00ff88';
  ctx.shadowBlur = 8;
  snake.cells.forEach((cell, index) => {
    ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);
    if (cell.x === apple.x && cell.y === apple.y) {
      snake.maxCells++;
      score += 10;
      document.getElementById("score").textContent = score;
      if (score > highscore) {
        highscore = score;
        localStorage.setItem("atlas_snake_high", highscore);
        document.getElementById("highscore").textContent = highscore;
      }
      apple.x = getRandomInt(0, 20) * grid;
      apple.y = getRandomInt(0, 20) * grid;
    }
    for (let i = index + 1; i < snake.cells.length; i++) {
      if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
        initGame();
      }
    }
  });
  ctx.shadowBlur = 0;
}

window.addEventListener("keydown", e => {
  if ((e.key === "ArrowLeft" || e.key === "a" || e.key === "A") && snake.dx === 0) {
    snake.dx = -grid; snake.dy = 0;
  } else if ((e.key === "ArrowUp" || e.key === "w" || e.key === "W") && snake.dy === 0) {
    snake.dy = -grid; snake.dx = 0;
  } else if ((e.key === "ArrowRight" || e.key === "d" || e.key === "D") && snake.dx === 0) {
    snake.dx = grid; snake.dy = 0;
  } else if ((e.key === "ArrowDown" || e.key === "s" || e.key === "S") && snake.dy === 0) {
    snake.dy = grid; snake.dx = 0;
  }
});

requestAnimationFrame(loop);
`,
    author: "Atlas Arcade",
    date: new Date().toISOString()
  }
};

const userSites = { ...builtInSites };

app.get("/api", (req, res) => {
  res.json({
    name: "Atlas Browser API",
    version: "2.0.0",
    status: "online",
    endpoints: ["/api/sites", "/api/site/:name", "/api/publish"]
  });
});

app.post("/api/publish", (req, res) => {
  const { name, html, css, js, author } = req.body || {};
  if (!name || typeof name !== "string" || !html) {
    return res.status(400).json({ success: false, error: "Name und HTML sind erforderlich." });
  }

  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  if (!cleanName) {
    return res.status(400).json({ success: false, error: "Ungültiger Seitenname." });
  }

  userSites[cleanName] = {
    name: cleanName,
    title: name,
    html,
    css: css || "",
    js: js || "",
    author: author || "Atlas Explorer",
    date: new Date().toISOString()
  };

  res.json({
    success: true,
    name: cleanName,
    url: `atlas://site/${cleanName}`,
    message: `Seite '${cleanName}' erfolgreich veröffentlicht!`
  });
});

app.get("/api/site/:name", (req, res) => {
  const rawName = (req.params.name || "").toLowerCase().trim();
  const site = userSites[rawName];
  if (!site) {
    return res.status(404).json({ error: `Seite '${rawName}' nicht gefunden.` });
  }
  res.json(site);
});

app.get("/api/sites", (req, res) => {
  const list = Object.keys(userSites).map(key => ({
    name: key,
    title: userSites[key].title || key,
    author: userSites[key].author || "Anonym",
    date: userSites[key].date || new Date().toISOString()
  }));
  res.json({ sites: list });
});

module.exports = app;
