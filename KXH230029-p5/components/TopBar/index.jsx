import React, {useEffect, useMemo, useState} from "react";
import {AppBar, Toolbar, Typography} from "@mui/material";
import {useLocation} from "react-router-dom";
import "./styles.css";

function TopBar() {
    const {pathname} = useLocation();
    const userId = pathname.split('/')
        .pop();
    const user = useMemo(() => window.models.userModel(userId), [userId]);
    const [title, setTitle] = useState('PhotoApp');

    useEffect(() => {
        if (user) {
            if (pathname.startsWith('/users/')) {
                setTitle(`${user.first_name} ${user.last_name}`);
            } else if (pathname.startsWith('/photos/')) {
                setTitle(`Photos of ${user.first_name} ${user.last_name}`);
            } else {
                setTitle('PhotoApp');
            }
        } else {
            setTitle('PhotoApp');
        }
    }, [pathname, user]);

    return (
        <AppBar className="topbar-appBar" position="static">
            <Toolbar className="topbar-toolbar">
                <Typography variant="h6" className="topbar-name">
                    Kiran Hegde
                </Typography>
                <Typography variant="h6" className="topbar-title">
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
