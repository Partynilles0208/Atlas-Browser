// =======================================================
// ATLAS BROWSER - COMPLETE CHROME & OPERA ARCHITECTURE
// =======================================================

// Base API
const ATLAS_API_BASE = (() => {
  const host = window.location.hostname;
  if (host.includes("vercel.app") || host === "localhost" || host === "127.0.0.1") {
    return window.location.origin;
  }
  return "https://atlas-browser-2.onrender.com";
})();

// ==================== STATE MANAGEMENT ====================
let tabs = [];
let activeTabId = null;
let zoomLevel = 100;

let settings = {
  theme: localStorage.getItem("atlas_theme") || "dark",
  searchEngine: localStorage.getItem("atlas_search_engine") || "google",
  bookmarks: JSON.parse(localStorage.getItem("atlas_bookmarks") || "[]"),
  history: JSON.parse(localStorage.getItem("atlas_history") || "[]"),
  speedDial: JSON.parse(localStorage.getItem("atlas_speed_dial") || "null")
};

// Default Speed Dial items if empty
if (!settings.speedDial || settings.speedDial.length === 0) {
  settings.speedDial = [
    { title: "Google", url: "https://www.google.com", icon: "🔍", color: "#4285F4" },
    { title: "YouTube", url: "https://www.youtube.com", icon: "▶", color: "#FF0000" },
    { title: "GitHub", url: "https://github.com", icon: "🐙", color: "#24292E" },
    { title: "Wikipedia", url: "https://de.wikipedia.org", icon: "W", color: "#636466" },
    { title: "Reddit", url: "https://www.reddit.com", icon: "💬", color: "#FF4500" },
    { title: "ChatGPT", url: "https://chatgpt.com", icon: "🤖", color: "#10A37F" },
    { title: "Twitch", url: "https://www.twitch.tv", icon: "🎮", color: "#9146FF" },
    { title: "Atlas Store", url: "atlas://store", icon: "🛒", color: "#10B981" }
  ];
  localStorage.setItem("atlas_speed_dial", JSON.stringify(settings.speedDial));
}

// Search engines
const SEARCH_ENGINES = {
  google: { name: "🔍 Google", url: "https://www.google.com/search?q=" },
  duckduckgo: { name: "🦆 DuckDuckGo", url: "https://duckduckgo.com/?q=" },
  bing: { name: "🟦 Bing", url: "https://www.bing.com/search?q=" },
  ecosia: { name: "🌳 Ecosia", url: "https://www.ecosia.org/search?q=" }
};

// Built-in Apps & Demos
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
  }
];

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
const btnBookmarkPage = document.getElementById("btn-bookmark-page");
const micButton = document.getElementById("mic-button");
const homeMicButton = document.getElementById("home-mic-button");
const tabList = document.getElementById("tab-list");
const btnAddTab = document.getElementById("btn-add-tab");
const suggestionsBox = document.getElementById("omnibox-suggestions");

// ==================== TOAST HELPER ====================
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

document.querySelectorAll(".theme-btn").forEach(btn => {
  btn.onclick = () => applyTheme(btn.dataset.theme);
});

// ==================== CLOCK & DATE ====================
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

