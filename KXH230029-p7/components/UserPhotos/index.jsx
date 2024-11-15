import React, {useCallback, useEffect, useState, useContext} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Button, Box, CircularProgress, Paper, Typography} from "@mui/material";
import TextField from '@mui/material/TextField';
import axios from "axios";
import {AdvancedContext } from "../context/appContext";

// Utility function to format date and time for display
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

// Component to render individual comments for a photo
function Comment({comment}) {
    return (
        <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}} className="comment-container">
            {/* Display the comment text */}
            <Typography variant="body1" className="comment">{comment.comment}</Typography>
            <Typography variant="caption">
                {/* Link to the user who posted the comment */}
                <Link to={`/users/${comment.user._id}`}
                      className="comment-link">{comment.user.first_name} {comment.user.last_name}
                </Link>
                {/* Display the formatted comment date */}
                <span className="photo-date">{' - '}{formatDateTime(comment.date_time)}</span>
            </Typography>
        </Paper>
    );
}

async function addCommentRequest(imageId, commentText){
    const response = await axios.post(`/commentsOfPhoto/${imageId}`, {
        comment: commentText // key-value pair in JSON
    });
    return response;
}

function CommentInput({imageId, setReload, reload}){

    const [comment, setComment] = useState("");

    return(
    <Paper elevation={1} className="comment-input-container" >
        <Box className="flex-display">
          <Box className="comment-input-box">
            
            <TextField id="standard-multiline-flexible" multiline label="Add your Comment" variant="filled" 
                    onChange={(e) => setComment(e.target.value)} maxRows={10}
                    className="comment-input-input-box"
                    fullWidth 
            />
            
            <Button variant="contained" size="medium" onClick={() => {
                addCommentRequest(imageId, comment);
                setReload(!reload);
                }}
             id="comment-submit-button">
             Comment
            </Button>
          </Box>
        </Box>  
    </Paper>
    );
}

// Component to display a single photo along with navigation buttons and comments
function Photo({
                   photo,
                   index,
                   totalPhotos,
                   onStep,
                   setReload,
                   reload
               }) {
    // State to manage the enabled/disabled state of navigation buttons
    const [buttonState, setButtonState] = useState({
        left: false,
        right: false
    });
    const [enableAdvancedFeatures,] = useContext(AdvancedContext);

    // Styles for navigation buttons
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

    // Update button states when the photo index or total photo count changes
    useEffect(() => {
        setButtonState({
            left: index <= 0,
            right: index >= totalPhotos - 1
        });
    }, [index, totalPhotos]);

    return (
        <div key={photo._id} className="photo-container">
            {/* Display photo */}
            <img src={`/images/${photo.file_name}`} alt={photo.file_name} className="photo-image"/>
            {/* Display formatted date */}
            <Typography variant="body2" sx={{margin: "10px 0"}}
                        className="photo-date">{formatDateTime(photo.date_time)}
            </Typography>
            {/* Comments section heading */}
            <Typography variant="h7" className="comments-heading">COMMENTS</Typography>
            <CommentInput imageId={photo._id} setReload={setReload} reload={reload}/>
            {/* Render comments or display a message if there are none */}
            {photo.comments && photo.comments.length > 0 ? (
                <div className="comments-section">
                    {photo.comments.map((comment) => (
                        <Comment key={comment._id} comment={comment} />
                    ))}
                </div>
            ) : (
                <Typography variant="h6" sx={{margin: "10px 0"}} className="no-comments">No Comments Yet</Typography>
            )}
            {/* Navigation buttons for advanced features */}
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

// Component to display all photos of a user, with advanced step-through functionality if enabled
function UserPhotos({
                        userId,
                        photoIndex,
                        setPhotoIndex
                    }) {
    // State to hold the user's photos and loading state
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enableAdvancedFeatures,] = useContext(AdvancedContext);
    const [reload, setReload] = useState(false);

    // Fetch photos when userId changes
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

    // Handle navigation in advanced mode by updating photoIndex
    const handleStep = useCallback((direction) => {
        setPhotoIndex((prevIndex) => Math.min(Math.max(prevIndex + direction, 0), photos.length - 1));
    }, [photos.length, setPhotoIndex]);

    // Show loading spinner while data is loading
    if (loading) return <CircularProgress className="loading-spinner"/>;
    // Display message if no photos are found
    if (!photos.length) return <Typography variant="h6" className="not-found-message">Photos not found.</Typography>;
    // Display message if the selected photo in advanced mode is invalid
    if (enableAdvancedFeatures && photoIndex >= 0 && !photos[photoIndex]) {
        return <Typography variant="h6" className="not-found-message">Photo not found.</Typography>;
    }

    // Render a single photo in advanced mode or a list of photos otherwise
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
        <div>{photos.map((photo, idx) => <Photo key={photo._id} photo={photo} index={idx} setReload={setReload} reload={reload}/>)}</div>
    );
}

export default UserPhotos;
