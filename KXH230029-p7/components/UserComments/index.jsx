import React, {useContext, useEffect, useMemo, useState} from "react";
import {CircularProgress, Paper, Typography} from "@mui/material";
import axios from "axios";
import {Link} from "react-router-dom";
import {AdvancedContext} from "../context/appContext";
import "./styles.css";
import formatDateTime from "../../lib/utils";

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

function UserComments({userId}) {
    const [photos, setPhotos] = useState({});
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enableAdvancedFeatures] = useContext(AdvancedContext);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        (async () => {
            await Promise.all([
                axios.get(`/commentsOfUser/${userId}`),
                axios.get(`/photos/list`)
            ])
                .then(([commentsResponse, photosResponse]) => {
                    setComments(commentsResponse.data);
                    const photosByUser = photosResponse.data.reduce((acc, photo) => {
                        (acc[photo.user_id] = acc[photo.user_id] || []).push(photo);
                        return acc;
                    }, {});
                    Object.values(photosByUser).forEach(arr => arr.sort((a, b) => a.id - b.id));
                    setPhotos(photosByUser);
                })
                .catch(error => {
                    console.error("Failed to fetch data:", error);
                })
                .finally(() => {
                    setLoading(false);
                });
        })();
    }, [userId]);

    const renderedComments = useMemo(() => (
        comments.map(comment => {
            const userPhotos = photos[comment.photo_user_id] || [];
            const photoIndex = userPhotos.findIndex(photo => photo._id === comment.photo_id);
            return (
                <Comment
                    key={`${comment._id}-${comment.photo_id}`}
                    comment={comment}
                    photoIndex={photoIndex}
                />
            );
        })
    ), [comments, photos]);

    if (loading) return <CircularProgress className="loading-spinner"/>;
    if (!comments.length) return <Typography variant="h6" className="no-comments">No Comments Yet</Typography>;
    return enableAdvancedFeatures ? <div>{renderedComments}</div> : null;
}

export default UserComments;