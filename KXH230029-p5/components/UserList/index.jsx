import React, {useEffect, useState} from "react";
import {List, ListItem, ListItemText} from "@mui/material";
import {Link} from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserList() {
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetchModel('/user/list')
            .then((result) => {
                setUsers(result.data);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Failed to fetch user:", error);
                setLoading(false);
            });
    }, []);

    if (loading) return <p>Loading...</p>;
    if (!users) return <p>Users not found.</p>;
    return (
        <List>
            {users.map(user => (
                <ListItem key={user._id}>
                    <Link to={`/users/${user._id}`}>
                        <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
                    </Link>
                </ListItem>
            ))}
        </List>
    );
}

export default UserList;
