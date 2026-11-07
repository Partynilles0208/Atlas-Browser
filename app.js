// ==========================================
// ATLAS BROWSER V2 - CORE JAVASCRIPT ENGINE
// ==========================================

// API Base URL Detection (Vercel, Localhost, or Fallback)
const ATLAS_API_BASE = (() => {
  const host = window.location.hostname;
  if (host.includes("vercel.app") || host === "localhost" || host === "127.0.0.1") {
    return window.location.origin;
  }
  return "https://atlas-browser-2.onrender.com";
})();

// ==================== STATE & TABS ====================
let tabs = [];
let activeTabId = null;

let settings = {
  theme: localStorage.getItem("atlas_theme") || "dark",
  searchEngine: localStorage.getItem("atlas_search_engine") || "duckduckgo",
  recentVisits: JSON.parse(localStorage.getItem("atlas_recent_visits") || "[]")
};

// Search engine URL mappings
const SEARCH_ENGINES = {
  duckduckgo: { name: "🦆 DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  google: { name: "🔍 Google", url: "https://www.google.com/search?q=" },
  bing: { name: "🟦 Bing", url: "https://www.bing.com/search?q=" },
  ecosia: { name: "🌳 Ecosia", url: "https://www.ecosia.org/search?q=" }
};

// Built-in Apps & Templates for Store & Editor
const BUILTIN_APPS = [
  {
    id: "snake",
    title: "Retro Snake Arcade",
    category: "games",
    icon: "🐍",
    tag: "Game",
    desc: "Klassisches Snake-Spiel mit Score, Highscore und Neon-Canvas-Grafik.",
    html: `<div class="box"><h2>🐍 Retro Snake</h2><div class="score">Punkte: <span id="s">0</span> | Rekord: <span id="h">0</span></div><canvas id="c" width="340" height="340"></canvas><p>Steuerung: Pfeiltasten / WASD</p><button onclick="reset()">Neustart</button></div>`,
    css: `body{margin:0;background:#05070b;color:#00ff88;font-family:monospace;display:flex;justify-content:center;align-items:center;min-height:100vh;text-align:center}.box{background:#0a101f;padding:1.5rem;border-radius:12px;border:2px solid #00ff88;box-shadow:0 0 25px rgba(0,255,136,0.2)}canvas{background:#020408;border:1px solid #1a2844;border-radius:6px;display:block;margin:10px auto}button{background:#00ff88;color:#05070b;border:none;font-weight:bold;padding:8px 16px;border-radius:6px;cursor:pointer}`,
    js: `const c=document.getElementById("c"),ctx=c.getContext("2d"),grid=17;let count=0,score=0,high=parseInt(localStorage.getItem("snk_h")||"0");document.getElementById("h").textContent=high;let snake={x:136,y:136,dx:grid,dy:0,cells:[],max:4},apple={x:68,y:68};function reset(){score=0;document.getElementById("s").textContent=0;snake.x=136;snake.y=136;snake.cells=[];snake.max=4;snake.dx=grid;snake.dy=0;apple.x=Math.floor(Math.random()*20)*grid;apple.y=Math.floor(Math.random()*20)*grid;}function loop(){requestAnimationFrame(loop);if(++count<6)return;count=0;ctx.clearRect(0,0,c.width,c.height);snake.x+=snake.dx;snake.y+=snake.dy;if(snake.x<0)snake.x=c.width-grid;else if(snake.x>=c.width)snake.x=0;if(snake.y<0)snake.y=c.height-grid;else if(snake.y>=c.height)snake.y=0;snake.cells.unshift({x:snake.x,y:snake.y});if(snake.cells.length>snake.max)snake.cells.pop();ctx.fillStyle="#ff3366";ctx.fillRect(apple.x,apple.y,grid-1,grid-1);ctx.fillStyle="#00ff88";snake.cells.forEach((cell,idx)=>{ctx.fillRect(cell.x,cell.y,grid-1,grid-1);if(cell.x===apple.x&&cell.y===apple.y){snake.max++;score+=10;document.getElementById("s").textContent=score;if(score>high){high=score;localStorage.setItem("snk_h",high);document.getElementById("h").textContent=high;}apple.x=Math.floor(Math.random()*20)*grid;apple.y=Math.floor(Math.random()*20)*grid;}for(let i=idx+1;i<snake.cells.length;i++){if(cell.x===snake.cells[i].x&&cell.y===snake.cells[i].y)reset();}});}window.addEventListener("keydown",e=>{if((e.key==="ArrowLeft"||e.key==="a")&&snake.dx===0){snake.dx=-grid;snake.dy=0;}else if((e.key==="ArrowUp"||e.key==="w")&&snake.dy===0){snake.dy=-grid;snake.dx=0;}else if((e.key==="ArrowRight"||e.key==="d")&&snake.dx===0){snake.dx=grid;snake.dy=0;}else if((e.key==="ArrowDown"||e.key==="s")&&snake.dy===0){snake.dy=grid;snake.dx=0;}});reset();requestAnimationFrame(loop);`
  },
  {
    id: "paint",
    title: "Neon Canvas Paint",
    category: "creative",
    icon: "🎨",
    tag: "Creative",
    desc: "Zeichne bunte Neon-Bilder mit anpassbaren Pinseln und Farben.",
    html: `<div class="paint-wrap"><div class="toolbar"><input type="color" id="col" value="#00ffff"><input type="range" id="size" min="1" max="50" value="5"><button id="clr">Löschen</button></div><canvas id="cv" width="600" height="400"></canvas></div>`,
    css: `body{margin:0;background:#060810;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:sans-serif}.paint-wrap{background:#111625;padding:1rem;border-radius:12px;border:1px solid #3d7cff}.toolbar{display:flex;gap:1rem;align-items:center;margin-bottom:10px}canvas{background:#000;border:1px solid #233050;border-radius:8px;cursor:crosshair}button{background:#3d7cff;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer}`,
    js: `const c=document.getElementById("cv"),ctx=c.getContext("2d");let draw=false;c.onmousedown=()=>draw=true;window.onmouseup=()=>draw=false;c.onmousemove=e=>{if(!draw)return;const r=c.getBoundingClientRect();ctx.fillStyle=document.getElementById("col").value;ctx.beginPath();ctx.arc(e.clientX-r.left,e.clientY-r.top,document.getElementById("size").value,0,Math.PI*2);ctx.fill();};document.getElementById("clr").onclick=()=>ctx.clearRect(0,0,c.width,c.height);`
  },
  {
    id: "calc",
    title: "Calculator Neo",
    category: "tools",
    icon: "🧮",
    tag: "Tool",
    desc: "Moderner Taschenrechner im futuristischen Glasmorphism-Look.",
    html: `<div class="calc"><div id="display">0</div><div class="keys"><button class="op" onclick="c()">C</button><button class="op" onclick="a('/')">/</button><button class="op" onclick="a('*')">*</button><button class="op" onclick="d()">⌫</button><button onclick="a('7')">7</button><button onclick="a('8')">8</button><button onclick="a('9')">9</button><button class="op" onclick="a('-')">-</button><button onclick="a('4')">4</button><button onclick="a('5')">5</button><button onclick="a('6')">6</button><button class="op" onclick="a('+')">+</button><button onclick="a('1')">1</button><button onclick="a('2')">2</button><button onclick="a('3')">3</button><button class="eq" onclick="e()">=</button><button class="zero" onclick="a('0')">0</button><button onclick="a('.')">.</button></div></div>`,
    css: `body{margin:0;background:#05070b;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:sans-serif}.calc{background:#0e1424;border:1px solid #263353;border-radius:18px;padding:1.5rem;box-shadow:0 15px 35px rgba(0,0,0,0.6);width:260px}#display{background:#060810;color:#5fd3ff;font-size:2rem;text-align:right;padding:1rem;border-radius:10px;margin-bottom:1rem;overflow:hidden}.keys{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}button{background:#162038;color:#fff;border:none;padding:14px;border-radius:10px;font-size:1.1rem;cursor:pointer;transition:background 0.15s}button:hover{background:#233257}.op{background:#2b3c66;color:#5fd3ff}.eq{background:#3d7cff;grid-row:span 2;height:100%}.zero{grid-column:span 2}`,
    js: `const disp=document.getElementById("display");function a(v){if(disp.textContent==='0'&&v!=='.')disp.textContent=v;else disp.textContent+=v;}function c(){disp.textContent='0';}function d(){disp.textContent=disp.textContent.slice(0,-1)||'0';}function e(){try{disp.textContent=eval(disp.textContent.replace(/[^0-9+\\-*./]/g,''));}catch(err){disp.textContent='Error';}}`
  },
  {
    id: "matrix",
    title: "Matrix Digital Rain",
    category: "creative",
    icon: "🌧️",
    tag: "Visual",
    desc: "Der legendäre digitale Regen aus grünen Glyphen im Terminal-Stil.",
    html: `<canvas id="matrix"></canvas>`,
    css: `body{margin:0;overflow:hidden;background:#000}canvas{display:block}`,
    js: `const c=document.getElementById("matrix"),ctx=c.getContext("2d");c.width=window.innerWidth;c.height=window.innerHeight;const chars="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+-/<>~";const fontSize=16,cols=c.width/fontSize,drops=Array(Math.floor(cols)).fill(1);function draw(){ctx.fillStyle="rgba(0,0,0,0.05)";ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#00ff66";ctx.font=fontSize+"px monospace";for(let i=0;i<drops.length;i++){const text=chars.charAt(Math.floor(Math.random()*chars.length));ctx.fillText(text,i*fontSize,drops[i]*fontSize);if(drops[i]*fontSize>c.height&&Math.random()>0.975)drops[i]=0;drops[i]++;}}setInterval(draw,33);`
  },
  {
    id: "pomodoro",
    title: "Pomodoro Focus Timer",
    category: "tools",
    icon: "⏱️",
    tag: "Tool",
    desc: "Produktivitäts-Timer mit Arbeits- und Pausen-Intervallen.",
    html: `<div class="pomo"><h2>Focus Timer</h2><div id="time">25:00</div><div class="btns"><button onclick="start()">Start</button><button onclick="pause()">Pause</button><button onclick="reset()">Reset</button></div></div>`,
    css: `body{margin:0;background:#0b0d17;color:#fff;display:flex;justify-content:center;align-items:center;min-height:100vh;font-family:sans-serif}.pomo{background:#13182c;padding:2.5rem;border-radius:20px;border:1px solid #3d7cff;text-align:center}#time{font-size:4rem;font-weight:700;color:#5fd3ff;margin:1rem 0}.btns{display:flex;gap:10px;justify-content:center}button{background:#3d7cff;border:none;color:#fff;padding:10px 20px;border-radius:30px;cursor:pointer;font-weight:bold}`,
    js: `let t=1500,timer=null;function update(){const m=Math.floor(t/60).toString().padStart(2,'0'),s=(t%60).toString().padStart(2,'0');document.getElementById("time").textContent=m+':'+s;}function start(){if(!timer)timer=setInterval(()=>{if(t>0){t--;update();}else{clearInterval(timer);timer=null;alert("Zeit abgelaufen!");}},1000);}function pause(){clearInterval(timer);timer=null;}function reset(){pause();t=1500;update();}`
  }
];

// Pre-populate built-in apps into LocalStorage site cache if not exists
function syncBuiltinsToLocalCache() {
  BUILTIN_APPS.forEach(app => {
    const key = "atlas_site_" + app.id;
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify({
        name: app.id,
        title: app.title,
        html: app.html,
        css: app.css,
        js: app.js,
        author: "Atlas Built-In",
        date: new Date().toISOString()
      }));
    }
  });
}
syncBuiltinsToLocalCache();

