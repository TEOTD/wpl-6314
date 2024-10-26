import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserDetail({userId}) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            fetchModel(`/user/${userId}`)
                .then((result) => {
                    setUser(result.data);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error("Failed to fetch user:", error);
                    setLoading(false);
                });
        }
    }, [userId]);

    if (loading) return <p>Loading...</p>;
    if (!user) return <p>User not found.</p>;

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
