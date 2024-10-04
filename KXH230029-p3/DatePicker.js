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

    const title = this.createElement("div", {
      className: "calender-header-title",
      id: `picker-calender-header-title-${this.id}`,
      textContent: "SELECT DATE",
    });

    const dayMonthYear = this.createElement("div", {
      className: "calender-header-day-month-year",
      id: `picker-calender-header-day-month-year-${this.id}`,
      textContent: `${this.shortDayNames[date.getDay()]}, ${
        this.shortMonthNames[date.getMonth()]
      } ${date.getFullYear().toString().slice(-2)}`,
    });

    header.appendChild(title);
    header.appendChild(dayMonthYear);
    return header;
  }

  renderCalendarArea() {
    const calenderArea = this.createElement("div", {
      className: "calender-area",
      id: `picker-calender-area-${this.id}`,
    });

    calenderArea.appendChild(this.renderCalendar());
    return calenderArea;
  }

  renderCalendar() {
    const calenderTable = this.createElement("table", {
      className: "calender-area-table",
    });

    const calenderThread = this.createElement("thead", {
      className: "calender-area-thread",
    });

    const calenderDaysRow = this.createElement("tr", {
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
    return calenderTable;
  }

  render(date) {
    const dateParent = document.querySelector(`#${this.id}`);
    if (!dateParent) return;
    dateParent.className = "picker-parent";

    const fragment = document.createDocumentFragment();

    fragment.appendChild(this.renderHeader(date));
    fragment.appendChild(this.renderCalendarArea());
    dateParent.appendChild(fragment);
  }
}
