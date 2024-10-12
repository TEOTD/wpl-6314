import React from "react";
import ReactDOM from "react-dom/client";

import States from "./components/States";
import Header from "./components/Header";

const root = ReactDOM.createRoot(document.getElementById("reactapp"));
root.render(
    <>
        <Header />
        <States />
    </>
);
