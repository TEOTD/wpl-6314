import {createContext} from "react";

// Creating context to select advanced features and to display the page title.
export const AdvancedContext = createContext([true, p => {
}]);
export const LoginContext = createContext([true, b => {
}]);
export const LoggedInUserContext = createContext([null, b => {
}]);
export const ReloadContext = createContext([true, p => {
}]);