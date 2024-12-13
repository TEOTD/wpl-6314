import React, {useContext, useEffect, useMemo, useState} from "react";
import {CircularProgress, Paper, Typography} from "@mui/material";
import axios from "axios";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {AdvancedContext, FirstLoadContext} from "../context/appContext";
import "./styles.css";
import formatDateTime from "../../lib/utils";

// Component to render each individual comment with associated photo and text
function Comment({comment, photoIndex}) {
    const mentionRegex = /@\[(.+?)]\((.+?)\)/g;
    const renderComment = (text) => {
        const parts = [];
        let lastIndex = 0;
        text.replace(mentionRegex, (match, name, userId, index) => {
            if (index > lastIndex) {
                parts.push(text.substring(lastIndex, index));
            }
            parts.push(
                <Link key={userId} to={`/users/${userId}`} className="comment-link">
                    @{name}
                </Link>
            );
            lastIndex = index + match.length;
        });
        if (lastIndex < text.length) {
            parts.push(text.substring(lastIndex));
        }
        return parts;
    };

    return (
        // Link to the photo page of the specific comment
        <Link to={`/photos/${comment.photo_user_id}/${photoIndex}`} style={{textDecoration: 'none', color: 'inherit'}}>
            {/* Styled paper container for each comment */}
            <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}}
                   className="comment-container-listed flex-comment-container">
                {/* Image associated with the comment */}
                <img src={`/images/${comment.file_name}`} alt={comment.file_name} className="comment-photo-image"/>
                <div>
                    {/* Date and time of the comment formatted with formatDateTime */}
                    <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                        {formatDateTime(comment.date_time)}
                    </Typography>
                    {/* The actual comment text */}
                    <Typography variant="body1" className="comment">{renderComment(comment.comment)}</Typography>
                </div>
            </Paper>
        </Link>
    );
}

// Component to fetch and display user comments
function UserComments({userId}) {
    const [photos, setPhotos] = useState({});
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [enableAdvancedFeatures] = useContext(AdvancedContext);
    const [firstLoad] = useContext(FirstLoadContext);

    const navigate = useNavigate();
    const {pathname} = useLocation();

    // Effect to fetch comments and photos when the userId changes
    // Group photos by user and sort them by ID
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

    // Effect to fetch comments and photos when the userId changes
    useEffect(() => {
        const routes = pathname.split("/");
        if (!firstLoad && !enableAdvancedFeatures) {
            navigate(`/users/${routes[2]}`);
        }
    }, [enableAdvancedFeatures]);

    // Memoized rendering of comments to avoid unnecessary re-renders
    const renderedComments = useMemo(() => (
        comments.map(comment => {
            // Find the photos associated with the user who made the comment
            const userPhotos = photos[comment.photo_user_id] || [];
            // Find the index of the photo related to the current comment
            const photoIndex = userPhotos.findIndex(photo => photo._id === comment.photo_id);
            // Render the Comment component with appropriate props
            return (
                <Comment
                    key={`${comment._id}-${comment.photo_id}`}
                    comment={comment}
                    photoIndex={photoIndex}
                />
            );
        })
    ), [comments, photos]);

    // Display a loading spinner if data is still being fetched
    if (loading) return <CircularProgress className="loading-spinner"/>;
    // Show a message if there are no comments available
    if (!comments.length) return <Typography variant="h6" className="no-comments">No Comments Yet</Typography>;
    // Render the comments only if advanced features are enabled
    return enableAdvancedFeatures ? <div>{renderedComments}</div> : null;
}

export default UserComments;