// ==================== TAB MANAGEMENT (CHROME ARCHITECTURE) ====================
function createTab(initialUrl = "atlas://home") {
  const tabId = "tab_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
  const newTab = {
    id: tabId,
    title: getTitleForUrl(initialUrl),
    icon: getIconForUrl(initialUrl),
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
    const tab = tabs[0];
    tab.url = "atlas://home";
    tab.title = "Startseite";
    tab.icon = "🏠";
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

    const iconEl = document.createElement("span");
    iconEl.className = "tab-favicon";
    iconEl.textContent = tab.icon || "🌐";

    const titleEl = document.createElement("span");
    titleEl.className = "tab-title";
    titleEl.textContent = tab.title || "Atlas";

    const closeBtn = document.createElement("button");
    closeBtn.className = "tab-close-btn";
    closeBtn.textContent = "×";
    closeBtn.title = "Tab schließen (Strg+W)";
    closeBtn.onclick = (e) => closeTab(tab.id, e);

    tabEl.appendChild(iconEl);
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
    return "Site: " + url.replace("atlas://site/", "");
  }
  return url.replace(/^https?:\/\//, "").slice(0, 18);
}

function getIconForUrl(url) {
  if (url === "atlas://home") return "🏠";
  if (url === "atlas://editor") return "</>";
  if (url === "atlas://store") return "🛒";
  if (url === "atlas://docs") return "📄";
  if (url === "atlas://community") return "🌐";
  if (url === "atlas://settings") return "⚙️";
  if (url.includes("google")) return "🔍";
  if (url.includes("youtube")) return "▶";
  if (url.includes("github")) return "🐙";
  if (url.includes("wikipedia")) return "W";
  if (url.includes("reddit")) return "💬";
  return "🌐";
}

btnAddTab.onclick = () => createTab("atlas://home");

function getActiveTab() {
  return tabs.find(t => t.id === activeTabId);
}

// ==================== SCREEN SWITCHER ====================
function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  if (screens[name]) {
    screens[name].classList.add("active");
  }

  // Update Opera Sidebar active state
  document.querySelectorAll(".sidebar-btn[data-nav]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.nav === "atlas://" + name);
  });
}

