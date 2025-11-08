# Content Planner - Desktop Application

Diese App wurde erfolgreich in eine Desktop-Anwendung umgewandelt, die auf deinem Computer läuft.

## Entwicklung

Um die Desktop-App in der Entwicklungsumgebung zu starten:

```bash
npm run electron:dev
```

Dies startet sowohl den Vite-Dev-Server als auch Electron.

## Desktop-App bauen

### Für Windows:
```bash
npm run electron:build:win
```

### Für macOS:
```bash
npm run electron:build:mac
```

### Für Linux:
```bash
npm run electron:build:linux
```

Die fertige App findest du im `release/` Ordner.

## Features

- Läuft vollständig offline auf deinem Computer
- Keine Webseite nötig
- Alle Funktionen der Web-App bleiben erhalten
- Datenbank-Verbindungen zu Firebase und Supabase funktionieren weiterhin

## Installation der fertigen App

Nach dem Build-Prozess:
- **Windows**: Führe die `.exe` Datei aus dem `release/` Ordner aus
- **macOS**: Öffne die `.dmg` Datei und ziehe die App in deinen Programme-Ordner
- **Linux**: Führe die `.AppImage` aus oder installiere das `.deb` Paket

## Systemanforderungen

- Windows 10/11, macOS 10.14+, oder eine aktuelle Linux-Distribution
- Mindestens 4 GB RAM
- 500 MB freier Festplattenspeicher
