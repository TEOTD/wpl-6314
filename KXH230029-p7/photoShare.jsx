import React, {useEffect, useMemo, useState} from "react";
import ReactDOM from "react-dom/client";
import {Grid, Paper} from "@mui/material";
import {HashRouter, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";
import "./styles/main.css";
import axios from "axios";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import {
    AdvancedContext,
    FirstLoadContext,
    LoggedInUserContext,
    LoginContext,
    ReloadContext,
    PhotoIndexContext
} from "./components/context/appContext";
import LoginRegister from "./components/LoginRegister";

// Route component for rendering UserDetail with a userId parameter
function UserDetailRoute() {
    const {userId} = useParams();
    return <UserDetail userId={userId}/>;
}

// Route component for rendering UserPhotos with userId and handling photoIndex state
function UserPhotosRoute() {
    const {userId} = useParams();
    return (
        <UserPhotos
            userId={userId}
        />
    );
}

// Route component for rendering UserComments with a userId parameter
function UserCommentsRoute() {
    const {userId} = useParams();
    return (
        <UserComments userId={userId}/>
    );
}

// Main PhotoShare component that handles the overall app structure
function PhotoShare({isLoggedIn, firstLoad}) {
    // State to track if advanced features are enabled
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
    // State for triggering component reloads
    const [reload, setReload] = useState(false);
    // State for tracking the photo index
    const [photoIndex, setPhotoIndex] = useState(-1);
    // Memoized context value for reload state
    const reloadContextValue = useMemo(() => [reload, setReload], [reload]);
    // Memoized context value for advanced features
    const advancedContextValue = useMemo(() => [enableAdvancedFeatures, setEnableAdvancedFeatures], [enableAdvancedFeatures]);
    // Setting Photo Index content
    const photoIndexContextValue = useMemo(() => [photoIndex, setPhotoIndex], [photoIndex]);
    // Getting the current pathname from the location
    const {pathname} = useLocation();
    const navigate = useNavigate();

    // Effect to manage the photoIndex state and redirect based on URL and advanced feature changes
    useEffect(() => {
        const routes = pathname.split("/");
        if (routes.length >= 3 && routes[1] === "photos") {
            setPhotoIndex(enableAdvancedFeatures ? Math.max(photoIndex, 0) : -1);
        }
    }, [enableAdvancedFeatures, setEnableAdvancedFeatures]);

    // Effect to update the URL based on photoIndex changes
    useEffect(() => {
        const routes = pathname.split("/");
        if (!firstLoad && routes[1] === "photos") {
            navigate(photoIndex === -1 ? `/photos/${routes[2]}` : `/photos/${routes[2]}/${photoIndex}`);
        }
    }, [photoIndex, setPhotoIndex]);

    // Effect to manage URL path and enable/disable advanced features accordingly
    useEffect(() => {
        const routes = pathname.split("/");
        if (routes[1] === "photos") {
            if (routes.length === 4 && routes[3] !== photoIndex.toString()) {
                setPhotoIndex(parseInt(routes[3], 10));
                setEnableAdvancedFeatures(true);
            } else if (routes.length === 3) {
                setEnableAdvancedFeatures(false);
            }
        }
    }, [pathname]);

    // Function to render the UserList component if the user is logged in
    const renderUserList = () => {
        return (isLoggedIn ? <UserList/> : null);
    };

    // Function to render the main content of the app based on login status
    const renderMainContent = () => {
        return (
            isLoggedIn ?
                (
                    <Routes>
                        <Route path="/"/>
                        <Route
                            path="/users/:userId"
                            element={<UserDetailRoute/>}
                        />
                        <Route
                            path="/photos/:userId"
                            element={(
                                <UserPhotosRoute/>
                            )}
                        />
                        <Route
                            path="/photos/:userId/:photoIndex"
                            element={(
                                <UserPhotosRoute/>
                            )}
                        />
                        <Route
                            path="/comments/:userId"
                            element={(
                                <UserCommentsRoute/>
                            )}
                        />
                        <Route path="/users" element={<UserList/>}/>
                    </Routes>
                ) :
                (
                    <Routes>
                        <Route path="/admin/login" element={<LoginRegister/>}/>
                    </Routes>
                )
        );
    };

    // Main render of the PhotoShare component, including the top bar and layout
    return (
        <div>
            <Grid container spacing={2}>
                <AdvancedContext.Provider value={advancedContextValue}>
                    <ReloadContext.Provider value={reloadContextValue}>
                        <PhotoIndexContext.Provider value={photoIndexContextValue}>
                            <Grid item xs={12}>
                                <TopBar/>
                            </Grid>
                            <div className="main-top-bar-buffer"/>
                            <Grid item sm={3}>
                                <Paper className="main-grid-item">
                                    {renderUserList()}
                                </Paper>
                            </Grid>
                            <Grid item sm={9}>
                                <Paper className="main-grid-item">
                                    {renderMainContent()}
                                </Paper>
                            </Grid>
                        </PhotoIndexContext.Provider>
                    </ReloadContext.Provider>
                </AdvancedContext.Provider>
            </Grid>
        </div>
    );
}

// Main App component that handles user authentication and session check and first load
function App() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [firstLoad, setFirstLoad] = useState(true);

    // Memoized context value for login state
    const loginContextValue = useMemo(() => [isLoggedIn, setIsLoggedIn], [isLoggedIn]);
    // Memoized context value for the logged-in user
    const loggedInUserContextValue = useMemo(() => [loggedInUser, setLoggedInUser], [loggedInUser]);
    // Memoized context value for first load
    const firstLoadContextValue = useMemo(() => [firstLoad, setFirstLoad], [firstLoad]);


    // Effect to check user session and manage login state
    useEffect(() => {
        const loggedInFlag = localStorage.getItem('isLoggedIn');
        const currentLoggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (loggedInFlag === 'true') {
            (async () => {
                await axios.get('/admin/check-session', {withCredentials: true})
                    .then(response => {
                        if (response.status === 200) {
                            setIsLoggedIn(true);
                            setFirstLoad(false);
                            setLoggedInUser(currentLoggedInUser);
                        } else {
                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('loggedInUser');
                            setIsLoggedIn(false);
                            setFirstLoad(false);
                            navigate("/admin/login", {replace: true});
                        }
                    })
                    .catch(() => {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('loggedInUser');
                        setIsLoggedIn(false);
                        setFirstLoad(false);
                        navigate("/admin/login", {replace: true});
                    });
            })();
        } else {
            setFirstLoad(false);
            navigate("/admin/login", {replace: true});
        }
    }, []);

    // Render the main application with context providers
    return (
        <FirstLoadContext.Provider value={firstLoadContextValue}>
            <LoginContext.Provider value={loginContextValue}>
                <LoggedInUserContext.Provider value={loggedInUserContextValue}>
                    <PhotoShare isLoggedIn={isLoggedIn} firstLoad={firstLoad}/>
                </LoggedInUserContext.Provider>
            </LoginContext.Provider>
        </FirstLoadContext.Provider>
    );
}

// Render the application into the root DOM node
const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
    <HashRouter>
        <App/>
    </HashRouter>
);