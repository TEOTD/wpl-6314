import React, {useEffect, useMemo, useState} from "react";
import ReactDOM from "react-dom/client";
import {Grid, Paper} from "@mui/material";
import {HashRouter, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import {AdvancedContext, LoggedInUserContext, LoginContext} from "./components/context/appContext";
import LoginRegister from "./components/LoginRegister";

// Route component for displaying user details with advanced features toggle passed as a prop
function UserDetailRoute() {
    const {userId} = useParams();
    return <UserDetail userId={userId}/>;
}

// Route component for displaying user photos with advanced features and photo index state handling
function UserPhotosRoute({
                             photoIndex,
                             setPhotoIndex
                         }) {
    const {userId} = useParams();
    return (
        <UserPhotos
            userId={userId}
            photoIndex={photoIndex}
            setPhotoIndex={setPhotoIndex}
        />
    );
}

function UserCommentsRoute() {
    const {userId} = useParams();
    return (
        <UserComments userId={userId}/>
    );
}

// Main PhotoShare component handling routing and managing state for advanced features
function PhotoShare() {
    const [firstLoad, setFirstLoad] = useState(true);
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    // Using memo to store contexts variable and set parameter functions, to avoid reloading on value change.
    const advancedContextValue = useMemo(() => [enableAdvancedFeatures, setEnableAdvancedFeatures], [enableAdvancedFeatures]);
    const loginContextValue = useMemo(() => [isLoggedIn, setIsLoggedIn], [isLoggedIn]);
    const loggedInUserContextValue = useMemo(() => [loggedInUser, setLoggedInUser], [loggedInUser])


    const [photoIndex, setPhotoIndex] = useState(-1);
    const {pathname} = useLocation();
    const navigate = useNavigate();

    // Set up initial state based on the URL path on component mount this is used for checking bookmark of advance features
    // Disable first load after initial setup
    // Enable advanced features if URL has photo index
    useEffect(() => {
        const routes = pathname.split("/");
        setFirstLoad(false);
        if ((routes[1] === "photos" && routes.length === 4) || (routes[1] === "comments")) {
            setEnableAdvancedFeatures(true);
        }
    }, []);

    // Update photoIndex based on enableAdvancedFeatures toggle
    useEffect(() => {
        const routes = pathname.split("/");
        if (routes.length >= 3 && routes[1] === "photos") {
            setPhotoIndex(enableAdvancedFeatures ? Math.max(photoIndex, 0) : -1);
        }
        if (firstLoad === false && enableAdvancedFeatures === false && routes[1] === "comments") {
            navigate(`/users/${routes[2]}`);
        }
    }, [enableAdvancedFeatures, setEnableAdvancedFeatures]);

    // Update the URL to include or exclude photoIndex based on its current state and photo index
    useEffect(() => {
        const routes = pathname.split("/");
        if (!firstLoad && routes[1] === "photos") {
            navigate(photoIndex === -1 ? `/photos/${routes[2]}` : `/photos/${routes[2]}/${photoIndex}`);
        }
    }, [photoIndex, setPhotoIndex]);

    // Adjust photoIndex based on URL path changes directly
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

    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/admin/login", {replace: true});
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && loggedInUser) {
            navigate(`/users/${loggedInUser._id}`);
        }
    }, [isLoggedIn, loggedInUser]);

    const renderUserList = () => {
        return (isLoggedIn ? <UserList/> : null);
    };

    const renderMainContent = () => {
        return (
            isLoggedIn ?
                <Routes>
                    <Route path="/"/>
                    <Route
                        path="/users/:userId"
                        element={<UserDetailRoute/>}
                    />
                    <Route
                        path="/photos/:userId"
                        element={<UserPhotosRoute/>}
                    />
                    <Route
                        path="/photos/:userId/:photoIndex"
                        element={(
                            <UserPhotosRoute
                                photoIndex={photoIndex}
                                setPhotoIndex={setPhotoIndex}
                            />
                        )}
                    />
                    <Route
                        path="/comments/:userId"
                        element={(
                            <UserCommentsRoute/>
                        )}
                    />
                    <Route path="/users" element={<UserList/>}/>
                </Routes> :
                <Routes>
                    <Route path="/admin/login" element={<LoginRegister/>}/>
                </Routes>
        );
    };

    const renderMainComponent = () => {
        return (
            <>
                {/* Sidebar listing users */}

                <Grid item sm={3}>
                    <Paper className="main-grid-item">
                        {renderUserList()}
                    </Paper>
                </Grid>
                {/* Main content area displaying loggedInUser details or photos based on the route */}
                <Grid item sm={9}>
                    <Paper className="main-grid-item">
                        {renderMainContent()}
                    </Paper>
                </Grid>
            </>
        )
    };

    return (
        <div>
            <Grid container spacing={2}>
                <LoginContext.Provider value={loginContextValue}>
                    <LoggedInUserContext.Provider value={loggedInUserContextValue}>
                        <AdvancedContext.Provider value={advancedContextValue}>
                            {/* TopBar component with advanced features toggle */}
                            <Grid item xs={12}>
                                <TopBar/>
                            </Grid>
                            <div className="main-top-bar-buffer"/>
                            {renderMainComponent()}
                        </AdvancedContext.Provider>
                    </LoggedInUserContext.Provider>
                </LoginContext.Provider>
            </Grid>
        </div>
    );
}

// Mount the main PhotoShare app within a HashRouter for client-side routing
const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
    <HashRouter>
        <PhotoShare/>
    </HashRouter>
);
