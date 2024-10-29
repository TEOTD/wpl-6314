import React, {useEffect, useMemo, useState} from "react";
import {CircularProgress, List, ListItem, ListItemText, Typography} from "@mui/material";
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
            })
            .catch((error) => {
                console.error("Failed to fetch users:", error);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const renderedUserList = useMemo(() => {
        if (!users) return null;
        return (
            <List className="userList">
                {users.map((user) => (
                    <ListItem
                        key={user._id}
                        className="userListItem"
                        component={Link}
                        to={`/users/${user._id}`}
                    >
                        <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
                    </ListItem>
                ))}
            </List>
        );
    }, [users]);

    if (loading) return <CircularProgress className="loadingSpinner"/>;
    if (!users) return <Typography variant="h6" className="notFoundMessage">User not found.</Typography>;

    return renderedUserList;
}

export default UserList;
