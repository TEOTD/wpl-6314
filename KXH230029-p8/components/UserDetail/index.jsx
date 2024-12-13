import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Box, Button, CircularProgress, Paper, Typography} from "@mui/material";
import "./styles.css";
import axios from "axios";
import {AdvancedContext, ReloadContext} from "../context/appContext";
import formatDateTime from "../../lib/utils";

function UserDetail({userId}) {
    // State to hold the fetched user data
    const [user, setUser] = useState(null);
    // State to hold the latest photo of the user
    const [latestPhoto, setLatestPhoto] = useState(null);
    // State to hold the most commented photo of the user
    const [mostCommentedPhoto, setMostCommentedPhoto] = useState(null);
    const [mentions, setMentions] = useState(null);
    // State to manage the loading spinner visibility
    const [loading, setLoading] = useState(true);

    // Context to check if advanced features are enabled
    const [enableAdvancedFeatures] = useContext(AdvancedContext);
    // Context to check if reload is needed when photo or comments are added
    const [reload] = useContext(ReloadContext);

    // Function to fetch data from the given URL and update the state
    // If error occurs, reset state
    const fetchData = async (url, setState) => {
        try {
            const response = await axios.get(url);
            setState(response.data);
        } catch (error) {
            setState(null);
        }
    };

    // Effect to fetch user data when the component mounts, or when the userId or reload changes
    useEffect(() => {
        if (userId) {
            setLoading(true);
            (async () => {
                await Promise.all([
                    fetchData(`/user/${userId}`, setUser),
                    fetchData(`/latestPhotoOfUser/${userId}`, setLatestPhoto),
                    fetchData(`/mostCommentedPhotoOfUser/${userId}`, setMostCommentedPhoto),
                    fetchData(`/photosWithMentions/${userId}`, setMentions)
                ]);
                setLoading(false);
            })();
        }
    }, [userId, reload]);

    // Show loading spinner while data is being fetched
    if (loading) {
        return <CircularProgress className="loading-spinner"/>;
    }

    // Show a message if user data is not found
    if (!user) {
        return <Typography variant="h6" className="not-found-message">User not found.</Typography>;
    }

    // Destructure user details from the fetched data for easier use
    const {first_name, last_name, description, location, occupation} = user;

    // Render the photo card (latest or most commented photo) with proper formatting and links
    const renderPhotoCard = (photo, label) => {
        if (!photo) {
            return (
                <Typography variant="h6" className="no-comments user-detail-container"
                            sx={{margin: "10px"}}>{label}
                </Typography>
            );
        }

        // check if image is hidden from the user
        if (photo._id === -1) {
            return (
                <Typography variant="h6" className="no-comments user-detail-container"
                            sx={{margin: "10px"}}>{"Sorry, image is not accessible to you."}
                </Typography>
            );
        }

        const mentionRegex = /@\[(.+?)]\((.+?)\)/g;
        const renderComment = (text) => {
            const parts = [];
            let lastIndex = 0;
            text.replace(mentionRegex, (match, name, commentUserId, index) => {
                if (index > lastIndex) {
                    parts.push(text.substring(lastIndex, index));
                }
                parts.push(
                    <Link key={commentUserId} to={`/users/${commentUserId}`} className="comment-link">
                        @{name}
                    </Link>
                );
                lastIndex = index + match.length;
            });
            if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }
            return parts;
        };

        return (
            <Link
                to={`/photos/${photo.user_id}/${photo.photo_index}`}
                style={{textDecoration: "none", color: "inherit"}}
            >
                <Paper
                    sx={{backgroundColor: "var(--secondary-hover-color)", margin: "10px"}}
                    className="comment-container-details flex-comment-container engagement-container"
                >
                    {/* Display the photo */}
                    <img
                        src={`/images/${photo.file_name}`}
                        alt={photo.file_name}
                        className="comment-photo-image"
                    />

                    {/* Container for photo information */}
                    <div className="photo-information">
                        <Typography
                            variant="body2"
                            sx={{margin: "10px 0"}}
                            className="photo-date"
                        >
                            {formatDateTime(photo.date_time)}
                        </Typography>
                        {/* Display the comment information if available */}
                        {photo.comment && (
                            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                <Paper sx={
                                    {
                                        display: 'flex',
                                        flexDirection: 'column',
                                        backgroundColor: "#ED2939",
                                        width: "600px",
                                        padding: "10px",
                                        height: 'fit-content',

                                    }
}>
                                    <Typography variant="body1"
                                                className="comment">{renderComment(photo.comment.comment)}
                                    </Typography>

                                    {/* Displays the user's name and the date of the comment */}
                                    <Typography variant="caption">
                                        <Link to={`/users/${photo.comment.user._id}`} className="comment-link">
                                            {photo.comment.user.first_name} {photo.comment.user.last_name}
                                        </Link>
                                        <span
                                            className="photo-date">{' - '}{formatDateTime(photo.comment.date_time)}
                                        </span>
                                    </Typography>
                                </Paper>
                            </Box>
                        )}
                        {/* Display the comment count if available */}
                        {photo.comment_count && (
                            <Paper sx={
                                {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    backgroundColor: "#ED2939",
                                    width: "300px",
                                    padding: "10px",
                                    height: 'fit-content',

                                }
}>
                                <Typography
                                    variant="body2"
                                    sx={{margin: "10px 0"}}
                                    className="photo-date photo-comment-count"
                                >
                                    Comment Count: {photo.comment_count}
                                </Typography>
                            </Paper>
                        )}
                    </div>
                </Paper>
            </Link>
        );
    };

    const renderMentions = () => {
        const mentionsList = mentions?.mentions;

        if (!Array.isArray(mentionsList) || mentionsList.length === 0) {
            return (
                <Typography variant="h6" className="no-comments user-detail-container" sx={{margin: "10px"}}>
                    No mentions yet
                </Typography>
            );
        }

        return mentionsList.map((mention) => (
            <div key={mention.user_id}>
                {renderPhotoCard(mention, "No mentions yet")}
            </div>
        ));
    };

    return (
        <>
            <div className="user-detail-container">
                <Typography variant="h4" className="user-name">{`${first_name} ${last_name}`}</Typography>
                {description && <Typography variant="body1" className="user-description">{description}</Typography>}
                {location && (
                    <Typography variant="body1" className="user-location"><strong>Location:</strong> {location}
                    </Typography>
                )}
                {occupation && (
                    <Typography variant="body1" className="user-occupation"
                                marginBottom="10px"><strong>Occupation:</strong> {occupation}
                    </Typography>
                )}

                {/* Button to view the photos, with conditional URL for advanced features */}
                <Button
                    component={Link}
                    to={enableAdvancedFeatures ? `/photos/${userId}/0` : `/photos/${userId}`}
                    className="viewPhotosButton"
                    variant="contained"
                    fullWidth
                    sx={{
                        backgroundColor: "var(--accent-color)",
                        color: "var(--text-color)",
                        "&:hover": {
                            backgroundColor: "var(--accent-hover-color)",
                            color: "var(--hover-text-color)",
                        },
                    }}
                >
                    View Photos
                </Button>
            </div>

            <div className="user-detail-container user-engagement-container">
                <Typography variant="h4" className="user-name">User Engagement</Typography>
                {/* Display the latest photo */}
                {renderPhotoCard(latestPhoto, "No Photos Yet")}
                {/* Display the most commented photo */}
                {renderPhotoCard(mostCommentedPhoto, "No Comments Yet")}
                <Typography variant="h4" className="user-name">@Mentions</Typography>
                {renderMentions()}
            </div>
        </>
    );
}

export default UserDetail;