import React, {useCallback, useMemo, useState} from "react";
import "./styles.css";

/**
 * Define States, a React component of Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.models.statesModel().
 */
function States() {
    // Get the list of states from the model
    const originalStates = window.models.statesModel();

    // State variable to hold the current filter input
    const [stateToFilter, setStateToFilter] = useState("");

    // Function to update the filter input, wrapped in useCallback to avoid unnecessary re-renders
    const updateStates = useCallback((state) => {
        setStateToFilter(state);
    }, []);

    // Memoized function to filter the states based on the current filter input
    const filteredStates = useMemo(() => {
        // Filter states by checking if the state name includes the filter string (case-insensitive)
        return originalStates.filter((str) => str.toLowerCase().includes(stateToFilter.toLowerCase()));
    }, [originalStates, stateToFilter]);

    return (
        <div className="container-states">
            {/* Heading section */}
            <p className="heading">STOOGLE</p>
            <p className="sub-heading">THE STATES GOOGLE</p>
            <p className="filter-info">
                SHOWING RESULTS FOR: <span>{stateToFilter}</span>
            </p>

            {/* Input field to capture user input for filtering states */}
            <input
                placeholder="Enter your Search"
                onChange={event => updateStates(event.target.value)}
                className="input-box"
            />

            {/* Conditionally render either 'no results' or the filtered list of states */}
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
