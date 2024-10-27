import React, {useEffect, useState} from "react";
import {AppBar, Checkbox, FormControlLabel, FormGroup, Toolbar, Typography} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import "./styles.css";
import {blue} from "@mui/material/colors";
import fetchModel from "../../lib/fetchModelData";

function TopBar({
                    enableAdvancedFeatures,
                    setEnableAdvancedFeatures,
                    photoIndex,
                    setPhotoIndex
                }) {
    const {pathname} = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [title, setTitle] = useState('PhotoApp');
    const [version, setVersion] = useState('');
    const [userId, setUserId] = useState(null);
    const label = "Enable Advanced Features";

    useEffect(() => {
        const photoMatch = pathname.match(/\/photos\/([A-Za-z\d]+)(?:\/(\d+))?/);
        const userMatch = pathname.match(/\/users\/([A-Za-z\d]+)/);

        if (photoMatch) {
            setUserId(photoMatch[1]);
            const detectedPhotoIndex = photoMatch[2] ? parseInt(photoMatch[2], 10) : null;

            if (detectedPhotoIndex !== null) {
                setPhotoIndex(detectedPhotoIndex);
                localStorage.setItem(`photoIndex_${photoMatch[1]}`, `${detectedPhotoIndex}`);
            }
        } else if (userMatch) {
            setUserId(userMatch[1]);
            setPhotoIndex(null);
            setEnableAdvancedFeatures(false);
        }
    }, [pathname, setEnableAdvancedFeatures, setPhotoIndex]);

    useEffect(() => {
        fetchModel('/test/info')
            .then((result) => setVersion(result.data.__v))
            .catch((error) => console.error('Failed to fetch version:', error));

        if (userId) {
            fetchModel(`/user/${userId}`)
                .then((result) => setUser(result.data))
                .catch((error) => console.error('Failed to fetch user:', error));

            const savedPhotoIndex = localStorage.getItem(`photoIndex_${userId}`);
            if (savedPhotoIndex) {
                setPhotoIndex(parseInt(savedPhotoIndex, 10));
                setEnableAdvancedFeatures(true);
            }
        }
    }, [userId]);

    useEffect(() => {
        setTitle(() => {
            if (!user) return 'PhotoApp';
            if (pathname.startsWith('/users/')) return `${user.first_name} ${user.last_name}`;
            if (pathname.startsWith('/photos/')) return `Photos of ${user.first_name} ${user.last_name}`;
            return 'PhotoApp';
        });
    }, [pathname, user]);

    const handleAdvancedFeaturesChange = () => {
        if (!enableAdvancedFeatures) {
            setEnableAdvancedFeatures(true);
            setPhotoIndex(photoIndex !== null ? photoIndex : 0);
        } else {
            setEnableAdvancedFeatures(false);
            setPhotoIndex(null);
            if (userId) navigate(`/photos/${userId}`);
        }
    };

    return (
        <AppBar className="topbar-appBar" position="static">
            <Toolbar className="topbar-toolbar">
                <Typography variant="h6" className="topbar-name">
                    Kiran Hegde
                </Typography>
                <Typography variant="h6" className="topbar-version">
                    Version: {version}
                </Typography>
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
                                onChange={handleAdvancedFeaturesChange}
                            />
                        )}
                        label={label}
                    />
                </FormGroup>
                <Typography variant="h6" className="topbar-title">
                    {title}
                </Typography>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;
