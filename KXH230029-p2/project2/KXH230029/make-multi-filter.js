"use strict"; // Enforces strict mode for better error handling

// Checks if the passed argument is a function
function isAFunction(functionToCheck) {
  return typeof functionToCheck === "function"; // Returns true if the type of functionToCheck is 'function'
}

// Creates a multi-filter function that can apply multiple filters to an array
function MakeMultiFilter(originalArray) {
  // Creates a copy of the original array to apply filters without mutating the original
  let currentArray = [...originalArray]; 
  
  // This is the function returned by MakeMultiFilter
  return function arrayFilterer(filterCriteria, callback) {
    // If the filterCriteria is not a function, return the current (filtered) array as it is
    if (!isAFunction(filterCriteria)) {
      return currentArray;
    }

    // Applies the filterCriteria to the current array to further filter the array
    currentArray = currentArray.filter(filterCriteria);

    // If a callback function is provided, then
    // call it with the original array as 'this' and the filtered array as an argument
    if (isAFunction(callback)) {
      callback.call(originalArray, currentArray);
    }

    // Returns the arrayFilterer function, allowing chaining of filters
    return arrayFilterer;
  };
}

