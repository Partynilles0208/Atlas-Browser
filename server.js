const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Statische Dateien (Frontend) servieren
app.use(express.static(__dirname));

// Sites Speicher (In-Memory + Builtins)
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
</div>`,
    css: `
body {
  margin: 0; padding: 2rem; font-family: system-ui, sans-serif;
  background: radial-gradient(circle at top, #151d33, #070913);
  color: #e4e9ff; display: flex; justify-content: center; align-items: center; min-height: 100vh;
}
.welcome-box {
  background: rgba(18, 24, 43, 0.85); border: 1px solid rgba(95, 211, 255, 0.2);
  border-radius: 20px; padding: 2.5rem; max-width: 600px; text-align: center;
}
h1 { color: #5fd3ff; }
.cards { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin: 2rem 0; }
.card { background: rgba(255,255,255,0.04); padding: 1rem; border-radius: 12px; }`,
    js: `console.log("Atlas Welcome loaded.");`,
    author: "Atlas Core Team",
    date: new Date().toISOString()
  }
};

const userSites = { ...builtInSites };

// API Status
app.get("/api", (req, res) => {
  res.json({
    name: "Atlas Browser Local API",
    version: "2.0.0",
    status: "online"
  });
});

// Seite veröffentlichen
app.post("/api/publish", (req, res) => {
  const { name, html, css, js, author } = req.body || {};
  if (!name || !html) {
    return res.status(400).json({ success: false, error: "Name oder HTML fehlt." });
  }

  const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-");
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
    url: `atlas://site/${cleanName}`,
    name: cleanName,
    message: `Seite '${cleanName}' erfolgreich veröffentlicht!`
  });
});

// Seite abrufen
app.get("/api/site/:name", (req, res) => {
  const cleanName = (req.params.name || "").toLowerCase().trim();
  const site = userSites[cleanName];
  if (!site) return res.status(404).json({ error: "Seite nicht gefunden." });
  res.json(site);
});

// Alle Seiten auflisten
app.get("/api/sites", (req, res) => {
  const list = Object.keys(userSites).map(key => ({
    name: key,
    title: userSites[key].title || key,
    author: userSites[key].author || "Anonym",
    date: userSites[key].date || new Date().toISOString()
  }));
  res.json({ sites: list });
});

// Alle anderen Routen an index.html weiterleiten (SPA fallback)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Start
app.listen(PORT, () => {
  console.log(`🚀 Atlas Browser Server läuft auf http://localhost:${PORT}`);
});

module.exports = app;
