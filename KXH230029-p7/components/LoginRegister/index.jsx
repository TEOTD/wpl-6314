import React, {useContext, useState} from 'react';
import './styles.css';
import {Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import axios from 'axios';
import {LoggedInUserContext, LoginContext} from '../context/appContext';

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
    const [, setIsLoggedIn] = useContext(LoginContext);
    const [, setLoggedInUser] = useContext(LoggedInUserContext);
    const [loading, setLoading] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [fieldError, setFieldError] = useState('');
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

        if (name === 'password' || name === 'confirmPassword') {
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
            const isPasswordValid = passwordRegex.test(credentials.password);

            if (!isPasswordValid) {
                setFieldError('Password must be at least 8 characters long, with uppercase, lowercase, number, and special character.');
            } else if (name === 'confirmPassword' && credentials.password !== value) {
                setFieldError('Passwords do not match');
            } else {
                setFieldError('');
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
                setIsLoggedIn(true);
                setLoggedInUser(result.data);
            }).catch((error) => {
                const errorMessage = error.response?.data || 'Unexpected error occurred';
                setFieldError(`Failed to ${isLogin ? 'login' : 'register'} error: ${errorMessage}`);
            }).finally(() => {
                    setLoading(false);
                }
            );
    };

    if (loading) {
        return <CircularProgress style={{display: 'block', margin: '20px auto'}}/>;
    }

    return (
        <>
            <Box className="login-register-container">
                <Typography variant="h4" gutterBottom className="login-heading">
                    {isLoginView ? 'Login' : 'Register'}
                </Typography>
                {!isLoginView && (
                    <>
                        {['firstName', 'lastName'].map((field) => (
                            <TextField
                                key={field}
                                label={field === 'firstName' ? 'First Name' : 'Last Name'}
                                name={field}
                                color="secondary"
                                variant="outlined"
                                value={credentials[field]}
                                onChange={handleChange}
                                error={!!fieldErrors[field]}
                                helperText={fieldErrors[field]}
                                id="filled-helperText"
                                required
                                className="login-text-fields"
                            />
                        ))}
                    </>
                )}
                <TextField
                    label="Username"
                    name="username"
                    variant="outlined"
                    color="secondary"
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
                    color="secondary"
                    value={credentials.password}
                    onChange={handleChange}
                    error={!!fieldErrors.password || (!isLoginView && fieldError.includes('least 8 characters long'))}
                    helperText={fieldErrors.password || (!isLoginView && fieldError.includes('least 8 characters long') ? fieldError : null)}
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
                            color="secondary"
                            value={credentials.confirmPassword}
                            onChange={handleChange}
                            error={!!fieldErrors.confirmPassword || fieldError.includes('match')}
                            helperText={fieldError.includes('match') ? fieldError : fieldErrors.confirmPassword}
                            disabled={!!fieldErrors.confirmPassword || fieldError.includes('least 8 characters long') || credentials.password.length <= 0}
                            required
                            className="login-text-fields"
                        />
                        {['location', 'description', 'occupation'].map((field) => (
                            <TextField
                                key={field}
                                label={field.charAt(0).toUpperCase() + field.slice(1)}
                                name={field}
                                variant="outlined"
                                color="secondary"
                                value={credentials[field]}
                                onChange={handleChange}
                                className="login-text-fields"
                                rows={field === 'description' ? 3 : 1}
                                multiline={field === 'description'}
                            />
                        ))}
                    </>
                )}
                <Box className="login-button-container">
                    <Button variant="contained" fullWidth onClick={() => handleAuth(isLoginView)}
                            className="login-button">
                        {isLoginView ? 'Login' : 'Register'}
                    </Button>
                    <Button
                        variant="contained"
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
                            setFieldErrors({});
                            setFieldError('');
                            setIsLoginView(!isLoginView);
                        }}
                        className="login-button"
                    >
                        {isLoginView ? 'Create an Account' : 'Go to Login'}
                    </Button>
                </Box>
            </Box>
            {!!fieldError && fieldError.includes('Failed to') && (
                <Typography variant="body2" color="error" className="not-found-message">
                    {fieldError}
                </Typography>
            )}
        </>
    );
}

export default LoginRegister;
