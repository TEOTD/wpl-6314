import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {Button, CircularProgress, Typography} from "@mui/material";
import "./styles.css"; // Ensure this is the correct path
import fetchModel from "../../lib/fetchModelData";

function UserDetail({
                        userId,
                        enableAdvancedFeatures
                    }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [path, setPath] = useState(`/photos/${userId}`);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            fetchModel(`/user/${userId}`)
                .then((result) => {
                    setUser(result.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);
                    setLoading(false);
                });
        }
    }, [userId]);

    useEffect(() => {
        setPath(enableAdvancedFeatures.enableAdvancedFeatures ? `/photos/${userId}/0` : `/photos/${userId}`);
    }, [enableAdvancedFeatures]);

    if (loading) return <CircularProgress className="loadingSpinner"/>;
    if (!user) return <Typography variant="h6" className="notFoundMessage">User not found.</Typography>;

    const {
        first_name,
        last_name,
        description,
        location,
        occupation
    } = user;

    return (
        <div className="userDetailContainer">
            <Typography variant="h4" className="userName">{`${first_name} ${last_name}`}</Typography>
            <Typography variant="body1" className="userDescription">{description}</Typography>
            <Typography variant="body1" className="userLocation"><strong>Location:</strong> {location}
            </Typography>
            <Typography variant="body1" className="userOccupation"
                        marginBottom="10px"><strong>Occupation:</strong> {occupation}
            </Typography>
            <Button
                component={Link}
                to={path}
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
