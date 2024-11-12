import { createContext } from "react";

// Creating context to select advanced features and to display the page title.
export const PageContext = createContext(["Home Page", () => {}]);
export const AdvancedContext = createContext([true, () => {}]);