import React, {useMemo} from "react";
import {Link} from "react-router-dom";
import "./styles.css";

function UserDetail({userId}) {
    const user = useMemo(() => window.models.userModel(userId), [userId]);
    const {
        first_name,
        last_name,
        description,
        location,
        occupation
    } = user;

    return (
        <div>
            <h1>{`${first_name} ${last_name}`}</h1>
            <p>{description}</p>
            <p>{location}</p>
            <p>{occupation}</p>
            <Link to={`/photos/${userId}`}>View Photos</Link>
        </div>
    );
}

export default UserDetail;
