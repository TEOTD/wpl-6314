import React, {useCallback, useMemo, useState} from "react";
import "./styles.css";

/**
 * Define States, a React component of Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.models.statesModel().
 */
function States() {
    const originalStates = window.models.statesModel();
    const [stateToFilter, setStateToFilter] = useState("");

    const updateStates = useCallback((state) => {
        setStateToFilter(state);
    }, []);

    const filteredStates = useMemo(() => {
        return originalStates.filter((str) => str.toLowerCase().includes(stateToFilter.toLowerCase()));
    }, [originalStates, stateToFilter]);

    return (
        <div className="container-states">
            <p className="heading">STOOGLE</p>
            <p className="sub-heading">THE STATES GOOGLE</p>
            <p className="filter-info">SHOWING RESULTS FOR: <span>{stateToFilter}</span></p>
            <input
                placeholder="Enter your Search"
                onChange={event => updateStates(event.target.value)}
                className="input-box"
            />
            {filteredStates.length === 0 ? (
                <p className="not-found">NO MATCHING STATE FOUND</p>
            ) : (
                <ul className="list-parent">
                    {filteredStates.map((state) => (
                        <li key={state} className="list">{state}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default States;