// ==================== NAVIGATION ENGINE ====================
function navigate(targetUrl, push = true) {
  if (!targetUrl) return;
  let url = targetUrl.trim();

  // Hide suggestions
  if (suggestionsBox) suggestionsBox.style.display = "none";

  // Smart URL parser (Google / Web / Atlas)
  if (!url.startsWith("atlas://") && !url.startsWith("http://") && !url.startsWith("https://")) {
    if (!url.includes(" ") && url.includes(".") && !url.startsWith("?")) {
      url = "https://" + url;
    } else {
      const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.google;
      url = engine.url + encodeURIComponent(url);
    }
  }

  const tab = getActiveTab();
  if (tab) {
    tab.url = url;
    tab.title = getTitleForUrl(url);
    tab.icon = getIconForUrl(url);

    if (push) {
      tab.historyStack = tab.historyStack.slice(0, tab.historyIndex + 1);
      tab.historyStack.push(url);
      tab.historyIndex++;
    }
  }

  renderTabs();
  urlInput.value = url;
  updateNavButtons();
  recordHistory(url);
  updateSecurityBadge(url);
  updateBookmarkStar(url);

  // Status text update
  const statusEl = document.getElementById("status-text");
  if (statusEl) statusEl.textContent = `Lade ${url.slice(0, 40)}...`;

  // Atlas Internal Pages
  if (url === "atlas://home") {
    renderSpeedDialGrid();
    showScreen("home");
    if (statusEl) statusEl.textContent = "Startseite bereit";
    return;
  }
  if (url === "atlas://editor") {
    showScreen("editor");
    if (statusEl) statusEl.textContent = "Atlas Editor bereit";
    return;
  }
  if (url === "atlas://store") {
    renderStoreGrid();
    showScreen("store");
    if (statusEl) statusEl.textContent = "Atlas Store bereit";
    return;
  }
  if (url === "atlas://docs") {
    showScreen("docs");
    if (statusEl) statusEl.textContent = "Dokumentation geladen";
    return;
  }
  if (url === "atlas://community") {
    loadCommunitySites();
    showScreen("community");
    if (statusEl) statusEl.textContent = "Community Hub geladen";
    return;
  }
  if (url === "atlas://settings") {
    showScreen("settings");
    if (statusEl) statusEl.textContent = "Einstellungen";
    return;
  }

  // Atlas Site (atlas://site/:name)
  if (url.startsWith("atlas://site/")) {
    const siteName = url.replace("atlas://site/", "").trim();
    loadAtlasSite(siteName);
    return;
  }

  // Real Web Browsing in WebView
  showScreen("webview");
  const iframe = document.getElementById("webview-frame");
  const display = document.getElementById("webview-url-display");
  const blockedNotice = document.getElementById("webview-blocked-notice");

  blockedNotice.style.display = "none";
  iframe.style.display = "block";
  iframe.src = url;
  display.textContent = url;

  if (statusEl) statusEl.textContent = "Webseite geladen: " + url.replace(/^https?:\/\//, "");

  // Check if iframe is blocked by X-Frame-Options
  document.getElementById("btn-blocked-open-external").onclick = () => {
    window.open(url, "_blank");
  };
  document.getElementById("btn-blocked-back").onclick = () => {
    navigate("atlas://home");
  };
}

function updateSecurityBadge(url) {
  const icon = document.getElementById("security-icon");
  if (!icon) return;
  if (url.startsWith("https://")) {
    icon.textContent = "🔒";
    icon.style.color = "#10b981";
  } else if (url.startsWith("atlas://")) {
    icon.textContent = "🌐";
    icon.style.color = "#38bdf8";
  } else {
    icon.textContent = "⚠️";
    icon.style.color = "#f59e0b";
  }
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
    showToast("⟳ Seite neu geladen", "info");
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

// Omnibox Autocomplete Suggestions
urlInput.addEventListener("input", (e) => {
  const query = e.target.value.trim();
  if (!query || query.length < 1) {
    suggestionsBox.style.display = "none";
    return;
  }

  const matches = [
    { type: "search", icon: "🔍", text: `${query} – Google Suche`, url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
    { type: "search", icon: "🦆", text: `${query} – DuckDuckGo Suche`, url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}` },
    { type: "site", icon: "🌐", text: `atlas://editor – Atlas Editor öffnen`, url: "atlas://editor" },
    { type: "site", icon: "🛒", text: `atlas://store – Atlas Store öffnen`, url: "atlas://store" },
    { type: "site", icon: "🐍", text: `atlas://site/snake – Snake Arcade Game`, url: "atlas://site/snake" }
  ].filter(item => item.text.toLowerCase().includes(query.toLowerCase()) || item.type === "search");

  suggestionsBox.innerHTML = "";
  matches.slice(0, 5).forEach(m => {
    const item = document.createElement("div");
    item.className = "suggestion-item";
    item.innerHTML = `<span class="sug-icon">${m.icon}</span><span class="sug-text">${m.text}</span>`;
    item.onclick = () => {
      navigate(m.url);
      suggestionsBox.style.display = "none";
    };
    suggestionsBox.appendChild(item);
  });
  suggestionsBox.style.display = "block";
});

document.addEventListener("click", (e) => {
  if (!urlInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
    suggestionsBox.style.display = "none";
  }
  // Close Chrome 3-Dots Menu if clicked outside
  const menu = document.getElementById("chrome-dropdown-menu");
  const menuBtn = document.getElementById("btn-chrome-menu");
  if (menu && menuBtn && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.style.display = "none";
  }
});

// ==================== BOOKMARKS MANAGEMENT ====================
function updateBookmarkStar(url) {
  const isBookmarked = settings.bookmarks.some(b => b.url === url);
  btnBookmarkPage.classList.toggle("active", isBookmarked);
}

btnBookmarkPage.onclick = () => {
  const tab = getActiveTab();
  if (!tab) return;
  const url = tab.url;
  const title = tab.title || "Lesezeichen";

  const idx = settings.bookmarks.findIndex(b => b.url === url);
  if (idx >= 0) {
    settings.bookmarks.splice(idx, 1);
    btnBookmarkPage.classList.remove("active");
    showToast("Lesezeichen entfernt", "info");
  } else {
    settings.bookmarks.push({ title, url, icon: tab.icon || "★" });
    btnBookmarkPage.classList.add("active");
    showToast("★ Lesezeichen hinzugefügt!", "success");
  }
  localStorage.setItem("atlas_bookmarks", JSON.stringify(settings.bookmarks));
  renderBookmarksBar();
};

function renderBookmarksBar() {
  const list = document.getElementById("bookmarks-list");
  if (!list) return;
  // Keep default buttons and append user bookmarks
  document.querySelectorAll(".bookmark-item.user-bm").forEach(el => el.remove());

  settings.bookmarks.forEach(bm => {
    const btn = document.createElement("button");
    btn.className = "bookmark-item user-bm";
    btn.innerHTML = `<span class="bm-icon">${bm.icon || "★"}</span> ${bm.title}`;
    btn.onclick = () => navigate(bm.url);
    list.appendChild(btn);
  });
}
renderBookmarksBar();

document.querySelectorAll(".bookmark-item[data-url]").forEach(btn => {
  btn.onclick = () => navigate(btn.dataset.url);
});

document.getElementById("btn-add-quick-bm").onclick = () => {
  const title = prompt("Name des Lesezeichens:");
  if (!title) return;
  let url = prompt("Adresse (z. B. https://google.com):");
  if (!url) return;
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("atlas://")) {
    url = "https://" + url;
  }
  settings.bookmarks.push({ title, url, icon: "★" });
  localStorage.setItem("atlas_bookmarks", JSON.stringify(settings.bookmarks));
  renderBookmarksBar();
  showToast(`Lesezeichen "${title}" hinzugefügt!`, "success");
};

// ==================== HISTORY MANAGEMENT ====================
function recordHistory(url) {
  if (url === "atlas://home") return;
  const item = { url, title: getTitleForUrl(url), time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }), date: new Date().toLocaleDateString("de-DE") };
  settings.history.unshift(item);
  if (settings.history.length > 100) settings.history = settings.history.slice(0, 100);
  localStorage.setItem("atlas_history", JSON.stringify(settings.history));
  renderHistoryDrawer();
}

