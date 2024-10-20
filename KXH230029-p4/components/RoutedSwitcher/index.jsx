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
    const location = useLocation();
    const {paths, pathLabelMapping} = window.models.switcherModel();
    const isActive = (path) => location.pathname === path;

    const toggleButton = useMemo(() => (
        <div className="toggle-button">
            {pathLabelMapping.map(({path, label}) => (
                <Link
                    key={path}
                    to={path}
                    className={isActive(path) ? "generic-button disabled-link" : "generic-button"}
                    onClick={(e) => isActive(path) && e.preventDefault()}
                >
                    {label}
                </Link>
            ))}
        </div>
    ), [pathLabelMapping, isActive]);

    return (
        <div>
            <Header button={toggleButton}/>
            <Switch>
                <Redirect exact from={paths.defaultPath} to={paths.examplePath}/>
                <Route path={paths.statesPath} component={States}/>
                <Route path={paths.examplePath} component={Example}/>
            </Switch>
        </div>
    );
}

export default RoutedSwitcher;
