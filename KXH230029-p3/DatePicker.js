"use strict";

class DatePicker {
  constructor(id, callback) {
    this.id = id;
    this.callback = callback;

    this.monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    this.shortDayNames = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    this.selectedDate = null;
  }

  createElement(tag, attrs = {}) {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element[key] = value;
    });
    if (element.id) {
      element.id = `${element.id}-${this.id}`;
    } else {
      element.id = `${element.className}-${this.id}`;
    }
    return element;
  }

  renderHeader(date) {
    const header = this.createElement("div", {
      className: "calender-header",
    });

    const dayMonthYear = this.createElement("div", {
      className: "calender-header-day-month-year",
      textContent: `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`,
    });

    const prevMonth = this.createElement("div", {
      className: "calender-header-prev-month",
      textContent: "<",
    });

    const nextMonth = this.createElement("div", {
      className: "calender-header-next-month",
      textContent: ">",
    });

    header.append(dayMonthYear, prevMonth, nextMonth);
    return { header, prevMonth, nextMonth };
  }

  renderCalendarArea(date) {
    const calenderArea = this.createElement("div", {
      className: "calender-area",
    });
    calenderArea.appendChild(this.renderCalendar(date));
    return calenderArea;
  }

  renderCalendar(date) {
    const calenderTable = this.createElement("table", {
      className: "calender-area-table",
    });

    const calenderThread = this.createElement("thead", {
      className: "calender-thread",
    });

    const calenderDaysRow = this.createElement("tr", {
      className: "calender-day-row",
    });

    this.shortDayNames.forEach((day) => {
      const calenderDay = this.createElement("th", {
        className: "calender-area-days-data",
        id: `calender-area-days-data-${day}`,
        textContent: day,
      });
      calenderDaysRow.appendChild(calenderDay);
    });

    calenderThread.appendChild(calenderDaysRow);
    calenderTable.append(calenderThread, this.getCalendarGrid(date));
    return calenderTable;
  }

  getCalendarGrid(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0
    ).getDate();
    const daysInPrevMonth = new Date(
      date.getFullYear(),
      date.getMonth(),
      0
    ).getDate();

    const calendarBody = this.createElement("tbody", {
      id: `calendarBody-${this.id}`,
    });

    let current_date = 1;
    let next_month_date = 1;

    let prevMonthDaysStart = daysInPrevMonth - firstDay + 1;

    let rowCount = 0;
    let finished = false;

    while (!finished) {
      const row = this.createElement("tr", {
        className: "calender-day-row",
        id: `calender-day-row-${rowCount}-${this.id}`, // Scoped ID per calendar instance
      });
      let weekHasCurrentMonthDay = false;

      for (let j = 0; j < 7; j++) {
        const cell = this.createElement("td", {
          className: "calender-day-data",
          id: `calender-day-data-${j}-${this.id}`, // Scoped ID per calendar instance
        });

        if (rowCount === 0 && j < firstDay) {
          cell.textContent = `${prevMonthDaysStart}`;
          prevMonthDaysStart++;
          cell.classList.add("calender-day-dimmed");
        } else if (current_date > daysInMonth) {
          cell.textContent = `${next_month_date}`;
          next_month_date++;
          cell.classList.add("calender-day-dimmed");
        } else {
          cell.textContent = `${current_date}`;

          const today = new Date();
          if (
            current_date === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            cell.classList.add("calender-day-selected");
          }

          weekHasCurrentMonthDay = true;
          current_date++;
        }
        row.appendChild(cell);
      }

      calendarBody.appendChild(row);

      rowCount++;

      if (current_date > daysInMonth && weekHasCurrentMonthDay) {
        finished = true;
      }
    }
    return calendarBody;
  }

  render(date) {
    const dateParent = document.querySelector(`#${this.id}`);
    if (!dateParent) return;
    dateParent.className = "picker-parent";

    const fragment = document.createDocumentFragment();
    const { header, prevMonth, nextMonth } = this.renderHeader(date);

    const updateCalendar = (monthChange) => {
      const newDate = new Date(
        date.getFullYear(),
        date.getMonth() + monthChange
      );
      this.render(newDate);
    };

    prevMonth.addEventListener("click", () => updateCalendar(-1));
    nextMonth.addEventListener("click", () => updateCalendar(1));

    const calendarArea = this.renderCalendarArea(date);
    calendarArea.addEventListener("click", (event) => {
      const target = event.target;
      if (
        target.classList.contains("calender-day-data") &&
        !target.classList.contains("calender-day-dimmed")
      ) {
        const selectedDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          target.textContent
        );
        const fixedDate = {
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
          year: selectedDate.getFullYear(),
        };

        this.callback(this.id, fixedDate);
        const selectedDay = dateParent.querySelector(".calender-day-selected");
        if (selectedDay) {
          selectedDay.classList.remove("calender-day-selected");
        }
        target.classList.add("calender-day-selected");
        this.selectedDate = selectedDate;
      }
    });

    fragment.append(header, calendarArea);
    dateParent.innerHTML = "";
    dateParent.appendChild(fragment);
  }
}
