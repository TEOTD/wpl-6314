import React, { useState, useEffect } from "react";
import "./styles.css";

/**
 * Since this component shows code we include the https://prismjs.com/
 * formatter. We invoke it by labelling code blocks with class="language-jsx"
 */
import Prism from "prismjs";
import "prismjs/components/prism-jsx.js";
import "../../node_modules/prismjs/themes/prism.css";

/* eslint-disable react/jsx-one-expression-per-line */
/* eslint-disable react/destructuring-assignment */
/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */

// React Components are now written as functional components with hooks
function Example() {
  const [name] = useState(window.models.exampleModel().name);
  const [motto, setMotto] = useState(window.models.exampleModel().motto);
  const [counter, setCounter] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [buttonWasClicked, setButtonWasClicked] = useState("");

  useEffect(() => {
    // To demonstrate state updating we define a function that increments the
    // counter state and instruct the DOM to call it every 2 seconds.
    const counterIncrFunc = () => {
      setCounter(prevCounter => prevCounter + 1);
    };
    const timerID = setInterval(counterIncrFunc, 2 * 1000);

    // Trigger the code coloring
    Prism.highlightAll();

    return () => {
      // Cleanup function to stop the interval
      clearInterval(timerID);
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Method called when the input box is typed into.
  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  // Method called when the button is pushed
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

      <h1>Project 4 React.js Example</h1>

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
        This view is an example of a &nbsp;
        <a
            href="https://react.dev/learn/your-first-component"
            target="_blank"
            rel="noopener noreferrer"
        >
          React.js Component
        </a>
        &nbsp; named <span className="code-name">Example</span>. It is
        located in the file <code>components/Example/index.jsx</code>. It
        looks like a function named Example that returns something that looks
        like HTML.
      </p>
      <p>
        It is actually written in a language named &nbsp;
        <a
          href="https://react.dev/learn/writing-markup-with-jsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          JSX
        </a>
        &nbsp; which is syntactic sugar for writing JavaScript that looks like
        HTML. JSX gets transpiled to JavaScript, and under the hood, it uses
        the React function <code>React.createElement()</code> to describe what
        the component renders. This allows you to write components in a more
        readable format while React handles the translation into JavaScript.
      </p>
<p>
  Although JSX looks like HTML, it is not HTML. Some of the differences
  are necessary due to embedding in JavaScript. For example, rather
  than <code>class=</code> we use <code>className=</code> (class is a
  JavaScript keyword). Although it is possible to interleave JavaScript
  and JSX code, care is needed since contents of JSX tags are processed
  into arguments to a function limiting what can be done as will be seen
  below.
</p>

<h3>Template substitution</h3>

<p>
  JSX treats text inside of parentheses (e.g.{" "}
  <code>{"{JavaScriptExpression}"}</code>) as templates where the
  JavaScript expression is evaluated in the context of the current
  function and whose value replaces the template in the string. The
  expression can evaluate to a JavaScript string or value from a JSX
  expression. This feature allows component&apos;s specification to use
  templated HTML.
</p>

<p>
  The Example functional component uses state variables such as{" "}
  <code>name</code> (see the useState hook initialization) from the
  model in the DOM which has a value of &ldquo; {name} &rdquo; so:
</p>
<pre className="example-code">
  <code className="language-jsx">
    {`<p>My name is "{name}".</p>`}
  </code>
</pre>
<p>should render as:</p>
<p className="example-output">
  My name is &ldquo; {name} &rdquo;.
</p>

<h3>One-way binding from JavaScript to HTML</h3>

<p>
  React automatically propagates any changes to JavaScript state to the
  JSX templates. For example, the following code{" "}
  <code>({"{counter}"})</code> displays the state.counter
  property of the Example component. The component sets a timer that
  increments the counter every 2 seconds. The value of the counter can
  be seen changing here: {counter}.
</p>

<h3>Control flow</h3>
<p>
  Most templating engines include support for doing conditional
  rendering and iteration. JSX is embedded in and is transpiled to
  JavaScript so we can use JavaScript language constructs for managing
  control flow.
</p>
<p>
  One way of doing control using JavaScript is to assign JSX fragments
  to JavaScript variables and use normal JavaScript control flow
  operators. For example, the following function selects among the
  possible output lines based on an argument to the function and uses a
  for loop to populate an array. These JavaScript variables can then be
  referred to in JSX returned by the function.
</p>
<pre className="example-code">
  <code className="language-jsx">
    {`const outOfBandJSX = (option) => {
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
      <div>
        {optionJSX}
        <ul>{listItems}</ul>
      </div>
    );
  } `}
  </code>
</pre>
<p>
  Calling this function from a template (i.e.{" "}
  <code>{"{outOfBandJSX(true)}"}</code>) would be expanded to:
</p>
<div className="example-output">{outOfBandJSX(true)}</div>
<p>
  Another way of accomplishing this is embedding the operations inside
  of curly braces. Although arbitrary JavaScript can appear inside
  braces, it must return a string or JSX expression to work. JavaScript
  control flow operations such as if, for, and while do not return
  values so templates like <code>{"{if (bool) ... else ...}"}</code> do
  not work.
</p>
<p>
  The following code generates the above output using the JavaScript{" "}
  {'"?:"'} operator and functional-style programming support to always
  return a value in the template:
</p>
<pre className="example-code">
  <code className="language-jsx">
    {`<div>
  {option ? <div>Option was True</div> : <div>Option was False</div>}
  <ul>
    {[0, 1, 2].map(i => <li key={i}>List Item {i}</li>)}
  </ul>
</div>`}
  </code>
</pre>
<p>
  Short-circuit boolean operations such as {'"&&"'} can also be used to
  control what is rendered. For example, the following code will make a
  sentence appear between two paragraphs when some characters are
  typed into the input box below.
</p>
<pre className="example-code">
  <code className="language-jsx">
    {`<div>
  <p>A paragraph will appear between this paragraph</p>
  {
    inputValue && (
      <p>This text will appear when inputValue is truthy.
        inputValue === {inputValue}
      </p>
    )
  }
  <p>... and this one when some characters are typed into the input box below.</p>
</div>`}
  </code>
</pre>
<p>Generates the output:</p>
<div className="example-output">
  <p>A paragraph will appear between this paragraph</p>
  {inputValue && (
    <p>
      This text will appear when inputValue is truthy.
      inputValue === {inputValue}
    </p>
  )}
  <p>
    ... and this one when some characters are typed into the below box.
  </p>
</div>

<h3>Input using DOM-like handlers</h3>
<p>
  Input in React is done using DOM-like event handlers. For example, JSX
  statements like:
</p>
<pre className="example-code">
  <code className="language-jsx">
    {`<label htmlFor="inId">Input Field: </label>
<input type="text" value={inputValue} onChange={handleChange} />`}
  </code>
</pre>
<p>
  will display the text from the inputValue property of the
  Component&apos;s state in the input box (it starts out blank) and
  calls the function handleChange every time the input field
  is changed. Typically this kind of input will be associated with a <code>Button</code> or
  inside a <code>Form</code>to
  allow the user to signal when they are finished changing the input
  field. Note the differences from HTML in <code>onchange=</code> becoming{" "}
  <code>onChange=</code> and
  <code>for=</code> becoming <code>htmlFor=</code>.
</p>

{/* eslint-disable jsx-a11y/label-has-associated-control */}
{/* eslint-disable jsx-a11y/label-has-for */}
<div className="example-output">
  <label htmlFor="inId">Input Field:</label>
  <input
    id="inId"
    type="text"
    value={inputValue}
    onChange={handleChange}
  />
</div>
<p>
  The handleChange function updates inputValue with the
  value of the DOM element so its value can be accessed like{" "}
  <code>{"{inputValue}"}</code> which returns &nbsp;&ldquo;{" "}
  {inputValue} &rdquo;. Note we cannot directly call{" "}
  <code>handleChange</code> since it is a function within the component.
  To handle this, we use it directly.
</p>
<p>
  If we want to pass arguments to event handling functions we can use
  inline arrow functions like so:
</p>
<pre className="example-code">
  <code className="language-jsx">
    {`<div className="example-output">
  <p>Test button clicks.
    {
      buttonWasClicked &&
      <span>Last button clicked was: {buttonWasClicked}</span>
    }
  </p>
  <button
    type="button"
    onClick={e => handleButtonClick("one", e)}
  >
    Call handleButtonClick function with one
  </button>
  <button
    type="button"
    onClick={e => handleButtonClick("two", e)}
  >
    Call handleButtonClick function with two
  </button>
</div>`}
  </code>
</pre>
<p>
  When the button is pushed it will call the arrow function, which will
  then call the function handleButtonClick with the specified
  argument.
</p>
<div className="example-output">
  <p>
    Test button clicks.{" "}
    {buttonWasClicked && (
      <span>
        Last button clicked was: {buttonWasClicked}
      </span>
    )}
  </p>
  <button
    type="button"
    onClick={() => handleButtonClick("one")}
  >
    Call handleButtonClick function with one
  </button>
  <button
    type="button"
    onClick={() => handleButtonClick("two")}
  >
    Call handleButtonClick function with two
  </button>
</div>
    </div>
);
}

export default Example;