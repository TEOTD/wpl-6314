import React, {useState} from "react";
import ReactDOM from "react-dom/client";
import {Grid, Paper} from "@mui/material";
import {HashRouter, Route, Routes, useParams} from "react-router-dom";

import "./styles/main.css";
import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";

function UserDetailRoute() {
    const {userId} = useParams();
    return <UserDetail userId={userId}/>;
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
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
    const [photoIndex, setPhotoIndex] = useState(0);

    return (
        <HashRouter>
            <div>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TopBar
                            enableAdvancedFeatures={enableAdvancedFeatures}
                            setEnableAdvancedFeatures={setEnableAdvancedFeatures}
                            photoIndex={photoIndex}
                            setPhotoIndex={setPhotoIndex}
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
                                <Route path="/users/:userId" element={<UserDetailRoute/>}/>
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
        </HashRouter>
    );
}


const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(<PhotoShare/>);
