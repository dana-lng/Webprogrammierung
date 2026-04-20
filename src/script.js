// Funktion um akutelles Jahr anzuzeigen + Tage im Kalender
document.addEventListener('DOMContentLoaded', function() {
    const yearContainter = document.getElementById('year');
    const monthContainer = document.querySelectorAll('.month');
    const prevButton = document.getElementById('prev');
    const nextButton = document.getElementById('next');
    let currentDate = new Date();
    let today = new Date();


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

            // Tage der Monate richtig anordnen
            const prevMonthLastDay = new Date(getYear, monthIndex, 0).getDate();

            for( let i = startDay; i > 0; i--) {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = prevMonthLastDay - i + 1;
                dayDiv.classList.add('fade');
                daysContainer.appendChild(dayDiv)
            }

            // erstellt für alle Tage ein Div 
            for(let i = 1; i <= lastDay; i++) {
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
        currentDate.setFullYear(currentDate.getFullYear() - 1);
        renderCalender(currentDate);
    });

    nextButton.addEventListener('click', function() {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        renderCalender(currentDate);
    });

    renderCalender(currentDate);
})