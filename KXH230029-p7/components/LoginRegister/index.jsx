import React, {useContext, useState} from 'react';
import './styles.css';
import {Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import axios from 'axios';
import {LoggedInUserContext, LoginContext} from '../context/appContext';

function LoginRegister() {
    const [credentials, setCredentials] = useState({
        first_name: '',
        last_name: '',
        login_name: '',
        password: '',
        confirm_password: '',
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
        if (!credentials.login_name) errors.login_name = 'login_name is required';
        if (!credentials.password) errors.password = 'Password is required';

        if (!isLoginView) {
            if (!credentials.first_name) errors.first_name = 'First Name is required';
            if (!credentials.last_name) errors.last_name = 'Last Name is required';
            if (!credentials.confirm_password) errors.confirm_password = 'Please confirm your password';
            if (credentials.password !== credentials.confirm_password) {
                errors.confirm_password = 'Passwords do not match';
            }
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (e) => {
        const {name, value} = e.target;
        setCredentials((prev) => ({...prev, [name]: value}));

        if (name === 'password' || name === 'confirm_password') {
            if (name === 'confirm_password' && credentials.password !== value) {
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
            ? {login_name: credentials.login_name, password: credentials.password}
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
                        {['first_name', 'last_name'].map((field) => (
                            <TextField
                                key={field}
                                label={field === 'first_name' ? 'First Name' : 'Last Name'}
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
                    label="Login Name"
                    name="login_name"
                    variant="outlined"
                    color="secondary"
                    value={credentials.login_name}
                    onChange={handleChange}
                    error={!!fieldErrors.login_name}
                    helperText={fieldErrors.login_name}
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
                    error={!!fieldErrors.password || (!isLoginView)}
                    helperText={fieldErrors.password || (!isLoginView ? fieldError : null)}
                    required
                    className="login-text-fields"
                />
                {!isLoginView && (
                    <>
                        <TextField
                            label="Re-Type Password"
                            name="confirm_password"
                            type="password"
                            variant="outlined"
                            color="secondary"
                            value={credentials.confirm_password}
                            onChange={handleChange}
                            error={!!fieldErrors.confirm_password || fieldError.includes('match')}
                            helperText={fieldError.includes('match') ? fieldError : fieldErrors.confirm_password}
                            disabled={!!fieldErrors.confirm_password || credentials.password.length <= 0}
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
                                first_name: '',
                                last_name: '',
                                login_name: '',
                                password: '',
                                confirm_password: '',
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
