import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Terrier from '../../assets/terrier.png';
import H4iLogo from '../../assets/h4i_removed_bg.png';
import GoogleLogo from '../../assets/google-logo.png';
import "./login.css";

const Login = ({ setIsAuthenticated, setUserEmail }) => {
    const navigate = useNavigate();

    const oauth = useGoogleLogin({
        onSuccess: async tokenResponse => {
            console.log(tokenResponse);
            const token = tokenResponse.access_token || tokenResponse.credential;
            sessionStorage.setItem('authToken', token);

            try {
                // Fetch user profile data from Google
                const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (!userInfoResponse.ok) {
                    throw new Error('Failed to fetch user profile');
                }

                const userInfo = await userInfoResponse.json();

                // Register/update user in our backend
                // const response = await fetch('https://h4i-event-management-platform-production.up.railway.app/users/login', {
                const response = await fetch('http://localhost:3000/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: userInfo.email,
                        name: userInfo.name
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to register user');
                }

                const userData = await response.json();

                // Store user data in session storage
                sessionStorage.setItem('userEmail', userData.email);
                sessionStorage.setItem('userName', userData.name);
                sessionStorage.setItem('userColor', userData.color);

                // Continue with authentication flow
                setIsAuthenticated(true);
                setUserEmail(userInfo.email);
                navigate('/home');
            } catch (error) {
                console.error('Login processing error:', error);
            }
        },
        onError: error => {
            console.error('Login Failed', error);
        },
        scope: 'email profile' // Request email and profile scopes
    });

    return (
        <div className="login_container">
            <img className="login_terrier" src={Terrier} alt="H41 Logo" />
            <Box className="login_box">
                <img className="login_h4iLogo" src={H4iLogo} alt="Hack4Impact Logo" />
                <Typography variant="h4">EMS Portal</Typography>
                <button className="login_button" onClick={oauth}>
                    <img className="login_googleLogo" src={GoogleLogo} alt="Google Logo" />
                    Login with Google
                </button>
            </Box>
        </div>
    );
};

export default Login;