function renderHistoryDrawer() {
  const panel = document.getElementById("panel-history-content");
  if (!panel) return;
  panel.innerHTML = "";
  if (settings.history.length === 0) {
    panel.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">Noch kein Verlauf vorhanden.</p>`;
    return;
  }
  settings.history.forEach((h, index) => {
    const row = document.createElement("div");
    row.className = "drawer-item";
    row.innerHTML = `<div><strong>${h.title}</strong><br><small style="color:var(--text-muted);">${h.url.slice(0, 32)} • ${h.time}</small></div>`;
    row.onclick = () => navigate(h.url);
    panel.appendChild(row);
  });
}
renderHistoryDrawer();

document.getElementById("btn-clear-history-panel").onclick = () => {
  settings.history = [];
  localStorage.setItem("atlas_history", "[]");
  renderHistoryDrawer();
  showToast("Verlauf geleert", "info");
};

// ==================== OPERA SIDEBAR & FLYOUT PANELS ====================
const flyoutPanels = {
  ai: document.getElementById("panel-ai"),
  bookmarks: document.getElementById("panel-bookmarks"),
  history: document.getElementById("panel-history")
};

function togglePanel(name) {
  const panel = flyoutPanels[name];
  if (!panel) return;
  const isVisible = panel.style.display === "flex";
  // Close all first
  Object.values(flyoutPanels).forEach(p => { if (p) p.style.display = "none"; });
  if (!isVisible) {
    panel.style.display = "flex";
  }
}

document.querySelectorAll(".panel-close-btn").forEach(btn => {
  btn.onclick = () => {
    const pId = btn.dataset.close;
    const p = document.getElementById(pId);
    if (p) p.style.display = "none";
  };
});

document.getElementById("sb-ai-toggle").onclick = () => togglePanel("ai");
document.getElementById("btn-toggle-ai").onclick = () => togglePanel("ai");
document.getElementById("sb-bookmarks-toggle").onclick = () => {
  renderBookmarksDrawer();
  togglePanel("bookmarks");
};
document.getElementById("sb-history-toggle").onclick = () => {
  renderHistoryDrawer();
  togglePanel("history");
};

function renderBookmarksDrawer() {
  const panel = document.getElementById("panel-bookmarks-content");
  if (!panel) return;
  panel.innerHTML = "";
  if (settings.bookmarks.length === 0) {
    panel.innerHTML = `<p style="color:var(--text-muted);font-size:0.85rem;">Keine Lesezeichen gespeichert.</p>`;
    return;
  }
  settings.bookmarks.forEach((bm, i) => {
    const row = document.createElement("div");
    row.className = "drawer-item";
    row.innerHTML = `<div><span>${bm.icon || "★"}</span> <strong>${bm.title}</strong><br><small style="color:var(--text-muted);">${bm.url}</small></div><button style="background:none;border:none;color:#ff5555;cursor:pointer;">✕</button>`;
    row.querySelector("div").onclick = () => navigate(bm.url);
    row.querySelector("button").onclick = (e) => {
      e.stopPropagation();
      settings.bookmarks.splice(i, 1);
      localStorage.setItem("atlas_bookmarks", JSON.stringify(settings.bookmarks));
      renderBookmarksDrawer();
      renderBookmarksBar();
      updateBookmarkStar(urlInput.value);
    };
    panel.appendChild(row);
  });
}

