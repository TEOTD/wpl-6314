import React, {useContext, useEffect, useState} from 'react';
import "./styles.css";
import {Button, CircularProgress, TextField, Typography} from '@mui/material';
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
        await axios.post(url, data)
            .then((result) => {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', JSON.stringify(result.data));
                console.log(result.data)
                setIsLoggedIn(true);
                setLoggedInUser(result.data);
            }).catch((error) => {
                const errorMessage = error.response?.data || 'Unexpected error occurred';
                setError(`Failed to ${isLogin ? 'login' : 'register'} error: ${errorMessage}`);
            }).finally(() => {
                    setLoading(false);
                }
            );
    };

    useEffect(() => {
        const loggedInFlag = localStorage.getItem('isLoggedIn');
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
        if (loggedInFlag === 'true') {
            (async () => {
                await axios.get('/admin/check-session', {withCredentials: true})
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
            })();
        }
    }, []);

    return (
        <div className="login-register-container">
            {loading ? (
                <CircularProgress style={{display: 'block', margin: '20px auto'}}/>
            ) : (
                <>
                    <Typography variant="h4" color="textPrimary" gutterBottom className="login-heading">
                        {isLoginView ? 'Login' : 'Register'}
                    </Typography>

                    {!isLoginView && (
                        <>
                            <TextField
                                label="First Name"
                                name="firstName"
                                variant="outlined"
                                value={credentials.firstName}
                                onChange={handleChange}
                                error={!!fieldErrors.firstName}
                                helperText={fieldErrors.firstName}
                                required
                                className="login-text-fields"
                            />
                            <TextField
                                label="Last Name"
                                name="lastName"
                                variant="outlined"
                                value={credentials.lastName}
                                onChange={handleChange}
                                error={!!fieldErrors.lastName}
                                helperText={fieldErrors.lastName}
                                required
                                className="login-text-fields"
                            />
                        </>
                    )}
                    <TextField
                        label="Username"
                        name="username"
                        variant="outlined"
                        value={credentials.username}
                        onChange={handleChange}
                        error={!!fieldErrors.username}
                        helperText={fieldErrors.username}
                        required
                        className="login-text-fields"
                    />
                    <TextField
                        label="Password"
                        name="password"
                        type="password"
                        variant="outlined"
                        value={credentials.password}
                        onChange={handleChange}
                        error={!!fieldErrors.password || (!!error && error.includes('least 8 characters long')) && !isLoginView}
                        helperText={!isLoginView && (error.includes('least 8 characters long') ? error : null) ||
                            (!!fieldErrors.password ? fieldErrors.password : null)}
                        required
                        className="login-text-fields"
                    />
                    {!isLoginView && (
                        <>
                            <TextField
                                label="Re-Type Password"
                                name="confirmPassword"
                                type="password"
                                variant="outlined"
                                value={credentials.confirmPassword}
                                onChange={handleChange}
                                error={!!fieldErrors.password || (!!error && error.includes('match'))}
                                helperText={(error.includes('match') ? error : null) ||
                                    (!!fieldErrors.password ? fieldErrors.password : null)}
                                disabled={credentials.password.length <= 0 || (!!error && error.includes('least 8 characters long'))
                                    || !!fieldErrors.password
                                    && !isLoginView}
                                required
                                className="login-text-fields"
                            />
                            <TextField
                                label="Location"
                                name="location"
                                variant="outlined"
                                value={credentials.location}
                                onChange={handleChange}
                                className="login-text-fields"
                            />
                            <TextField
                                label="Description"
                                name="description"
                                variant="outlined"
                                multiline
                                rows={3}
                                value={credentials.description}
                                onChange={handleChange}
                                className="login-text-fields"
                            />
                            <TextField
                                label="Occupation"
                                name="occupation"
                                variant="outlined"
                                value={credentials.occupation}
                                onChange={handleChange}
                                className="login-text-fields"
                            />
                        </>
                    )}
                    <div className="login-button-container">
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            onClick={() => handleAuth(isLoginView)}
                            className="login-button"
                        >
                            {isLoginView ? 'Login' : 'Register'}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
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
                            className="login-button"
                        >
                            {isLoginView ? 'Create an Account' : 'Go to Login'}
                        </Button>
                    </div>
                    {!!error && error.includes('Failed to') && (
                        <Typography
                            variant="body2"
                            color="error"
                            style={{marginTop: '10px', textAlign: 'center'}}
                            className="not-found-message"
                        >
                            {error}
                        </Typography>
                    )}
                </>
            )}
        </div>
    );
}

export default LoginRegister;
