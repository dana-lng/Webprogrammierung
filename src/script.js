let feiertageDaten = null;
let geburtstagsDaten = null;
let Geburtstage = [];
let randomGeburtstag = [];
let currentDate = new Date();
let today = new Date();

// Service Worker fuer die PWA registrieren
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(() => console.log('Service Worker registriert'))
        .catch(err => console.error('Fehler:', err));
}

// Feiertagsdaten einmalig aus der JSON-Datei laden
async function ladeFeiertage() {
    const response = await fetch('holidays.json');
    feiertageDaten = await response.json();
}

// Geburtstage fuer ein bestimmtes Datum aus der Wikimedia API laden
async function ladeGeburtstage(monat, tag) {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/feed/onthisday/births/${monat}/${tag}`);
    const geburtstagsDaten = await response.json();
    return geburtstagsDaten.births;
}

// Ostersonntag fuer ein Jahr berechnen
function berechneOstern(jahr) {
    const a = jahr % 19;                                    // Position im 19-Jahres-Mondzyklus (Metonischer Zyklus)
    const b = Math.floor(jahr / 100);                       // Jahrhundert
    const c = jahr % 100;                                   // Jahr innerhalb des Jahrhunderts
    const d = Math.floor(b / 4);                            // Schaltjahrkorrektur des Jahrhunderts
    const e = b % 4;                                        // Rest der Jahrhundertkorrektur
    const f = Math.floor((b + 8) / 25);                     // Mondkorrektur
    const g = Math.floor((b - f + 1) / 3);                  // weitere Mondkorrektur
    const h = (19*a + b - d - g + 15) % 30;                 // Abstand des Vollmonds vom 21. Maerz
    const i = Math.floor(c / 4);                            // Schaltjahrkorrektur des Jahres
    const k = c % 4;                                        // Rest der Jahreskorrektur
    const l = (32 + 2*e + 2*i - h - k) % 7;                 // Wochentag-Korrektur damit Ostern ein Sonntag ist
    const m = Math.floor((a + 11*h + 22*l) / 451);          // Sonderfall-Korrektur fuer April
    const monat = Math.floor((h + l - 7*m + 114) / 31);     // Ergibt 3 (Maerz) oder 4 (April)
    const tag = ((h + l - 7*m + 114) % 31) + 1;             // Tageszahl des Ostersonntags
    return new Date(jahr, monat - 1, tag);                  // monat - 1 weil JS Monate 0-basiert sind
}

// Buss- und Bettag ist der Mittwoch vor dem 23. November
function berechneBussBettag(jahr) {
    const nov23 = new Date(jahr, 10, 23);
    const wt = nov23.getDay();
    const tageZurueck = wt === 3 ? 7 : (wt + 4) % 7;
    const result = new Date(nov23);
    result.setDate(nov23.getDate() - tageZurueck);
    return result;
}

// Cache fuer berechnete Feiertage pro Jahr
const _feiertagCache = [];

// Feiertagsnamen fuer einen bestimmten Tag ermitteln
function getFeiertagName(jahr, monat, tag) {
    if (!feiertageDaten) return null;

    if (!_feiertagCache[jahr]) {
        const map = new Map();
        const ostern = berechneOstern(jahr);

        // statische Feiertage in die Jahresliste eintragen
        for (const ft of feiertageDaten.statisch) {
            const d = new Date(jahr, ft.monat - 1, ft.tag);
            map.set(d.toDateString(), ft.name);
        }

        // dynamische Feiertage berechnen und eintragen
        for (const ft of feiertageDaten.dynamisch) {
            let d;
            if (ft.tageVonOstern === null) {
                d = berechneBussBettag(jahr);
            }
            else {
                d = new Date(ostern);
                d.setDate(ostern.getDate() + ft.tageVonOstern);
            }
            map.set(d.toDateString(), ft.name);
        }
        _feiertagCache[jahr] = map;
    }

    const key = new Date(jahr, monat - 1, tag).toDateString();
    return _feiertagCache[jahr].get(key) || null;
}

// ISO-Kalenderwoche fuer ein Datum berechnen
function getCalenderWeek(date) {
    const tempDate = new Date(date);
    tempDate.setHours(0, 0, 0, 0);

    // Donnerstag bestimmt die Kalenderwoche
    tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));

    // KW 1 ist die Woche mit dem 4. Januar
    const week1 = new Date(tempDate.getFullYear(), 0, 4);

    return (1 + Math.round(((tempDate - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7 )) / 7);
}

// Kalender nach dem Laden der Seite aufbauen
document.addEventListener('DOMContentLoaded', async function() {
    const yearContainter = document.getElementById('year');
    const monthContainer = document.querySelectorAll('.month');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const select = document.getElementById('year');
    const load = document.getElementById('newload');
    const topbar = document.querySelector('.topbar');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');

    // Modal schliessen
    document.getElementById('modal-close').addEventListener('click', () => { modal.style.display = 'none';})

    // Modal mit Text anzeigen
    function zeigModal(text) {
        modalText.textContent = text;
        modal.style.display = 'flex';
    }

    // Browser-Titel dynamisch setzen
    const aktuellesDatum = today.getFullYear();
    document.title = `Jahreskalender ${aktuellesDatum}`;

    // Feiertage vor dem Rendern laden
    await ladeFeiertage();

    // Jahreskalender fuer das uebergebene Datum rendern
    function renderCalender(date) {
        const getYear = date.getFullYear();

        yearContainter.textContent = `${getYear}`;

        // Jahresauswahl von 2000 bis 2099 fuellen
        for (let i=2000; i<=2099; i++) {
            const yearOption = document.createElement('option');
            yearOption.textContent = i;
            yearOption.value = i;

            // Aktuelles Jahr vorauswaehlen
            if (i == getYear) {
                yearOption.selected = true;
            }
            select.appendChild(yearOption);
        }

        monthContainer.forEach((monthElement, monthIndex) => {
            const daysContainer = monthElement.querySelector('.days');
            const firstDay = new Date(getYear, monthIndex, 1).getDay();
            const lastDay = new Date(getYear, monthIndex + 1, 0).getDate();
            let startDay = firstDay === 0 ? 6 : firstDay - 1;

            // Alte Tageszellen entfernen
            daysContainer.innerHTML = '';

            // Erste Kalenderwoche des Monats anzeigen
            const firstDate = new Date(getYear, monthIndex, 1 - startDay);
            let currentWeek = getCalenderWeek(firstDate);

            const kwDiv = document.createElement('div');
            kwDiv.textContent = currentWeek;
            kwDiv.classList.add('kw');
            daysContainer.appendChild(kwDiv);

            // Tage aus dem Vormonat auffuellen
            const prevMonthLastDay = new Date(getYear, monthIndex, 0).getDate();
            for( let i = startDay; i > 0; i--) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = prevMonthLastDay - i + 1;
                dayDiv.classList.add('fade');
                daysContainer.appendChild(dayDiv)
            }

            // Tage des aktuellen Monats erzeugen
            for(let i = 1; i <= lastDay; i++) {
                const currentDayDate = new Date(getYear, monthIndex, i);

                // Bei Wochenbeginn neue KW-Zelle einfuegen
                if(currentDayDate.getDay() === 1 && i !== 1) {
                    const kwDiv = document.createElement('div');
                    kwDiv.textContent = getCalenderWeek(currentDayDate);
                    kwDiv.classList.add('kw');
                    daysContainer.appendChild(kwDiv);
                }

                const dayDiv = document.createElement('div');
                dayDiv.textContent = i;

                // Heutigen Tag markieren
                if(i === today.getDate() && monthIndex === today.getMonth() && getYear === today.getFullYear()) {
                    dayDiv.classList.add('today');
                }

                // Feiertage markieren und klickbar machen
                const feiertagName = getFeiertagName(getYear, monthIndex + 1, i);
                if (feiertagName) {
                    dayDiv.classList.add('feiertag');
                    dayDiv.dataset.feiertag = feiertagName;
                    dayDiv.addEventListener('click', () => zeigModal(`${feiertagName} - ${i}. ${monthIndex + 1}. ${getYear}`));
                }
                else {
                    dayDiv.addEventListener('click', async () => {
                        let zufaellige = [];
                        let key = `births_${String(monthIndex + 1).padStart(2, '0')}_${String(i).padStart(2, '0')}`;
                        let gespeichert = localStorage.getItem(key);
                        let daten;

                        if (gespeichert) {
                            // Gespeicherte Geburtstage verwenden
                            daten = JSON.parse(gespeichert);
                        }
                        else {
                            // Geburtstage laden und platzsparend speichern
                            daten = await ladeGeburtstage(String(monthIndex + 1).padStart(2, '0'), String(i).padStart(2, '0'));
                            const reduziert = daten.map(person => ({text: person.text, year: person.year}));
                            localStorage.setItem(key, JSON.stringify(reduziert));
                            daten = reduziert;
                        }

                        // Fuenf zufaellige Eintraege auswaehlen
                        while (zufaellige.length < 5) {
                            const person =
                                daten[Math.floor(Math.random() * daten.length)];

                            if (!zufaellige.includes(person)) {
                                zufaellige.push(person);
                            }
                        }

                        // Ausgewaehlte Geburtstage im Modal anzeigen
                        let text = '';
                        for (const person of zufaellige) {
                            text += `${person.text}, ${person.year}\n`;
                        }

                        zeigModal(text);
                    });
                }

                daysContainer.appendChild(dayDiv);
            }

            // Tage aus dem Folgemonat auffuellen
            const nextMonthStartDay = 8 - new Date(getYear, monthIndex + 1, 0).getDay() - 1;
            for(let i = 1; i <= nextMonthStartDay; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = i;
                dayDiv.classList.add('fade');
                daysContainer.appendChild(dayDiv);
            }
        });
    }

    // Kalender wieder auf heute setzen
    load.addEventListener('click', function() {
        renderCalender(today);
    });

    // Kalender bei geaenderter Jahresauswahl neu rendern
    select.addEventListener('change', function() {
        const year = new Date(select.value, 0, 1);
        renderCalender(year);
    });

    // Ein Jahr zurueckblaettern
    prevButton.addEventListener('click', function() {
       let newYear = currentDate.getFullYear() - 1;

        if (newYear >= 2000) {
            currentDate.setFullYear(newYear);
            renderCalender(currentDate);
        }
    });

    // Ein Jahr weiterblaettern
    nextButton.addEventListener('click', function() {
        let newYear = currentDate.getFullYear() + 1;

        if (newYear <= 2099) {
            currentDate.setFullYear(newYear);
            renderCalender(currentDate);
        }
    });

    renderCalender(currentDate);
})
