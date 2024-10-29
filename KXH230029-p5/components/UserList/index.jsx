import React, {useEffect, useMemo, useState} from "react";
import {CircularProgress, List, ListItem, ListItemText, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

// UserList component displays a list of users fetched from an API
function UserList() {
    // State to store user data and loading status
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user list data on component mount
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

    // Memoized function to render user list only when `users` state changes
    // Return null if there are no users
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

    // Display loading spinner if data is still loading
    if (loading) return <CircularProgress className="loadingSpinner"/>;
    // Display message if no users are found
    if (!users) return <Typography variant="h6" className="notFoundMessage">User not found.</Typography>;

    // Render the list of users if data is available and loading is complete
    return renderedUserList;
}

export default UserList;
