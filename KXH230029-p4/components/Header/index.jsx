import React, {useEffect, useState} from "react";
import "./styles.css";

function Header({button}) {
    // Extract necessary properties from window.models
    const {
        name, motto, quote, socialLinks,
        imagePaths, themes
    } = window.models.headerModel();

    // State for managing the current theme and fade effect
    const [theme, setTheme] = useState(themes.default);
    const [fade, setFade] = useState(false);
    const [videoSupported, setVideoSupported] = useState(true);

    // Handles the click event for the logo, toggling between themes
    const handleButtonClick = () => {
        setFade(true); // Trigger fade animation
        setTimeout(() => {
            // Switch between default and Naruto themes
            setTheme((prevTheme) => (prevTheme === themes.default ? themes.naruto : themes.default));
            setFade(false); // Reset fade after theme switch
        }, 1000); // Delay to sync with fade-out
    };

    // Effect to update body and header styles based on the current theme
    useEffect(() => {
        const body = document.body;
        const header = document.querySelector(".header");
        const themeClassList = [`${theme}`, `${fade ? 'fade' : 'visible'}`];
        body.className = themeClassList.join(' ');
        header.className = `header ${theme}`;

        if (theme === "naruto") {
            // Apply Naruto theme background and banner
            body.style.background = `url(${imagePaths.background}) no-repeat center center fixed`;
            body.style.backgroundSize = "cover";
            header.style.backgroundImage = `url(${imagePaths.banner})`;
        } else {
            // Reset background for default theme
            body.style.background = "";
            header.style.backgroundImage = "linear-gradient(45deg, #1e1e1e, #333, #4a4a4a)";
        }
    }, [theme, fade]);

    // Effect to check if video is supported by the browser
    useEffect(() => {
        const videoElement = document.createElement("video");
        setVideoSupported(!!videoElement.canPlayType("video/mp4"));
    }, []);

    // Renders social links for the default theme
    const renderSocialLinks = () => (
        <div className={`social-links theme-specific ${fade ? 'fade' : 'visible'}`}>
            {socialLinks.map(link => (
                <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
                    <img alt={`${link.name} icon`} src={link.icon} className="social-icon"/>
                </a>
            ))}
        </div>
    );

    // Renders the Naruto video or fallback GIF for the Naruto theme
    const renderNarutoVideo = () => (
        <div className={`naruto-video-container theme-specific ${fade ? 'fade' : 'visible'}`}>
            <div className="tv-container">
                {videoSupported ? (
                    <video autoPlay loop muted playsInline className="giphy-embed">
                        <source src={imagePaths.video} type="video/mp4"/>
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <img src={imagePaths.gif} className="giphy-embed" alt="Minatio Gif"/>
                )}
                <img className="tv-frame" src={imagePaths.tv} alt="Television with a transparent screen"/>
            </div>
        </div>
    );

    return (
        <div className={`header ${fade ? 'fade' : 'visible'}`}>
            <img alt="Seal Logo" src={imagePaths.seal} className="logo" onClick={handleButtonClick}/>
            <div className="header-content">
                <h1 className="header-title">{name}</h1>
                <p className="header-motto">{motto}</p>
                <p className="header-quote">{quote}</p>
                {button && <div className="switcher-button">{button}</div>}
            </div>
            <div className="right-side-container">
                {theme === themes.default ? renderSocialLinks() : renderNarutoVideo()}
            </div>
        </div>
    );
}

export default Header;
