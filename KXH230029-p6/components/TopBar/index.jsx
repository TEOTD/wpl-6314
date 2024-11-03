import React, {useEffect, useMemo, useState} from "react";
import {AppBar, Box, Checkbox, FormControlLabel, FormGroup, Toolbar, Typography} from "@mui/material";
import {useLocation} from "react-router-dom";
import "./styles.css";
import axios from "axios";

// TopBar component for displaying application title, user information, version number, and a toggle for advanced features
function TopBar({
                    enableAdvancedFeatures,
                    setEnableAdvancedFeatures
                }) {
    // Retrieve current URL pathname to determine the context
    const {pathname} = useLocation();

    // State variables for user and application version
    const [user, setUser] = useState(null);
    const [version, setVersion] = useState('');

    // Extracts the user ID from the URL based on path pattern
    const userId = useMemo(() => {
        const match = pathname.match(/\/photos\/([A-Za-z\d]+)|\/users\/([A-Za-z\d]+)/);
        return match ? match[1] || match[2] : null;
    }, [pathname]);

    // Fetches user data and app version when userId changes
    /*It also fetches user data if userId is present, fetches app version, and log any errors during data fetching*/
    useEffect(() => {
        Promise.all([
            userId ? axios.get(`/user/${userId}`)
                .then((result) => setUser(result.data)) : Promise.resolve(),
            axios.get('/test/info')
                .then((result) => setVersion(result.data.__v))
        ])
            .catch((error) => console.error('Failed to fetch data:', error));
    }, [userId]);

    // Generates the page title which represents context based on the current path and fetched user data
    // Default title when no user or other paths - Home Page
    // User-specific title like Peregrin Took
    // Photo-specific title like Photos of Peregrin Took
    const title = useMemo(() => {
        if (!user) return 'Home Page';
        if (pathname.startsWith('/users/')) return `${user.first_name} ${user.last_name}`;
        if (pathname.startsWith('/photos/')) return `Photos of ${user.first_name} ${user.last_name}`;
        if (pathname.startsWith('/comments/')) return `Comments of ${user.first_name} ${user.last_name}`;
        return 'Home Page';
    }, [user, pathname]);

    return (
        <AppBar position="static" className="top-bar" sx={{backgroundColor: 'var(--primary-color)'}}>
            <Toolbar sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                {/* Left section: Username and app version */}
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}>
                    <Typography variant="h6" className="my-name">
                        Kiran Hegde
                    </Typography>
                    <Box className="separator"/>
                    <Typography variant="caption" className="version">
                        Version: {version}
                    </Typography>
                </Box>

                {/* Right section: Advanced Features toggle and dynamic title */}
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                }}>
                    <FormGroup>
                        {/* Checkbox to toggle advanced features */}
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    sx={{
                                        color: 'var(--text-color)',
                                        '&.Mui-checked': {color: 'var(--text-color)'},
                                    }}
                                    checked={enableAdvancedFeatures}
                                    onChange={() => setEnableAdvancedFeatures(prev => !prev)}
                                />
                            )}
                            label="Advanced Features"
                            className="advanced-features"
                        />
                    </FormGroup>
                    {/* Dynamic title based on user and path */}
                    <Typography variant="h6" className="title">
                        {title}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
