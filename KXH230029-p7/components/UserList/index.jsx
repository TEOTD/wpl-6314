import React, {useContext, useEffect, useMemo, useState} from "react";
import {Badge, CircularProgress, IconButton, List, ListItem, ListItemText, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import "./styles.css";
import axios from "axios";
import {Message, PhotoLibrary} from "@mui/icons-material";
import {AdvancedContext, ReloadContext} from "../context/appContext";

function UserList() {
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [numberOfPhotosOfUser, setNumberOfPhotosOfUser] = useState(null);
    const [numberOfCommentsOfUser, setNumberOfCommentsOfUser] = useState(null);
    const [enableAdvancedFeatures,] = useContext(AdvancedContext);
    const [reload,] = useContext(ReloadContext);


    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get('/user/list')
                .then((result) => {
                    setUsers(result.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch users:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, []);

    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get('/photos/count')
                .then((result) => {
                    setNumberOfPhotosOfUser(result.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch users:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, [reload]);

    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get('/comments/count')
                .then((result) => {
                    setNumberOfCommentsOfUser(result.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch users:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, [reload]);

    function getNumberOfPhotosOfUser(userId) {
        const userPhotos = numberOfPhotosOfUser.find(photo => photo.user_id === userId);
        return userPhotos ? userPhotos.photo_count : 0;
    }

    function getNumberOfCommentsOfUser(userId) {
        const userComments = numberOfCommentsOfUser.find(comment => comment.user_id === userId);
        return userComments ? userComments.comment_count : 0;
    }

    const photoBubble = (userId) => {
        const photoCount = getNumberOfPhotosOfUser(userId);
        return (
            <Link to={`/photos/${userId}/0`} style={{textDecoration: 'none', color: 'inherit'}}>
                <IconButton aria-label="photos">
                    <Badge badgeContent={photoCount} color="secondary" showZero="true">
                        <PhotoLibrary color="action" sx={{
                            color: 'var(--tertiary-color)',
                        }}/>
                    </Badge>
                </IconButton>
            </Link>

        );
    };

    const messageBubble = (userId) => {
        const commentCount = getNumberOfCommentsOfUser(userId);
        return (
            <Link to={`/comments/${userId}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <IconButton aria-label="photos">
                    <Badge badgeContent={commentCount} color="secondary" showZero="true">
                        <Message color="action" sx={{
                            color: 'var(--secondary-hover-color)'
                        }}/>
                    </Badge>
                </IconButton>
            </Link>
        );
    };

    const renderedUserList = useMemo(() => {
        if (!users) return null;
        return (
            <List className="user-list">
                {users.map((user) => (
                    <div key={user._id + "user-name"} className="user-list-container">
                        <ListItem
                            key={user._id}
                            className="user-list-item"
                            component={Link}
                            to={`/users/${user._id}`}
                        >
                            <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
                        </ListItem>
                        {enableAdvancedFeatures && (
                            <ListItem
                                key={user._id + "user-bubble"}
                                className="user-bubble-item"
                            >
                                <ListItemText
                                    className="bubble-container"
                                    primary={(
                                        <>
                                            {photoBubble(user._id)}
                                            {' '}
                                            {messageBubble(user._id)}
                                        </>
                                    )}
                                />
                            </ListItem>
                        )}
                    </div>
                ))}
            </List>
        );
    }, [users, enableAdvancedFeatures, reload, numberOfPhotosOfUser]);

    if (loading) return <CircularProgress className="loading-spinner"/>;
    if (!users) return <Typography variant="h6" className="not-found-message">User not found.</Typography>;
    return renderedUserList;
}

export default UserList;
