import React, {useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Button, CircularProgress, Paper, Typography} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

const formatDateTime = (date) => {
    const options = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    };
    return new Date(date).toLocaleString('en-US', options);
};

function Comment({comment}) {
    const {
        user,
        date_time
    } = comment;
    return (
        <div key={comment._id} className="commentContainer">
            <Paper sx={{
                backgroundColor: "var(--secondary-hover-color)",
                padding: "10px"
            }}>
                <Typography variant="body1" className="comment">{comment.comment}
                </Typography>
                <Typography variant="caption">
                    <Link to={`/users/${user._id}`} className="commentLink">
                        {user.first_name} {user.last_name}
                    </Link> {' - '}
                    <Typography variant="caption"
                                className="photoDate" sx={{
                        color: "var(--text-color-hover)"
                    }}>{formatDateTime(new Date(date_time))}
                    </Typography>
                </Typography>
            </Paper>
        </div>
    );
}

function Photo({
                   photo,
                   index,
                   totalPhotos,
                   onStep,
                   enableAdvancedFeatures
               }) {
    const [buttonLeftDisabled, setButtonLeftDisabled] = useState(false);
    const [buttonRightDisabled, setButtonRightDisabled] = useState(false);

    useEffect(() => {
        if (index <= 0 && index >= totalPhotos - 1) {
            setButtonLeftDisabled(true);
            setButtonRightDisabled(true);
        } else if (index <= 0) {
            setButtonLeftDisabled(true);
            setButtonRightDisabled(false);
        } else if (index >= totalPhotos - 1) {
            setButtonLeftDisabled(false);
            setButtonRightDisabled(true);
        } else {
            setButtonLeftDisabled(false);
            setButtonRightDisabled(false);
        }
    }, [index]);

    return (
        <div key={photo._id} className="photoContainer">
            <img src={`/images/${photo.file_name}`} alt={`${photo.file_name}`} className="photoImage"/>
            <Typography variant="body2" className="photoDate" sx={{
                margin: "10px 0 10px 0"
            }}>{formatDateTime(new Date(photo.date_time))}
            </Typography>
            <Typography variant="h7" className="comment-heading"
                        sx={{
                            color: "var(--text-color)",
                            backgroundColor: "var(--secondary-color)",
                            padding: "5px",
                            borderTopRightRadius: 5,
                            borderTopLeftRadius: 5,
                            fontWeight: "bold"
                        }}>COMMENTS
            </Typography>
            {photo.comments && photo.comments.length > 0 ? (
                <div className="commentsSection">
                    {photo.comments.map(comment => (
                        <Comment key={comment._id} comment={comment}/>
                    ))}
                </div>
            ) : (
                <Typography variant="h6" className="notFoundMessage"
                            sx={{
                                color: "var(--text-color-hover)",
                                backgroundColor: "var(--secondary-hover-color)",
                                padding: "10px",
                                margin: "10px 0 10px 0"
                            }}
                >No Comments Yet
                </Typography>
            )}
            {enableAdvancedFeatures && (
                <div className="buttonContainer">
                    <Button
                        onClick={() => onStep(-1)}
                        disabled={buttonLeftDisabled}
                        variant="contained"
                        className="navButton"
                        sx={{
                            flex: 1,
                            backgroundColor: "var(--accent-color)",
                            color: "var(--text-color)",
                            marginRight: "2px",
                            '&:hover': {
                                backgroundColor: "var(--accent-hover-color)",
                                color: "var(--hover-text-color)",
                            },
                            '&:disabled': {
                                backgroundColor: "var(--accent-color)",
                                color: "var(--text-color-hover)",
                                opacity: 0.5,
                            }
                        }}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => onStep(1)}
                        disabled={buttonRightDisabled}
                        variant="contained"
                        className="navButton"
                        sx={{
                            flex: 1,
                            backgroundColor: "var(--accent-color)",
                            color: "var(--text-color)",
                            marginLeft: "2px",
                            '&:hover': {
                                backgroundColor: "var(--accent-hover-color)",
                                color: "var(--hover-text-color)"
                            },
                            '&:disabled': {
                                backgroundColor: "var(--accent-color)",
                                color: "var(--text-color-hover)",
                                opacity: 0.5,
                            },
                        }}
                    >
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
        if (userId) {
            setLoading(true);
            fetchModel(`/photosOfUser/${userId}`)
                .then((result) => {
                    setPhotos(result.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Failed to fetch user photos:", error);
                    setLoading(false);
                });
        }
    }, [userId]);

    const handleStep = (direction) => {
        const newIndex = Math.min(Math.max(parseInt(photoIndex, 10) + direction, 0), photos.length - 1);
        setPhotoIndex(newIndex);
    };

    if (loading) return <CircularProgress className="loadingSpinner"/>;
    if (!photos.length) return <Typography variant="h6" className="notFoundMessage">Photos not found.</Typography>;
    if (enableAdvancedFeatures && photoIndex >= 0 && photos[photoIndex] == null) {
        return (
            <Typography variant="h6" className="notFoundMessage">Photo
                not found.
            </Typography>
        );
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
        <div>
            {photos.map((photo, idx) => (
                <Photo key={photo._id} photo={photo} index={idx}/>
            ))}
        </div>
    );
}

export default UserPhotos;
