import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/login/login';
import './App.css'

function App() {
  const [visible, setVisible] = useState(false);
  function getVisible() {
    setVisible(!visible);
  }
  function ErrorBoundary() {
    const localLink = window.location.href.substring(window.location.href.lastIndexOf('/'));
    return (
      <>
        <h1 style={{ textAlign: 'center', marginTop: '5rem' }}>Error 404: Page Not Found</h1>
        <h2 style={{ textAlign: 'center', marginBottom: '5rem' }}>The requested URL {localLink} was not found on this server.</h2>
      </>
    );
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<ErrorBoundary />} />
      </Routes>
    </Router>
  );
}

export default App
