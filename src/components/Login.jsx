import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password
      });
      
      const { token, username: loggedInUsername } = response.data;
      
      onLogin(token, loggedInUsername);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };
  
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  return (
    <div className="login-container py-5">
      <div className="row">
        <div className="col-md-6 d-none d-md-block">
          <div className="login-banner h-100 d-flex flex-column justify-content-center p-4">
            <div className="text-center mb-4">
              <i className="bi bi-newspaper display-1"></i>
            </div>
            <h2 className="text-center mb-4">SVIT News Portal</h2>
            <p className="text-center mb-5">
              Admin access to manage news articles, publications, and events for Sri Vasavi Institute of Technology.
            </p>
            <div className="features-list">
              <div className="feature-item mb-3">
                <i className="bi bi-pencil-square me-3"></i>
                <span>Create and publish news articles</span>
              </div>
              <div className="feature-item mb-3">
                <i className="bi bi-upload me-3"></i>
                <span>Upload and manage documents</span>
              </div>
              <div className="feature-item mb-3">
                <i className="bi bi-people me-3"></i>
                <span>Share student and faculty achievements</span>
              </div>
              <div className="feature-item">
                <i className="bi bi-calendar-event me-3"></i>
                <span>Announce upcoming college events</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card login-form-card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">
              <div className="text-center mb-4 d-md-none">
                <i className="bi bi-newspaper display-4"></i>
                <h4 className="mt-2">SVIT News Portal</h4>
              </div>
              
              <h2 className="text-center mb-4">Admin Login</h2>
              
              {error && (
                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  {error}
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setError('')}
                    aria-label="Close"
                  ></button>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="login-form">
                <div className="mb-4">
                  <label htmlFor="username" className="form-label">
                    <i className="bi bi-person me-2"></i>Username
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-person"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="form-label">
                    <i className="bi bi-lock me-2"></i>Password
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <i className="bi bi-lock"></i>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control form-control-lg"
                      id="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      className="input-group-text bg-light"
                      type="button"
                      onClick={toggleShowPassword}
                    >
                      <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                    />
                    <label className="form-check-label" htmlFor="rememberMe">
                      Remember me
                    </label>
                  </div>
                </div>
                
                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i> Login
                      </>
                    )}
                  </button>
                </div>
              </form>
              
              <div className="text-center">
                <div className="alert alert-info" role="alert">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Demo Credentials:</strong> admin / admin123
                </div>
                
                <div className="mt-3">
                  <Link to="/" className="btn btn-link text-decoration-none">
                    <i className="bi bi-arrow-left me-1"></i> Back to Homepage
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;