"use strict";

class TableTemplate {
  // Replaces placeholders in the template with values from the dictionary
  static replaceFillers(template, dictionary) {
    const templateProcessor = new TemplateProcessor(template);
    return templateProcessor.fillIn(dictionary);
  }

  // Fills table cells based on the provided dictionary and column name
  static fillIn(id, dictionary, columnName) {
    const table = document.querySelector(`#${id}`); // Select the table by ID
    if (!table) return; // Exit if the table does not exist

    const headers = table.rows[0].querySelectorAll("td"); // Get the headers from the first row
    let columnIndex = -1; // Initialize column index

    // Update header text and find the index of the specified column
    headers.forEach((header, index) => {
      header.textContent = this.replaceFillers(header.textContent, dictionary);
      if (header.textContent === columnName) {
        columnIndex = index;
      }
    });

    // If the specified column is found, update its cells
    if (columnIndex !== -1) {
      [...table.rows].forEach((row, rowIndex) => {
        if (rowIndex > 0) { // Skip header row
          const cells = row.querySelectorAll("td"); // Get cells in the current row
          if (cells[columnIndex]) {
            cells[columnIndex].textContent = this.replaceFillers(
              cells[columnIndex].textContent,
              dictionary
            );
          }
        }
      });
    } else if (!columnName) { // If no column name is provided, fill all cells
      [...table.rows].forEach((row) => {
        [...row.querySelectorAll("td")].forEach((cell) => {
          cell.textContent = this.replaceFillers(cell.textContent, dictionary);
        });
      });
    }

    // Make the table visible if it was hidden
    if (table.style.visibility === "hidden") {
      table.style.visibility = "visible";
    }
  }
}