// ==================== SCREENS & DOM ELEMENTS ====================
const screens = {
  home: document.getElementById("home-screen"),
  editor: document.getElementById("editor-screen"),
  store: document.getElementById("store-screen"),
  docs: document.getElementById("docs-screen"),
  community: document.getElementById("community-screen"),
  settings: document.getElementById("settings-screen"),
  webview: document.getElementById("webview-screen")
};

const urlInput = document.getElementById("url-input");
const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");
const btnHome = document.getElementById("btn-home");
const btnClearUrl = document.getElementById("btn-clear-url");
const micButton = document.getElementById("mic-button");
const homeMicButton = document.getElementById("home-mic-button");

// Tab bar
const tabList = document.getElementById("tab-list");
const btnAddTab = document.getElementById("btn-add-tab");

// ==================== TOAST NOTIFICATIONS ====================
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(10px)";
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ==================== THEME MANAGEMENT ====================
function applyTheme(themeName) {
  document.body.setAttribute("data-theme", themeName);
  settings.theme = themeName;
  localStorage.setItem("atlas_theme", themeName);
  document.querySelectorAll(".theme-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === themeName);
  });
}
applyTheme(settings.theme);

// Theme buttons in settings
document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.onclick = () => applyTheme(btn.dataset.theme);
});

