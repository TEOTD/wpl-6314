import React, {useEffect, useState} from "react";
import {CircularProgress, List, ListItem, ListItemText, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import "./styles.css";
import fetchModel from "../../lib/fetchModelData";

function UserList() {
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hoveredIndexes, setHoveredIndexes] = useState({});

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

    if (loading) return <CircularProgress className="loadingSpinner"/>;
    if (!users) return <Typography variant="h6" className="notFoundMessage">User not found.</Typography>;

    return (
        <List className="userList">
            {users.map((user, index) => (
                <ListItem
                    key={user._id}
                    className={`userListItem ${hoveredIndexes[index] ? 'hovered' : ''}`}
                    component={Link}
                    to={`/users/${user._id}`}
                    onMouseEnter={() => setHoveredIndexes(prev => ({
                        ...prev,
                        [index]: true
                    }))}
                    onMouseLeave={() => setHoveredIndexes(prev => ({
                        ...prev,
                        [index]: false
                    }))}
                >
                    <ListItemText primary={`${user.first_name} ${user.last_name}`}/>
                </ListItem>
            ))}
        </List>
    );
}

export default UserList;