// Opera Sidebar Navigation Links
document.querySelectorAll(".sidebar-btn[data-nav]").forEach(btn => {
  btn.onclick = () => navigate(btn.dataset.nav);
});

// ==================== OPERA AI COPILOT ====================
const aiInput = document.getElementById("ai-input");
const btnSendAi = document.getElementById("btn-send-ai");
const aiChatMessages = document.getElementById("ai-chat-messages");

function sendAiMessage() {
  const text = aiInput.value.trim();
  if (!text) return;

  // Add User msg
  const userMsg = document.createElement("div");
  userMsg.className = "ai-msg user";
  userMsg.textContent = text;
  aiChatMessages.appendChild(userMsg);
  aiInput.value = "";
  aiChatMessages.scrollTop = aiChatMessages.scrollHeight;

  // Simulate AI Response
  setTimeout(() => {
    const botMsg = document.createElement("div");
    botMsg.className = "ai-msg bot";

    const query = text.toLowerCase();
    if (query.includes("spiel") || query.includes("snake") || query.includes("code")) {
      botMsg.innerHTML = `<strong>Atlas AI:</strong> Ich habe eine Idee für dich! Du kannst im <strong>Atlas Editor</strong> sofort Mini-Spiele oder interaktive Seiten bauen. Klicke unten, um eine Vorlage im Editor zu öffnen:<br><button class="primary-btn-sm" style="margin-top:8px;" onclick="navigate('atlas://editor')">Zum Editor wechseln</button>`;
    } else if (query.includes("wer bist du") || query.includes("hallo") || query.includes("hi")) {
      botMsg.innerHTML = `<strong>Atlas AI:</strong> Hallo! Ich bin dein integrierter Assistent im Atlas Browser – wie Opera Aria oder Edge Copilot. Frag mich gerne nach Code-Hilfe oder Internet-Tipps!`;
    } else {
      botMsg.innerHTML = `<strong>Atlas AI:</strong> Zu "<em>${text}</em>" empfehle ich dir eine Google-Suche im Browser:<br><button class="primary-btn-sm" style="margin-top:8px;" onclick="navigate('https://www.google.com/search?q=${encodeURIComponent(text)}')">Google Suche starten</button>`;
    }

    aiChatMessages.appendChild(botMsg);
    aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
  }, 600);
}

if (btnSendAi) btnSendAi.onclick = sendAiMessage;
if (aiInput) aiInput.addEventListener("keydown", e => { if (e.key === "Enter") sendAiMessage(); });

// ==================== SPEED DIAL (OPERA STYLE) ====================
function renderSpeedDialGrid() {
  const grid = document.getElementById("speed-dial-grid");
  if (!grid) return;
  grid.innerHTML = "";

  settings.speedDial.forEach((tile, index) => {
    const el = document.createElement("div");
    el.className = "speed-dial-tile";
    el.innerHTML = `
      <div class="sd-icon-box" style="background:${tile.color}22; border: 1px solid ${tile.color}; color:${tile.color};">${tile.icon}</div>
      <div class="sd-title">${tile.title}</div>
    `;
    el.onclick = () => navigate(tile.url);
    grid.appendChild(el);
  });
}
renderSpeedDialGrid();

document.getElementById("btn-speeddial-add").onclick = () => {
  const title = prompt("Name für die Speed-Dial Kachel:");
  if (!title) return;
  let url = prompt("Webadresse (z. B. https://spiegel.de):");
  if (!url) return;
  if (!url.startsWith("http://") && !url.startsWith("https://") && !url.startsWith("atlas://")) {
    url = "https://" + url;
  }
  settings.speedDial.push({ title, url, icon: "🌐", color: "#3d7cff" });
  localStorage.setItem("atlas_speed_dial", JSON.stringify(settings.speedDial));
  renderSpeedDialGrid();
  showToast(`Kachel "${title}" hinzugefügt!`, "success");
};

