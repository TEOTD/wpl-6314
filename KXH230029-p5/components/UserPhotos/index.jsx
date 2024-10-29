import React, {useCallback, useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Button, CircularProgress, Paper, Typography} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
};

function Comment({comment}) {
    return (
        <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}} className="commentContainer">
            <Typography variant="body1" className="comment">{comment.comment}</Typography>
            <Typography variant="caption">
                <Link to={`/users/${comment.user._id}`}
                      className="commentLink">{comment.user.first_name} {comment.user.last_name}
                </Link>
                <span className="photoDate">{' - '}{formatDateTime(comment.date_time)}</span>
            </Typography>
        </Paper>
    );
}

function Photo({
                   photo,
                   index,
                   totalPhotos,
                   onStep,
                   enableAdvancedFeatures
               }) {
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false
    });

    const navButtonStyles = (side) => ({
        flex: 1,
        backgroundColor: "var(--accent-color)",
        color: "var(--text-color)",
        marginLeft: side === "right" ? "2px" : "0",
        marginRight: side === "left" ? "2px" : "0",
        "&:hover": {
            backgroundColor: "var(--accent-hover-color)",
            color: "var(--hover-text-color)"
        },
        "&:disabled": {
            backgroundColor: "var(--accent-color)",
            color: "var(--text-color-hover)",
            opacity: 0.5
        }
    });

    useEffect(() => {
        setButtonState({
            left: index <= 0,
            right: index >= totalPhotos - 1
        });
    }, [index, totalPhotos]);

    return (
        <div key={photo._id} className="photoContainer">
            <img src={`/images/${photo.file_name}`} alt={photo.file_name} className="photoImage"/>
            <Typography variant="body2" sx={{margin: "10px 0"}}
                        className="photoDate">{formatDateTime(photo.date_time)}
            </Typography>
            <Typography variant="h7" className="comments-heading">COMMENTS</Typography>
            {photo.comments && photo.comments.length > 0 ? (
                <div className="commentsSection">
                    {photo.comments.map((comment) => (
                        <Comment key={comment._id} comment={comment}/>
                    ))}
                </div>
            ) : (
                <Typography variant="h6" sx={{margin: "10px 0"}} className="no-comments">No Comments Yet</Typography>
            )}
            {enableAdvancedFeatures && (
                <div className="buttonContainer">
                    <Button onClick={() => onStep(-1)} disabled={buttonState.left} variant="contained"
                            sx={navButtonStyles("left")}>
                        Previous
                    </Button>
                    <Button onClick={() => onStep(1)} disabled={buttonState.right} variant="contained"
                            sx={navButtonStyles("right")}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
}

function UserPhotos({
                        userId,
                        enableAdvancedFeatures,
                        photoIndex,
                        setPhotoIndex
                    }) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        fetchModel(`/photosOfUser/${userId}`)
            .then((result) => setPhotos(result.data))
            .catch((error) => console.error("Failed to fetch user photos:", error))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleStep = useCallback((direction) => {
        setPhotoIndex((prevIndex) => Math.min(Math.max(prevIndex + direction, 0), photos.length - 1));
    }, [photos.length, setPhotoIndex]);

    if (loading) return <CircularProgress className="loadingSpinner"/>;
    if (!photos.length) return <Typography variant="h6" className="notFoundMessage">Photos not found.</Typography>;
    if (enableAdvancedFeatures && photoIndex >= 0 && !photos[photoIndex]) {
        return <Typography variant="h6" className="notFoundMessage">Photo not found.</Typography>;
    }

    return enableAdvancedFeatures && photoIndex >= 0 ? (
        <Photo
            photo={photos[photoIndex]}
            index={photoIndex}
            totalPhotos={photos.length}
            onStep={handleStep}
            enableAdvancedFeatures={enableAdvancedFeatures}
        />
    ) : (
        <div>{photos.map((photo, idx) => <Photo key={photo._id} photo={photo} index={idx}/>)}</div>
    );
}

export default UserPhotos;
