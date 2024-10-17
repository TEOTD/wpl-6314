import React from "react";
import "./styles.css";

function Header({button}) {
    const logoDirectory = "../assets/logo-white.png";
    const name = "Kiran Hegde";
    const motto = "Exploring the Depths of Technology";
    const quote = "Code is like humor. When you have to explain it, it’s bad.";
    const socialLinks = [
        {name: "GitHub", url: "https://github.com/TEOTD", icon: "../assets/github.png"},
        {name: "LinkedIn", url: "https://linkedin.com/in/hegdeki18", icon: "../assets/linkedin.png"},
    ];

    return (
        <div className="header">
            <img alt="KH Logo" src={logoDirectory} className="logo"/>
            <div className="header-content">
                <h1 className="header-title">{name}</h1>
                <p className="header-motto">{motto}</p>
                <p className="header-quote">{quote}</p>
                {button && <div className="switcher-button">{button}</div>}
            </div>
            <div className="social-links">
                {socialLinks.map(link => (
                    <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                        <img alt={`${link.name} icon`} src={link.icon} className="social-icon"/>
                    </a>
                ))}
            </div>
        </div>
    );
}

export default Header;