// Home quick search
const homeUrlInput = document.getElementById("home-url-input");
if (homeUrlInput) {
  homeUrlInput.addEventListener("keydown", e => {
    if (e.key === "Enter") navigate(e.target.value);
  });
}

// Search engine selector badge on home
const homeEngineBadge = document.getElementById("home-engine-badge");
function updateEngineBadge() {
  const engine = SEARCH_ENGINES[settings.searchEngine] || SEARCH_ENGINES.google;
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

// Quick tiles
document.querySelectorAll(".quick-tile").forEach(tile => {
  tile.onclick = () => navigate(tile.dataset.target);
});

// ==================== CHROME 3-DOTS MENU ====================
const chromeMenuBtn = document.getElementById("btn-chrome-menu");
const chromeMenu = document.getElementById("chrome-dropdown-menu");

chromeMenuBtn.onclick = (e) => {
  e.stopPropagation();
  chromeMenu.style.display = chromeMenu.style.display === "block" ? "none" : "block";
};

document.getElementById("menu-new-tab").onclick = () => {
  createTab("atlas://home");
  chromeMenu.style.display = "none";
};

document.getElementById("menu-bookmarks").onclick = () => {
  togglePanel("bookmarks");
  chromeMenu.style.display = "none";
};

document.getElementById("menu-history").onclick = () => {
  togglePanel("history");
  chromeMenu.style.display = "none";
};

document.getElementById("menu-downloads").onclick = () => {
  showToast("Keine aktiven Downloads", "info");
  chromeMenu.style.display = "none";
};

document.getElementById("menu-settings").onclick = () => {
  navigate("atlas://settings");
  chromeMenu.style.display = "none";
};

document.getElementById("menu-docs").onclick = () => {
  navigate("atlas://docs");
  chromeMenu.style.display = "none";
};

// Zoom controls
document.getElementById("btn-zoom-in").onclick = () => {
  zoomLevel = Math.min(150, zoomLevel + 10);
  document.getElementById("zoom-level").textContent = zoomLevel + "%";
  document.getElementById("status-zoom-indicator").textContent = zoomLevel + "%";
  document.getElementById("browser-content-viewport").style.transform = `scale(${zoomLevel / 100})`;
  document.getElementById("browser-content-viewport").style.transformOrigin = "top left";
};

document.getElementById("btn-zoom-out").onclick = () => {
  zoomLevel = Math.max(70, zoomLevel - 10);
  document.getElementById("zoom-level").textContent = zoomLevel + "%";
  document.getElementById("status-zoom-indicator").textContent = zoomLevel + "%";
  document.getElementById("browser-content-viewport").style.transform = `scale(${zoomLevel / 100})`;
  document.getElementById("browser-content-viewport").style.transformOrigin = "top left";
};

document.getElementById("btn-zoom-fullscreen").onclick = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
};

// Window Controls (Minimize / Maximize / Close)
document.querySelector(".win-min").onclick = () => showToast("Browser minimiert (Simulation)", "info");
document.querySelector(".win-max").onclick = () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
  else document.exitFullscreen().catch(() => {});
};
document.querySelector(".win-close").onclick = () => {
  if (confirm("Möchtest du alle Tabs schließen?")) {
    window.location.reload();
  }
};

// Quick action buttons
document.getElementById("btn-quick-editor").onclick = () => navigate("atlas://editor");
document.getElementById("btn-quick-store").onclick = () => navigate("atlas://store");

// ==================== SPEECH RECOGNITION ====================
function setupSpeechRecognition(triggerBtn, targetInput) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;
  const recognition = new SpeechRecognition();
  recognition.lang = "de-DE";
  recognition.interimResults = false;

  triggerBtn.onclick = () => {
    try {
      recognition.start();
      triggerBtn.classList.add("listening");
      showToast("🎙️ Zuhören... Bitte sprechen", "info");
    } catch (e) {
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
    triggerBtn.classList.remove("listening");
  };
}
setupSpeechRecognition(micButton, urlInput);
setupSpeechRecognition(homeMicButton, homeUrlInput);

