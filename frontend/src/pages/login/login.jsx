import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import Terrier from '../../assets/terrier.png';
import H4iLogo from '../../assets/hack4impact-logo.jpg';
import GoogleLogo from '../../assets/google-logo.png';
import "./login.css";

const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();

    const oauth = useGoogleLogin({
        onSuccess: tokenResponse => {
            console.log(tokenResponse);
            const token = tokenResponse.access_token || tokenResponse.credential;
            sessionStorage.setItem('authToken', token);
            setIsAuthenticated(true);
            navigate('/home');
        },
        onError: error => {
            console.error('Login Failed', error);
        },
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
