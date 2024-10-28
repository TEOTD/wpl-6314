import React, {useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Button, CircularProgress, Typography} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

function Comment({comment}) {
    const {
        user,
        date_time
    } = comment;
    return (
        <div key={comment._id} className="commentContainer">
            <Typography variant="body1" className="comment">{comment.comment}
            </Typography>
            <Typography variant="caption">
                <Link to={`/users/${user._id}`} className="commentLink">
                    {user.first_name} {user.last_name}
                </Link>
                {' - '}
                <Typography variant="caption" className="photoDate">{new Date(date_time).toLocaleString()}</Typography>
            </Typography>
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
    return (
        <div key={photo._id} className="photoContainer">
            <img src={`/images/${photo.file_name}`} alt={`${photo.file_name}`} className="photoImage"/>
            <Typography variant="body2" className="photoDate">{new Date(photo.date_time).toLocaleString()}</Typography>
            {photo.comments && photo.comments.length > 0 && (
                <div className="commentsSection">
                    {photo.comments.map(comment => (
                        <Comment key={comment._id} comment={comment}/>
                    ))}
                </div>
            )}
            {enableAdvancedFeatures && (
                <div className="buttonContainer">
                    <Button
                        onClick={() => onStep(-1)}
                        disabled={index === 0}
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
                            }
                        }}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => onStep(1)}
                        disabled={index === totalPhotos - 1}
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
                            }
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
        const newIndex = Math.min(Math.max(photoIndex + direction, 0), photos.length - 1);
        setPhotoIndex(newIndex);
    };

    if (loading) return <CircularProgress className="loadingSpinner"/>;
    if (!photos.length) return <Typography variant="body1">Photos not found.</Typography>;
    if (enableAdvancedFeatures && photoIndex >= 0 && photos[photoIndex] == null) {
        return (
            <Typography variant="body1">Photo
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
