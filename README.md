# 🌐 Atlas Browser V2

> **Creat. Explore. Atlas.**  
> Ein webbasierter Micro-Browser und Web-Betriebssystem für Entwickler und Kreative mit nativer Code-Entwicklungsumgebung, App-Store und `atlas://` Protokoll.

---

## ✨ Features

- **🚀 Native `atlas://` URLs:**
  - `atlas://home` – Startseite mit Schnellzugriff, Live-Uhr & Sprachsuche.
  - `atlas://editor` – HTML-, CSS- und JS-Editor mit Live-Preview & interaktiver Konsole.
  - `atlas://store` – Entdecke vorinstallierte Apps & Spiele (Snake, Paint, Taschenrechner, Matrix Rain, Pomodoro).
  - `atlas://community` – Teile und forke Projekte aus der Community.
  - `atlas://docs` – Vollständige Dokumentation & API-Referenz.
  - `atlas://settings` – Farbschemata (Dark, Neon, Matrix, OLED, Light), Suchmaschinen und Backup-Export.
  - `atlas://site/<name>` – Lade direkt veröffentlichte Webseiten.
- **📑 Multi-Tab Browsing:** Öffne und schließe mehrere Tabs gleichzeitig.
- **🎙️ Sprachsuche:** Integrierte Spracherkennung über die Web Speech API.
- **💾 Offline & Cloud-Storage:** Funktioniert nahtlos offline mit LocalStorage und synchronisiert mit der REST API.
- **⚡ Vercel-Ready:** Perfekt konfiguriert für Vercel (inklusive Serverless Functions und SPA-Routing).

---

## 🚀 Lokale Ausführung

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Server starten
npm start
```

Der Server läuft anschließend unter [http://localhost:3000](http://localhost:3000).

---

## ☁️ Deployment auf Vercel

Dieses Repository ist vorkonfiguriert für ein 1-Klick-Deployment auf Vercel:
- **`vercel.json`** regelt SPA-Routing und leitet API-Aufrufe an `api/index.js` weiter.
- **`index.html`** und alle Core-Dateien sind strikt kleingeschrieben für Linux-Server-Kompatibilität.