// ==================== CLOCK & GREETING ====================
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, "0");
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const clockEl = document.getElementById("home-clock");
  if (clockEl) clockEl.textContent = `${hours}:${minutes}`;

  const dateEl = document.getElementById("home-date");
  if (dateEl) {
    const options = { weekday: "long", day: "numeric", month: "long" };
    dateEl.textContent = now.toLocaleDateString("de-DE", options);
  }

  const saluteEl = document.getElementById("home-salute");
  if (saluteEl) {
    if (hours < 12) saluteEl.textContent = "Guten Morgen, Explorer";
    else if (hours < 18) saluteEl.textContent = "Guten Tag, Explorer";
    else saluteEl.textContent = "Guten Abend, Explorer";
  }
}
setInterval(updateClock, 1000);
updateClock();

// Favoriten Buttons Handlers
document.querySelectorAll(".fav-chip[data-url]").forEach(chip => {
  chip.onclick = () => navigate(chip.dataset.url);
});

const btnCustomBookmark = document.getElementById("btn-custom-bookmark");
if (btnCustomBookmark) {
  btnCustomBookmark.onclick = () => {
    const name = prompt("Name des Favoriten (z. B. Twitch):");
    if (!name) return;
    let url = prompt("Adresse (z. B. twitch.tv oder https://...):");
    if (!url) return;
    if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("atlas://")) {
      url = "https://" + url;
    }
    const container = document.getElementById("home-favorites-row");
    const chip = document.createElement("button");
    chip.className = "fav-chip";
    chip.setAttribute("data-url", url);
    chip.innerHTML = `<span class="fav-icon" style="background:rgba(61,124,255,0.2);color:#5fd3ff;">★</span><span class="fav-name">${name}</span>`;
    chip.onclick = () => navigate(url);
    container.insertBefore(chip, btnCustomBookmark);
    showToast(`Favorit "${name}" hinzugefügt!`, "success");
  };
}

// ==================== TAB MANAGEMENT ====================
function createTab(initialUrl = "atlas://home") {
  const tabId = "tab_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const newTab = {
    id: tabId,
    title: getTitleForUrl(initialUrl),
    url: initialUrl,
    historyStack: [initialUrl],
    historyIndex: 0
  };

  tabs.push(newTab);
  renderTabs();
  activateTab(tabId);
  return newTab;
}

function activateTab(tabId) {
  const tab = tabs.find(t => t.id === tabId);
  if (!tab) return;
  activeTabId = tabId;
  renderTabs();
  navigate(tab.url, false);
}

function closeTab(tabId, event) {
  if (event) event.stopPropagation();
  if (tabs.length <= 1) {
    // If only one tab left, reset to home
    const tab = tabs[0];
    tab.url = "atlas://home";
    tab.title = "Startseite";
    tab.historyStack = ["atlas://home"];
    tab.historyIndex = 0;
    renderTabs();
    navigate("atlas://home", false);
    return;
  }

  const idx = tabs.findIndex(t => t.id === tabId);
  tabs = tabs.filter(t => t.id !== tabId);

  if (activeTabId === tabId) {
    const nextTab = tabs[idx] || tabs[idx - 1] || tabs[0];
    activateTab(nextTab.id);
  } else {
    renderTabs();
  }
}

function renderTabs() {
  tabList.innerHTML = "";
  tabs.forEach(tab => {
    const tabEl = document.createElement("div");
    tabEl.className = `tab-item ${tab.id === activeTabId ? "active" : ""}`;
    tabEl.onclick = () => activateTab(tab.id);

    const titleEl = document.createElement("span");
    titleEl.className = "tab-title";
    titleEl.textContent = tab.title || "Atlas";

    const closeBtn = document.createElement("button");
    closeBtn.className = "tab-close-btn";
    closeBtn.textContent = "×";
    closeBtn.title = "Tab schließen";
    closeBtn.onclick = (e) => closeTab(tab.id, e);

    tabEl.appendChild(titleEl);
    tabEl.appendChild(closeBtn);
    tabList.appendChild(tabEl);
  });
}

