import React, {useState} from "react";
import "./styles.css";
import Header from "../Header";
import Example from "../Example";
import States from "../States";

function Switcher() {
    const [showExample, setShowExample] = useState(true);
    const toggleView = () => {
        setShowExample((prevShowExample) => !prevShowExample);
    };
    const toggleButton = (
        <div className="generic-button toggle-button" onClick={toggleView} role="button" tabIndex={0}>
            {showExample ? "Switch to States" : "Switch to Example"}
        </div>
    );

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
