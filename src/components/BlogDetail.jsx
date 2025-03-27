import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [blog, setBlog] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
        setBlog(response.data);
        
        // Simulate fetching related blogs
        // In a real app, you would make another API call
        // For now, let's simulate it
        fetchRelatedBlogs(response.data);
        
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError('Article not found. It may have been removed or relocated.');
        } else {
          setError('Failed to load the article. Please try again later.');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    window.scrollTo(0, 0);
    fetchBlog();
  }, [id]);
  
  // Simulate fetching related blogs
  const fetchRelatedBlogs = async (currentBlog) => {
    try {
      const response = await axios.get('http://localhost:5000/api/blogs');
      
      // Filter out the current blog and get blogs of the same category
      // In a real app, the API would handle this
      const related = response.data
        .filter(blog => blog.id !== parseInt(id) && blog.category === currentBlog.category)
        .slice(0, 3);
        
      setRelatedBlogs(related);
    } catch (err) {
      console.error('Error fetching related blogs:', err);
    }
  };
  
  // Function to format date
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
      return dateString; // Fallback
    }
  };
  
  // Function to get category label and info
  const getCategoryInfo = (categoryValue) => {
    const categories = {
      'events': { label: 'College Events', icon: 'bi-calendar-event', color: 'info' },
      'achievements': { label: 'Student/Faculty Achievements', icon: 'bi-trophy', color: 'success' },
      'research': { label: 'Research Papers', icon: 'bi-journal-text', color: 'warning' }
    };
    
    return categories[categoryValue] || { label: categoryValue, icon: 'bi-tag', color: 'primary' };
  };
  
  // Function to determine if the file is an image
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };
  
  // Function to truncate content for preview in related posts
  const truncateContent = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-loader mb-3"></div>
        <p className="text-muted">Loading article...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="my-5 text-center">
        <div className="error-container p-4">
          <i className="bi bi-exclamation-circle display-1 text-danger mb-3"></i>
          <h2 className="mb-4">Oops! Something went wrong</h2>
          <div className="alert alert-danger mb-4">
            {error}
          </div>
          <div className="d-flex justify-content-center gap-3">
            <button 
              onClick={() => navigate(-1)} 
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i> Go Back
            </button>
            <Link to="/" className="btn btn-primary">
              <i className="bi bi-house me-2"></i> Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Get category information
  const categoryInfo = getCategoryInfo(blog.category);
  
  return (
    <div className="blog-detail-page">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {/* Breadcrumb Navigation */}
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link 
                    to={`/?category=${blog.category}`}
                    className="text-decoration-none"
                  >
                    {categoryInfo.label}
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {blog.title}
                </li>
              </ol>
            </nav>
            
            {/* Article Header */}
            <header className="blog-header mb-5">
              <div className="d-flex align-items-center mb-3">
                <span className={`badge bg-${categoryInfo.color} me-2 px-3 py-2 rounded-pill`}>
                  <i className={`bi ${categoryInfo.icon} me-1`}></i> {categoryInfo.label}
                </span>
                
                <span className="text-muted">
                  <i className="bi bi-clock me-1"></i> {formatDate(blog.created_at)}
                </span>
              </div>
              
              <h1 className="display-4 fw-bold mb-4">{blog.title}</h1>
              
              <div className="d-flex align-items-center author-info">
                <div className="author-avatar me-3">
                  <span className="author-initial">{blog.author.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <h6 className="mb-0">By {blog.author}</h6>
                  {blog.updated_at !== blog.created_at && (
                    <small className="text-muted">
                      Updated on {formatDate(blog.updated_at)}
                    </small>
                  )}
                </div>
              </div>
            </header>
            
            {/* Featured Image (if exists) */}
            {blog.attachment_url && isImage(blog.attachment_type) && (
              <figure className="blog-featured-image mb-5">
                <img 
                  src={`http://localhost:5000${blog.attachment_url}`} 
                  alt={blog.title} 
                  className="img-fluid rounded shadow"
                />
              </figure>
            )}
            
            {/* Article Content */}
            <div className="blog-content mb-5">
              <div className="content-body">
                {blog.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
            
            {/* PDF Attachment (if exists) */}
            {blog.attachment_url && !isImage(blog.attachment_type) && (
              <div className="attachment-section p-4 bg-light rounded mb-5">
                <h5 className="mb-3">
                  <i className="bi bi-paperclip me-2"></i> Attached Document
                </h5>
                <div className="pdf-card">
                  <div className="pdf-icon">
                    <i className="bi bi-file-earmark-pdf"></i>
                  </div>
                  <div className="pdf-info">
                    <h6 className="mb-2">Document File</h6>
                    <p className="text-muted small mb-3">
                      View or download the attached PDF document
                    </p>
                    <a 
                      href={`http://localhost:5000${blog.attachment_url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn btn-outline-danger"
                    >
                      <i className="bi bi-file-earmark-pdf me-2"></i> View PDF
                    </a>
                  </div>
                </div>
              </div>
            )}
            
            {/* Share Links */}
            <div className="share-section mb-5">
              <h5 className="mb-3">Share this article</h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-primary">
                  <i className="bi bi-facebook"></i>
                </button>
                <button className="btn btn-outline-info">
                  <i className="bi bi-twitter-x"></i>
                </button>
                <button className="btn btn-outline-success">
                  <i className="bi bi-whatsapp"></i>
                </button>
                <button className="btn btn-outline-secondary">
                  <i className="bi bi-linkedin"></i>
                </button>
                <button className="btn btn-outline-dark">
                  <i className="bi bi-envelope"></i>
                </button>
              </div>
            </div>
            
            {/* Navigation between articles */}
            <div className="article-navigation d-flex justify-content-between py-4 border-top border-bottom mb-5">
              <button 
                className="btn btn-link text-decoration-none p-0"
                onClick={() => navigate(-1)}
              >
                <i className="bi bi-arrow-left me-2"></i> Back to Articles
              </button>
            </div>
            
            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
              <div className="related-articles mb-5">
                <h4 className="mb-4">Related Articles</h4>
                <div className="row g-4">
                  {relatedBlogs.map(relatedBlog => (
                    <div className="col-md-4" key={relatedBlog.id}>
                      <div className="card h-100 border-0 shadow-sm hover-card">
                        {relatedBlog.attachment_url && isImage(relatedBlog.attachment_type) ? (
                          <img 
                            src={`http://localhost:5000${relatedBlog.attachment_url}`} 
                            className="card-img-top" 
                            alt={relatedBlog.title} 
                            style={{ height: '140px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className={`card-img-top bg-${categoryInfo.color} text-white d-flex align-items-center justify-content-center`} style={{ height: '140px' }}>
                            <i className={`bi ${categoryInfo.icon} fs-1`}></i>
                          </div>
                        )}
                        <div className="card-body">
                          <h6 className="card-title">{relatedBlog.title}</h6>
                          <p className="card-text small text-muted">
                            {truncateContent(relatedBlog.content)}
                          </p>
                          <Link to={`/blog/${relatedBlog.id}`} className="stretched-link"></Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;