// ==================== KEYBOARD SHORTCUTS (CHROME STANDARD) ====================
window.addEventListener("keydown", (e) => {
  // Ctrl + T (New Tab)
  if ((e.ctrlKey || e.metaKey) && (e.key === "t" || e.key === "T")) {
    e.preventDefault();
    createTab("atlas://home");
  }
  // Ctrl + W (Close Tab)
  if ((e.ctrlKey || e.metaKey) && (e.key === "w" || e.key === "W")) {
    e.preventDefault();
    if (activeTabId) closeTab(activeTabId);
  }
  // Ctrl + H (History)
  if ((e.ctrlKey || e.metaKey) && (e.key === "h" || e.key === "H")) {
    e.preventDefault();
    togglePanel("history");
  }
  // Ctrl + D (Bookmark)
  if ((e.ctrlKey || e.metaKey) && (e.key === "d" || e.key === "D")) {
    e.preventDefault();
    btnBookmarkPage.click();
  }
  // Alt + Left (Back)
  if (e.altKey && e.key === "ArrowLeft") {
    e.preventDefault();
    btnBack.click();
  }
  // Alt + Right (Forward)
  if (e.altKey && e.key === "ArrowRight") {
    e.preventDefault();
    btnForward.click();
  }
});

// ==================== ATLAS SITE LOADER ====================
async function loadAtlasSite(siteName) {
  showScreen("webview");
  const iframe = document.getElementById("webview-frame");
  const display = document.getElementById("webview-url-display");
  display.textContent = "atlas://site/" + siteName;

  const localCacheKey = "atlas_site_" + siteName;
  const localData = localStorage.getItem(localCacheKey);
  if (localData) {
    try {
      const site = JSON.parse(localData);
      renderSiteInIframe(iframe, site);
      return;
    } catch (e) {}
  }

  try {
    const res = await fetch(ATLAS_API_BASE + "/api/site/" + siteName);
    const site = await res.json();
    if (site.error) throw new Error("Nicht gefunden");
    localStorage.setItem(localCacheKey, JSON.stringify(site));
    renderSiteInIframe(iframe, site);
  } catch (err) {
    iframe.srcdoc = `<body style="background:#05070b;color:#e4e9ff;font-family:sans-serif;text-align:center;padding:3rem;"><h2>404 - Atlas Seite nicht gefunden</h2><p>Die Seite <code>atlas://site/${siteName}</code> existiert nicht.</p></body>`;
  }
}

