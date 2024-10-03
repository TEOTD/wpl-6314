"use strict"; // Enforces strict mode to ensure better coding practices and error handling

// Class that processes a template string
// fills in fillers with corresponding values from a dictionary
class TemplateProcessor {
  // Constructor to initialize the template string
  constructor(template) {
    this.template = template; // Stores the template string provided when creating an instance
  }

  // Method to replace fillers in the template with values from the dictionary
  fillIn(dictionary) {
    // Uses a regular expression to find fillers in the format {{key}} and replace them
    return this.template.replace(/\{\{\w+\}\}/g, (filler) => {
      // Extracts the key name between the curly braces {{key}}
      const key = filler.slice(2, -2);
      // If the key exists in the dictionary, then
      // return the corresponding value; otherwise, keep the string as is
      return key in dictionary ? dictionary[key] : filler;
    });
  }
}

// Exposes the TemplateProcessor class to the global window object
window.TemplateProcessor = TemplateProcessor;
