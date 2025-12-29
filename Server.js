const express = require("express");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let sites = {}; // In-Memory-Speicher (optional: später mit Datenbank ersetzen)

// Seite veröffentlichen
app.post("/api/publish", (req, res) => {
  const { name, html, css, js } = req.body;
  if (!name || !html) {
    return res.json({ success: false, error: "Name oder HTML fehlt." });
  }
  sites[name] = { html, css, js };
  res.json({ success: true, url: `atlas://site/${name}` });
});

// Seite abrufen
app.get("/api/site/:name", (req, res) => {
  const site = sites[req.params.name];
  if (!site) return res.json({ error: "Seite nicht gefunden." });
  res.json(site);
});

// Start
app.listen(PORT, () => {
  console.log(`Atlas Server läuft auf Port ${PORT}`);
});