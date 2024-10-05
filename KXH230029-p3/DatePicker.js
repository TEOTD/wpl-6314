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
    this.dayNames = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    this.shortMonthNames = this.monthNames.map((month) => month.slice(0, 3));
    this.shortDayNames = this.dayNames.map((day) => day.slice(0, 3));
  }

  getSuffix(day) {
    if (day > 3 && day < 21) return "th";
    const suffixes = ["th", "st", "nd", "rd"];
    const lastDigit = day % 10;
    return suffixes[lastDigit] || "th";
  }

  createElement(tag, attrs = {}) {
    const element = document.createElement(tag);
    Object.keys(attrs).forEach((key) => {
      element[key] = attrs[key];
    });
    return element;
  }

  renderHeader(date) {
    const header = this.createElement("div", {
      className: "calender-header",
      id: `picker-calender-header-${this.id}`,
    });

    const dayMonthYear = this.createElement("div", {
      className: "calender-header-day-month-year",
      id: `picker-calender-header-day-month-year-${this.id}`,
      textContent: `${
        this.monthNames[date.getMonth()]
      } ${date.getFullYear()}`,
    });

    const prevMonth = this.createElement("div", {
      className: "calender-header-prev-month",
      id: `picker-calender-header-prev-month-${this.id}`,
      textContent: "<"
    });

    const nextMonth = this.createElement("div", {
      className: "calender-header-next-month",
      id: `picker-calender-header-next-month-${this.id}`,
      textContent: ">"
    });

    header.appendChild(dayMonthYear);
    header.appendChild(prevMonth);
    header.appendChild(nextMonth);
    return header;
  }

  renderCalendarArea(date) {
    const calenderArea = this.createElement("div", {
      className: "calender-area",
      id: `picker-calender-area-${this.id}`,
    });

    calenderArea.appendChild(this.renderCalendar(date));
    return calenderArea;
  }

  renderCalendar(date) {
    const calenderTable= this.createElement("table", {
      className: "calender-area-table",
    });

    const calenderThread= this.createElement("thead", {
      className: "calender-area-thread",
    });

    const calenderDaysRow= this.createElement("tr", {
      className: "calender-area-days-row",
    });

    this.shortDayNames.forEach((day) => {
      const calenderDay = this.createElement("th", {
        className: "calender-area-days-data",
        id: `calender-area-days-data-${day}-${this.id}`,
        textContent: day,
      });
      calenderDaysRow.appendChild(calenderDay);
    });

    calenderThread.appendChild(calenderDaysRow);
    calenderTable.appendChild(calenderThread);
    calenderTable.appendChild(this.getCalendarGrid(date));
    return calenderTable;
  }


  getCalendarGrid(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const daysInPrevMonth = new Date(date.getFullYear(), date.getMonth(), 0).getDate();

    const calendarBody = this.createElement("tbody", {
      id: "calendarBody",
    });

    let current_date = 1;
    let next_month_date = 1;

    let prevMonthDaysStart = daysInPrevMonth - firstDay + 1;

    let rowCount = 0;
    let finished = false;

    while (!finished) {
      const row = this.createElement("tr");
      let weekHasCurrentMonthDay = false;

      for (let j = 0; j < 7; j++) {
        const cell = this.createElement("td", {
          className: "calender-area-day",
        });

        if (rowCount === 0 && j < firstDay) {
          cell.textContent = prevMonthDaysStart++;
          cell.classList.add("calender-day-dimmed");
        } else if (current_date > daysInMonth) {
          cell.textContent = next_month_date++;
          cell.classList.add("calender-day-dimmed");
        } else {
          cell.textContent = current_date;

          const today = new Date();
          if (
              current_date === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear()
          ) {
            cell.classList.add("calender-day-today");
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

    fragment.appendChild(this.renderHeader(date));
    fragment.appendChild(this.renderCalendarArea(date));
    dateParent.appendChild(fragment);
  }
}
