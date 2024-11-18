import {createContext} from "react";

// Creating context to select advanced features, for login and reloading on input of comments.
// Context used to check if the advanced options is enables
export const AdvancedContext = createContext([true,]);
// Used as a login flag
export const LoginContext = createContext([true,]);
// Used to get the logged in user
export const LoggedInUserContext = createContext([null,]);
// Context used to reload cound of comments and photos as well as
// reload photos page on photo upload.
export const ReloadContext = createContext([true,]);
// Context used to handle opening of bookmark links.
export const FirstLoadContext = createContext([true,]);
