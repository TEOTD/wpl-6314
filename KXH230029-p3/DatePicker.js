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
  }

  //This is a common function used to create a tag and set tag attributes
  createElement(tag, attrs = {}) {
    const element = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      element[key] = value; // Set attributes for the created element
    });
    // Set a unique ID for each element based on the tag name and instance ID
    if (element.id) {
      element.id = `${element.id}-${this.id}`;
    } else {
      element.id = `${element.className}-${this.id}`;
    }
    return element;
  }

  //This is the area encompassing header + table area
  renderCalendarArea(date, dateParent) {
    const calenderArea = this.createElement("div", {
      className: "calender-area",
    });

    // Handle day selection in the calendar
    calenderArea.addEventListener("click", (event) => {
      const target = event.target;
      // Check if the clicked target is a valid day.
      // In current month then only call callback function and select date
      if (
        target.classList.contains("calender-day-data") &&
        !target.classList.contains("calender-day-dimmed")
      ) {
        const fixedDate = {
          month: date.getMonth() + 1,
          day: target.textContent,
          year: date.getFullYear(),
        };

        this.callback(this.id, fixedDate); // Invoke the callback with the selected date
        const selectedDay = dateParent.querySelector(".calender-day-selected");
        if (selectedDay) {
          selectedDay.classList.remove("calender-day-selected"); // Remove selection from previously selected day
        }

        target.classList.add("calender-day-selected"); // Mark the newly selected day
      }
    });

    // Render the calendar header and body
    calenderArea.append(this.renderHeader(date), this.renderCalendar(date));
    return calenderArea;
  }

  renderHeader(date) {
    const header = this.createElement("div", {
      className: "calender-header",
    });

    // Display the current month and year on top of calendar
    const dayMonthYear = this.createElement("div", {
      className: "calender-header-day-month-year",
      textContent: `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`,
    });

    // Create buttons for navigating to the previous and next months
    const prevMonth = this.createElement("div", {
      className: "calender-header-prev-month",
      textContent: "<",
    });

    const nextMonth = this.createElement("div", {
      className: "calender-header-next-month",
      textContent: ">",
    });

    // Set event listeners to update the calendar on button click of prevMonth and nextMonth
    prevMonth.addEventListener("click", () => this.updateCalendar(date, -1));
    nextMonth.addEventListener("click", () => this.updateCalendar(date, 1));

    header.append(dayMonthYear, prevMonth, nextMonth);
    return header;
  }

  updateCalendar(date, monthChange) {
    // Calculate the new date based on month change
    const newDate = new Date(date.getFullYear(), date.getMonth() + monthChange);
    this.render(newDate); // Re-render the calendar with the new date
  }

  renderCalendar(date) {
    const calenderTable = this.createElement("table", {
      className: "calender-area-table",
    });

    const calenderDaysRow = this.createElement("tr", {
      className: "calender-day-row",
    });

    // Render the header row with the names of the days
    this.shortDayNames.forEach((day) => {
      const calenderDay = this.createElement("th", {
        className: "calender-area-days-data",
        id: `calender-area-days-data-${day}`,
        textContent: day,
      });
      calenderDaysRow.appendChild(calenderDay);
    });

    // Append the grid to the table
    calenderTable.append(calenderDaysRow, this.getCalendarGrid(date));
    return calenderTable; // Return the constructed calendar table
  }

  getCalendarGrid(date) {
    // Determine the first day of the month and the number of days in the month
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

    let currentDate = 1; // Counter for the current date
    let nextMonthDate = 1; // Counter for the next month's date

     // Start from the last few days of the previous month
    let prevMonthDaysStart = daysInPrevMonth - firstDay + 1;

    let rowCount = 0; // To track the number of rows added
    let finished = false; // Flag to indicate when to stop rendering rows

    // Loop to create rows until all days are rendered
    while (!finished) {
      const row = this.createElement("tr", {
        className: "calender-day-row",
        id: `calender-day-row-${rowCount}-${this.id}`, // Scoped ID per calendar instance
      });

      // Flag to check if current month days are present in the week
      let weekHasCurrentMonthDay = false;

      for (let j = 0; j < 7; j++) {
        // Create cells for each day of the week
        const cell = this.createElement("td", {
          className: "calender-day-data",
          id: `calender-day-data-${j}-${this.id}`, // Scoped ID per calendar instance
        });

        // Fill in the cells for the previous month
        if (rowCount === 0 && j < firstDay) {
          cell.textContent = `${prevMonthDaysStart}`;
          prevMonthDaysStart++;
          cell.classList.add("calender-day-dimmed"); // Dimmed style for previous month days
        }
        // Fill in the cells for the next month
        else if (currentDate > daysInMonth) {
          cell.textContent = `${nextMonthDate}`;
          nextMonthDate++;
          cell.classList.add("calender-day-dimmed"); // Dimmed style for next month days
        } else {
          cell.textContent = `${currentDate}`; // Set the current date

          // Check if the current day is today
          const today = new Date();
          if (
            currentDate === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
          ) {
            cell.classList.add("calender-day-selected"); // Highlight today's date
          }

          // Mark that there is at least one current month day in this week
          weekHasCurrentMonthDay = true; 
          currentDate++; // Move to the next date
        }
        row.appendChild(cell); // Append the cell to the row
      }

      calendarBody.appendChild(row); // Append the completed row to the calendar body

      rowCount++; // Increment the row count

      // Check if all days have been rendered
      if (currentDate > daysInMonth && weekHasCurrentMonthDay) {
        finished = true; // End the loop if the current month days are all rendered
      }
    }
    return calendarBody; // Return the constructed calendar grid
  }

  render(date) {
    const dateParent = document.querySelector(`#${this.id}`); // Find the parent element for this date picker
    if (!dateParent) return; // Exit if the parent element is not found
    dateParent.className = "picker-parent"; // Set a class for styling
    const calendarArea = this.renderCalendarArea(date, dateParent); // Render the main calendar area
    dateParent.innerHTML = ""; // Clear the parent element
    dateParent.appendChild(calendarArea); // Append the new content to the parent element
  }
}
