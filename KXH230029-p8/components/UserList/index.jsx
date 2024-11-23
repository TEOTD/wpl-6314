import React, {useContext, useEffect, useMemo, useState} from "react";
import {Badge, CircularProgress, IconButton, List, ListItem, ListItemText, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import "./styles.css";
import axios from "axios";
import {Message, PhotoLibrary} from "@mui/icons-material";
import {AdvancedContext, ReloadContext, UserContext} from "../context/appContext";

function UserList() {
    // State to store the list of users fetched from the server
    const [users, setUsers] = useContext(UserContext);
    // State to manage loading spinner visibility
    const [loading, setLoading] = useState(true);
    // State to store the number of photos associated with each user
    const [numberOfPhotosOfUser, setNumberOfPhotosOfUser] = useState(null);
    // State to store the number of comments associated with each user
    const [numberOfCommentsOfUser, setNumberOfCommentsOfUser] = useState(null);
    // Context value to check if advanced features are enabled
    const [enableAdvancedFeatures] = useContext(AdvancedContext);
    // Context value to trigger a reload of data when needed
    const [reload] = useContext(ReloadContext);

    // Effect to fetch the list of users when the component mounts
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

    // Effect to fetch the number of photos for each user
    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get('/photos/count')
                .then((result) => {
                    setNumberOfPhotosOfUser(result.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch photo counts:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, [reload]);

    // Effect to fetch the number of comments for each user
    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get('/comments/count')
                .then((result) => {
                    setNumberOfCommentsOfUser(result.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch comment counts:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, [reload]);

    // Function to get the number of photos for a specific user
    function getNumberOfPhotosOfUser(userId) {
        const userPhotos = numberOfPhotosOfUser.find(photo => photo.user_id === userId);
        return userPhotos ? userPhotos.photo_count : 0;
    }

    // Function to get the number of comments for a specific user
    function getNumberOfCommentsOfUser(userId) {
        const userComments = numberOfCommentsOfUser.find(comment => comment.user_id === userId);
        return userComments ? userComments.comment_count : 0;
    }

    // Function to render a photo icon with a badge showing the number of photos
    const photoBubble = (userId) => {
        const photoCount = getNumberOfPhotosOfUser(userId);
        return (
            <Link to={`/photos/${userId}/0`} style={{textDecoration: 'none', color: 'inherit'}}>
                <IconButton aria-label="photos">
                    <Badge badgeContent={photoCount} color="secondary" showZero={true}>
                        <PhotoLibrary color="action" sx={{
                            color: 'var(--tertiary-color)',
                        }}/>
                    </Badge>
                </IconButton>
            </Link>
        );
    };

    // Function to render a message icon with a badge showing the number of comments
    const messageBubble = (userId) => {
        const commentCount = getNumberOfCommentsOfUser(userId);
        return (
            <Link to={`/comments/${userId}`} style={{textDecoration: 'none', color: 'inherit'}}>
                <IconButton aria-label="comments">
                    <Badge badgeContent={commentCount} color="secondary" showZero={true}>
                        <Message color="action" sx={{
                            color: 'var(--secondary-hover-color)'
                        }}/>
                    </Badge>
                </IconButton>
            </Link>
        );
    };

    // Memoize the rendered user list to optimize performance
    const renderedUserList = useMemo(() => {
        if (!users) return null;
        return (
            <List className="user-list">
                {users.map((user) => (
                    <div key={user._id + "user-name"} className="user-list-container">
                        {/* Render each user as a list item with a link to the user's detail page */}
                        <ListItem
                            key={user._id}
                            className="user-list-item"
                            component={Link}
                            to={`/users/${user._id}`}
                        >
                            <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
                        </ListItem>
                        {/* Render photo and message icons if advanced features are enabled */}
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

    // Show a loading spinner if data is still being fetched
    if (loading) return <CircularProgress className="loading-spinner"/>;
    // Show a message if no users are found
    if (!users) return <Typography variant="h6" className="not-found-message">User not found.</Typography>;
    // Render the user list
    return renderedUserList;
}

export default UserList;