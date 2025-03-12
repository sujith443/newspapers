import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  
  // Categories for the filter
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'events', label: 'College Events', color: 'primary' },
    { value: 'achievements', label: 'Achievements', color: 'success' },
    { value: 'research', label: 'Research Papers', color: 'info' }
  ];
  
  const fetchBlogs = async (search = '', category = '') => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/blogs';
      const params = {};
      
      if (search) params.search = search;
      if (category) params.category = category;
      
      const response = await axios.get(url, { params });
      setBlogs(response.data);
    } catch (err) {
      setError('Failed to fetch blogs. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBlogs();
  }, []);
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(searchTerm, selectedCategory);
  };
  
  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setSelectedCategory(category);
    fetchBlogs(searchTerm, category);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setActiveCategory('');
    fetchBlogs('', '');
  };
  
  // Function to format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Fallback to the original string
    }
  };
  
  // Function to truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };
  
  // Function to get category badge
  const getCategoryBadge = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    if (!category) return null;
    
    return (
      <span className={`badge bg-${category.color} category-badge`}>
        {category.label}
      </span>
    );
  };
  
  // Function to render featured post
  const renderFeaturedPost = () => {
    if (blogs.length === 0) return null;
    
    const featuredPost = blogs[0];
    return (
      <div className="jumbotron p-4 p-md-5 text-white rounded bg-dark mb-4">
        <div className="row">
          <div className="col-md-8 px-0">
            <h1 className="display-5 font-weight-bold">{featuredPost.title}</h1>
            <div className="mb-2">
              {getCategoryBadge(featuredPost.category)}
            </div>
            <p className="lead my-3">{truncateContent(featuredPost.content, 200)}</p>
            <p className="lead mb-0">
              <Link to={`/blog/${featuredPost.id}`} className="text-white fw-bold">
                Continue reading...
              </Link>
            </p>
          </div>
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            {featuredPost.attachment_url && featuredPost.attachment_type?.startsWith('image/') ? (
              <img 
                src={`http://localhost:5000${featuredPost.attachment_url}`} 
                alt="Featured" 
                className="img-fluid rounded shadow"
                style={{ maxHeight: '200px' }}
              />
            ) : (
              <div className="text-center">
                <i className="bi bi-newspaper text-white" style={{ fontSize: '5rem' }}></i>
              </div>
            )}
          </div>
        </div>
        <div className="mt-2 text-white-50">
          <small>
            By {featuredPost.author} | Published on {formatDate(featuredPost.created_at)}
          </small>
        </div>
      </div>
    );
  };
  
  if (loading && blogs.length === 0) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  if (error && blogs.length === 0) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div>
      <div className="container py-4">
        <header className="mb-4 text-center">
          <h1 className="display-4 fw-bold">College Newspaper</h1>
          <p className="lead text-muted">Stay updated with the latest campus news, events, and research</p>
        </header>
        
        {/* Improved Search Bar */}
        <div className="search-container mb-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <form onSubmit={handleSearch} className="row g-2">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control form-control-lg border-start-0"
                      placeholder="Search for articles, topics, or authors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      aria-label="Search"
                    />
                    <button className="btn btn-primary px-4" type="submit">
                      Search
                    </button>
                  </div>
                </div>
                <div className="col-md-4 d-grid">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={clearFilters}
                    disabled={!searchTerm && !selectedCategory}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Clear Filters
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        {/* Category Pills */}
        <div className="category-filter mb-4">
          <div className="d-flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.value}
                className={`btn ${activeCategory === category.value ? 
                  `btn-${category.value ? category.color : 'primary'}` : 
                  'btn-outline-secondary'}`}
                onClick={() => handleCategoryClick(category.value)}
              >
                {category.value === '' ? 'All Articles' : category.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Featured Post */}
        {!searchTerm && !selectedCategory && blogs.length > 0 && renderFeaturedPost()}
        
        {/* Main Content */}
        {blogs.length === 0 ? (
          <div className="text-center my-5 py-5 bg-light rounded">
            <i className="bi bi-inbox text-muted" style={{ fontSize: '4rem' }}></i>
            <h3 className="mt-3">No articles found</h3>
            <p className="text-muted">
              {searchTerm || selectedCategory ? 
                'Try different search criteria or clear filters.' : 
                'Check back later for updates.'}
            </p>
          </div>
        ) : (
          <div className="row g-4">
            {/* Skip the first blog if it's displayed as featured and no filters are applied */}
            {(blogs.slice(searchTerm || selectedCategory ? 0 : 1)).map((blog) => (
              <div className="col-md-6 col-lg-4" key={blog.id}>
                <div className="card h-100 shadow-sm hover-card">
                  {blog.attachment_url && blog.attachment_type?.startsWith('image/') && (
                    <div className="card-img-wrapper" style={{ height: '180px', overflow: 'hidden' }}>
                      <img 
                        src={`http://localhost:5000${blog.attachment_url}`} 
                        className="card-img-top" 
                        alt={blog.title}
                        style={{ objectFit: 'cover', height: '100%', width: '100%' }}
                      />
                    </div>
                  )}
                  <div className="card-body">
                    <div className="mb-2">
                      {getCategoryBadge(blog.category)}
                      
                      {blog.attachment_url && !blog.attachment_type?.startsWith('image/') && (
                        <span className="badge bg-secondary ms-2">
                          <i className="bi bi-file-pdf me-1"></i> PDF
                        </span>
                      )}
                    </div>
                    <h5 className="card-title">{blog.title}</h5>
                    <p className="card-text text-muted small mb-2">
                      By {blog.author} | {formatDate(blog.created_at)}
                    </p>
                    <p className="card-text">{truncateContent(blog.content)}</p>
                  </div>
                  <div className="card-footer bg-white border-top-0">
                    <Link to={`/blog/${blog.id}`} className="btn btn-sm btn-outline-primary">
                      Read Full Article <i className="bi bi-arrow-right ms-1"></i>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;