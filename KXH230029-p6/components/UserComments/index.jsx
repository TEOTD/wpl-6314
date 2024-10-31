//todo: Shows all the comments of the user
//todo: For each of the user's comments the view should show a small thumbnail of the photo on which the comment was made and the text of the comment.
//todo: Clicking on the comment or photo should switch the view to the photo's detail view containing that photo and all its comments.
import React, {useEffect, useState} from "react";
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

function Comment({comment, userId}) {
    return (
        <Link to={`/photos/${userId}`} style={{textDecoration: 'none', color: 'inherit'}}>
            <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}} className="comment-container">
                <img src={`/images/${comment.file_name}`} alt={comment.file_name} className="comment-photo-image"/>
                <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                    {formatDateTime(comment.date_time)}
                </Typography>
                {/* Display the comment text */}
                <Typography variant="body1" className="comment">{comment.comment}</Typography>
            </Paper>
        </Link>
    );
}

function UserComments({userId}) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;
        setLoading(true);
        axios.get(`/commentsOfUser/${userId}`)
            .then((result) => setComments(result.data))
            .catch((error) => console.error("Failed to fetch user comments:", error))
            .finally(() => setLoading(false));
    }, [userId]);

    if (loading) return <CircularProgress className="loading-spinner"/>;
    if (!comments.length) {
        return <Typography variant="h6" className="no-comments">No Comments Yet</Typography>;
    }

    return (
        <div>
            {comments.map((comment) => (
                <Comment key={comment._id + comment.photo_id} comment={comment} userId={userId}/>
            ))}
        </div>
    );
}

export default UserComments;