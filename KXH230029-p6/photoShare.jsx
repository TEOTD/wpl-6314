import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import {Grid, Paper} from "@mui/material";
import {HashRouter, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

// Route component for displaying user details with advanced features toggle passed as a prop
function UserDetailRoute(enableAdvancedFeatures) {
    const {userId} = useParams();
    return <UserDetail userId={userId} enableAdvancedFeatures={enableAdvancedFeatures}/>;
}

// Route component for displaying user photos with advanced features and photo index state handling
function UserPhotosRoute({
                             enableAdvancedFeatures,
                             photoIndex,
                             setPhotoIndex
                         }) {
    const {userId} = useParams();
    return (
        <UserPhotos
            userId={userId}
            enableAdvancedFeatures={enableAdvancedFeatures}
            photoIndex={photoIndex}
            setPhotoIndex={setPhotoIndex}
        />
    );
}

// Main PhotoShare component handling routing and managing state for advanced features
function PhotoShare() {
    const [firstLoad, setFirstLoad] = useState(true);
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(-1);
    const {pathname} = useLocation();
    const navigate = useNavigate();

    // Set up initial state based on the URL path on component mount this is used for checking bookmark of advance features
    // Disable first load after initial setup
    // Enable advanced features if URL has photo index
    useEffect(() => {
        const routes = pathname.split("/");
        setFirstLoad(false);
        if (routes[1] === "photos" && routes.length === 4) {
            setEnableAdvancedFeatures(true);
        }
    }, []);

    // Update photoIndex based on enableAdvancedFeatures toggle
    useEffect(() => {
        const routes = pathname.split("/");
        if (routes.length >= 3 && routes[1] === "photos") {
            setPhotoIndex(enableAdvancedFeatures ? Math.max(photoIndex, 0) : -1);
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

    return (
        <div>
            <Grid container spacing={2}>
                {/* TopBar component with advanced features toggle */}
                <Grid item xs={12}>
                    <TopBar
                        enableAdvancedFeatures={enableAdvancedFeatures}
                        setEnableAdvancedFeatures={setEnableAdvancedFeatures}
                    />
                </Grid>
                <div className="main-top-bar-buffer"/>
                {/* Sidebar listing users */}
                <Grid item sm={3}>
                    <Paper className="main-grid-item">
                        <UserList/>
                    </Paper>
                </Grid>
                {/* Main content area displaying user details or photos based on the route */}
                <Grid item sm={9}>
                    <Paper className="main-grid-item">
                        <Routes>
                            <Route path="/"/>
                            <Route
                                path="/users/:userId"
                                element={<UserDetailRoute enableAdvancedFeatures={enableAdvancedFeatures}/>}
                            />
                            <Route
                                path="/photos/:userId"
                                element={<UserPhotosRoute enableAdvancedFeatures={enableAdvancedFeatures}/>}
                            />
                            <Route
                                path="/photos/:userId/:photoIndex"
                                element={(
                                    <UserPhotosRoute
                                        enableAdvancedFeatures={enableAdvancedFeatures}
                                        photoIndex={photoIndex}
                                        setPhotoIndex={setPhotoIndex}
                                    />
                                )}
                            />
                            <Route path="/users" element={<UserList/>}/>
                        </Routes>
                    </Paper>
                </Grid>
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
