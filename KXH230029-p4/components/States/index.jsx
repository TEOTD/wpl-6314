import React, {useState} from "react";
import "./styles.css";

/**
 * Define States, a React component of Project 4, Problem 2. The model
 * data for this view (the state names) is available at
 * window.models.statesModel().
 */
function States() {
    console.log(
        "window.models.statesModel()",
        window.models.statesModel()
    );

    const originalStates = window.models.statesModel();
    const [states, setStates] = useState(originalStates);
    const [stateToFilter, setStateToFilter] = useState("");

    function updateStates(state) {
        setStateToFilter(state);
        let filteredStates = originalStates.filter((str) => str.toLowerCase().includes(state.toLowerCase()));
        setStates(filteredStates);
    }

    return (
        <div className={"container-states"}>
            <p className={"heading"}>STOOGLE</p>
            <p className={"sub-heading"}>THE STATES GOOGLE</p>
            <p className={"filter-info"}>SHOWING RESULTS FOR: <span>{stateToFilter}</span></p>
            <input
                placeholder={"Enter your Search"}
                onChange={event => updateStates(event.target.value)}
                className={"input-box"}
            />
            {states.length === 0 ? (
                <p className={"not-found"}>NO MATCHING STATE FOUND</p>
            ) : (
                <ul className={"list-parent"}>
                    {states.map((state, index) => (<li key={index} className={"list"}>{state}</li>))}
                </ul>
            )}
        </div>
    );
}

export default States;
