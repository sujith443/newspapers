import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(response.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Blog post not found.');
        } else {
          setError('Failed to fetch blog post. Please try again later.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlog();
  }, [id]);
  
  // Function to format date - improved to handle SQLite date strings
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Fallback to the original string
    }
  };
  
  // Function to get category label
  const getCategoryLabel = (categoryValue) => {
    const categories = {
      'events': 'College Events',
      'achievements': 'Student/Faculty Achievements',
      'research': 'Research Papers'
    };
    
    return categories[categoryValue] || categoryValue;
  };
  
  // Function to determine if the file is an image
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };
  
  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="my-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
        <div className="text-center mt-3">
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="my-5">
      <div className="card">
        <div className="card-body">
          <span className="badge bg-primary mb-2">{getCategoryLabel(blog.category)}</span>
          <h2 className="card-title">{blog.title}</h2>
          <h6 className="card-subtitle mb-3 text-muted">
            By {blog.author} | Published on {formatDate(blog.created_at)}
            {blog.updated_at !== blog.created_at && 
              ` | Updated on ${formatDate(blog.updated_at)}`}
          </h6>
          
          <div className="card-text blog-content mt-4">
            {blog.content}
          </div>
          
          {blog.attachment_url && (
            <div className="mt-4 p-3 bg-light rounded">
              <h5>Attachment</h5>
              {isImage(blog.attachment_type) ? (
                <div className="text-center my-3">
                  <img 
                    src={`http://localhost:5000${blog.attachment_url}`} 
                    alt="Attachment" 
                    className="img-fluid" 
                    style={{ maxHeight: '400px' }}
                  />
                </div>
              ) : (
                <div className="d-flex align-items-center">
                  <i className="bi bi-file-earmark-pdf fs-1 me-3 text-danger"></i>
                  <div>
                    <p className="mb-1">PDF Document</p>
                    <a 
                      href={`http://localhost:5000${blog.attachment_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary"
                    >
                      Open PDF
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-3">
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default BlogDetail;