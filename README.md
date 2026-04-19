# Jahreskalender PWA – Sachsen (2000–2099)

## Beschreibung

Dieses Projekt ist eine Progressive Web App (PWA), die einen Jahreskalender für das Bundesland Sachsen im Zeitraum 2000 bis 2099 berechnet und darstellt.

Die Anwendung wurde im Rahmen des Moduls Webprogrammierung entwickelt.

Die PWA zeigt alle Monate eines Jahres übersichtlich an und hebt sowohl aktuelle Tage als auch Feiertage hervor. Zusätzlich können über eine API Geburtstage berühmter Persönlichkeiten angezeigt werden.

## Technische Umsetzung

### Technologien
* HTML5
* CSS3 (inkl. Grid Layout)
* JavaScript (Vanilla)

### Datenverarbeitung
Feiertage:
* Statisch: fest definiert
* Dynamisch: berechnet (z. B. Gaußsche Osterformel)
Speicherung:
* JSON (lokal oder extern geladen)

### API
* Nutzung der Wikimedia API ("On this day")
* Daten werden beim Start geladen und im localStorage gespeichert

## Autor
* Name: Dana Lenzig
* Studiengang: Medieninformatik
* Hochschule: HTW Dresden
