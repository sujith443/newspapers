import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Components
import Navbar from './components/Navbar';
import Login from './components/Login';
import BlogList from './components/BlogList';
import BlogDetail from './components/BlogDetail';
import BlogForm from './components/BlogForm.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      setUser({ username: localStorage.getItem('username') });
    }
  }, []);
  
  const handleLogin = (token, username) => {
    localStorage.setItem('token', token);
    localStorage.setItem('username', username);
    setIsAuthenticated(true);
    setUser({ username });
  };
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUser(null);
  };
  
  return (
    <Router>
      <div className="App">
        <Navbar 
          isAuthenticated={isAuthenticated} 
          username={user?.username}
          onLogout={handleLogout} 
        />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<BlogList />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route 
              path="/login" 
              element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/admin" />} 
            />
            <Route 
              path="/admin" 
              element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/create" 
              element={isAuthenticated ? <BlogForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin/edit/:id" 
              element={isAuthenticated ? <BlogForm isEditing={true} /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
        <footer className="mt-5 py-3 bg-light text-center">
          <div className="container">
            <p className="mb-0">© {new Date().getFullYear()} College Newspaper App | Developed by BTech Students</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;