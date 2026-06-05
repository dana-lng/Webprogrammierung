# Jahreskalender PWA – Sachsen (2000–2099)

## Beschreibung

Dieses Projekt ist eine Progressive Web App (PWA), die einen Jahreskalender für das Bundesland Sachsen im Zeitraum 2000 bis 2099 berechnet und darstellt.

Die Anwendung wurde im Rahmen des Moduls Webprogrammierung entwickelt.

Die PWA zeigt alle Monate eines Jahres übersichtlich an und hebt sowohl aktuelle Tage als auch Feiertage hervor. Zusätzlich können über eine API Geburtstage berühmter Persönlichkeiten angezeigt werden.

## Technische Umsetzung

### Technologien
* HTML5
* CSS (inkl. Grid Layout)
* JavaScript (Vanilla)

### Datenverarbeitung
Feiertage:
* Statisch: fest definiert
* Dynamisch: berechnet (z. B. Gaußsche Osterformel)
Speicherung:
* JSON 

### API
* Nutzung der Wikimedia API ("On this day")
* Daten werden beim Start geladen und im localStorage gespeichert

## Installation der PWA

Die Anwendung ist als Progressive Web App installierbar. Dafür sind folgende PWA-Bestandteile im Projekt vorhanden:

* Manifest: `src/manifest.json`
* Icons: `src/icons/icon-192.png` und `src/icons/icon-512.png`
* Service Worker: `src/service-worker.js`
* Registrierung des Service Workers in `src/script.js`

Damit der Browser die PWA installieren kann, muss die Anwendung über einen gültigen Webserver erreichbar sein. Das direkte Öffnen der `index.html` per Datei-URL reicht dafür nicht aus.

### Lokale Installation

1. Einen lokalen Webserver im Ordner `src` starten, zum Beispiel mit Simple Web Server 

2. Die Anwendung im Browser öffnen:

   ```text
   http://localhost:8000/
   ```

3. Im Browser die Installationsfunktion verwenden. In Chrome oder Edge erscheint diese meist in der Adressleiste oder im Browser-Menü als „App installieren“.

### Installation über einen Webserver

Für eine Installation auf anderen Endgeräten muss die PWA auf einem Webserver bereitgestellt werden, der per HTTPS erreichbar ist und ein gültiges offizielles Zertifikat besitzt. Danach kann die Anwendung über die HTTPS-Adresse geöffnet und über die Installationsfunktion des Browsers installiert werden.

## Autor
* Name: Dana Lenzig
* Studiengang: Medieninformatik
* Hochschule: HTW Dresden
