var models;

if (models === undefined) {
    models = {};
}

models.headerModel = function () {
    const name = "Kiran Hegde";
    const motto = "Exploring the Depths of Technology";
    const quote = "Code is like humor. When you have to explain it, it’s bad.";
    const socialLinks = [
        {name: "GitHub", url: "https://github.com/TEOTD", icon: "/assets/github.png"},
        {name: "LinkedIn", url: "https://linkedin.com/in/hegdeki18", icon: "/assets/linkedin.png"},
    ];
    const imagePaths = {
        banner: "/assets/naruto-banner.jpg",
        background: "/assets/naruto-background.png",
        seal: "/assets/seal.png",
        tv: "/assets/tv.png",
        gif: "/assets/gif.webp",
        video: "/assets/tv-video.mp4"
    };

    const themes = {
        default: "default",
        naruto: "naruto",
    };


    return {
        name: name,
        motto: motto,
        quote: quote,
        socialLinks: socialLinks,
        imagePaths: imagePaths,
        themes: themes,
    };
};