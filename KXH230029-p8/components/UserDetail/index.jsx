import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, CircularProgress, Paper, Typography } from "@mui/material";
import "./styles.css";
import axios from "axios";
import { AdvancedContext, ReloadContext } from "../context/appContext";
import formatDateTime from "../../lib/utils";
import {margin} from "@mui/system";

function UserDetail({ userId }) {
    const [user, setUser] = useState(null);
    const [latestPhoto, setLatestPhoto] = useState(null);
    const [mostCommentedPhoto, setMostCommentedPhoto] = useState(null);
    const [loading, setLoading] = useState(true);

    const [enableAdvancedFeatures] = useContext(AdvancedContext);
    const [reload] = useContext(ReloadContext);

    // Function to fetch data with a URL and state updater
    const fetchData = async (url, setState) => {
        try {
            const response = await axios.get(url);
            setState(response.data);
        } catch (error) {
            setState(null);
        }
    };

    useEffect(() => {
        if (userId) {
            setLoading(true);
            (async () => {
                await Promise.all([
                    fetchData(`/user/${userId}`, setUser),
                    fetchData(`/latestPhotoOfUser/${userId}`, setLatestPhoto),
                    fetchData(`/mostCommentedPhotoOfUser/${userId}`, setMostCommentedPhoto),
                ]);
                setLoading(false);
            })();
        }
    }, [userId, reload]);

    if (loading) {
        return <CircularProgress className="loading-spinner" />;
    }

    if (!user) {
        return <Typography variant="h6" className="not-found-message">User not found.</Typography>;
    }

    const { first_name, last_name, description, location, occupation } = user;

    const renderPhotoCard = (photo, label) => {
        if (!photo) {
            return <Typography variant="h6" className="no-comments user-detail-container" sx={{margin: "10px"}}>{label}</Typography>;
        }

        return (
            <Link
                to={`/photos/${photo.user_id}/${photo.photo_index}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                <Paper
                    sx={{ backgroundColor: "var(--secondary-hover-color)", margin: "10px"}}
                    className="comment-container flex-comment-container engagement-container"
                >
                    {/* Display the photo */}
                    <img
                        src={`/images/${photo.file_name}`}
                        alt={photo.file_name}
                        className="comment-photo-image"
                    />

                    {/* Container for photo information */}
                    <div className="photo-information">
                        {/* Display the formatted photo date */}
                        <Typography
                            variant="body2"
                            sx={{ margin: "10px 0" }}
                            className="photo-date"
                        >
                            {formatDateTime(photo.date_time)}
                        </Typography>

                        {/* Conditionally display the comment count if available */}
                        {photo.comment_count && (
                            <Typography
                                variant="body2"
                                sx={{ margin: "10px 0" }}
                                className="photo-date photo-comment-count"
                            >
                                Comment Count: {photo.comment_count}
                            </Typography>
                        )}
                    </div>
                </Paper>
            </Link>
        );
    };

    return (
        <>
            <div className="user-detail-container">
                <Typography variant="h4" className="user-name">{`${first_name} ${last_name}`}</Typography>
                {description && <Typography variant="body1" className="user-description">{description}</Typography>}
                {location && <Typography variant="body1" className="user-location"><strong>Location:</strong> {location}</Typography>}
                {occupation && <Typography variant="body1" className="user-occupation" marginBottom="10px"><strong>Occupation:</strong> {occupation}</Typography>}

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
                {renderPhotoCard(latestPhoto, "No Photos Yet")}
                {renderPhotoCard(mostCommentedPhoto, "No Comments Yet")}
            </div>
        </>
    );
}

export default UserDetail;