    
    let feiertageDaten = null;

    // Lädt holiydays.json per Axas einmalig beim Start
    async function ladeFeiertage() {
        const response = await fetch('holidays.json');
        feiertageDaten = await response.json();        
    }

    // Gaußsche Osterformel - berechnet den Ostersonntag für ein gegebenes Jahr
    function berechneOstern(jahr) {
        const a = jahr % 19;                            // Position im 19-Jahres-Mondzyklus (Metonischer Zyklus)
        const b = Math.floor(jahr / 100);              // Jahrhundert
        const c = jahr % 100;                          // Jahr innerhalb des Jahrhunderts
        const d = Math.floor(b / 4);                   // Schaltjahrhkorrektur des Jahrhunderts
        const e = b % 4;                               // Rest der Jahrhundertkorrektur
        const f = Math.floor((b + 8) / 25);            // Mondkorrektur
        const g = Math.floor((b - f + 1) / 3);         // weitere Mondkorrektur
        const h = (19*a + b - d - g + 15) % 30;        // Abstand des Vollmonds vom 21. März
        const i = Math.floor(c / 4);                   // Schaltjahreskorrektur des Jahres
        const k = c % 4;                               // Rest der Jahreskorrektur
        const l = (32 + 2*e + 2*i - h - k) % 7;        // Wochentag-Korrektur damit Ostern ein Sonntag ist
        const m = Math.floor((a + 11*h + 22*l) / 451); // Sonderfall-Korrektur für April
        const monat = Math.floor((h + l - 7*m + 114) / 31);     // Ergibt 3 (März) oder 4 (April)
        const tag = ((h + l - 7*m + 114) % 31) + 1;             // Tageszahl des Ostersonntags
        return new Date(jahr, monat - 1, tag);          // monat - 1 weil JS Monate 0-basiert sind
    }

    // Buß- und Bettag = Mittwoch vor dem 23. November 
    function berechneBussBettag(jahr) {
        const nov23 = new Date(jahr, 10, 23);
        const wt = nov23.getDay();
        const tageZurueck = wt === 3 ? 7 : (wt + 4) % 7;
        const result = new Date(nov23);
        result.setDate(nov23.getDate() - tageZurueck);
        return result;
    }

    const _feiertagCache = [];

    function getFeiertagName(jahr, monat, tag) {
        if (!feiertageDaten) return null;

        if (!_feiertagCache[jahr]) {
            const map = new Map();
            const ostern = berechneOstern(jahr);

            // statische Feiertage
            for (const ft of feiertageDaten.statisch) {
                const d = new Date(jahr, ft.monat - 1, ft.tag);
                map.set(d.toDateString(), ft.name);
            }

            // dynamische Feiertage
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

    // Berechnung der Kalenderwochen
    function getCalenderWeek(date) {
        const tempDate = new Date(date);
        tempDate.setHours(0, 0, 0, 0);

        // Donnerstag der aktuellen Woche bestimmen
        tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));

        // nimmt den 4. Januar (der liegt immer im neuen Jahr)
        const week1 = new Date(tempDate.getFullYear(), 0, 4);

        return (1 + Math.round(((tempDate - week1) / 86400000 - 3 + (week1.getDay() + 6) % 7 )) / 7); 
    }



