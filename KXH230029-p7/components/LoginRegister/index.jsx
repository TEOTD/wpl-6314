import React, {useContext, useState} from 'react';
import {Button, CircularProgress, Paper, TextField, Typography} from '@mui/material';
import {LoggedInUserContext, LoginContext} from '../context/appContext';
import axios from 'axios';

function LoginRegister() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useContext(LoginContext);
    const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
    const [loading, setLoading] = useState(false);
    const [loginStatus, setLoginStatus] = useState(true);

    const handleLogin = async () => {
        setLoading(true);
        await axios.post('/admin/login', {username, password})
            .then((result) => {
                setIsLoggedIn(true);
                setLoginStatus(true);
                setLoggedInUser(result.data);
            }).catch(error => {
                console.error('Failed to login:', error);
                setLoginStatus(false);
            }).finally(
                () => setLoading(false)
            );
    };

    if (loading) {
        return <CircularProgress className="loading-spinner" style={{display: 'block', margin: '20px auto'}}/>;
    }

    return (
        <Paper style={{padding: '20px', maxWidth: '400px', margin: '20px auto'}}>
            <Typography variant="h6" color="textPrimary" gutterBottom>
                Please Login
            </Typography>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
                margin="normal"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
                label="Password"
                type="password"
                variant="outlined"
                fullWidth
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleLogin}
                style={{marginTop: '20px'}}
            >
                Login
            </Button>
            {!loginStatus && (
                <Typography
                    variant="body2"
                    color="error"
                    style={{marginTop: '10px', textAlign: 'center'}}
                >
                    Invalid Username or Password. Please try again.
                </Typography>
            )}
        </Paper>
    );
}

export default LoginRegister;
