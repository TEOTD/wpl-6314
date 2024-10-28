import React, {useEffect, useMemo, useState} from "react";
import {AppBar, Box, Checkbox, FormControlLabel, FormGroup, Toolbar, Typography} from "@mui/material";
import {useLocation} from "react-router-dom";
import fetchModel from "../../lib/fetchModelData";
import "./styles.css";

function TopBar({
                    enableAdvancedFeatures,
                    setEnableAdvancedFeatures
                }) {
    const {pathname} = useLocation();
    const [user, setUser] = useState(null);
    const [version, setVersion] = useState('');

    useEffect(() => {
        const match = pathname.match(/\/photos\/([A-Za-z\d]+)|\/users\/([A-Za-z\d]+)/);
        const userId = match ? match[1] || match[2] : null;

        if (userId) {
            fetchModel(`/user/${userId}`)
                .then((result) => setUser(result.data))
                .catch((error) => console.error('Failed to fetch user:', error));
        }
        fetchModel('/test/info')
            .then((result) => setVersion(result.data.__v))
            .catch((error) => console.error('Failed to fetch version:', error));
    }, [pathname]);

    const title = useMemo(() => {
        if (!user) return 'PhotoApp';
        if (pathname.startsWith('/users/')) return `${user.first_name} ${user.last_name}`;
        if (pathname.startsWith('/photos/')) return `Photos of ${user.first_name} ${user.last_name}`;
        return 'PhotoApp';
    }, [user, pathname]);

    return (
        <AppBar position="static" className="topBar" sx={{backgroundColor: 'var(--primary-color)'}}>
            <Toolbar sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
            }}>
                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                }}>
                    <Typography variant="h6" className="myName">
                        Kiran Hegde
                    </Typography>
                    <Box className="separator"/>
                    <Typography variant="caption" className="version">
                        Version: {version}
                    </Typography>
                </Box>

                <Box sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2
                }}>
                    <FormGroup>
                        <FormControlLabel
                            control={(
                                <Checkbox
                                    sx={{
                                        color: 'var(--text-color)',
                                        '&.Mui-checked': {
                                            color: 'var(--text-color)',
                                        },
                                    }}
                                    checked={enableAdvancedFeatures}
                                    onChange={() => setEnableAdvancedFeatures(prev => !prev)}
                                />
                            )}
                            label="Advanced Features"
                            className="advancedFeatures"
                        />
                    </FormGroup>
                    <Typography variant="h6" className="title">
                        {title}
                    </Typography>
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
