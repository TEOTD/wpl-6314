import React from "react";
import {HashRouter, Link, Redirect, Route, Switch, useLocation} from "react-router-dom";
import Header from "../Header";
import Example from "../Example";
import States from "../States";
import "./styles.css";

function RoutedSwitcher() {
    return (
        <HashRouter>
            <RoutedContent/>
        </HashRouter>
    );
}

function RoutedContent() {
    const location = useLocation();
    const isStatesActive = location.pathname === "/states";
    const isExampleActive = location.pathname === "/example";
    const toggleButton = (
        <div className="toggle-button">
            <Link
                to="/states"
                className={isStatesActive ? "disabled-link" : ""}
                onClick={(e) => isStatesActive && e.preventDefault()}
            >
                Switch to States
            </Link>
            <Link
                to="/example"
                className={isExampleActive ? "disabled-link" : ""}
                onClick={(e) => isExampleActive && e.preventDefault()}
            >
                Switch to Example
            </Link>
        </div>
    );

    return (
        <div>
            {location.pathname === "/" && <Redirect to="/example"/>}
            <Header button={toggleButton}/>
            <Switch>
                <Route path="/states" component={States}/>
                <Route path="/example" component={Example}/>
            </Switch>
        </div>
    );
}

export default RoutedSwitcher;
