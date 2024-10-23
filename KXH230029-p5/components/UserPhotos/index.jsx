import React from "react";
import { Typography } from "@mui/material";

import "./styles.css";

function UserPhotos({userId}) {

  return (
    <Typography variant="body1">
      This should be the UserPhotos view of the PhotoShare app. Since it is
      invoked from React Router the params from the route will be in property
      match. So this should show details of user: {userId}. You can fetch the
      model for the user from window.models.photoOfUserModel(userId):
      <Typography variant="caption">
        {JSON.stringify(window.models.photoOfUserModel(userId))}
      </Typography>
    </Typography>
  );
}

export default UserPhotos;