// Funktion um akutelles Jahr anzuzeigen + Tage im Kalender
document.addEventListener('DOMContentLoaded', async function() {
    const yearContainter = document.getElementById('year');
    const monthContainer = document.querySelectorAll('.month');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    const select = document.getElementById('year');
    const load = document.getElementById('newload');
    const hide = document.getElementById('hide');
    const topbar = document.querySelector('.topbar');
    let currentDate = new Date();
    let today = new Date();
    // Modal-Logik, damit Anzeige der Feiertage schöner ist
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    document.getElementById('modal-close').addEventListener('click', () => { modal.style.display = 'none';})

    // Hilfsfunktion um Modal zu öffnen
    function zeigModal(text) {
        modalText.textContent = text;
        modal.style.display = 'flex';
    }
    
    // Feiertage laden bevor der Kalender gerändert wird
    await ladeFeiertage();

    function renderCalender(date) {
        const getYear = date.getFullYear();

        yearContainter.textContent = `${getYear}`;

        // alle Jahre im select-Element einfügen
        for (let i=2000; i<=2099; i++) {                            // Grenzen sind fix, deswegen hard gecodet
            const yearOption = document.createElement('option');
            yearOption.textContent = i;
            yearOption.value = i;
            // aktuelles Jahr als Standart setzen
            if (i == getYear) {
                yearOption.selected = true;
            }
            select.appendChild(yearOption);
        }

        monthContainer.forEach((monthElement, monthIndex) => {
            const daysContainer = monthElement.querySelector('.days');
            const firstDay = new Date(getYear, monthIndex, 1).getDay();
            const lastDay = new Date(getYear, monthIndex + 1, 0).getDate();
            let startDay = firstDay === 0 ? 6 : firstDay - 1;               // bei Js ist Sonntag = 0, man muss umrechnen, damit Montag = 0

            // leert Container, damit beim Neuladen nichts doppelt ist
            daysContainer.innerHTML = '';


            // KW der ersten Kalenderwoche
            const firstDate = new Date(getYear, monthIndex, 1 - startDay);
            let currentWeek = getCalenderWeek(firstDate);

            // KW-Zelle für für die erste Zeile
            const kwDiv = document.createElement('div');
            kwDiv.textContent = currentWeek;
            kwDiv.classList.add('kw');
            daysContainer.appendChild(kwDiv);

            // leere Tage vor Monatsbeginn
            const prevMonthLastDay = new Date(getYear, monthIndex, 0).getDate();

            // Tage der Monate richtig anordnen
            for( let i = startDay; i > 0; i--) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = prevMonthLastDay - i + 1;
                dayDiv.classList.add('fade');
                daysContainer.appendChild(dayDiv)
            }

            // erstellt für alle Tage ein Div 
            for(let i = 1; i <= lastDay; i++) {
                const currentDayDate = new Date(getYear, monthIndex, i);

                // Wenn Montag & nicht der 1. Tag: neue KW-Zelle einfügen
                if(currentDayDate.getDay() === 1 && i !== 1) {
                    const kwDiv = document.createElement('div');
                    kwDiv.textContent = getCalenderWeek(currentDayDate);
                    kwDiv.classList.add('kw');
                    daysContainer.appendChild(kwDiv);
                }

                const dayDiv = document.createElement('div');
                dayDiv.textContent = i;

                // markiert den heutigen Tag
                if(i === today.getDate() && monthIndex === today.getMonth() && getYear === today.getFullYear()) {
                    dayDiv.classList.add('today');
                }

                // Feiertage prüfen und markieren
                const feiertagName = getFeiertagName(getYear, monthIndex + 1, i);
                if (feiertagName) {
                    dayDiv.classList.add('feiertag');
                    dayDiv.dataset.feiertag = feiertagName;

                    // Klick: Feiertagname anzeigen
                    dayDiv.addEventListener('click', () => zeigModal(`${feiertagName} - ${i}. ${monthIndex + 1}. ${getYear}`));

                }

                daysContainer.appendChild(dayDiv);

            }

            // Tage des nächsten Monat
            const nextMonthStartDay = 8 - new Date(getYear, monthIndex + 1, 0).getDay() - 1;
            for(let i = 1; i <= nextMonthStartDay; i++) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = i;
                dayDiv.classList.add('fade');
                daysContainer.appendChild(dayDiv);
            }

        });

    }

    // lädt PWA neu
    load.addEventListener('click', function() {
        renderCalender(today);
    });

    // wählt das Jahr im select-Element aus + ändert den kalender 
    select.addEventListener('change', function() {
        const year = new Date(select.value, 0, 1);
        renderCalender(year);
    });

    // Jahr verringern, wenn man auf zurück klickt
    prevButton.addEventListener('click', function() {
       let newYear = currentDate.getFullYear() - 1;

        if (newYear >= 2000) {
            currentDate.setFullYear(newYear);
            renderCalender(currentDate);
        }
        
    });

    // Jahr erhöhen, wenn man auf das Nächste klickt
    nextButton.addEventListener('click', function() {
        let newYear = currentDate.getFullYear() + 1;

        if (newYear <= 2099) {
            currentDate.setFullYear(newYear);
            renderCalender(currentDate);
        }
        
    });

    hide.addEventListener('click', function() {
        if(topbar.style.display == 'none') {
            topbar.style.display = 'flex';
        }
        else {
            topbar.style.display = 'none';

        }

    });

    renderCalender(currentDate);
})