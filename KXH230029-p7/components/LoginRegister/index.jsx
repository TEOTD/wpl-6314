import React, {useContext, useState} from 'react';
import './styles.css';
import {Box, Button, CircularProgress, TextField, Typography} from '@mui/material';
import axios from 'axios';
import {useNavigate} from "react-router-dom";
import {LoggedInUserContext, LoginContext} from '../context/appContext';

function LoginRegister() {
    // State to manage user credentials for login or registration
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

    // Context hooks to update the login status and logged-in user information
    const [, setIsLoggedIn] = useContext(LoginContext);
    const [, setLoggedInUser] = useContext(LoggedInUserContext);

    // State to handle loading indicator, login/register view toggle, and error messages
    const [loading, setLoading] = useState(false);
    const [isLoginView, setIsLoginView] = useState(true);
    const [fieldError, setFieldError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const navigate = useNavigate();

    // Function to validate form required fields before submitting login/registration
    const validateFields = () => {
        const errors = {};
        if (!credentials.login_name) errors.login_name = 'Login name is required';
        if (!credentials.password) errors.password = 'Password is required';

        if (!isLoginView) {
            if (!credentials.first_name) errors.first_name = 'First Name is required';
            if (!credentials.last_name) errors.last_name = 'Last Name is required';
            if (!credentials.confirm_password) errors.confirm_password = 'Please confirm your password';
            if (credentials.password !== credentials.confirm_password) {
                errors.confirm_password = 'Passwords do not match';
            }
        }

        // Update field errors and return whether the form is valid
        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handler to update credentials state when input fields change
    const handleChange = (event) => {
        const {name, value} = event.target;
        setCredentials((prev) => ({...prev, [name]: value}));

        // Check for password match when updating password fields
        if (name === 'password' || name === 'confirm_password') {
            if (name === 'confirm_password' && credentials.password !== value) {
                setFieldError('Passwords do not match');
            } else {
                setFieldError('');
            }
        }
    };

    // Function to handle login or registration authentication
    const handleAuth = async (isLogin) => {
        // Validate fields before making the API request
        if (!validateFields()) return;
        setLoading(true);

        // Determine the API endpoint and data based on the view
        const url = isLogin ? '/admin/login' : '/user';
        const data = isLogin
            ? {login_name: credentials.login_name, password: credentials.password}
            : credentials;

        // Make the API request for login/registration
        // On success, store login status and user data in localStorage for login caching and context
        await axios.post(url, data)
            .then((result) => {
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('loggedInUser', JSON.stringify(result.data));
                setIsLoggedIn(true);
                setLoggedInUser(result.data);
                navigate(`/users/${result.data._id}`);
            }).catch((error) => {
                const errorMessage = error.response?.data || 'Unexpected error occurred';
                setFieldError(`Failed to ${isLogin ? 'login' : 'register'}: ${errorMessage}`);
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
                {/* Heading that changes based on the view (Login or Register) */}
                <Typography variant="h4" gutterBottom className="login-heading">
                    {isLoginView ? 'Login' : 'Register'}
                </Typography>

                {/* Render additional fields for registration */}
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
                                required
                                className="login-text-fields"
                            />
                        ))}
                    </>
                )}

                {/* Input for login name */}
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

                {/* Input for password */}
                <TextField
                    label="Password"
                    name="password"
                    type="password"
                    variant="outlined"
                    color="secondary"
                    value={credentials.password}
                    onChange={handleChange}
                    error={!!fieldErrors.password}
                    helperText={fieldErrors.password || fieldError}
                    required
                    className="login-text-fields"
                />

                {/* Confirm password field for registration */}
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

                        {/* Additional optional fields for registration */}
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

                {/* Buttons for authentication and toggling between login and register views */}
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

            {/* Error message display */}
            {!!fieldError && fieldError.includes('Failed to') && (
                <Typography variant="body2" color="error" className="not-found-message">
                    {fieldError}
                </Typography>
            )}
        </>
    );
}

export default LoginRegister;
