import React, {useContext, useEffect, useMemo, useState} from "react";
import {Box, CircularProgress, Paper, Typography} from "@mui/material";
import "./styles.css";
import axios from "axios";
import {ReloadContext} from "../context/appContext";
import formatDateTime from "../../lib/utils";

function Activities() {

    // States used to handle the activity log page.
    const [reload] = useContext(ReloadContext);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(false);

    // fetcehes the latest activities of all the users to show activity log.
    useEffect(() => {
        setLoading(true);
        (async () => {
            await axios.get(`/activities`)
                .then((result) => setActivities(result.data))
                .catch((error) => console.error("Failed to Website Activities", error))
                .finally(() => setLoading(false));
        })();
    }, [reload]);

    // Use cached data to display the activity log unless required to reload
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
                            <Box sx={{
                                display: "flex",
                                justifyContent: "center",
                            }}>
                                <img src={`/images/${activity.file_name}`} alt={activity.file_name}
                                     className="comment-photo-image"/>
                            </Box>
                        );
                    case "comment-added":
                        return (
                            <Box
                                    sx={{
                                        display: "flex",
                                        justifyContent: "center",
                                        alignItems: "center",
                                    }}
                                >
                                    {/* Image associated with the comment */}
                                    <img src={`/images/${activity.file_name}`} alt={activity.file_name}
                                         className="comment-photo-image"/>
                                    {/* The actual comment text */}
                                    <Paper sx={
                                        {
                                            display: 'flex',
                                            flexDirection: 'column',
                                            backgroundColor: "#ED2939",
                                            width: "250px",
                                            padding: "10px",
                                            height: 'fit-content',

                                        }
}>
                                        <Typography variant="body1"
                                                    className="comment">{renderComment(activity.comment)}
                                        </Typography>
                                        {/* Displays the user's name and the date of the comment */}
                                        <Typography variant="caption"
                                                    sx={{
                                                        color: 'var(--highlight-color)',
                                                    }}
                                        >
                                            - {activity.photo_owner_first_name} {activity.photo_owner_last_name}
                                        </Typography>
                                    </Paper>
                            </Box>
                        );

                    default:
                        return null;
                }
            };

            return (
                <Paper sx={{
                    backgroundColor: "var(--secondary-hover-color)",
justifyContent: "center",
marginLeft: "100px",
                    marginRight: "100px",
                }}
                       className="comment-container-listed" key={activity._id}>
                    <Typography variant="h4" className="user-name" sx={{textAlign: "center",}}>
                        {activity.first_name} {activity.last_name} - {activity.type}
                    </Typography>
                    <Typography variant="body2" sx={{margin: "10px 0", textAlign: "center",}} className="photo-date">
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
