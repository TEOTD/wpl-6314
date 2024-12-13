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
    FormControl,
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
import {
    AdvancedContext,
    LoggedInUserContext,
    LoginContext,
    PhotoIndexContext,
    ReloadContext
} from "../context/appContext";

function TopBar() {
    // Get the current location path and initialize the navigate function
    const {pathname} = useLocation();
    const navigate = useNavigate();

    // Contexts to manage application state
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useContext(AdvancedContext);
    const [isLoggedIn, setIsLoggedIn] = useContext(LoginContext);
    const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
    const [reload, setReload] = useContext(ReloadContext);
    const [, setPhotoIndex] = useContext(PhotoIndexContext);

    // State variables for UI elements and notifications
    const [imageUploadShow, setImageUploadShow] = useState(false);
    const [deleteUserShow, setDeleteUserShow] = useState(false);
    const [uploadInput, setUploadInput] = useState(null);
    const [showPhotoUploadSuccess, setShowPhotoUploadSuccess] = useState({
        message: '',
        success: false,
        show: false
    });

    const [accessToAll, setAccessToAll] = useState(true);
    const [users, setUsers] = useState();
    const [checkedList, setCheckedList] = useState();


    // Get users list to limit access control
    useEffect(() => {
        (async () => {
            await axios.get('/user/list')
                .then((result) => {
                    if (!loggedInUser) {
                        return;
                    }
                    let users1 = result.data;
                    users1 = users1.filter(user => {
                        return user._id !== loggedInUser._id;
                    });
                    setUsers(users1);
                    setCheckedList(new Array(users1.length).fill(false));
                })
                .catch((error) => {
                    console.error("Failed to fetch users:", error);
                });
        })();
    }, [loggedInUser]);

    // Effect to handle initial loading and enabling advanced features based on the URL path
    useEffect(() => {
        const routes = pathname.split("/");
        if ((routes[1] === "photos" && routes.length === 4) || (routes[1] === "comments")) {
            setEnableAdvancedFeatures(true);
        }
    }, []);

    const handleDialogToggle = useCallback((type, open) => {
        if (type === "image") {
            setImageUploadShow(open);
            setAccessToAll(true);
        }
        if (type === "delete") setDeleteUserShow(open);
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
            let user_list = ['*'];
            if (!accessToAll) {
                user_list = [];
                users.map(
                    (user, index) => {
                        if (checkedList[index]) {
                            user_list.push(user._id);
                        }
                        return user;
                    }
                );
                user_list.push(loggedInUser._id);
            }
            domForm.append("access_list", JSON.stringify(user_list));
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
        handleDialogToggle("image", false);
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
        if (pathname.startsWith("/activities")) return `Website Activities`;
        return "Home Page";
    }, [user, pathname]);

    // Memoized greeting message based on login status
    const greeting = useMemo(() => {
        if (!isLoggedIn) return "Please Login";
        return `Hi ${loggedInUser.first_name} !!!!`;
    }, [isLoggedIn, loggedInUser]);

    function resetAllContext() {
        setIsLoggedIn(false);
        setLoggedInUser(null);
        setEnableAdvancedFeatures(false);
        setPhotoIndex(-1);
    }

    // Function to handle logout and clear stored data
    const handleLogout = useCallback(async () => {
        await axios.post("/admin/logout")
            .then(() => {
                localStorage.removeItem("isLoggedIn");
                localStorage.removeItem("loggedInUser");
                resetAllContext();
                navigate("/admin/login", {replace: true});
            })
            .catch(error => {
                console.error("Logout failed:", error);
            });
    }, [setIsLoggedIn, setLoggedInUser, navigate]);

    const handleActivities = useCallback(async () => {
        navigate("/activities");
    }, []);

    // Function to handle delete user and send it to the server
    const handleDeleteUser = async () => {
        await axios.delete(`/user/${loggedInUser._id}`)
            .then(() => {
                handleLogout();
            })
            .catch(err => showAlert({
                message: `User deletion failed: ${err.response?.data || "unexpected error"}`,
                success: false,
                show: true
            }));
        handleDialogToggle("delete", false);
    };


    const updateCheckedList = (index) => {
        let newc = [...checkedList];
        newc[index] = !newc[index];
        setCheckedList(newc);
    };


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
                            <Button color="inherit" onClick={handleActivities} className="add-photo-button">
                                Activities
                            </Button>
                            <Box className="separator"/>
                            <Button color="inherit" onClick={() => handleDialogToggle("image", true)}
                                    className="add-photo-button">
                                Add Photo
                            </Button>
                            <Dialog
                                open={imageUploadShow}
                                keepMounted
                                onClose={() => handleDialogToggle("image", false)}
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
                                    <Button
                                        sx={{
                                            backgroundColor: accessToAll ? "#aa95ca" : "#7fd860",
                                            margin: "10px",
                                            color: "white",
                                        }}
                                        onClick={() => {
                                            setAccessToAll(!accessToAll);
                                        }}
                                    >
                                        {
                                            accessToAll ? "Limit Access" : "Allow Access to All"
                                        }
                                    </Button>

                                    {!accessToAll &&
                                        (
                                            <Box sx={{
                                                display: "flex",
                                                flexDirection: "column",
                                            }}>
                                                <Typography variant="body1"
                                                            sx={{
                                                                color: "white",
                                                                marginLeft: "10px",
                                                            }}
                                                >
                                                    Select Users To Provide Access
                                                </Typography>
                                                <FormControl sx={{m: 3}} component="fieldset" variant="standard">
                                                    <FormGroup> {
                                                        users.map((user1, index) => {
                                                            return (
                                                                <FormControlLabel
                                                                    sx={{
                                                                        color: "white",
                                                                    }}
                                                                    control={

                                                                        (
                                                                            <Checkbox
                                                                                sx={{
                                                                                    color: "white",
                                                                                }}
                                                                                onChange={() => {
                                                                                    updateCheckedList(index);
                                                                                }}
                                                                                checked={checkedList[index]}
                                                                                name={user1.first_name}
                                                                            />
                                                                        )
                                                                    }
                                                                    key={user1._id}
                                                                    label={user1.first_name + " " + user1.last_name}
                                                                />
                                                            );
                                                        })
                                                    }
                                                    </FormGroup>
                                                </FormControl>
                                            </Box>
                                        )}

                                </DialogContent>
                                <DialogActions>
                                    <Button className="dialog-button"
                                            onClick={() => handleDialogToggle("image", false)}>Cancel
                                    </Button>
                                    <Button className="dialog-button" onClick={handleFileUpload}>Upload</Button>
                                </DialogActions>
                            </Dialog>
                            <Box className="separator"/>
                            <Button color="inherit" onClick={() => handleDialogToggle("delete", true)}
                                    className="delete-user-button">
                                Delete User
                            </Button>
                            <Dialog
                                open={deleteUserShow}
                                keepMounted
                                onClose={() => handleDialogToggle("delete", false)}
                                aria-describedby="alert-dialog-slide-description"
                                id="dialog"
                                sx={{
                                    "& .MuiPaper-root": {
                                        background: "#000",
                                        borderRadius: "10px",
                                    },
                                }}
                            >
                                <DialogTitle
                                    className="dialog-title">{"Are You Sure You want to Delete the User ??"}
                                </DialogTitle>
                                <DialogActions>
                                    <Button className="delete-dialog-button"
                                            onClick={() => handleDialogToggle("delete", false)}>Cancel
                                    </Button>
                                    <Button className="delete-dialog-button" onClick={handleDeleteUser}>Delete</Button>
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