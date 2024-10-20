import React, {useMemo, useState} from "react";
import Header from "../Header";
import Example from "../Example";
import States from "../States";

function Switcher() {
    const {labels} = window.models.switcherModel();
    const [showExample, setShowExample] = useState(true);

    const toggleView = () => {
        setShowExample((prevShowExample) => !prevShowExample);
    };

    const toggleButton = useMemo(() => (
        <div
            className="generic-button toggle-button"
            onClick={toggleView}
            role="button"
            tabIndex={0}
            aria-pressed={showExample}
        >
            {showExample ? labels.states : labels.example}
        </div>
    ), [showExample, labels]);

    return (
        <div>
            <Header button={toggleButton}/>
            <div>
                {showExample ? <Example/> : <States/>}
            </div>
        </div>
    );
}

export default Switcher;
