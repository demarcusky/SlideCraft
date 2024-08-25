import React from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import LoginForm from './components/LoginForm.jsx';
import RegisterForm from './components/RegisterForm.jsx';
import Dashboard from './components/Dashboard.jsx';
import Presentation from './components/Presentation.jsx';
import Preview from './components/Preview.jsx';
import config from './config.json';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';

const BACKEND_PORT = config.BACKEND_PORT;
export const BACKEND_URL = `http://localhost:${BACKEND_PORT}`;

function App () {
  return (
    <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/presentation/:key/:slide" Component={Presentation} />
          <Route path="/presentation/:key/preview/:slide" element={<Preview />} />
        </Routes>
        <Footer />
    </Router>
  );
}

export default App;
