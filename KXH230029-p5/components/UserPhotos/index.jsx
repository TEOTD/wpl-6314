import React, {useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
import {Button} from "@mui/material";
import fetchModel from "../../lib/fetchModelData";

function Comment({comment}) {
    const {
        user,
        date_time
    } = comment;
    return (
        <div key={comment._id}>
            <p>{comment.comment}</p>
            <p>
                <Link to={`/users/${user._id}`}>
                    {user.first_name} {user.last_name}
                </Link>
                {' - '}
                {new Date(date_time).toLocaleString()}
            </p>
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
        <div key={photo._id}>
            <img src={`/images/${photo.file_name}`} alt={`${photo.file_name}`}/>
            <p>{new Date(photo.date_time).toLocaleString()}</p>
            {photo.comments && photo.comments.length > 0 && (
                <div>
                    {photo.comments.map(comment => (
                        <Comment key={comment._id} comment={comment}/>
                    ))}
                </div>
            )}
            {enableAdvancedFeatures && (
                <div>
                    <Button
                        onClick={() => onStep(-1)}
                        disabled={index === 0}
                        variant="contained"
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => onStep(1)}
                        disabled={index === totalPhotos - 1}
                        variant="contained"
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

    if (loading) return <p>Loading...</p>;
    if (!photos.length) return <p>Photos not found.</p>;
    if (enableAdvancedFeatures && photoIndex >= 0 && photos[photoIndex] == null) return <p>Photo not found.</p>;

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
