import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ isAuthenticated, username, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [expanded, setExpanded] = useState(false);
  
  // Handle navbar background change on scroll
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  const handleLogout = () => {
    onLogout();
    navigate('/');
    setExpanded(false);
  };
  
  const navClass = scrolled ? 'navbar-scrolled shadow-sm' : '';
  
  // Close mobile menu when navigating
  const handleNavClick = () => {
    if (expanded) {
      setExpanded(false);
    }
  };
  
  return (
    <nav className={`navbar navbar-expand-lg sticky-top ${navClass}`}>
      <div className="container">
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <span className="newspaper-icon me-2">
            <i className="bi bi-newspaper"></i>
          </span>
          <div>
            <span className="brand-title">SVIT News</span>
            <small className="d-block brand-tagline">Campus Chronicles</small>
          </div>
        </Link>
        
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setExpanded(!expanded)}
          aria-controls="navbarNav"
          aria-expanded={expanded ? "true" : "false"}
          aria-label="Toggle navigation"
        >
          <span className={`navbar-toggler-icon ${expanded ? 'open' : ''}`}></span>
        </button>
        
        <div className={`collapse navbar-collapse ${expanded ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
                onClick={handleNavClick}
              >
                <i className="bi bi-house-door me-1"></i> Home
              </Link>
            </li>
            
            <li className="nav-item dropdown">
              <a 
                className="nav-link dropdown-toggle" 
                href="#" 
                id="navbarCategories" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i className="bi bi-grid me-1"></i> Categories
              </a>
              <ul className="dropdown-menu" aria-labelledby="navbarCategories">
                <li>
                  <Link 
                    className="dropdown-item" 
                    to="/?category=events"
                    onClick={handleNavClick}
                  >
                    <i className="bi bi-calendar-event me-2"></i> College Events
                  </Link>
                </li>
                <li>
                  <Link 
                    className="dropdown-item" 
                    to="/?category=achievements"
                    onClick={handleNavClick}
                  >
                    <i className="bi bi-trophy me-2"></i> Achievements
                  </Link>
                </li>
                <li>
                  <Link 
                    className="dropdown-item" 
                    to="/?category=research"
                    onClick={handleNavClick}
                  >
                    <i className="bi bi-journal-text me-2"></i> Research Papers
                  </Link>
                </li>
              </ul>
            </li>
            
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="#"
                onClick={handleNavClick}
              >
                <i className="bi bi-info-circle me-1"></i> About
              </a>
            </li>
            
            <li className="nav-item">
              <a 
                className="nav-link" 
                href="#"
                onClick={handleNavClick}
              >
                <i className="bi bi-envelope me-1"></i> Contact
              </a>
            </li>
            
            {isAuthenticated && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
                  to="/admin"
                  onClick={handleNavClick}
                >
                  <i className="bi bi-speedometer2 me-1"></i> Dashboard
                </Link>
              </li>
            )}
          </ul>
          
          <div className="d-flex align-items-center nav-right">
            {isAuthenticated ? (
              <div className="user-menu dropdown">
                <a 
                  className="nav-link dropdown-toggle user-dropdown-toggle d-flex align-items-center" 
                  href="#" 
                  id="userDropdown" 
                  role="button" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <div className="avatar me-2">
                    <span className="avatar-text">{username.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="d-none d-sm-inline">{username}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/admin"
                      onClick={handleNavClick}
                    >
                      <i className="bi bi-speedometer2 me-2"></i> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link 
                      className="dropdown-item" 
                      to="/admin/create"
                      onClick={handleNavClick}
                    >
                      <i className="bi bi-plus-circle me-2"></i> New Article
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <button
                      className="dropdown-item text-danger"
                      onClick={handleLogout}
                    >
                      <i className="bi bi-box-arrow-right me-2"></i> Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link 
                className="btn btn-outline-primary login-btn" 
                to="/login"
                onClick={handleNavClick}
              >
                <i className="bi bi-person me-2"></i> Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;