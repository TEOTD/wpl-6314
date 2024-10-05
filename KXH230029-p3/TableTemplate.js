"use strict";

class TableTemplate {
  static replaceFillers(template, dictionary) {
    const templateProcessor = new TemplateProcessor(template);
    return templateProcessor.fillIn(dictionary);
  }

  static fillIn(id, dictionary, columnName) {
    const table = document.querySelector(`#${id}`);
    if (!table) return;
    const headers = table.rows[0].querySelectorAll("td");
    let columnIndex = -1;
    headers.forEach((header, index) => {
      header.textContent = this.replaceFillers(header.textContent, dictionary);
      if (header.textContent === columnName) {
        columnIndex = index;
      }
    });

    if (columnIndex !== -1) {
      [...table.rows].forEach((row, rowIndex) => {
        if (rowIndex > 0) {
          const cells = row.querySelectorAll("td");
          if (cells[columnIndex]) {
            cells[columnIndex].textContent = this.replaceFillers(
              cells[columnIndex].textContent,
              dictionary
            );
          }
        }
      });
    } else if (!columnName) {
      [...table.rows].forEach((row) => {
        [...row.querySelectorAll("td")].forEach((cell) => {
          cell.textContent = this.replaceFillers(cell.textContent, dictionary);
        });
      });
    }

    if (table.style.visibility === "hidden") {
      table.style.visibility = "visible";
    }
  }
}
