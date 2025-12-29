const ATLAS_API_BASE = "https://atlas-browser-1.onrender.com";

// Screens
const screens = {
  home: document.getElementById("home-screen"),
  editor: document.getElementById("editor-screen"),
  store: document.getElementById("store-screen"),
  docs: document.getElementById("docs-screen"),
  community: document.getElementById("community-screen"),
  settings: document.getElementById("settings-screen"),
  webview: document.getElementById("webview-screen")
};

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.remove("active"));
  screens[name].classList.add("active");
}

// Navigation
const urlInput = document.getElementById("url-input");
const btnBack = document.getElementById("btn-back");
const btnForward = document.getElementById("btn-forward");
const btnReload = document.getElementById("btn-reload");

let historyStack = [];
let historyIndex = -1;

function navigate(url, push = true) {
  urlInput.value = url;

  if (push) {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(url);
    historyIndex++;
  }

  updateNavButtons();

  if (url === "atlas://home") return showScreen("home");
  if (url === "atlas://editor") return showScreen("editor");
  if (url === "atlas://store") return showScreen("store");
  if (url === "atlas://docs") return showScreen("docs");
  if (url === "atlas://community") return showScreen("community");
  if (url === "atlas://settings") return showScreen("settings");

  if (url.startsWith("atlas://site/")) {
    const name = url.replace("atlas://site/", "");
    loadAtlasSite(name);
    return;
  }

  // Echte WebView
  showScreen("webview");
  const iframe = document.getElementById("webview-frame");
  const display = document.getElementById("webview-url-display");
  iframe.src = url;
  display.textContent = url;
}

function updateNavButtons() {
  btnBack.disabled = historyIndex <= 0;
  btnForward.disabled = historyIndex >= historyStack.length - 1;
}

btnBack.onclick = () => {
  if (historyIndex > 0) {
    historyIndex--;
    navigate(historyStack[historyIndex], false);
  }
};

btnForward.onclick = () => {
  if (historyIndex < historyStack.length - 1) {
    historyIndex++;
    navigate(historyStack[historyIndex], false);
  }
};

btnReload.onclick = () => {
  if (historyIndex >= 0) {
    navigate(historyStack[historyIndex], false);
  }
};

urlInput.addEventListener("keydown", e => {
  if (e.key === "Enter") navigate(urlInput.value);
});

// Home
document.querySelectorAll(".quick-tile").forEach(tile => {
  tile.onclick = () => navigate(tile.dataset.target);
});

document.getElementById("home-url-input").addEventListener("keydown", e => {
  if (e.key === "Enter") navigate(e.target.value);
});

// Editor
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

document.getElementById("btn-run").onclick = () => {
  const doc = `
    <style>${editorCSS.value}</style>
    ${editorHTML.value}
    <script>${editorJS.value}<\/script>
  `;
  const frameDoc = previewFrame.contentWindow.document;
  frameDoc.open();
  frameDoc.write(doc);
  frameDoc.close();
};

// Publish
document.getElementById("btn-publish").onclick = async () => {
  const name = prompt("Name für die Seite:");
  if (!name) return;

  const payload = {
    name,
    html: editorHTML.value,
    css: editorCSS.value,
    js: editorJS.value
  };

  try {
    const res = await fetch(ATLAS_API_BASE + "/api/publish", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!data.success) {
      alert("Fehler: " + data.error);
      return;
    }

    alert("Veröffentlicht unter: " + data.url);
    navigate(data.url);

  } catch (err) {
    alert("Server nicht erreichbar.");
  }
};

// Load Atlas Site
async function loadAtlasSite(name) {
  showScreen("webview");

  try {
    const res = await fetch(ATLAS_API_BASE + "/api/site/" + name);
    const data = await res.json();

    if (data.error) {
      document.getElementById("webview-url-display").textContent =
        "Seite nicht gefunden: " + name;
      return;
    }

    const doc = `
      <style>${data.css}</style>
      ${data.html}
      <script>${data.js}<\/script>
    `;

    const iframe = document.getElementById("webview-frame");
    const iframeDoc = iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(doc);
    iframeDoc.close();

    document.getElementById("webview-url-display").textContent = "atlas://site/" + name;

  } catch (err) {
    document.getElementById("webview-url-display").textContent = "Fehler beim Laden.";
  }
}

// Start

navigate("atlas://home");


