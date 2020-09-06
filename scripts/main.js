$(function(){

    $('.input-plus').click(function(event) {
        event.preventDefault();
        var input = $(this).parents('.week-days__input').find('input')[0];
        input.valueAsNumber += 1;
    })

    $('.input-minus').click(function(event) {
        event.preventDefault();
        var input = $(this).parents('.week-days__input').find('input')[0];
        if (input.valueAsNumber > 0) {
            input.valueAsNumber -= 1;
        }
    })

    const animateDuration = 500;
    const transitionDuration = 300;

    const monthsNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
    const weekDaysNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
    var calendarMonth = 0;
    var calendarYear = 0;

    
    var weekendsData = localStorage.getItem('weekends');
    if (!weekendsData) {
        var weekends = {};
    } else {
        var weekends = JSON.parse(weekendsData);
    }

    function getLocalDay(date) {

        let day = date.getDay();
      
        if (day == 0) {
            day = 7;
        }
      
        return day - 1;
    }

    function formatDate(date) {
        var d = new Date(date),
            month = '' + (d.getMonth() + 1),
            day = '' + d.getDate(),
            year = d.getFullYear();
    
        if (month.length < 2) 
            month = '0' + month;
        if (day.length < 2) 
            day = '0' + day;
    
        return [day, month, year].join('.');
    }

    function weekendEntryCheck(year, month, day) {
        return year in weekends && month in weekends[year] && weekends[year][month].includes(day)
    }

    function updateCalendar() {
        let year = calendarYear;
        let month = calendarMonth;
        let d = new Date(year, month);

        let table = '<tr>';
        weekDaysNames.forEach(element => {
            table += `<th>${element}</th>`
        });
        table += '<tr>'
        

        for (let i = 0; i < getLocalDay(d); i++) {
            table += '<td></td>';
        }

        while (d.getMonth() == month) {
            day = d.getDate()
            bgClass = ''
            if (weekendEntryCheck(year, month, day)) {
                bgClass = ' calendar__day-active'
            }
            table += `<td class="calendar__day${bgClass}">${day}</td>`;

            if (getLocalDay(d) % 7 == 6) {
                table += '</tr><tr>';
            }

            d.setDate(day + 1);
        }

        if (getLocalDay(d) != 0) {
            for (let i = getLocalDay(d); i < 7; i++) {
                table += '<td></td>';
            }
        }

        table += '</tr>';

        $('.calendar__month').html(monthsNames[month]);
        $('.calendar__year').html(year);
        $('.calendar__table').html(table);
    }



    function removeNote(note){
        note.animate({
            'opacity': 0
        }, animateDuration);
        note.promise().done(function() {
            note.remove();
        });
    }

    function addNote(text, classes) {
        newNote = $(`<div class="note ${classes}"><div class="note__text">${text}</div><button class="note__close-button">&#xD7;</button></div>`);
        $('.notes-container').append(newNote);
        newNote.animate({
            'opacity': 1,
            'right': '20px',
        }, animateDuration);
        setInterval(removeNote, 4000, newNote);
    }

    $(document).on('click', '.note__close-button', function(event) {
        note = $(this).parents('.note');
        removeNote(note);
    })



    $('.start-date input')[0].valueAsDate = new Date();
    
    
    
    const modalDuration = 300;
    const modalWindows = {
        "about-button": ".modal__about",
        "change-weekends-button": ".modal__change-weekends"
    }

    function closeModal(fadeOutElement){
        fadeOutElement.fadeOut(modalDuration);
        $("html, body").removeClass('disable-scroll');
        for (var cls in modalWindows) {
            $(modalWindows[cls]).hide();
        };
    }

    $('.open-modal').click(function(event){
        event.preventDefault();
        target = $(event.target);
        for (var cls in modalWindows) {
            if (target.hasClass(cls)) {
                $(modalWindows[cls]).fadeIn(modalDuration);
            }
        };
        $(".modal-fade").fadeIn(modalDuration);
        $("html, body").addClass('disable-scroll');
    });

    $('.modal__close-button').click(function(event) {
        event.preventDefault();
        closeModal($(this).parents(".modal-fade"));
    });

    $(".modal-fade").click(function(event) {
        if (!($(event.target).closest('.modal').length)) {
            closeModal($(this));
        }
    });

    $('.calendar__export').click(function(event) {
        event.preventDefault();
        
        var json = JSON.stringify(weekends);
        var blob = new Blob([json], {type: "application/json"});
        var url  = URL.createObjectURL(blob);

        var a = $(`<a></a>`);
        a.css('display', 'none');
        a.attr({
            'href': url,
            'download': 'scheduler_dates.json'
        });
        a[0].click();
        a.remove();
    })

    $('.calendar__input-file').change(function(event) {
        var file = this.files[0];

        if (!file) {
            return;
        }

        var reader = new FileReader();

        reader.onload = function(e) {
            var stringData = reader.result;

            try {
                data = JSON.parse(stringData);
                weekends = data;
                updateCalendar();
                localStorage.setItem('weekends', JSON.stringify(weekends));
                addNote('Данные успешно импортированы', 'success');
            } catch (error) {
                addNote('Произошла ошибка при импорте данных', 'error');
            }
        };
        reader.readAsText(file);
    })

    $('.calendar__close-button').click(function(event) {
        event.preventDefault();
        closeModal($(this).parents(".modal-fade"));
    });

    $('.week-days__toggle-list-button').click(function(event) {
        event.preventDefault();

        $('.week-days__list').slideToggle(transitionDuration);
        $(this).toggleClass('rotate');
    })

    $(".copy-dates-button").click(function(event) {
        event.preventDefault();

        var dates = []

        $.each($('.result__date'), function(index, item) {
            dates.push($(item)[0].textContent);
        });

        navigator.clipboard.writeText(dates.join('\n'));

        addNote('Даты скопированы в буфер обмена', 'success')
    });

    $(".plan-tasks-button").click(function(event) {
        event.preventDefault();

        function getWeekDaysArray() {
            var weekDays = [];
            $.each($(".week-days__list input"), function(index, item) {
                weekDays.push($(item)[0].valueAsNumber);
            });
            return weekDays;
        }

        var weekDays = getWeekDaysArray();
        if (!(weekDays.some((element) => element > 0))) {
            return addNote('Выберите количество задач', 'error');
        }

        var startDate = $(".start-date input")[0].valueAsDate;
        var tasks = $('.tasks textarea')[0].value.split('\n');
        var tasks = tasks.filter((element) => Boolean(element));
        if (tasks.length == 0) {
            return addNote('В списке должна быть хотя бы одна задача', 'error');
        }

        var currentDay = startDate;
        var weekDay = getLocalDay(currentDay);
        var weekDayCount = 0;

        var table = '';

        tasks.forEach(function(task, index) {
            while (weekDays[weekDay] == weekDayCount || weekendEntryCheck(currentDay.getFullYear(), currentDay.getMonth(), currentDay.getDate())) {
                weekDayCount = 0;
                weekDay += 1;
                if (weekDay > 6) {
                    weekDay = 0;
                }
                currentDay.setDate(currentDay.getDate() + 1);
            }

            weekDayCount += 1;

            var date = formatDate(currentDay);
            table += `<tr><td class="result__number">${index + 1}</td><td class="result__date">${date}</td><td class="result__task">${task}</td></tr>`;
        });

        $('.result table').empty();
        $('.result table').html(table);
        $('.result__empty').hide();
        $('.result__container').show();
        $('.copy-dates-button').show();

        addNote('Задачи успешно спланированы', 'success');
    });

    $('.change-weekends-button').click(function(event) {
        var startDate = $(".start-date input")[0].valueAsDate;
        calendarMonth = startDate.getMonth();
        calendarYear = startDate.getFullYear();
        updateCalendar();
    });

    $('.calendar__prev-month').click(function(event) {
        calendarMonth -= 1;
        if (calendarMonth < 0) {
            calendarMonth = 11;
            calendarYear -= 1;
        }
        updateCalendar();
    });

    $('.calendar__next-month').click(function(event) {
        calendarMonth += 1;
        if (calendarMonth > 11) {
            calendarMonth = 0;
            calendarYear += 1;
        }
        updateCalendar();
    });

    $('.calendar__table').on('click', '.calendar__day', function(event) {
        cell = $(event.target);
        day = parseInt(cell[0].textContent);
        month = calendarMonth;
        year = calendarYear;
        
        if (weekendEntryCheck(year, month, day)) {
            cell.removeClass('calendar__day-active');
            var index = weekends[year][month].indexOf(day);
            if (index >= 0) {
                weekends[year][month].splice(index, 1);
            }
        } else {
            cell.addClass('calendar__day-active');
            if (!(year in weekends)) {
                weekends[year] = {};
            }
            if (!(month in weekends[year])) {
                weekends[year][month] = [];
            }
            weekends[year][month].push(day);
        }

        localStorage.setItem('weekends', JSON.stringify(weekends));
    });
});