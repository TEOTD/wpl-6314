import React, {useContext, useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Button, CircularProgress, Typography} from "@mui/material";
import "./styles.css";
import axios from "axios";
import {AdvancedContext} from "../context/appContext";

function UserDetail({userId}) {
    // State to hold the fetched user data
    const [user, setUser] = useState(null);
    // State to manage the loading spinner visibility
    const [loading, setLoading] = useState(true);
    // Context value to check if advanced features are enabled
    const [enableAdvancedFeatures] = useContext(AdvancedContext);

    // Effect to fetch user data when the component mounts or the userId changes
    useEffect(() => {
        if (userId) {
            setLoading(true);
            (async () => {
                await axios.get(`/user/${userId}`)
                    .then((result) => {
                        setUser(result.data);
                    })
                    .catch((error) => {
                        console.error("Failed to fetch user:", error);
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            })();
        }
    }, [userId]);

    // Display a loading spinner while data is being fetched
    if (loading) {
        return <CircularProgress className="loading-spinner"/>;
    }

    // Display a message if no user data is found
    if (!user) {
        return <Typography variant="h6" className="not-found-message">User not found.</Typography>;
    }

    // Destructure user details from the fetched data
    const {first_name, last_name, description, location, occupation} = user;

    return (
        <div className="user-detail-container">
            {/* Display the user's full name */}
            <Typography variant="h4" className="user-name">{`${first_name} ${last_name}`}</Typography>

            {/* Display the user's description */}
            <Typography variant="body1" className="user-description">{description}</Typography>

            {/* Display the user's location with a label */}
            <Typography variant="body1" className="user-location">
                <strong>Location:</strong> {location}
            </Typography>

            {/* Display the user's occupation with a label */}
            <Typography variant="body1" className="user-occupation" marginBottom="10px">
                <strong>Occupation:</strong> {occupation}
            </Typography>

            {/* Button to view user's photos */}
            {/*Set the link path based on whether advanced features are enabled*/}
            <Button
                component={Link}
                to={enableAdvancedFeatures ? `/photos/${userId}/0` : `/photos/${userId}`}
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