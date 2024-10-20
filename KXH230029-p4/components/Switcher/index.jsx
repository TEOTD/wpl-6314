import React, {useMemo, useState} from "react";
import Header from "../Header";
import Example from "../Example";
import States from "../States";

function Switcher() {
    // Extract labels from the model (for button text)
    const {labels} = window.models.switcherModel();

    // State variable to control which view is shown (Example or States)
    const [showExample, setShowExample] = useState(true);

    // Function to toggle between the Example and States views
    const toggleView = () => {
        setShowExample((prevShowExample) => !prevShowExample); // Toggle boolean value
    };

    // Memoize the toggle button to prevent unnecessary re-renders
    const toggleButton = useMemo(() => (
        <div
            className="generic-button toggle-button"
            onClick={toggleView} // Toggle view when clicked
            role="button"
            tabIndex={0}
            aria-pressed={showExample}
        >
            {/* Display label based on the current view */}
            {showExample ? labels.states : labels.example}
        </div>
    ), [showExample, labels]);

    return (
        <div>
            {/* Pass the toggle button to the Header component */}
            <Header button={toggleButton}/>

            <div>
                {/* Conditionally render either the Example or States component based on the state */}
                {showExample ? <Example/> : <States/>}
            </div>
        </div>
    );
}

export default Switcher;
