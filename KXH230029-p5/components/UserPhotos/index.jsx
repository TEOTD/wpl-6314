import React, {useEffect, useState} from "react";
import "./styles.css";
import {Link} from "react-router-dom";
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
                    <button onClick={() => onStep(-1)} disabled={index === 0}>Previous</button>
                    <button onClick={() => onStep(1)} disabled={index === totalPhotos - 1}>Next</button>
                </div>
            )}
        </div>
    );
}

function UserPhotos({
                        userId,
                        enableAdvancedFeatures
                    }) {
    const [photos, setPhotos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
        setCurrentPhotoIndex(prevIndex => Math.min(Math.max(prevIndex + direction, 0), photos.length - 1));
    };

    if (loading) return <p>Loading...</p>;
    if (!photos) return <p>Photos not found.</p>;

    if (enableAdvancedFeatures) {
        return (
            <Photo
                photo={photos[currentPhotoIndex]}
                index={currentPhotoIndex}
                totalPhotos={photos.length}
                onStep={handleStep}
                enableAdvancedFeatures={enableAdvancedFeatures}
            />
        );
    }

    return (
        <div>
            {photos.map(photo => (
                <Photo key={photo._id} photo={photo}/>
            ))}
        </div>
    );
}

export default UserPhotos;
