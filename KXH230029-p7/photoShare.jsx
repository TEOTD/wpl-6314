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
import {AdvancedContext, LoggedInUserContext, LoginContext, ReloadContext} from "./components/context/appContext";
import LoginRegister from "./components/LoginRegister";

function UserDetailRoute() {
    const {userId} = useParams();
    return <UserDetail userId={userId}/>;
}

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

function PhotoShare({isLoggedIn, navigate}) {
    const [firstLoad, setFirstLoad] = useState(true);
    const [enableAdvancedFeatures, setEnableAdvancedFeatures] = useState(false);
    const [reload, setReload] = useState(false);
    const reloadContextValue = useMemo(() => [reload, setReload], [reload]);
    const [photoIndex, setPhotoIndex] = useState(-1);

    const advancedContextValue = useMemo(() => [enableAdvancedFeatures, setEnableAdvancedFeatures], [enableAdvancedFeatures]);
    const {pathname} = useLocation();

    useEffect(() => {
        const routes = pathname.split("/");
        setFirstLoad(false);
        if ((routes[1] === "photos" && routes.length === 4) || (routes[1] === "comments")) {
            setEnableAdvancedFeatures(true);
        }
    }, []);

    useEffect(() => {
        const routes = pathname.split("/");
        if (routes.length >= 3 && routes[1] === "photos") {
            setPhotoIndex(enableAdvancedFeatures ? Math.max(photoIndex, 0) : -1);
        }
        if (firstLoad === false && enableAdvancedFeatures === false && routes[1] === "comments") {
            navigate(`/users/${routes[2]}`);
        }
    }, [enableAdvancedFeatures, setEnableAdvancedFeatures]);

    useEffect(() => {
        const routes = pathname.split("/");
        if (!firstLoad && routes[1] === "photos") {
            navigate(photoIndex === -1 ? `/photos/${routes[2]}` : `/photos/${routes[2]}/${photoIndex}`);
        }
    }, [photoIndex, setPhotoIndex]);

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

    const renderUserList = () => {
        return (isLoggedIn ? <UserList/> : null);
    };

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
                    </Routes>
                ) :
                (
                    <Routes>
                        <Route path="/admin/login" element={<LoginRegister/>}/>
                    </Routes>
                )

        );
    };

    return (
        <div>
            <Grid container spacing={2}>
                <AdvancedContext.Provider value={advancedContextValue}>
                    <ReloadContext.Provider value={reloadContextValue}>
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
                    </ReloadContext.Provider>
                </AdvancedContext.Provider>
            </Grid>
        </div>
    );
}

function App() {
    const navigate = useNavigate();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loggedInUser, setLoggedInUser] = useState(null);

    const loginContextValue = useMemo(() => [isLoggedIn, setIsLoggedIn], [isLoggedIn]);
    const loggedInUserContextValue = useMemo(() => [loggedInUser, setLoggedInUser], [loggedInUser]);

    useEffect(() => {
        const loggedInFlag = localStorage.getItem('isLoggedIn');
        const currentLoggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

        if (loggedInFlag === 'true') {
            (async () => {
                await axios.get('/admin/check-session', {withCredentials: true})
                    .then(response => {
                        if (response.status === 200) {
                            setIsLoggedIn(true);
                            setLoggedInUser(currentLoggedInUser);
                        } else {
                            localStorage.removeItem('isLoggedIn');
                            localStorage.removeItem('loggedInUser');
                            setIsLoggedIn(false);
                            navigate("/admin/login", {replace: true});
                        }
                    })
                    .catch(() => {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('loggedInUser');
                        setIsLoggedIn(false);
                        navigate("/admin/login", {replace: true});
                    });
            })();
        } else {
            navigate("/admin/login", {replace: true});
        }
    }, []);

    return (
        <LoginContext.Provider value={loginContextValue}>
            <LoggedInUserContext.Provider value={loggedInUserContextValue}>
                <PhotoShare isLoggedIn={isLoggedIn} navigate={navigate}/>
            </LoggedInUserContext.Provider>
        </LoginContext.Provider>
    );
}

const root = ReactDOM.createRoot(document.getElementById("photoshareapp"));
root.render(
    <HashRouter>
        <App/>
    </HashRouter>
);
