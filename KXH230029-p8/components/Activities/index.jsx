import React, {useContext, useEffect, useMemo, useState} from "react";
import {Box, CircularProgress, Paper, Typography} from "@mui/material";
import "./styles.css";
import axios from "axios";
import {ReloadContext} from "../context/appContext";
import formatDateTime from "../../lib/utils";

function Activities() {
    const [reload] = useContext(ReloadContext);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get(`/activities`)
                .then((result) => setActivities(result.data))
                .catch((error) => console.error("Failed to Website Activities", error))
                .finally(() => setLoading(false));
        })();
    }, [reload]);

    const renderMainActivityComponent = useMemo(() => {
        const mentionRegex = /@\[(.+?)]\((.+?)\)/g;
        const renderComment = (text) => {
            const parts = [];
            let lastIndex = 0;
            text.replace(mentionRegex, (match, name, userId, index) => {
                if (index > lastIndex) {
                    parts.push(text.substring(lastIndex, index));
                }
                parts.push(`@${name}`);
                lastIndex = index + match.length;
            });
            if (lastIndex < text.length) {
                parts.push(text.substring(lastIndex));
            }
            return parts;
        };

        return activities.map(activity => {
            const renderCardContent = () => {
                switch (activity.type) {
                    case "photo-upload":
                        return (
                            <img src={`/images/${activity.file_name}`} alt={activity.file_name}
                                 className="comment-photo-image"/>
                        );
                    case "comment-added":
                        return (
                            <>
                                {/* Image associated with the comment */}
                                <img src={`/images/${activity.file_name}`} alt={activity.file_name}
                                     className="comment-photo-image"/>
                                {/* The actual comment text */}
                                <Box sx={{display: 'flex', flexDirection: 'column'}}>
                                    <Typography variant="body1"
                                                className="comment">{renderComment(activity.comment)}
                                    </Typography>
                                    {/* Displays the user's name and the date of the comment */}
                                    <Typography variant="caption" className="comment-link">
                                        {activity.photo_owner_first_name} {activity.photo_owner_last_name}
                                    </Typography>
                                </Box>
                            </>
                        );

                    default:
                        return null;
                }
            };

            return (
                <Paper sx={{backgroundColor: "var(--secondary-hover-color)"}}
                       className="comment-container-listed" key={activity._id}>
                    <Typography variant="h4" className="user-name">
                        {activity.first_name} {activity.last_name} - {activity.type}
                    </Typography>
                    <Typography variant="body2" sx={{margin: "10px 0"}} className="photo-date">
                        {formatDateTime(activity.timestamp)}
                    </Typography>
                    {renderCardContent()}
                </Paper>
            );
        });
    }, [activities, reload]);

    return (
        <div>
            {loading ? (
                <CircularProgress/>
            ) : (
                renderMainActivityComponent
            )}
        </div>
    );
}

export default Activities;
