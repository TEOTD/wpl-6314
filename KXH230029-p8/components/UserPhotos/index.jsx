import React, {useCallback, useContext, useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Box, Button, CircularProgress, Menu, MenuItem, Paper, TextField, Typography,} from "@mui/material";
import {Delete, Edit} from "@mui/icons-material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import axios from "axios";
import {AdvancedContext, LoggedInUserContext, PhotoIndexContext, ReloadContext} from "../context/appContext";
import formatDateTime from "../../lib/utils";

function OptionsMenu({onEdit, onDelete, open, anchorEl, handleClose}) {
    return (
        <Menu
            id="options-menu"
            MenuListProps={{"aria-labelledby": "options-button"}}
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
        >
            {/*todo: add comment edit functionality*/}
            {onEdit && (
                <MenuItem onClick={onEdit} disableRipple>
                    <Edit/> Edit
                </MenuItem>
            )}
            <MenuItem onClick={onDelete} disableRipple>
                <Delete/> Delete
            </MenuItem>
        </Menu>
    );
}

function Comment({comment, loggedInUser, onReload}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const deleteComment = async () => {
        try {
            await axios.delete(`/commentOfUser/${comment._id}`);
            onReload();
        } catch (error) {
            console.error("Failed to delete comment:", error);
        }
    };

    return (
        <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}} className="comment-container">
            <Box sx={{display: 'flex', flexDirection: 'column'}}>
                <Typography variant="body1" className="comment">{comment.comment}</Typography>
                {/* Displays the user's name and the date of the comment */}
                <Typography variant="caption">
                    <Link to={`/users/${comment.user._id}`} className="comment-link">
                        {comment.user.first_name} {comment.user.last_name}
                    </Link>
                    <span className="photo-date">{' - '}{formatDateTime(comment.date_time)}</span>
                </Typography>
            </Box>
            {loggedInUser._id === comment.user._id && (
                <Box>
                    <Button onClick={handleMenuClick} className="more-button-comment">
                        <MoreHorizIcon/>
                    </Button>
                    <OptionsMenu
                        open={open}
                        anchorEl={anchorEl}
                        handleClose={handleMenuClose}
                        onDelete={deleteComment}
                    />
                </Box>
            )}
        </Paper>
    );
}

function CommentInput({imageId, onReload}) {
    const [comment, setComment] = useState("");

    const addComment = async () => {
        if (!comment.trim()) return;
        try {
            await axios.post(`/commentsOfPhoto/${imageId}`, {comment: comment});
            setComment("");
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    return (
        <Paper elevation={1} className="comment-input-container">
            {/* Input field for writing a new comment */}
            <TextField
                id="standard-multiline-flexible"
                multiline
                label="Add your Comment"
                variant="filled"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxRows={10}
                className="comment-input-input-box"
                color="secondary"
                fullWidth
            />
            {/* Button to submit the comment */}
            <Button
                variant="contained"
                size="medium"
                onClick={() => {
                    addComment().then(() => onReload());
                }}
                id="comment-submit-button"
            >
                Comment
            </Button>
        </Paper>
    );
}

function Photo({photo, index, totalPhotos, onStep, enableAdvancedFeatures, onReload}) {
    const [loggedInUser] = useContext(LoggedInUserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [buttonState, setButtonState] = useState({left: false, right: false});

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const deletePhoto = async () => {
        try {
            await axios.delete(`/photosOfUser/${photo._id}`);
        } catch (error) {
            console.error("Failed to delete photo:", error);
        }
    };

    // Styles for the navigation buttons
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

    // Effect to update the button state based on the current index
    useEffect(() => {
        setButtonState({left: index <= 0, right: index >= totalPhotos - 1});
    }, [index, totalPhotos]);

    return (
        <div key={photo._id} className="photo-container">
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
            {/* Photo display */}
            <img src={`/images/${photo.file_name}`} alt={photo.file_name} className="photo-image"/>
            <Box sx={{display: "flex", justifyContent: "space-between"}}>
                <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                    {formatDateTime(photo.date_time)}
                </Typography>
                {loggedInUser._id === photo.user_id && (
                    <Box>
                        <Button onClick={handleMenuClick} className="more-button">
                            <MoreHorizIcon/>
                        </Button>
                        <OptionsMenu
                            open={open}
                            anchorEl={anchorEl}
                            handleClose={handleMenuClose}
                            onDelete={() => deletePhoto().then(() => onReload())}
                        />
                    </Box>
                )}
            </Box>
            {/* Comments section */}
            <Typography variant="h7" className="comments-heading">COMMENTS</Typography>
            <CommentInput imageId={photo._id} onReload={onReload}/>
            {/* List of comments or a message if there are no comments */}
            {photo.comments?.length > 0 ? (
                <div className="comments-section">
                    {photo.comments.map((comment) => (
                        <Comment
                            key={comment._id}
                            comment={comment}
                            loggedInUser={loggedInUser}
                            onReload={onReload}
                        />
                    ))}
                </div>
            ) : (
                <Typography variant="h6" sx={{margin: "10px 0"}} className="no-comments">
                    No Comments Yet
                </Typography>
            )}
        </div>
    );
}

// Component to display all photos of a user and handle navigation
function UserPhotos({userId}) {
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enableAdvancedFeatures] = useContext(AdvancedContext);
    const [reload, setReload] = useContext(ReloadContext);
    const [photoIndex, setPhotoIndex] = useContext(PhotoIndexContext);

    // Fetch photos of the user when the userId or reload state changes
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

    // Function to handle photo navigation
    const handleStep = useCallback((direction) => {
        setPhotoIndex((prevIndex) => Math.min(Math.max(prevIndex + direction, 0), photos.length - 1));
    }, [photos.length, setPhotoIndex]);

    // Display loading spinner, a message if there are no photos, or the photos
    if (loading) return <CircularProgress className="loading-spinner"/>;
    if (!photos.length) return <Typography variant="h6" className="no-photos">No Photos Yet.</Typography>;
    if (enableAdvancedFeatures && photoIndex >= 0 && !photos[photoIndex]) {
        return <Typography variant="h6" className="no-photos">No Photos Yet.</Typography>;
    }

    // Toggle Screens based on advanced features
    return enableAdvancedFeatures && photoIndex >= 0 ? (
        <Photo
            photo={photos[photoIndex]}
            index={photoIndex}
            totalPhotos={photos.length}
            onStep={handleStep}
            enableAdvancedFeatures={enableAdvancedFeatures}
            onReload={() => setReload(!reload)}
        />
    ) : (
        photos.map((photo, idx) => (
            <Photo
                key={photo._id}
                photo={photo}
                index={idx}
                onReload={() => setReload(!reload)}
            />
        ))
    );
}

export default UserPhotos;