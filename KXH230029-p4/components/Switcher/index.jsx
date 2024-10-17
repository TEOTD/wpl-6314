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
        <div className="toggle-button">
            <button onClick={toggleView}>
                {showExample ? "Switch to States" : "Switch to Example"}
            </button>
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
