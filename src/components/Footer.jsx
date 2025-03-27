import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-dark text-white py-5 mt-5">
      <div className="container">
        <div className="row g-4">
          <div className="col-lg-4">
            <h5 className="text-uppercase fw-bold mb-4">
              <i className="bi bi-newspaper me-2"></i>
              SVIT News
            </h5>
            <p className="mb-3">
              The official news platform for SVIT students and faculty.
              Stay updated with latest campus news, events, and academic achievements.
            </p>
            <div className="d-flex gap-3 social-icons">
              <a href="#" className="text-white" aria-label="Facebook">
                <i className="bi bi-facebook"></i>
              </a>
              <a href="#" className="text-white" aria-label="Twitter">
                <i className="bi bi-twitter-x"></i>
              </a>
              <a href="#" className="text-white" aria-label="Instagram">
                <i className="bi bi-instagram"></i>
              </a>
              <a href="#" className="text-white" aria-label="LinkedIn">
                <i className="bi bi-linkedin"></i>
              </a>
            </div>
          </div>
          
          <div className="col-lg-2 col-md-6">
            <h5 className="text-uppercase fw-bold mb-4">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> Home
                </Link>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> Events
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> Achievements
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> Research
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h5 className="text-uppercase fw-bold mb-4">College Resources</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> SVIT Official Website
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> Academic Calendar
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> E-Learning Portal
                </a>
              </li>
              <li className="mb-2">
                <a href="#" className="text-white text-decoration-none hover-link">
                  <i className="bi bi-chevron-right me-1 small"></i> Career Services
                </a>
              </li>
            </ul>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <h5 className="text-uppercase fw-bold mb-4">Contact</h5>
            <p className="mb-2">
              <i className="bi bi-geo-alt-fill me-2"></i> 
              SVIT, Andhra Pradesh, India
            </p>
            <p className="mb-2">
              <i className="bi bi-envelope-fill me-2"></i>
              info@svit.edu.in
            </p>
            <p className="mb-2">
              <i className="bi bi-telephone-fill me-2"></i>
              +91 123 456 7890
            </p>
          </div>
        </div>
        
        <hr className="my-4" />
        
        <div className="row align-items-center">
          <div className="col-md-7 col-lg-8">
            <p className="mb-md-0">
              © {currentYear} <strong>SVIT College News & Publications</strong>. All rights reserved.
            </p>
          </div>
          
          <div className="col-md-5 col-lg-4">
            <div className="text-md-end">
              <ul className="list-inline mb-0">
                <li className="list-inline-item">
                  <a href="#" className="text-white text-decoration-none hover-link small">
                    Privacy Policy
                  </a>
                </li>
                <li className="list-inline-item">
                  <span className="text-white mx-2">|</span>
                </li>
                <li className="list-inline-item">
                  <a href="#" className="text-white text-decoration-none hover-link small">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;