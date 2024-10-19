import React, {useEffect, useState} from "react";
import "./styles.css";

function Header({button}) {
    const name = "Kiran Hegde";
    const motto = "Exploring the Depths of Technology";
    const quote = "Code is like humor. When you have to explain it, it’s bad.";
    const socialLinks = [
        {name: "GitHub", url: "https://github.com/TEOTD", icon: "/assets/github.png"},
        {name: "LinkedIn", url: "https://linkedin.com/in/hegdeki18", icon: "/assets/linkedin.png"},
    ];
    const banner = "/assets/naruto-banner.jpg";
    const background = "/assets/naruto-background.png";

    const [theme, setTheme] = useState("default");
    const [videoSupported, setVideoSupported] = useState(true);
    const [fade, setFade] = useState(false);

    const handleButtonClick = () => {
        setFade(true);
        setTimeout(() => {
            setTheme((prevTheme) => (prevTheme === "default" ? "naruto" : "default"));
            setFade(false);
        }, 1000);
    };

    useEffect(() => {
        const body = document.body;
        body.classList.remove("default-theme", "naruto-theme", "fade", "visible");
        body.classList.add(`${theme}`, `${fade ? 'fade' : 'visible'}`);

        if (theme === "naruto") {
            body.style.background = `url(${background}) no-repeat center center fixed`;
            body.style.backgroundSize = "cover";
        } else {
            body.style.background = "";
        }

        const header = document.querySelector(".header");
        header.classList.remove("default", "naruto");
        header.classList.add(theme);

        if (theme === "naruto") {
            header.style.backgroundImage = `url(${banner})`;
        } else {
            header.style.backgroundImage = "linear-gradient(45deg, #1e1e1e, #333, #4a4a4a)";
        }
    }, [theme]);

    useEffect(() => {
        const videoElement = document.createElement("video");
        if (!videoElement.canPlayType("video/mp4")) {
            setVideoSupported(false);
        }
    }, []);

    return (
        <div className={`header ${fade ? 'fade' : 'visible'}`}>
            <img
                alt="Seal Logo"
                src="/assets/seal.png"
                className="logo"
                onClick={handleButtonClick}
            />
            <div className="header-content">
                <h1 className={`header-title`}>{name}</h1>
                <p className={`header-motto`}>{motto}</p>
                <p className={`header-quote`}>{quote}</p>
                {button && <div className="switcher-button">{button}</div>}
            </div>
            <div className="right-side-container">
                {theme === "default" && (
                    <div className={`social-links theme-specific ${fade ? 'fade' : 'visible'}`}>
                        {socialLinks.map((link) => (
                            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                                <img alt={`${link.name} icon`} src={link.icon} className="social-icon"/>
                            </a>
                        ))}
                    </div>
                )}
                {theme === "naruto" && (
                    <div className={`naruto-video-container theme-specific ${fade ? 'fade' : 'visible'}`}>
                        <div className="tv-container">
                            {videoSupported ? (
                                <video autoPlay loop muted playsInline className="giphy-embed">
                                    <source src="/assets/tv-video.mp4" type="video/mp4"/>
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <img
                                    src="/assets/gif.webp"
                                    className="giphy-embed"
                                    alt="Minatio Gif"
                                />
                            )}
                            <img className="tv-frame" src="/assets/tv.png" alt="Television with a transparent screen"/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
