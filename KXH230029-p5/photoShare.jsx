import React, {useEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import {Grid, Paper} from "@mui/material";
import {HashRouter, Route, Routes, useLocation, useNavigate, useParams} from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

//todo: fix backspace and forward

function UserDetailRoute(enableAdvancedFeatures) {
    const {userId} = useParams();
    return <UserDetail userId={userId} enableAdvancedFeatures={enableAdvancedFeatures}/>;
}

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

function PhotoShare() {
    const [firstLoad, setFirstLoad] = useState(true);
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(-1);
    const {pathname} = useLocation();
    const navigate = useNavigate();

    //Run only once during initial render
    useEffect(() => {
        const routes = pathname.split("/");
        setFirstLoad(false);
        if (routes[1] === "photos") {
            if (routes.length === 4) {
                setEnableAdvancedFeatures(true);
            }
        }
    }, []);

    //Only change when enable features
    useEffect(() => {
        const routes = pathname.split("/");
        if (routes.length >= 3) {
            if (enableAdvancedFeatures) {
                setPhotoIndex(photoIndex < 0 ? 0 : photoIndex);
            } else {
                setPhotoIndex(-1);
            }
        }
    }, [enableAdvancedFeatures, setEnableAdvancedFeatures]);

    //run on stepper
    useEffect(() => {
        const routes = pathname.split("/");
        if (!firstLoad && routes[1] === "photos") {
            if (photoIndex === -1) {
                navigate(`/photos/${routes[2]}`);
            } else {
                navigate(`/photos/${routes[2]}/${photoIndex}`);
            }
        }
    }, [photoIndex, setPhotoIndex]);

    useEffect(() => {
        const routes = pathname.split("/");
        if (routes.length === 4 && routes[3] !== photoIndex) {
            setPhotoIndex(parseInt(routes[3], 10));
        }
    }, [pathname]);

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TopBar
                        enableAdvancedFeatures={enableAdvancedFeatures}
                        setEnableAdvancedFeatures={setEnableAdvancedFeatures}
                    />
                </Grid>
                <div className="main-topbar-buffer"/>
                <Grid item sm={3}>
                    <Paper className="main-grid-item">
                        <UserList/>
                    </Paper>
                </Grid>
                <Grid item sm={9}>
                    <Paper className="main-grid-item">
                        <Routes>
                            <Route path="/"/>
                            <Route path="/users/:userId"
                                   element={<UserDetailRoute enableAdvancedFeatures={enableAdvancedFeatures}/>}/>
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


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
    <HashRouter>
        <PhotoShare/>
    </HashRouter>
);
