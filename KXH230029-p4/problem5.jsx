import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css";
import RoutedSwitcher from "./components/RoutedSwitcher";

const root = ReactDOM.createRoot(document.getElementById("reactapp"));
root.render(
    <RoutedSwitcher/>
);
