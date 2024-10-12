import React from "react";
import ReactDOM from "react-dom/client";
import "./styles/main.css";
import Example from "./components/Example";
import Header from "./components/Header";

const root = ReactDOM.createRoot(document.getElementById("reactapp"));
root.render(
    <>
        <Header />
        <Example />
    </>
);