function getTitleForUrl(url) {
  if (url === "atlas://home") return "Startseite";
  if (url === "atlas://editor") return "Editor";
  if (url === "atlas://store") return "Store";
  if (url === "atlas://docs") return "Docs";
  if (url === "atlas://community") return "Community";
  if (url === "atlas://settings") return "Einstellungen";
  if (url.startsWith("atlas://site/")) {
    const name = url.replace("atlas://site/", "");
    return "Site: " + name;
  }
  return url.replace(/^https?:\/\//, "").slice(0, 20);
}

btnAddTab.onclick = () => createTab("atlas://home");

// ==================== NAVIGATION ENGINE ====================
function getActiveTab() {
  return tabs.find(t => t.id === activeTabId);
}

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  if (screens[name]) {
    screens[name].classList.add("active");
  }
}

function recordRecentVisit(url) {
  if (url.startsWith("atlas://site/") || url.startsWith("http")) {
    let list = settings.recentVisits.filter(u => u !== url);
    list.unshift(url);
    if (list.length > 8) list = list.slice(0, 8);
    settings.recentVisits = list;
    localStorage.setItem("atlas_recent_visits", JSON.stringify(list));
    renderRecentVisits();
  }
}

function renderRecentVisits() {
  const container = document.getElementById("recent-chips");
  if (!container) return;
  container.innerHTML = "";
  if (!settings.recentVisits || settings.recentVisits.length === 0) {
    container.innerHTML = `<span style="color:var(--text-muted);font-size:0.8rem;">Noch keine Seiten besucht.</span>`;
    return;
  }

  settings.recentVisits.forEach(url => {
    const chip = document.createElement("button");
    chip.className = "recent-chip";
    chip.innerHTML = `<span>🔗</span> <span>${url.replace(/^https?:\/\//, "")}</span>`;
    chip.onclick = () => navigate(url);
    container.appendChild(chip);
  });
}
renderRecentVisits();

function navigate(targetUrl, push = true) {
  if (!targetUrl) return;
  let url = targetUrl.trim();

  // Smart URL parser
  if (!url.startsWith("atlas://") && !url.startsWith("http://") && !url.startsWith("https://")) {
    // Check if it's a domain name (contains . and no spaces)
    if (!url.includes(" ") && url.includes(".") && !url.startsWith("?")) {
      url = "https://" + url;
    } else {
      // Search Query
      const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.duckduckgo;
      url = engine.url + encodeURIComponent(url);
    }
  }

  const tab = getActiveTab();
  if (tab) {
    tab.url = url;
    tab.title = getTitleForUrl(url);

    if (push) {
      tab.historyStack = tab.historyStack.slice(0, tab.historyIndex + 1);
      tab.historyStack.push(url);
      tab.historyIndex++;
    }
  }

  renderTabs();
  urlInput.value = url;
  updateNavButtons();
  recordRecentVisit(url);

  // Update protocol badge
  const badge = document.getElementById("url-protocol-badge");
  if (url.startsWith("atlas://")) {
    badge.textContent = "atlas://";
    badge.style.display = "inline-block";
  } else if (url.startsWith("https://")) {
    badge.textContent = "https://";
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }

  // Handle Atlas Internal Screens
  if (url === "atlas://home") return showScreen("home");
  if (url === "atlas://editor") return showScreen("editor");
  if (url === "atlas://store") {
    renderStoreGrid();
    return showScreen("store");
  }
  if (url === "atlas://docs") return showScreen("docs");
  if (url === "atlas://community") {
    loadCommunitySites();
    return showScreen("community");
  }
  if (url === "atlas://settings") return showScreen("settings");

  // Handle Atlas Sites (atlas://site/name)
  if (url.startsWith("atlas://site/")) {
    const siteName = url.replace("atlas://site/", "").trim();
    loadAtlasSite(siteName);
    return;
  }

  // Real External Web View
  showScreen("webview");
  const iframe = document.getElementById("webview-frame");
  const display = document.getElementById("webview-url-display");
  const blockedNotice = document.getElementById("webview-blocked-notice");

  blockedNotice.style.display = "none";
  iframe.style.display = "block";
  iframe.src = url;
  display.textContent = url;

  // Setup blocked iframe fallback button
  document.getElementById("btn-blocked-open-external").onclick = () => {
    window.open(url, "_blank");
  };
}

function updateNavButtons() {
  const tab = getActiveTab();
  if (!tab) {
    btnBack.disabled = true;
    btnForward.disabled = true;
    return;
  }
  btnBack.disabled = tab.historyIndex <= 0;
  btnForward.disabled = tab.historyIndex >= tab.historyStack.length - 1;
}

// Nav Button Handlers
btnBack.onclick = () => {
  const tab = getActiveTab();
  if (tab && tab.historyIndex > 0) {
    tab.historyIndex--;
    navigate(tab.historyStack[tab.historyIndex], false);
  }
};

btnForward.onclick = () => {
  const tab = getActiveTab();
  if (tab && tab.historyIndex < tab.historyStack.length - 1) {
    tab.historyIndex++;
    navigate(tab.historyStack[tab.historyIndex], false);
  }
};

btnReload.onclick = () => {
  const tab = getActiveTab();
  if (tab && tab.historyIndex >= 0) {
    navigate(tab.historyStack[tab.historyIndex], false);
    showToast("Seite neu geladen", "info");
  }
};

btnHome.onclick = () => navigate("atlas://home");

btnClearUrl.onclick = () => {
  urlInput.value = "";
  urlInput.focus();
};

urlInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    navigate(urlInput.value);
  }
});

// Quick bar actions
document.getElementById("btn-quick-editor").onclick = () => navigate("atlas://editor");
document.getElementById("btn-quick-store").onclick = () => navigate("atlas://store");
document.getElementById("btn-quick-settings").onclick = () => navigate("atlas://settings");

// Home Quick Tiles
document.querySelectorAll(".quick-tile").forEach(tile => {
  tile.onclick = () => navigate(tile.dataset.target);
});

