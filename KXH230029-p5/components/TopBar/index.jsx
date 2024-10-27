import React, {useEffect, useMemo, useState} from "react";
import {AppBar, Checkbox, FormControlLabel, FormGroup, Toolbar, Typography} from "@mui/material";
import {useLocation} from "react-router-dom";
import "./styles.css";
import {blue} from "@mui/material/colors";
import fetchModel from "../../lib/fetchModelData";

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
        <AppBar className="topbar-appBar" position="static">
            <Toolbar className="topbar-toolbar">
                <Typography variant="h6" className="topbar-name">Kiran Hegde</Typography>
                <Typography variant="h6" className="topbar-version">Version: {version}</Typography>
                <FormGroup className="topbar-version">
                    <FormControlLabel
                        control={(
                            <Checkbox
                                sx={{
                                    color: blue[50],
                                    '&.Mui-checked': {
                                        color: blue[50],
                                    },
                                }}
                                checked={enableAdvancedFeatures}
                                onChange={() => setEnableAdvancedFeatures(prev => !prev)}
                            />
                        )}
                        label="Advanced Features"
                    />
                </FormGroup>
                <Typography variant="h6" className="topbar-title">{title}</Typography>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
