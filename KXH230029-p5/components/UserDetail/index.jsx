import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Button, CircularProgress, Typography} from "@mui/material";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail({
                        userId,
                        enableAdvancedFeatures
                    }) {
    // State to hold user data and loading status
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user data when component mounts or when userId changes
    // Set loading state to true while fetching and set to false after fetch completes
    useEffect(() => {
        if (userId) {
            setLoading(true);
            fetchModel(`/user/${userId}`)
                .then((result) => {
                    setUser(result.data);
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [userId]);

    // Show a loading spinner while data is being fetched
    if (loading) {
        return <CircularProgress className="loading-spinner"/>;
    }

    // Display message if no user data is found
    if (!user) {
        return <Typography variant="h6" className="not-found-message">User not found.</Typography>;
    }

    // Destructure user details from fetched data
    const {
        first_name,
        last_name,
        description,
        location,
        occupation
    } = user;

    return (
        <div className="user-detail-container">
            {/* Display user's name */}
            <Typography variant="h4" className="user-name">{`${first_name} ${last_name}`}</Typography>

            {/* Display user description */}
            <Typography variant="body1" className="user-description">{description}</Typography>

            {/* Display user's location */}
            <Typography variant="body1" className="user-location">
                <strong>Location:</strong> {location}
            </Typography>

            {/* Display user's occupation */}
            <Typography variant="body1" className="user-occupation" marginBottom="10px">
                <strong>Occupation:</strong> {occupation}
            </Typography>

            {/* Button to view user's photos, links to either advanced or standard view based on enableAdvancedFeatures */}
            <Button
                component={Link}
                to={enableAdvancedFeatures.enableAdvancedFeatures ? `/photos/${userId}/0` : `/photos/${userId}`}
                className="viewPhotosButton"
                variant="contained"
                fullWidth
                sx={{
                    backgroundColor: "var(--accent-color)",
                    color: "var(--text-color)",
                    '&:hover': {
                        backgroundColor: "var(--accent-hover-color)",
                        color: "var(--hover-text-color)"
                    }
                }}
            >
                View Photos
            </Button>
        </div>
    );
}

export default UserDetail;