// Home Search bar
const homeUrlInput = document.getElementById("home-url-input");
if (homeUrlInput) {
  homeUrlInput.addEventListener("keydown", e => {
    if (e.key === "Enter") navigate(e.target.value);
  });
}

// Search engine selector badge on home
const homeEngineBadge = document.getElementById("home-engine-badge");
function updateEngineBadge() {
  const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.duckduckgo;
  if (homeEngineBadge) homeEngineBadge.textContent = engine.name;
  const select = document.getElementById("setting-search-engine");
  if (select) select.value = settings.searchEngine;
}
updateEngineBadge();

if (homeEngineBadge) {
  homeEngineBadge.onclick = () => {
    const keys = Object.keys(SEARCH_ENGINES);
    const currIdx = keys.indexOf(settings.searchEngine);
    const nextKey = keys[(currIdx + 1) % keys.length];
    settings.searchEngine = nextKey;
    localStorage.setItem("atlas_search_engine", nextKey);
    updateEngineBadge();
    showToast("Suchmaschine: " + SEARCH_ENGINES[nextKey].name, "info");
  };
}

const engineSelect = document.getElementById("setting-search-engine");
if (engineSelect) {
  engineSelect.onchange = (e) => {
    settings.searchEngine = e.target.value;
    localStorage.setItem("atlas_search_engine", e.target.value);
    updateEngineBadge();
    showToast("Suchmaschine gespeichert", "success");
  };
}

// ==================== SPEECH RECOGNITION ====================
function setupSpeechRecognition(triggerBtn, targetInput) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    triggerBtn.onclick = () => {
      showToast("Spracherkennung wird von diesem Browser nicht unterstützt.", "error");
    };
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  let isListening = false;

  triggerBtn.onclick = () => {
    if (isListening) {
      recognition.stop();
      return;
    }
    try {
      recognition.start();
      isListening = true;
      triggerBtn.classList.add("listening");
      showToast("🎙️ Zuhören... Bitte sprechen", "info");
    } catch (err) {
      isListening = false;
      triggerBtn.classList.remove("listening");
    }
  };

  recognition.onresult = (e) => {
    const transcript = e.results[0][0].transcript;
    targetInput.value = transcript;
    showToast(`Erkannt: "${transcript}"`, "success");
    navigate(transcript);
  };

  recognition.onspeechend = () => {
    recognition.stop();
    isListening = false;
    triggerBtn.classList.remove("listening");
  };

  recognition.onerror = (e) => {
    isListening = false;
    triggerBtn.classList.remove("listening");
    showToast("Sprachfehler: " + (e.error || "Unbekannt"), "error");
  };
}
setupSpeechRecognition(micButton, urlInput);
setupSpeechRecognition(homeMicButton, homeUrlInput);

// ==================== ATLAS SITE LOADER ====================
async function loadAtlasSite(siteName) {
  showScreen("webview");
  const iframe = document.getElementById("webview-frame");
  const display = document.getElementById("webview-url-display");
  display.textContent = "atlas://site/" + siteName;

  // 1. Check local cache first (instant load & offline support)
  const localCacheKey = "atlas_site_" + siteName;
  const localData = localStorage.getItem(localCacheKey);
  if (localData) {
    try {
      const site = JSON.parse(localData);
      renderSiteInIframe(iframe, site);
      return;
    } catch (e) {}
  }

  // 2. Fetch from Atlas API
  try {
    const res = await fetch(ATLAS_API_BASE + "/api/site/" + siteName);
    if (!res.ok) throw new Error("Nicht gefunden");
    const site = await res.json();

    if (site.error) {
      display.textContent = `Seite '${siteName}' existiert nicht.`;
      iframe.srcdoc = `
        <body style="font-family:sans-serif;background:#05070b;color:#e4e9ff;text-align:center;padding:3rem;">
          <h2 style="color:#ff5555;">404 - Atlas Seite nicht gefunden</h2>
          <p>Die Seite <code>atlas://site/${siteName}</code> existiert nicht.</p>
          <button style="background:#3d7cff;color:#fff;border:none;padding:10px 20px;border-radius:20px;cursor:pointer;"
                  onclick="parent.postMessage({action:'navigate',url:'atlas://editor'},'*')">
            Im Editor neu anlegen
          </button>
        </body>`;
      return;
    }

    // Cache locally
    localStorage.setItem(localCacheKey, JSON.stringify(site));
    renderSiteInIframe(iframe, site);

  } catch (err) {
    display.textContent = `Fehler beim Laden von '${siteName}'`;
    iframe.srcdoc = `
      <body style="font-family:sans-serif;background:#05070b;color:#e4e9ff;text-align:center;padding:3rem;">
        <h2 style="color:#ff5555;">Verbindungsfehler</h2>
        <p>Die Seite konnte weder lokal noch über den Server <code>${ATLAS_API_BASE}</code> geladen werden.</p>
      </body>`;
  }
}

