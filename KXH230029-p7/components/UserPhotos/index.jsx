import React, {useCallback, useContext, useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Box, Button, CircularProgress, Paper, Typography} from "@mui/material";
import TextField from '@mui/material/TextField';
import axios from "axios";
import {AdvancedContext} from "../context/appContext";
import formatDateTime from "../../lib/utils";

// Component to render individual comments for a photo
function Comment({comment}) {
    return (
        <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}} className="comment-container">
            <Typography variant="body1" className="comment">{comment.comment}</Typography>
            <Typography variant="caption">
                <Link to={`/users/${comment.user._id}`} className="comment-link">
                    {comment.user.first_name} {comment.user.last_name}
                </Link>
                <span className="photo-date">{' - '}{formatDateTime(comment.date_time)}</span>
            </Typography>
        </Paper>
    );
}

async function addCommentRequest(imageId, commentText) {
    await axios.post(`/commentsOfPhoto/${imageId}`, {
        comment: commentText
    });
}

function CommentInput({imageId, setReload, reload}) {

    const [comment, setComment] = useState("");

    return (
        <Paper elevation={1} className="comment-input-container">
            <Box className="flex-display">
                <Box className="comment-input-box">
                    <TextField
                        id="standard-multiline-flexible"
                        multiline
                        label="Add your Comment"
                        variant="filled"
                        onChange={(e) => setComment(e.target.value)}
                        maxRows={10}
                        className="comment-input-input-box"
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        size="medium"
                        onClick={() => {
                            addCommentRequest(imageId, comment).then(() => setReload(!reload));
                        }}
                        id="comment-submit-button"
                    >
                        Comment
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}

// Component to display a single photo
function Photo({photo, index, totalPhotos, onStep, setReload, reload}) {
    const [buttonState, setButtonState] = useState({left: false, right: false});
    const [enableAdvancedFeatures,] = useContext(AdvancedContext);

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
        setButtonState({left: index <= 0, right: index >= totalPhotos - 1});
    }, [index, totalPhotos]);

    return (
        <div key={photo._id} className="photo-container">
            <img src={`/images/${photo.file_name}`} alt={photo.file_name} className="photo-image"/>
            <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                {formatDateTime(photo.date_time)}
            </Typography>
            <Typography variant="h7" className="comments-heading">COMMENTS</Typography>
            <CommentInput imageId={photo._id} setReload={setReload} reload={reload}/>
            {photo.comments && photo.comments.length > 0 ? (
                <div className="comments-section">
                    {photo.comments.map((comment) => (
                        <Comment key={comment._id} comment={comment}/>
                    ))}
                </div>
            ) : (
                <Typography variant="h6" sx={{margin: "10px 0"}} className="no-comments">
                    No Comments Yet
                </Typography>
            )}
            {enableAdvancedFeatures && (
                <div className="button-container">
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

function UserPhotos({userId, photoIndex, setPhotoIndex}) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enableAdvancedFeatures,] = useContext(AdvancedContext);
    const [reload, setReload] = useState(false);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        (async () => {
            await axios.get(`/photosOfUser/${userId}`)
                .then((result) => setPhotos(result.data))
                .catch((error) => console.error("Failed to fetch user photos:", error))
                .finally(() => setLoading(false));
        })();
    }, [userId, reload]);

    const handleStep = useCallback((direction) => {
        setPhotoIndex((prevIndex) => Math.min(Math.max(prevIndex + direction, 0), photos.length - 1));
    }, [photos.length, setPhotoIndex]);

    if (loading) return <CircularProgress className="loading-spinner"/>;
    if (!photos.length) return <Typography variant="h6" className="no-photos">No Photos Yet.</Typography>;
    if (enableAdvancedFeatures && photoIndex >= 0 && !photos[photoIndex]) {
        return <Typography variant="h6" className="no-photos">No Photos Yet.</Typography>;
    }

    return enableAdvancedFeatures && photoIndex >= 0 ? (
        <Photo
            photo={photos[photoIndex]}
            index={photoIndex}
            totalPhotos={photos.length}
            onStep={handleStep}
            enableAdvancedFeatures={enableAdvancedFeatures}
            setReload={setReload}
            reload={reload}
        />
    ) : (
        <div>{photos.map((photo, idx) => (
            <Photo key={photo._id} photo={photo} index={idx} setReload={setReload} reload={reload}/>
        ))}
        </div>
    );
}

export default UserPhotos;
