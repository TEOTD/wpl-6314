import React, {useMemo} from "react";
import {List, ListItem, ListItemText} from "@mui/material";
import {Link} from "react-router-dom";
import "./styles.css";

function UserList() {
    const users = useMemo(() => window.models.userListModel(), []);

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
