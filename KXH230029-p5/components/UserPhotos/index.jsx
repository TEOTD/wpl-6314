import React, {useMemo} from "react";
import "./styles.css";
import {Link} from "react-router-dom";

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

function Photo({photo}) {
    return (
        <div key={photo._id}>
            <img src={`/images/${photo.file_name}`} alt={`Photo of ${photo.file_name}`}/>
            <p>{new Date(photo.date_time).toLocaleString()}</p>
            {photo.comments && photo.comments.length > 0 && (
                <div>
                    {photo.comments.map(comment => (
                        <Comment key={comment._id} comment={comment}/>
                    ))}
                </div>
            )}
        </div>
    );
}

function UserPhotos({userId}) {
    const photos = useMemo(() => window.models.photoOfUserModel(userId), [userId]);

    return (
        <div>
            {photos.map(photo => (
                <Photo key={photo._id} photo={photo}/>
            ))}
        </div>
    );
}

export default UserPhotos;