function renderSiteInIframe(iframe, site) {
  const doc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>${site.css || ""}</style>
      </head>
      <body>
        ${site.html || ""}
        <script>
          try {
            ${site.js || ""}
          } catch(err) {
            console.error("Atlas Script Fehler:", err);
          }
        <\/script>
      </body>
    </html>
  `;
  iframe.srcdoc = doc;
}

// Listen to postMessage from iframe
window.addEventListener("message", (e) => {
  if (e.data && e.data.action === "navigate") {
    navigate(e.data.url);
  }
});

// WebView Toolbar actions
document.getElementById("btn-webview-reload").onclick = () => {
  const iframe = document.getElementById("webview-frame");
  if (iframe.srcdoc) {
    const src = iframe.srcdoc;
    iframe.srcdoc = "";
    setTimeout(() => { iframe.srcdoc = src; }, 50);
  } else if (iframe.src) {
    iframe.src = iframe.src;
  }
  showToast("Vorschau neu geladen", "info");
};

document.getElementById("btn-webview-copy").onclick = () => {
  const url = document.getElementById("webview-url-display").textContent;
  navigator.clipboard.writeText(url).then(() => {
    showToast("URL in Zwischenablage kopiert!", "success");
  });
};

document.getElementById("btn-webview-external").onclick = () => {
  const iframe = document.getElementById("webview-frame");
  if (iframe.src && !iframe.src.startsWith("about:") && !iframe.srcdoc) {
    window.open(iframe.src, "_blank");
  } else {
    showToast("Atlas-interne Seiten laufen direkt im Browser", "info");
  }
};

// ==================== EDITOR ENGINE ====================
const editorTabs = document.querySelectorAll(".editor-tab");
const editorPanels = document.querySelectorAll(".editor-panel");

editorTabs.forEach(tab => {
  tab.onclick = () => {
    editorTabs.forEach(t => t.classList.remove("active"));
    editorPanels.forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("editor-" + tab.dataset.tab).classList.add("active");
  };
});

const editorHTML = document.getElementById("editor-html");
const editorCSS = document.getElementById("editor-css");
const editorJS = document.getElementById("editor-js");
const previewFrame = document.getElementById("editor-preview");
const consoleOutput = document.getElementById("editor-console-output");

function runEditorCode() {
  consoleOutput.innerHTML = "";
  const code = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>${editorCSS.value}</style>
      </head>
      <body>
        ${editorHTML.value}
        <script>
          // Console interceptor
          ['log', 'warn', 'error'].forEach(type => {
            const original = console[type];
            console[type] = function(...args) {
              original.apply(console, args);
              window.parent.postMessage({
                type: 'atlas-console',
                level: type,
                msg: args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')
              }, '*');
            };
          });

          try {
            ${editorJS.value}
          } catch(err) {
            console.error(err.message);
          }
        <\/script>
      </body>
    </html>
  `;
  previewFrame.srcdoc = code;
}

document.getElementById("btn-run").onclick = runEditorCode;

// Run shortcut (Ctrl+Enter)
window.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    runEditorCode();
    showToast("▶ Vorschau aktualisiert", "info");
  }
  if ((e.ctrlKey || e.metaKey) && e.key === "s") {
    e.preventDefault();
    saveProjectLocally();
  }
});

// Console logger listener
window.addEventListener("message", (e) => {
  if (e.data && e.data.type === "atlas-console") {
    const entry = document.createElement("div");
    entry.className = `console-entry ${e.data.level}`;
    entry.textContent = `[${e.data.level}] ${e.data.msg}`;
    consoleOutput.appendChild(entry);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;
  }
});

document.getElementById("btn-clear-console").onclick = () => {
  consoleOutput.innerHTML = "";
};

// Fullscreen preview button
document.getElementById("btn-fullscreen-preview").onclick = () => {
  const site = {
    html: editorHTML.value,
    css: editorCSS.value,
    js: editorJS.value
  };
  showScreen("webview");
  const iframe = document.getElementById("webview-frame");
  renderSiteInIframe(iframe, site);
  document.getElementById("webview-url-display").textContent = "atlas://editor/fullscreen";
};

// Template Selector
const templateSelect = document.getElementById("template-select");
const TEMPLATES = {
  starter: {
    title: "Starter-Projekt",
    html: `<h1>Hallo Atlas Explorer! 🚀</h1>\n<p>Bearbeite diesen Text im Editor.</p>\n<button id="btn">Klick mich</button>`,
    css: `body { font-family: system-ui; background: #0b0f19; color: #5fd3ff; text-align: center; padding: 3rem; }\nbutton { background: #3d7cff; color: #fff; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer; }`,
    js: `document.getElementById("btn").onclick = () => alert("Super gemacht!");`
  },
  card: {
    title: "Cyberpunk-Karte",
    html: `<div class="card">\n  <div class="tag">CYBER // 2077</div>\n  <h2>Atlas Protocol</h2>\n  <p>Dezentrales Web-Betriebssystem für Entwickler.</p>\n  <button class="neon-btn">ENTER CYBERSPACE</button>\n</div>`,
    css: `body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #050014; font-family: sans-serif; }\n.card { background: #0e0524; border: 1px solid #d946ef; border-radius: 16px; padding: 2rem; color: #fff; box-shadow: 0 0 30px rgba(217,70,239,0.3); text-align: center; }\n.tag { color: #38bdf8; font-weight: bold; font-size: 0.8rem; margin-bottom: 0.5rem; }\n.neon-btn { background: #d946ef; border: none; color: #fff; padding: 10px 24px; border-radius: 8px; font-weight: bold; cursor: pointer; box-shadow: 0 0 15px #d946ef; }`,
    js: `document.querySelector(".neon-btn").onclick = () => {\n  document.body.style.background = '#140033';\n  console.log("Cyber-Modus aktiviert!");\n};`
  },
  counter: {
    title: "Zähler-App",
    html: `<div class="counter-box">\n  <h1>Zähler: <span id="num">0</span></h1>\n  <div class="btns">\n    <button id="sub">-</button>\n    <button id="add">+</button>\n    <button id="res">Reset</button>\n  </div>\n</div>`,
    css: `body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #111827; color: #fff; font-family: sans-serif; }\n.counter-box { text-align: center; background: #1f2937; padding: 2rem; border-radius: 12px; border: 1px solid #374151; }\nbutton { margin: 5px; padding: 10px 20px; font-size: 1.2rem; cursor: pointer; border-radius: 6px; border: none; background: #3b82f6; color: #fff; }`,
    js: `let count = 0;\nconst num = document.getElementById("num");\ndocument.getElementById("add").onclick = () => { count++; num.textContent = count; };\ndocument.getElementById("sub").onclick = () => { count--; num.textContent = count; };\ndocument.getElementById("res").onclick = () => { count = 0; num.textContent = count; };`
  },
  canvas: {
    title: "Zeichenbrett",
    html: `<canvas id="c" width="400" height="400"></canvas><br><button id="clear">Clear</button>`,
    css: `body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; }\ncanvas { background: #1e293b; border-radius: 8px; cursor: crosshair; }\nbutton { margin-top: 10px; padding: 8px 16px; background: #ef4444; color: #fff; border: none; border-radius: 6px; cursor: pointer; }`,
    js: `const c=document.getElementById("c"),ctx=c.getContext("2d");let draw=false;c.onmousedown=()=>draw=true;window.onmouseup=()=>draw=false;c.onmousemove=e=>{if(!draw)return;const r=c.getBoundingClientRect();ctx.fillStyle="#38bdf8";ctx.beginPath();ctx.arc(e.clientX-r.left,e.clientY-r.top,4,0,Math.PI*2);ctx.fill();};document.getElementById("clear").onclick=()=>ctx.clearRect(0,0,c.width,c.height);`
  },
  blank: {
    title: "Leere Seite",
    html: `<!DOCTYPE html>\n<html>\n  <head><title>Neu</title></head>\n  <body>\n    <h1>Neue Seite</h1>\n  </body>\n</html>`,
    css: `body { background: #05070b; color: #e4e9ff; font-family: sans-serif; padding: 2rem; }`,
    js: `console.log("Atlas bereit.");`
  }
};

