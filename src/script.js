// Funktion um akutelles Jahr anzuzeigen + Tage im Kalender
document.addEventListener('DOMContentLoaded', function() {
    const yearContainter = document.getElementById('year');
    const monthContainer = document.querySelectorAll('.month');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    let currentDate = new Date();
    let today = new Date();

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

    function renderCalender(date) {
        const getYear = date.getFullYear();
        

        yearContainter.textContent = `${getYear}`;

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

    prevButton.addEventListener('click', function() {
       let newYear = currentDate.getFullYear() - 1;

        if (newYear >= 2000) {
            currentDate.setFullYear(newYear);
            renderCalender(currentDate);
        }
        
    });

    nextButton.addEventListener('click', function() {
        let newYear = currentDate.getFullYear() + 1;

        if (newYear <= 2099) {
            currentDate.setFullYear(newYear);
            renderCalender(currentDate);
        }
        
    });

    renderCalender(currentDate);
})