import React, {useEffect, useMemo, useState} from "react";
import {CircularProgress, Paper, Typography} from "@mui/material";
import axios from "axios";
import {Link} from "react-router-dom";
import "./styles.css";

// Helper function to format the date and time for display
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

// Component to render each individual comment
function Comment({comment, photoIndex}) {
    return (
        <Link to={`/photos/${comment.photo_user_id}/${photoIndex}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}}
                   className="comment-container flex-comment-container">
                <img src={`/images/${comment.file_name}`} alt={comment.file_name} className="comment-photo-image"/>
                <div>
                    <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                        {formatDateTime(comment.date_time)}
                    </Typography>
                    <Typography variant="body1" className="comment">{comment.comment}</Typography>
                </div>
            </Paper>
        </Link>
    );
}

// Main component to fetch and display comments for a specific user
function UserComments({userId, enableAdvancedFeatures}) {
    const [photos, setPhotos] = useState({});
    const [comments, setComments] = useState([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [loadingPhotos, setLoadingPhotos] = useState(true);

    // Fetch comments for the specified user
    useEffect(() => {
        if (!userId) return;
        setLoadingComments(true);
        (async () => {
            await axios.get(`/commentsOfUser/${userId}`)
                .then((result) => setComments(result.data))
                .catch((error) => console.error("Failed to fetch user comments:", error))
                .finally(() => setLoadingComments(false));
        })();
    }, [userId]);

    // Fetch all photos and organize them by user
    useEffect(() => {
        setLoadingPhotos(true);
        (async () => {
            await axios.get(`/photos/list`)
                .then((result) => {
                    // Group photos by user_id for quick lookup later
                    const photosByUser = result.data.reduce((acc, photo) => {
                        if (!acc[photo.user_id]) {
                            acc[photo.user_id] = [];
                        }
                        acc[photo.user_id].push(photo);
                        return acc;
                    }, {});

                    // Sort photos for each user by ID to maintain order
                    Object.keys(photosByUser).forEach(id => {
                        photosByUser[id].sort((a, b) => a.id - b.id);
                    });

                    setPhotos(photosByUser);
                })
                .catch((error) => console.error("Failed to fetch photos:", error))
                .finally(() => setLoadingPhotos(false));
        })();
    }, []);

    // Generate the rendered comments using useMemo for performance optimization
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

    // Render comments only if advanced features are enabled
    return (
        enableAdvancedFeatures &&
        <div>{renderedComments}</div>
    );
}

export default UserComments;