function renderSiteInIframe(iframe, site) {
  iframe.srcdoc = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${site.css || ""}</style></head><body>${site.html || ""}<script>${site.js || ""}<\/script></body></html>`;
}

// WebView actions
document.getElementById("btn-webview-reload").onclick = () => {
  const iframe = document.getElementById("webview-frame");
  if (iframe.src) iframe.src = iframe.src;
  else if (iframe.srcdoc) {
    const c = iframe.srcdoc;
    iframe.srcdoc = "";
    setTimeout(() => iframe.srcdoc = c, 50);
  }
  showToast("Vorschau neu geladen", "info");
};

document.getElementById("btn-webview-copy").onclick = () => {
  navigator.clipboard.writeText(urlInput.value).then(() => showToast("URL kopiert!", "success"));
};

document.getElementById("btn-webview-external").onclick = () => {
  const iframe = document.getElementById("webview-frame");
  if (iframe.src && !iframe.src.startsWith("about:")) {
    window.open(iframe.src, "_blank");
  } else {
    window.open(urlInput.value, "_blank");
  }
};

// ==================== EDITOR ENGINE ====================
const editorHTML = document.getElementById("editor-html");
const editorCSS = document.getElementById("editor-css");
const editorJS = document.getElementById("editor-js");
const previewFrame = document.getElementById("editor-preview");
const consoleOutput = document.getElementById("editor-console-output");

document.querySelectorAll(".editor-tab").forEach(tab => {
  tab.onclick = () => {
    document.querySelectorAll(".editor-tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".editor-panel").forEach(p => p.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById("editor-" + tab.dataset.tab).classList.add("active");
  };
});

function runEditorCode() {
  if (!previewFrame) return;
  consoleOutput.innerHTML = "";
  previewFrame.srcdoc = `<!DOCTYPE html><html><head><style>${editorCSS.value}</style></head><body>${editorHTML.value}<script>['log','warn','error'].forEach(t=>{const o=console[t];console[t]=function(...a){o.apply(console,a);window.parent.postMessage({type:'console',level:t,msg:a.join(' ')},'*');};});try{${editorJS.value}}catch(e){console.error(e.message);}<\/script></body></html>`;
}

document.getElementById("btn-run").onclick = runEditorCode;

window.addEventListener("message", (e) => {
  if (e.data && e.data.type === "console") {
    const row = document.createElement("div");
    row.className = `console-entry ${e.data.level}`;
    row.textContent = `[${e.data.level}] ${e.data.msg}`;
    consoleOutput.appendChild(row);
  }
});

document.getElementById("btn-clear-console").onclick = () => consoleOutput.innerHTML = "";

// Save & Export
document.getElementById("btn-save").onclick = () => {
  const name = document.getElementById("project-title-input").value.trim() || "projekt";
  localStorage.setItem("atlas_site_" + name, JSON.stringify({ name, html: editorHTML.value, css: editorCSS.value, js: editorJS.value }));
  showToast(`💾 Projekt '${name}' gespeichert!`, "success");
};

document.getElementById("btn-export-html").onclick = () => {
  const name = document.getElementById("project-title-input").value.trim() || "atlas";
  const blob = new Blob([`<!DOCTYPE html><html><head><style>${editorCSS.value}</style></head><body>${editorHTML.value}<script>${editorJS.value}<\/script></body></html>`], { type: "text/html" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${name}.html`;
  a.click();
  showToast("Download gestartet", "success");
};

// Publish
document.getElementById("btn-publish").onclick = async () => {
  const name = prompt("Name für die Seite:", "meine-seite");
  if (!name) return;
  const cleanName = name.toLowerCase().replace(/[^a-z0-9_-]/g, "-");
  const payload = { name: cleanName, html: editorHTML.value, css: editorCSS.value, js: editorJS.value };

  localStorage.setItem("atlas_site_" + cleanName, JSON.stringify(payload));
  try {
    const res = await fetch(ATLAS_API_BASE + "/api/publish", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    showToast(`🎉 Veröffentlicht unter: atlas://site/${cleanName}`, "success");
  } catch (e) {
    showToast(`Lokal gesichert unter: atlas://site/${cleanName}`, "info");
  }
  navigate(`atlas://site/${cleanName}`);
};

// ==================== STORE ENGINE ====================
function renderStoreGrid() {
  const grid = document.getElementById("store-grid");
  if (!grid) return;
  grid.innerHTML = "";
  BUILTIN_APPS.forEach(app => {
    const card = document.createElement("div");
    card.className = "app-card";
    card.innerHTML = `
      <div class="app-card-top"><div class="app-icon">${app.icon}</div><div class="app-info"><h3>${app.title}</h3><span class="app-tag">${app.tag}</span></div></div>
      <p class="app-desc">${app.desc}</p>
      <div class="app-card-actions">
        <button class="primary-btn" onclick="navigate('atlas://site/${app.id}')">Öffnen</button>
        <button class="ghost-btn" onclick="forkApp('${app.id}')">Im Editor</button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function forkApp(appId) {
  const app = BUILTIN_APPS.find(a => a.id === appId);
  if (!app) return;
  editorHTML.value = app.html;
  editorCSS.value = app.css;
  editorJS.value = app.js;
  document.getElementById("project-title-input").value = app.id;
  navigate("atlas://editor");
  runEditorCode();
  showToast(`'${app.title}' in Editor geladen!`, "success");
}

// ==================== INITIAL BOOTSTRAP ====================
createTab("atlas://home");
runEditorCode();