templateSelect.onchange = (e) => {
  const t = TEMPLATES[e.target.value];
  if (!t) return;
  if (confirm(`Vorlage "${t.title}" laden? Aktueller Code wird ersetzt.`)) {
    editorHTML.value = t.html;
    editorCSS.value = t.css;
    editorJS.value = t.js;
    document.getElementById("project-title-input").value = t.title.toLowerCase().replace(/[^a-z0-9]/g, "-");
    runEditorCode();
    showToast(`Vorlage "${t.title}" geladen`, "success");
  }
};

// New project
document.getElementById("btn-new-project").onclick = () => {
  if (confirm("Neues Projekt beginnen?")) {
    const t = TEMPLATES.starter;
    editorHTML.value = t.html;
    editorCSS.value = t.css;
    editorJS.value = t.js;
    document.getElementById("project-title-input").value = "neues-projekt";
    runEditorCode();
    showToast("Neues Projekt erstellt", "info");
  }
};

// Save Project locally
function saveProjectLocally() {
  const name = document.getElementById("project-title-input").value.trim() || "atlas-projekt";
  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const siteData = {
    name: cleanName,
    title: name,
    html: editorHTML.value,
    css: editorCSS.value,
    js: editorJS.value,
    author: "Du",
    date: new Date().toISOString()
  };

  localStorage.setItem("atlas_site_" + cleanName, JSON.stringify(siteData));
  showToast(`💾 Projekt '${name}' lokal gespeichert!`, "success");
}
document.getElementById("btn-save").onclick = saveProjectLocally;

