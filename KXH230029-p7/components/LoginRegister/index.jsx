import React, {useContext, useEffect, useState} from 'react';
import {Button, CircularProgress, Paper, TextField, Typography} from '@mui/material';
import {LoggedInUserContext, LoginContext} from '../context/appContext';
import axios from 'axios';

function LoginRegister() {
    const [credentials, setCredentials] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: '',
        confirmPassword: '',
        location: '',
        description: '',
        occupation: '',
    });
    const [isLoggedIn, setIsLoggedIn] = useContext(LoginContext);
    const [loggedInUser, setLoggedInUser] = useContext(LoggedInUserContext);
    const [loading, setLoading] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateFields = () => {
        const errors = {};
        if (!credentials.username) errors.username = 'Username is required';
        if (!credentials.password) errors.password = 'Password is required';

        if (!isLoginView) {
            if (!credentials.firstName) errors.firstName = 'First Name is required';
            if (!credentials.lastName) errors.lastName = 'Last Name is required';
            if (!credentials.confirmPassword) errors.confirmPassword = 'Please confirm your password';
            if (credentials.password !== credentials.confirmPassword) {
                errors.confirmPassword = 'Passwords do not match';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCredentials((prev) => ({...prev, [name]: value}));

        // Simplified Password and Match Validation
        if (name === 'password' || name === 'confirmPassword') {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            const isPasswordValid = passwordRegex.test(credentials.password);

            if (!isPasswordValid) {
                setError(
                    'Password must be at least 8 characters long, with uppercase, lowercase, number, and special character.'
                );
            } else if (name === 'confirmPassword' && credentials.password !== value) {
                setError('Passwords do not match');
            } else {
                setError('');
            }
        }
    };

    const handleAuth = async (isLogin) => {
        if (!validateFields()) return;
        setLoading(true);
        const url = isLogin ? '/admin/login' : '/user';
        const data = isLogin
            ? {username: credentials.username, password: credentials.password}
            : credentials;

        try {
            const result = await axios.post(url, data);
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', JSON.stringify(result.data));
            console.log(result.data)
            setIsLoggedIn(true);
            setLoggedInUser(result.data);
        } catch (error) {
            setError(`Failed to ${isLogin ? 'login' : 'register'}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loggedInFlag = localStorage.getItem('isLoggedIn');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInFlag === 'true') {
            axios.get('/admin/check-session', {withCredentials: true})
                .then(response => {
                    if (response.status === 200) {
                        setIsLoggedIn(true);
                        console.log(loggedInUser)
                        setLoggedInUser(loggedInUser)
                    } else {
                        localStorage.removeItem('isLoggedIn');
                        localStorage.removeItem('loggedInUser');
                        setIsLoggedIn(false);
                    }
                })
                .catch(() => {
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('loggedInUser');
                    setIsLoggedIn(false);
                });
        }
    }, []);

    return (
        <Paper style={{padding: '20px', maxWidth: '400px', margin: '20px auto'}}>
            {loading ? (
                <CircularProgress style={{display: 'block', margin: '20px auto'}}/>
            ) : (
                <>
                    <Typography variant="h6" color="textPrimary" gutterBottom>
                        {isLoginView ? 'Please Login' : 'Please Register'}
                    </Typography>

                    {!isLoginView && (
                        <>
                            <TextField
                                label="First Name"
                                name="firstName"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={credentials.firstName}
                                onChange={handleChange}
                                error={fieldErrors.firstName}
                                helperText={fieldErrors.firstName}
                                required
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={credentials.lastName}
                                onChange={handleChange}
                                error={fieldErrors.lastName}
                                helperText={fieldErrors.lastName}
                                required
                            />
                        </>
                    )}
                    <TextField
                        label="Username"
                        name="username"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={credentials.username}
                        onChange={handleChange}
                        error={fieldErrors.username}
                        helperText={fieldErrors.username}
                        required
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={credentials.password}
                        onChange={handleChange}
                        error={fieldErrors.password || (error && error.includes('least 8 characters long')) && !isLoginView}
                        helperText={!isLoginView && (error.includes('least 8 characters long') ? error : null) ||
                            (fieldErrors.password ? fieldErrors.password : null)}
                        required
                    />
                    {!isLoginView && (
                        <>
                            <TextField
                                label="Re-Type Password"
                                name="confirmPassword"
                                type="password"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={credentials.confirmPassword}
                                onChange={handleChange}
                                error={fieldErrors.password || (error && error.includes('match'))}
                                helperText={(error.includes('match') ? error : null) ||
                                    (fieldErrors.password ? fieldErrors.password : null)}
                                disabled={credentials.password.length <= 0 || (error && error.includes('least 8 characters long'))
                                    || fieldErrors.password
                                    && !isLoginView}
                                required
                            />
                            <TextField
                                label="Location"
                                name="location"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={credentials.location}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Description"
                                name="description"
                                variant="outlined"
                                multiline
                                rows={3}
                                fullWidth
                                margin="normal"
                                value={credentials.description}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Occupation"
                                name="occupation"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={credentials.occupation}
                                onChange={handleChange}
                            />
                        </>
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        style={{marginTop: '20px'}}
                        onClick={() => handleAuth(isLoginView)}
                    >
                        {isLoginView ? 'Login' : 'Register'}
                    </Button>
                    <Button
                        variant="text"
                        color="secondary"
                        fullWidth
                        style={{marginTop: '10px'}}
                        onClick={() => {
                            setCredentials({
                                firstName: '',
                                lastName: '',
                                username: '',
                                password: '',
                                confirmPassword: '',
                                location: '',
                                description: '',
                                occupation: '',
                            });
                            setFieldErrors({})
                            setError('')
                            setIsLoginView(!isLoginView)
                        }}
                    >
                        {isLoginView ? 'Create an Account' : 'Go to Login'}
                    </Button>
                    {error && error.includes('Failed to') && (
                        <Typography
                            variant="body2"
                            color="error"
                            style={{marginTop: '10px', textAlign: 'center'}}
                        >
                            {error}
                        </Typography>
                    )}
                </>
            )}
        </Paper>
    );
}

export default LoginRegister;
