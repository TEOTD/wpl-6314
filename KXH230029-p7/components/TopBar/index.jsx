import React, {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
    Alert,
    AppBar,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Toolbar,
    Typography
} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import "./styles.css";
import axios from "axios";
import {AdvancedContext, LoggedInUserContext, LoginContext, ReloadContext} from "../context/appContext";

function TopBar() {
    // Get the current location path and initialize the navigate function
    const {pathname} = useLocation();
    const navigate = useNavigate();

    // Contexts to manage application state
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useContext(AdvancedContext);
    const [isLoggedIn, setIsLoggedIn] = useContext(LoginContext);
    const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
    const [reload, setReload] = useContext(ReloadContext);

    // State variables for UI elements and notifications
    const [imageUploadShow, setImageUploadShow] = useState(false);
    const [uploadInput, setUploadInput] = useState(null);
    const [showPhotoUploadSuccess, setShowPhotoUploadSuccess] = useState({
        message: '',
        success: false,
        show: false
    });

    // Effect to handle initial loading and enabling advanced features based on the URL path
    useEffect(() => {
        const routes = pathname.split("/");
        if ((routes[1] === "photos" && routes.length === 4) || (routes[1] === "comments")) {
            setEnableAdvancedFeatures(true);
        }
    }, []);

    // Function to show the image upload dialog
    const handleClickOpen = useCallback(() => {
        setImageUploadShow(true);
    }, []);

    // Function to close the image upload dialog
    const handleClose = useCallback(() => {
        setImageUploadShow(false);
    }, []);

    // Function to show an alert message and refresh content
    const showAlert = useCallback((data) => {
        setReload(!reload);
        setShowPhotoUploadSuccess(data);
    }, []);

    // Effect to hide the alert after 3 seconds and refresh content on changes
    useEffect(() => {
        setReload(!reload);
        if (showPhotoUploadSuccess.show) {
            setTimeout(() => {
                setShowPhotoUploadSuccess((prev) => ({
                    ...prev,
                    show: false,
                }));
            }, 3000);
        }
    }, [showPhotoUploadSuccess.show]);

    // Function to handle file upload and send it to the server
    const handleFileUpload = async () => {
        if (uploadInput?.files.length > 0) {
            const domForm = new FormData();
            domForm.append("uploadedphoto", uploadInput.files[0]);
            await axios.post("/photos/new", domForm)
                .then(() => {
                    showAlert({
                        message: "Your Photo has been uploaded successfully!",
                        success: true,
                        show: true
                    });
                })
                .catch(err => showAlert({
                    message: `Photo upload failed: ${err.response?.data || "unexpected error"}`,
                    success: false,
                    show: true
                }));
        }
        handleClose();
    };

    // State variables for user and app version
    const [user, setUser] = useState(null);
    const [version, setVersion] = useState("");

    // Extract userId from the URL path using a regular expression
    const userId = useMemo(() => {
        const match = pathname.match(/\/(photos|users|comments)\/([A-Za-z\d]+)/);
        return match ? match[2] : null;
    }, [pathname]);

    // Effect to fetch user data when logged in and userId is available
    useEffect(() => {
        if (isLoggedIn && userId) {
            (async () => {
                await axios.get(`/user/${userId}`)
                    .then((result) => setUser(result.data))
                    .catch((error) => console.error("Failed to fetch data:", error));
            })();
        }
    }, [userId, isLoggedIn]);

    // Effect to fetch the version number from the server
    useEffect(() => {
        if (isLoggedIn) {
            (async () => {
                await axios.get("/test/info")
                    .then(result => setVersion(result.data.__v))
                    .catch(error => console.error("Failed to fetch data:", error));
            })();
        }
    }, [isLoggedIn]);

    // Memoized title based on the current path and user details
    const title = useMemo(() => {
        if (!user) return "Home Page";
        if (pathname.startsWith("/users/")) return `${user.first_name} ${user.last_name}`;
        if (pathname.startsWith("/photos/")) return `Photos of ${user.first_name} ${user.last_name}`;
        if (pathname.startsWith("/comments/")) return `Comments of ${user.first_name} ${user.last_name}`;
        return "Home Page";
    }, [user, pathname]);

    // Memoized greeting message based on login status
    const greeting = useMemo(() => {
        if (!isLoggedIn) return "Please Login";
        return `Hi ${loggedInUser.first_name} !!!!`;
    }, [isLoggedIn, loggedInUser]);

    // Function to handle logout and clear stored data
    const handleLogout = useCallback(async () => {
        await axios.post("/admin/logout")
            .then(() => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("loggedInUser");
                setIsLoggedIn(false);
                setLoggedInUser(null);
                navigate("/admin/login", {replace: true});
            })
            .catch(error => {
                console.error("Logout failed:", error);
            });
    }, [setIsLoggedIn, setLoggedInUser, navigate]);

    // JSX structure of the top bar, including the photo upload dialog and alerts
    return (
        <AppBar position="static" className="top-bar" sx={{backgroundColor: "var(--primary-color)"}}>
            <Toolbar sx={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                    <Typography variant="h6" className="my-name">
                        {greeting}
                    </Typography>
                    {isLoggedIn && (
                        <>
                            <Box className="separator"/>
                            <Typography variant="caption" className="version">
                                Version: {version}
                            </Typography>
                            <Box className="separator"/>
                            <Button color="inherit" onClick={handleClickOpen} className="add-photo-button">
                                Add Photo
                            </Button>
                            <Dialog
                                open={imageUploadShow}
                                keepMounted
                                onClose={handleClose}
                                aria-describedby="alert-dialog-slide-description"
                                id="photo-upload-dialog"
                                sx={{
                                    "& .MuiPaper-root": {
                                        background: "#000",
                                        borderRadius: "10px",
                                    },
                                }}
                            >
                                <DialogTitle className="dialog-title">{"Please select An image File"}</DialogTitle>
                                <DialogContent>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={(domFileRef) => setUploadInput(domFileRef)}
                                        id="choose-photo-icon"
                                        className="dialog-button-input"
                                    />
                                </DialogContent>
                                <DialogActions>
                                    <Button className="dialog-button" onClick={handleClose}>Cancel</Button>
                                    <Button className="dialog-button" onClick={handleFileUpload}>Upload</Button>
                                </DialogActions>
                            </Dialog>
                            {showPhotoUploadSuccess.show && (
                                <Alert
                                    icon={
                                        showPhotoUploadSuccess.success ? (
                                            <CheckIcon fontSize="inherit"/>
                                        ) : (
                                            <CloseIcon fontSize="inherit"/>
                                        )
                                    }
                                    severity={showPhotoUploadSuccess.success ? "success" : "error"}
                                >
                                    {showPhotoUploadSuccess.message}
                                </Alert>
                            )}
                        </>
                    )}
                </Box>
                <Box sx={{display: "flex", alignItems: "center", gap: 3}}>
                    {isLoggedIn && (
                        <>
                            <FormGroup>
                                <FormControlLabel
                                    control={(
                                        <Checkbox
                                            sx={{
                                                color: "var(--text-color)",
                                                "&.Mui-checked": {color: "var(--text-color)"},
                                            }}
                                            checked={enableAdvancedFeatures}
                                            onChange={() => setEnableAdvancedFeatures((prev) => !prev)}
                                        />
                                    )}
                                    label="Advanced Features"
                                    className="advanced-features"
                                />
                            </FormGroup>
                            <Typography variant="h6" className="title">
                                {title}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout} className="logout-button">
                                Logout
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}

export default TopBar;