// Export .html file download
document.getElementById("btn-export-html").onclick = () => {
  const name = document.getElementById("project-title-input").value.trim() || "atlas-page";
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${name}</title>
  <style>${editorCSS.value}</style>
</head>
<body>
  ${editorHTML.value}
  <script>${editorJS.value}<\/script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.html`;
  a.click();
  showToast("Download gestartet: " + name + ".html", "success");
};

// Publish Project
document.getElementById("btn-publish").onclick = async () => {
  const rawName = document.getElementById("project-title-input").value.trim();
  const namePrompt = prompt("Name für deine Atlas-Seite (z. B. 'mein-spiel'):", rawName || "meine-seite");
  if (!namePrompt) return;

  const cleanName = namePrompt.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  if (!cleanName) {
    showToast("Ungültiger Name", "error");
    return;
  }

  const payload = {
    name: cleanName,
    html: editorHTML.value,
    css: editorCSS.value,
    js: editorJS.value,
    author: "Atlas Explorer"
  };

  // Always save locally so it works immediately
  localStorage.setItem("atlas_site_" + cleanName, JSON.stringify(payload));

  showToast("Veröffentliche auf Server...", "info");

  try {
    const res = await fetch(ATLAS_API_BASE + "/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (data.success) {
      showToast(`🎉 Online veröffentlicht unter: ${data.url}`, "success");
      navigate(data.url);
    } else {
      showToast("Lokal gespeichert unter: atlas://site/" + cleanName, "info");
      navigate("atlas://site/" + cleanName);
    }
  } catch (err) {
    showToast("Server offline – lokal gesichert unter: atlas://site/" + cleanName, "info");
    navigate("atlas://site/" + cleanName);
  }
};

// ==================== STORE ENGINE ====================
function renderStoreGrid(filter = "all", searchQuery = "") {
  const grid = document.getElementById("store-grid");
  if (!grid) return;
  grid.innerHTML = "";

  const filtered = BUILTIN_APPS.filter(app => {
    const matchesFilter = filter === "all" || app.category === filter;
    const matchesSearch = !searchQuery || app.title.toLowerCase().includes(searchQuery.toLowerCase()) || app.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  filtered.forEach(app => {
    const card = document.createElement("div");
    card.className = "app-card";
    card.innerHTML = `
      <div class="app-card-top">
        <div class="app-icon">${app.icon}</div>
        <div class="app-info">
          <h3>${app.title}</h3>
          <span class="app-tag">${app.tag}</span>
        </div>
      </div>
      <p class="app-desc">${app.desc}</p>
      <div class="app-card-actions">
        <button class="primary-btn btn-open-app" data-id="${app.id}">Öffnen</button>
        <button class="ghost-btn btn-fork-app" data-id="${app.id}">Im Editor</button>
      </div>
    `;

    card.querySelector(".btn-open-app").onclick = () => {
      navigate("atlas://site/" + app.id);
    };

    card.querySelector(".btn-fork-app").onclick = () => {
      editorHTML.value = app.html;
      editorCSS.value = app.css;
      editorJS.value = app.js;
      document.getElementById("project-title-input").value = app.id;
      navigate("atlas://editor");
      runEditorCode();
      showToast(`'${app.title}' in den Editor geladen!`, "success");
    };

    grid.appendChild(card);
  });
}

// Store Filters
document.querySelectorAll(".store-filter-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".store-filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const query = document.getElementById("store-search-input").value;
    renderStoreGrid(btn.dataset.filter, query);
  };
});

const storeSearchInput = document.getElementById("store-search-input");
if (storeSearchInput) {
  storeSearchInput.oninput = (e) => {
    const activeFilterBtn = document.querySelector(".store-filter-btn.active");
    const filter = activeFilterBtn ? activeFilterBtn.dataset.filter : "all";
    renderStoreGrid(filter, e.target.value);
  };
}

// ==================== COMMUNITY ENGINE ====================
async function loadCommunitySites() {
  const grid = document.getElementById("community-grid");
  if (!grid) return;
  grid.innerHTML = `<div style="color:var(--text-soft);padding:1rem;">Lade Community-Projekte...</div>`;

  // Collect local sites from localStorage
  const localSites = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("atlas_site_")) {
      try {
        const item = JSON.parse(localStorage.getItem(key));
        localSites.push(item);
      } catch (e) {}
    }
  }

  let serverSites = [];
  try {
    const res = await fetch(ATLAS_API_BASE + "/api/sites");
    if (res.ok) {
      const data = await res.json();
      serverSites = data.sites || [];
    }
  } catch (err) {}

  // Merge unique sites
  const allMap = new Map();
  localSites.forEach(s => allMap.set(s.name, s));
  serverSites.forEach(s => {
    if (!allMap.has(s.name)) allMap.set(s.name, s);
  });

  const merged = Array.from(allMap.values());

  grid.innerHTML = "";
  if (merged.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-soft);padding:1rem;">Noch keine Projekte veröffentlicht. Erstelle das erste!</p>`;
    return;
  }

  merged.forEach(site => {
    const card = document.createElement("div");
    card.className = "app-card";
    const dateFormatted = site.date ? new Date(site.date).toLocaleDateString("de-DE") : "Kürzlich";
    card.innerHTML = `
      <div class="app-card-top">
        <div class="app-icon">🌐</div>
        <div class="app-info">
          <h3>${site.title || site.name}</h3>
          <span class="app-tag">von ${site.author || "Explorer"}</span>
        </div>
      </div>
      <p class="app-desc">Atlas-Adresse: <code>atlas://site/${site.name}</code><br><small style="color:var(--text-muted);">Erstellt am: ${dateFormatted}</small></p>
      <div class="app-card-actions">
        <button class="primary-btn btn-comm-launch">Starten ↗</button>
        <button class="ghost-btn btn-comm-fork">Im Editor bearbeiten</button>
      </div>
    `;

    card.querySelector(".btn-comm-launch").onclick = () => {
      navigate("atlas://site/" + site.name);
    };

    card.querySelector(".btn-comm-fork").onclick = async () => {
      // If we don't have code locally, fetch it
      if (!site.html) {
        try {
          const res = await fetch(ATLAS_API_BASE + "/api/site/" + site.name);
          const fullSite = await res.json();
          site.html = fullSite.html;
          site.css = fullSite.css;
          site.js = fullSite.js;
        } catch (e) {}
      }
      editorHTML.value = site.html || "<h1>Kein HTML</h1>";
      editorCSS.value = site.css || "";
      editorJS.value = site.js || "";
      document.getElementById("project-title-input").value = site.name;
      navigate("atlas://editor");
      runEditorCode();
      showToast(`'${site.name}' in den Editor geladen!`, "success");
    };

    grid.appendChild(card);
  });
}

document.getElementById("btn-community-refresh").onclick = loadCommunitySites;
document.getElementById("btn-community-create").onclick = () => navigate("atlas://editor");

// ==================== SETTINGS & BACKUP ====================
// Export all sites as JSON
document.getElementById("btn-export-all-sites").onclick = () => {
  const backup = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("atlas_site_") || key.startsWith("atlas_")) {
      backup[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `atlas-backup-${Date.now()}.json`;
  a.click();
  showToast("Export erfolgreich heruntergeladen!", "success");
};

// Import sites from JSON
const importFileInput = document.getElementById("import-sites-file");
document.getElementById("btn-import-sites-trigger").onclick = () => importFileInput.click();

importFileInput.onchange = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (evt) => {
    try {
      const data = JSON.parse(evt.target.result);
      let count = 0;
      for (const k in data) {
        localStorage.setItem(k, data[k]);
        count++;
      }
      showToast(`${count} Atlas-Einträge erfolgreich importiert!`, "success");
      loadCommunitySites();
      renderRecentVisits();
    } catch (err) {
      showToast("Fehlerhafte JSON-Datei", "error");
    }
  };
  reader.readAsText(file);
};

// Clear history
document.getElementById("btn-clear-history").onclick = () => {
  settings.recentVisits = [];
  localStorage.setItem("atlas_recent_visits", "[]");
  renderRecentVisits();
  showToast("Browser-Verlauf geleert", "info");
};

// Reset Atlas
document.getElementById("btn-reset-atlas").onclick = () => {
  if (confirm("Wirklich den gesamten lokalen Atlas-Speicher zurücksetzen? Alle ungespeicherten Daten gehen verloren.")) {
    localStorage.clear();
    location.reload();
  }
};

// ==================== INITIAL BOOTSTRAP ====================
createTab("atlas://home");
runEditorCode();
