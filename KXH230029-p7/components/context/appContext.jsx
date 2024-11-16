import {createContext} from "react";

// Creating context to select advanced features and to display the page title.
// eslint-disable-next-line no-unused-vars
export const AdvancedContext = createContext([true, p => {
}]);
// eslint-disable-next-line no-unused-vars
export const LoginContext = createContext([true, b => {
}]);
// eslint-disable-next-line no-unused-vars
export const LoggedInUserContext = createContext([null, b => {
}]);
// eslint-disable-next-line no-unused-vars
export const ReloadContext = createContext([true, p => {
}]);