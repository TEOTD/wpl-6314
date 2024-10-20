import React, {useMemo} from "react";
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

    // Get current location
    const location = useLocation();

    // Extract paths and labels from model
    const {paths, pathLabelMapping} = window.models.switcherModel();

    // Check if the current path is active
    const isActive = (path) => location.pathname === path;

    // Create the toggle button with memoization to avoid unnecessary re-renders
    const toggleButton = useMemo(() => (
        <div className="toggle-button">
            {/*Loop through path label mapping and map them to make links*/}
            {pathLabelMapping.map(({path, label}) => (
                <Link
                    key={path}
                    to={path}
                    className={isActive(path) ? "generic-button disabled-link" : "generic-button"}
                    // Prevent press of navigation if already active
                    onClick={(e) => isActive(path) && e.preventDefault()}
                >
                    {label}
                </Link>
            ))}
        </div>
    ), [pathLabelMapping, isActive]);

    return (
        <div>
            <Header button={toggleButton}/> {/* Pass the toggle button to the Header */}
            <Switch>
                {/* Redirect default path to the example page */}
                <Redirect exact from={paths.defaultPath} to={paths.examplePath}/>
                {/* Define routes for the States and Example components */}
                <Route path={paths.statesPath} component={States}/>
                <Route path={paths.examplePath} component={Example}/>
            </Switch>
        </div>
    );
}

export default RoutedSwitcher;
