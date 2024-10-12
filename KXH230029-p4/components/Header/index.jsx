import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import "./styles.css";

function Header() {
    const [isNavOpen, setIsNavOpen] = useState(false);
    const navigate = useHistory();

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            toggleNav();
        }
    };

    const handleNavigation = (event) => {
        switch (event.target.innerHTML) {
            case "Problem 1":
                navigate.push("/getting-started.html");
                break;
            case "Problem 2":
                navigate.push("/problem2.html");
                break;
            case "Problem 3":
                navigate.push("/problem2.html");
                break;
            case "Problem 4":
                navigate.push("/problem4.html");
                break;
            case "Problem 5":
                navigate.push("/problem5.html");
                break;
            default:
                break;
        }
        setIsNavOpen(false);
    };

    return (
        <div className={`header ${isNavOpen ? 'expanded' : ''}`}>
            <div className="logo">KH</div>
            <div
                className={`hamburger ${isNavOpen ? 'open' : ''}`}
                onClick={toggleNav}
                onKeyDown={handleKeyDown}
                role="button"
                tabIndex="0"
                aria-expanded={isNavOpen}
                aria-label="Toggle navigation"
            >
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
            <ul className={`nav ${isNavOpen ? 'show' : ''}`} onClick={event => handleNavigation(event)}>
                <li className="problem">Problem 1</li>
                <li className="problem">Problem 2</li>
                <li className="problem">Problem 3</li>
                <li className="problem">Problem 4</li>
                <li className="problem">Problem 5</li>
            </ul>
        </div>
    );
}

export default Header;
