import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

const OAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const CLIENTID = "39491951165-v3ub1br05daakp32p6fj48hdagt6utvu.apps.googleusercontent.com";

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/home');
        }
    }, [isAuthenticated, navigate]);

    return (
        <div>
            <GoogleLogin
                onSuccess={credentialResponse => {
                    console.log(credentialResponse);
                    setIsAuthenticated(true);
                }}
                onError={() => {
                    console.log('Login Failed');
                }}
            />
        </div>
    );
};

const Login = () => {
    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                flexDirection: 'column',
                position: 'relative'
            }}
        >
            <img
                id='first image'
                src='/assets/h41-logo-2.png'
                style={{
                    width: '180px',
                    height: '180px',
                    margin: 'none',
                    transform: 'rotate(-42deg)',
                    position: 'absolute',
                    top: '75px',
                    zIndex: 2
                }}
            />
            <Box
                id='container'
                sx={{
                    margin: 'none',
                    width: '370px',
                    height: '450px',
                    border: 'solid',
                    borderRadius: '3%',
                    borderColor: '#a49ca0',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <img
                    src='/assets/hack4impact-logo.jpg'
                    style={{
                        width: '150px',
                        height: '150px',
                        margin: '20px',
                    }}
                />
                <Typography
                    sx={{
                        fontSize: '25px',
                        margin: '20px',
                    }}
                >
                    EMS Portal
                </Typography>
                <button
                    style={{
                        width: '170px',
                        height: '35px',
                        border: 'none',
                        borderRadius: 6,
                        backgroundColor: '#0c0d0d',
                        color: '#e8edee',
                        fontSize: '13px',
                        cursor: 'pointer',
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#656f7b'}
                    onMouseOut={(e) => e.target.style.backgroundColor = '#0c0d0d'}
                    onClick={() => OAuth()}
                >
                    Login with Google OAuth
                </button>
            </Box>
        </div>
    );
};

export default Login;