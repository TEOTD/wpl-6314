import React, {useContext, useEffect, useState} from "react";
import "./styles.css";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Tooltip,
    Typography
} from "@mui/material";
import axios from "axios";
import CancelIcon from '@mui/icons-material/Cancel';
import {LoggedInUserContext, ReloadContext} from "../context/appContext";
import formatDateTime from "../../lib/utils";

function UserFavorites() {
    const [userFavourites, setUserFavourites] = useState([]);
    const [loggedInUser,] = useContext(LoggedInUserContext);
    const [photoList, setPhotoList] = useState([]);
    const [reload, setReload] = useContext(ReloadContext);
    const [open, setOpen] = useState(false);
    const [imageDetails, setImageDetails] = useState();
    const [imageUser, setImageUser] = useState();

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        (async () => {
            await axios.get(`/user/${loggedInUser._id}`)
                .then((result) => {
                    setUserFavourites(result.data.favourite_img_list);
                })
                .catch((error) => console.error("Failed to fetch user photos:", error));
        })();
    }, [reload]);

    // Fetch user favourites photos field
    useEffect(() => {
        if (imageDetails) {
            (async () => {
                await axios.get(`/user/${imageDetails.user_id}`)
                    .then((result) => {
                        setImageUser(result.data);
                    })
                    .catch((error) => console.error("Failed to fetch user photos:", error));
            })();
        }
    }, [imageDetails, reload]);

    useEffect(() => {

        (async () => {
            await axios.get(`/photos/`,
                {
                    params: {
                        ids: userFavourites  // Send the array as a query parameter
                    }
                })
                .then((result) => {
                    setPhotoList(result.data);
                })
                .catch((error) => console.error("Failed to fetch user photos:", error));
        })();


    }, [userFavourites]);

    const RemoveFavourite = async (photo_id) => {
        try {
            setReload(true);
            await axios.post(`/removeFavorite/${photo_id}`, {});
            setReload(false);
        } catch (error) {
            console.error("Failed to add comment:", error);
        }
    };

    return (
        <>
            <Typography variant="h5">Favorite List</Typography>
            {photoList.length > 0 ? (
                <Paper sx={{
                    display: "flex",
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                }}>

                    {photoList.map((photo, index) => (
                        <Paper
                            key={index} // Unique key for each item
                            sx={{
                                backgroundColor: "var(--secondary-hover-color)",
                                margin: "10px",
                                padding: "20px",
                                width: "200px",
                            }}
                            className="comment-container-details flex-comment-container engagement-container"
                        >
                            {/* Display the photo */}
                            <Button sx={{justifyContent: "center"}} onClick={() => {
                                setImageDetails(photo);
                                setOpen(true);
                            }}>
                                <img
                                    src={`/images/${photo.file_name}`}
                                    alt={photo.file_name}
                                    className="comment-photo-image"
                                />
                            </Button>

                            <Tooltip title="Remove Photo" arrow>
                                <IconButton onClick={() => {
                                    RemoveFavourite(photo._id);
                                }}>
                                    <CancelIcon/>
                                </IconButton>
                            </Tooltip>
                        </Paper>
                    ))}
                    <Dialog open={open} onClose={handleClose} sx={{
                        "& .MuiPaper-root": {
                            background: "#000",
                            borderRadius: "10px",
                        },
                    }}>
                        <DialogTitle>Image Details</DialogTitle>
                        <DialogContent>
                            {

                                imageDetails && imageUser ?

                                    (
                                        <>
                                            <img src={`/images/${imageDetails.file_name}`} alt={imageDetails.file_name}
                                                 className="photo-image"/>
                                            <Paper sx={{padding: "15px", margin: "4px"}} className="dialog-info-card">
                                                <Typography
                                                    variant="body1">{"Posted On: " + formatDateTime(imageDetails.date_time)}
                                                </Typography>
                                            </Paper>
                                            <Paper sx={{padding: "15px", margin: "4px"}} className="dialog-info-card">
                                                <Typography
                                                    variant="body1">{"Posted By: " + imageUser.first_name + " " + imageUser.last_name}
                                                </Typography>
                                            </Paper>
                                            <Paper sx={{padding: "15px", margin: "4px"}} className="dialog-info-card">
                                                <Typography
                                                    variant="body1">{"File Name: " + imageDetails.file_name}
                                                </Typography>
                                            </Paper>
                                            <Paper sx={{padding: "15px", margin: "4px"}} className="dialog-info-card">
                                                <Typography
                                                    variant="body1">{"Number of Comments: " + imageDetails.comments.length}
                                                </Typography>
                                            </Paper>

                                        </>
                                    )
                                    : undefined
                            }

                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleClose} color="primary">
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
              ) : (
                <Paper
                    sx={{
                        backgroundColor: "var(--secondary-hover-color)",
                        justifyContent: "center",
                    }}
                >
                    <Typography variant="h5"
                                sx={{
                                    padding: "20px",
                                    color: "white",
                                    textAlign: "center",
                                }}
                    >
                        You have not added any photos to favorites yet.
                    </Typography>
                </Paper>
              )}
        </>
    );
}

export default UserFavorites;