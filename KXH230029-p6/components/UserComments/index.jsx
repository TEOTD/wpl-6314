import React, {useEffect, useMemo, useState} from "react";
import {CircularProgress, Paper, Typography} from "@mui/material";
import axios from "axios";
import {Link} from "react-router-dom";

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

function Comment({comment, photoIndex}) {
    return (
        <Link to={`/photos/${comment.photo_user_id}/${photoIndex}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}} className="comment-container">
                <img src={`/images/${comment.file_name}`} alt={comment.file_name} className="comment-photo-image"/>
                <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                    {formatDateTime(comment.date_time)}
                </Typography>
                <Typography variant="body1" className="comment">{comment.comment}</Typography>
            </Paper>
        </Link>
    );
}

function UserComments({userId}) {
    const [photos, setPhotos] = useState({});
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [loadingPhotos, setLoadingPhotos] = useState(true);

    useEffect(() => {
        if (!userId) return;

        setLoadingComments(true);
        axios.get(`/commentsOfUser/${userId}`)
            .then((result) => setComments(result.data))
            .catch((error) => console.error("Failed to fetch user comments:", error))
            .finally(() => setLoadingComments(false));
    }, [userId]);

    useEffect(() => {
        setLoadingPhotos(true);
        axios.get(`/photos/list`)
            .then((result) => {
                const photosByUser = result.data.reduce((acc, photo) => {
                    if (!acc[photo.user_id]) {
                        acc[photo.user_id] = [];
                    }
                    acc[photo.user_id].push(photo);
                    return acc;
                }, {});

                Object.keys(photosByUser).forEach(id => {
                    photosByUser[id].sort((a, b) => a.id - b.id);
                });

                setPhotos(photosByUser);
            })
            .catch((error) => console.error("Failed to fetch photos:", error))
            .finally(() => setLoadingPhotos(false));
    }, []);

    const renderedComments = useMemo(() => comments.map((comment) => {
        const userPhotos = photos[comment.photo_user_id] || [];
        const photoIndex = userPhotos.findIndex(photo => photo._id === comment.photo_id);
        return (
            <Comment
                key={`${comment._id}-${comment.photo_id}`}
                comment={comment}
                photoIndex={photoIndex}
                userPhoto={userPhotos[photoIndex]}
            />
        );
    }), [comments, photos]);

    if (loadingComments || loadingPhotos) return <CircularProgress className="loading-spinner"/>;
    if (!comments.length) {
        return <Typography variant="h6" className="no-comments">No Comments Yet</Typography>;
    }

    return (
        <div>{renderedComments}</div>
    );
}

export default UserComments;
