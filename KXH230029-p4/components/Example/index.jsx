import React, { useState, useEffect } from "react";
import "./styles.css";
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import "prismjs/themes/prism.css";

function Example () {
  const [name] = useState(window.models.exampleModel().name);
  const [motto, setMotto] = useState(window.models.exampleModel().motto);
  const [counter, setCounter] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [buttonWasClicked, setButtonWasClicked] = useState("");

  useEffect(() => {
    const counterIncrFunc = () => {
      setCounter(prevCounter => prevCounter + 1);
    };
    const timerID = setInterval(counterIncrFunc, 2000);

    Prism.highlightAll();

    return () => {
      clearInterval(timerID);
    };
  }, []);

  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleButtonClick = (buttonName) => {
    setButtonWasClicked(buttonName);
  };

  const outOfBandJSX = (option) => {
    let optionJSX;
    const listItems = [];
    if (option) {
      optionJSX = <div>Option was True</div>;
    } else {
      optionJSX = <div>Option was False</div>;
    }
    for (let i = 0; i < 3; i++) {
      listItems[i] = <li key={i}>List Item {i}</li>;
    }
    return (
      <>
        {optionJSX}
        <ul>{listItems}</ul>
      </>
    );
  };

  return (
    <div className="container Example">
      <h1>Project 4 React Example</h1>
      <div className="motto-update">
          <div className="motto-text">
            My name is: {name} and my motto is: {motto}.
          </div>
          Update Motto: <input
          type="text"
          value={motto}
          onChange={event => setMotto(event.target.value)}
          maxLength="20"
          placeholder="Update your motto"
          />
      </div>
      <p>
        This view is an example of a&nbsp;
        <a
          href="https://react.dev/learn/your-first-component"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Component
        </a>
        &nbsp;named <span className="code-name">Example</span>. It is located in
        the file <code>components/Example/index.jsx</code>.
      </p>
      <p>My name is &ldquo; {name} &rdquo;.</p>

      <h3>One-way binding from JavaScript to HTML</h3>
      <p>The counter increments every 2 seconds: {counter}.</p>

      <h3>Control flow</h3>
      <p>Option rendering and a list:</p>
      <div className="example-output">{outOfBandJSX(true)}</div>

      <h3>Input using DOM-like handlers</h3>
      <div className="example-output">
        <label htmlFor="inId">Input Field:</label>
        <input id="inId" type="text" value={inputValue} onChange={handleChange} />
      </div>
      <p>Current inputValue: {inputValue}</p>

      <h3>Handling Button Clicks</h3>
      <div className="example-output">
        <p>Last button clicked: {buttonWasClicked && buttonWasClicked}</p>
        <button type="button" onClick={(e) => handleButtonClick("one", e)}>
          Call handleButtonClick with one
        </button>
        <button type="button" onClick={(e) => handleButtonClick("two", e)}>
          Call handleButtonClick with two
        </button>
      </div>
    </div>
  );
}

export default Example;
