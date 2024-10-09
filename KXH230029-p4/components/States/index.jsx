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
  function updateStates(state) {
    const filteredStates = originalStates.filter((str) => str.toLowerCase().includes(state.toLowerCase()));
    setStates(filteredStates);
  }

  return (
      <>
        <input onChange={event => updateStates(event.target.value)}></input>
        <ul>
          {states.map((state, index) => (<li key={index}>{state}</li>))}
        </ul>
      </>
  );
}

export default States;
