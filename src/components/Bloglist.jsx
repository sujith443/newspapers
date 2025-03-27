import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlogList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  
  const initialCategory = queryParams.get('category') || '';
  const initialSearch = queryParams.get('search') || '';
  const initialSort = queryParams.get('sort') || 'newest';
  
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortOption, setSortOption] = useState(initialSort);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  // Categories for the filter
  const categories = [
    { value: '', label: 'All Categories', icon: 'bi-grid', color: 'primary' },
    { value: 'events', label: 'College Events', icon: 'bi-calendar-event', color: 'info' },
    { value: 'achievements', label: 'Achievements', icon: 'bi-trophy', color: 'success' },
    { value: 'research', label: 'Research Papers', icon: 'bi-journal-text', color: 'warning' }
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'bi-arrow-down' },
    { value: 'oldest', label: 'Oldest First', icon: 'bi-arrow-up' },
    { value: 'a-z', label: 'A-Z', icon: 'bi-sort-alpha-down' },
    { value: 'z-a', label: 'Z-A', icon: 'bi-sort-alpha-up' }
  ];
  
  const itemsPerPage = 9;
  
  const fetchBlogs = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/blogs';
      const params = {
        page: currentPage,
        limit: itemsPerPage
      };
      
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory) params.category = selectedCategory;
      
      // Handle sorting
      switch (sortOption) {
        case 'oldest':
          params.sort = 'created_at';
          params.order = 'asc';
          break;
        case 'a-z':
          params.sort = 'title';
          params.order = 'asc';
          break;
        case 'z-a':
          params.sort = 'title';
          params.order = 'desc';
          break;
        default: // newest
          params.sort = 'created_at';
          params.order = 'desc';
      }
      
      const response = await axios.get(url, { params });
      
      // In a real app, the API would return pagination data
      // For now, just use the returned array
      setBlogs(response.data);
      
      // Simulate pagination data
      // In a real app, this would come from the API
      setTotalPages(Math.ceil(response.data.length / itemsPerPage));
      
    } catch (err) {
      setError('Failed to fetch articles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    // Update the URL with the current filters
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedCategory) params.set('category', selectedCategory);
    if (sortOption) params.set('sort', sortOption);
    if (currentPage > 1) params.set('page', currentPage);
    
    const newUrl = `${location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
    navigate(newUrl, { replace: true });
    
    fetchBlogs();
  }, [selectedCategory, sortOption, currentPage]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    fetchBlogs();
  };
  
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page when changing category
  };
  
  const handleSortChange = (option) => {
    setSortOption(option);
    setCurrentPage(1); // Reset to first page when changing sort
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortOption('newest');
    setCurrentPage(1);
    setShowFilters(false);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    try {
      return new Date(dateString).toLocaleDateString(undefined, options);
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString; // Fallback
    }
  };
  
  // Truncate content for preview
  const truncateContent = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };
  
  // Get category information
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };
  
  // Render featured post
  const renderFeaturedPost = () => {
    if (blogs.length === 0) return null;
    
    const featuredPost = blogs[0];
    const categoryInfo = getCategoryInfo(featuredPost.category);
    
    return (
      <section className="featured-post mb-5">
        <div className="card border-0 bg-dark text-white shadow-lg featured-card">
          <div className="overlay-bg"></div>
          
          {featuredPost.attachment_url && featuredPost.attachment_type?.startsWith('image/') ? (
            <img 
              src={`http://localhost:5000${featuredPost.attachment_url}`} 
              className="featured-img" 
              alt={featuredPost.title}
            />
          ) : (
            <div className="featured-default-bg"></div>
          )}
          
          <div className="card-img-overlay d-flex flex-column justify-content-end p-4 p-md-5">
            <div className="overlay-content">
              <div className="mb-3">
                <span className={`badge rounded-pill bg-${categoryInfo.color} px-3 py-2`}>
                  <i className={`bi ${categoryInfo.icon} me-1`}></i> {categoryInfo.label}
                </span>
                <span className="ms-2 text-white-50">
                  <i className="bi bi-clock me-1"></i> {formatDate(featuredPost.created_at)}
                </span>
              </div>
              
              <h1 className="display-4 fw-bold mb-3">{featuredPost.title}</h1>
              
              <p className="lead mb-4">
                {truncateContent(featuredPost.content, 220)}
              </p>
              
              <div className="d-flex flex-wrap align-items-center">
                <div className="d-flex align-items-center me-4 mb-2 mb-md-0">
                  <div className="author-avatar me-2">
                    <span className="author-initial">{featuredPost.author.charAt(0).toUpperCase()}</span>
                  </div>
                  <span className="text-white-50">By {featuredPost.author}</span>
                </div>
                
                <Link 
                  to={`/blog/${featuredPost.id}`} 
                  className="btn btn-light rounded-pill px-4"
                >
                  Read Full Article <i className="bi bi-arrow-right ms-2"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    return (
      <nav aria-label="Page navigation" className="my-5">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              aria-label="Previous"
            >
              <span aria-hidden="true">&laquo;</span>
            </button>
          </li>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <li 
              key={page} 
              className={`page-item ${currentPage === page ? 'active' : ''}`}
            >
              <button 
                className="page-link" 
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              aria-label="Next"
            >
              <span aria-hidden="true">&raquo;</span>
            </button>
          </li>
        </ul>
      </nav>
    );
  };
  
  // Render search and filter UI
  const renderSearchAndFilters = () => {
    return (
      <div className="search-and-filters mb-5">
        <div className="card shadow-sm border-0">
          <div className="card-body">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-lg-8">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search articles, topics, or authors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label="Search"
                  />
                  <button 
                    className="btn btn-primary px-4" 
                    type="submit"
                  >
                    Search
                  </button>
                </div>
              </div>
              
              <div className="col-lg-4 d-flex">
                <button
                  type="button"
                  className="btn btn-outline-secondary me-2 w-100"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <i className={`bi bi-funnel${showFilters ? '-fill' : ''} me-2`}></i>
                  Filters
                </button>
                
                <button
                  type="button"
                  className="btn btn-link text-danger"
                  onClick={clearFilters}
                  disabled={!searchTerm && !selectedCategory && sortOption === 'newest'}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Clear
                </button>
              </div>
            </form>
            
            {showFilters && (
              <div className="mt-3 pt-3 border-top">
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label"><i className="bi bi-tag me-2"></i>Category</label>
                    <div className="d-flex flex-wrap gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          className={`btn ${selectedCategory === category.value ? 
                            `btn-${category.color}` : 
                            `btn-outline-${category.color}`}`}
                          onClick={() => handleCategoryClick(category.value)}
                        >
                          <i className={`bi ${category.icon} me-1`}></i> {category.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <label className="form-label"><i className="bi bi-sort-down me-2"></i>Sort By</label>
                    <div className="d-flex flex-wrap gap-2">
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          className={`btn ${sortOption === option.value ? 
                            'btn-dark' : 'btn-outline-secondary'}`}
                          onClick={() => handleSortChange(option.value)}
                        >
                          <i className={`bi ${option.icon} me-1`}></i> {option.label}
                        </button>))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Render article cards
  const renderArticleCards = () => {
    // Skip the first blog if it's displayed as featured and no filters are applied
    const articlesToDisplay = (!searchTerm && !selectedCategory && sortOption === 'newest') 
      ? blogs.slice(1) 
      : blogs;
      
    if (articlesToDisplay.length === 0) {
      return (
        <div className="text-center my-5 py-5 empty-state">
          <i className="bi bi-newspaper display-1 text-muted"></i>
          <h3 className="mt-4">No articles found</h3>
          <p className="text-muted max-w-md mx-auto">
            {searchTerm || selectedCategory ? 
              'Try different search criteria or clear filters.' : 
              'Check back later for updates.'}
          </p>
          {(searchTerm || selectedCategory || sortOption !== 'newest') && (
            <button 
              className="btn btn-outline-primary mt-3"
              onClick={clearFilters}
            >
              <i className="bi bi-arrow-counterclockwise me-2"></i>
              Clear Filters
            </button>
          )}
        </div>
      );
    }
    
    return (
      <div className="row g-4">
        {articlesToDisplay.map((blog) => {
          const categoryInfo = getCategoryInfo(blog.category);
          
          return (
            <div className="col-md-6 col-lg-4" key={blog.id}>
              <div className="card h-100 border-0 shadow-sm article-card">
                {blog.attachment_url && blog.attachment_type?.startsWith('image/') ? (
                  <div className="card-img-top-wrapper">
                    <img 
                      src={`http://localhost:5000${blog.attachment_url}`} 
                      className="card-img-top" 
                      alt={blog.title}
                    />
                    <div className="category-pill">
                      <span className={`badge rounded-pill bg-${categoryInfo.color}`}>
                        <i className={`bi ${categoryInfo.icon} me-1`}></i> {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className={`card-img-top-wrapper category-bg-${categoryInfo.color}`}>
                    <div className="category-icon">
                      <i className={`bi ${categoryInfo.icon}`}></i>
                    </div>
                    <div className="category-pill">
                      <span className={`badge rounded-pill bg-${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="card-body">
                  <h5 className="card-title">{blog.title}</h5>
                  
                  <div className="d-flex align-items-center mb-3">
                    <div className="author-avatar-sm me-2">
                      <span className="author-initial-sm">{blog.author.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <span className="author-name">{blog.author}</span>
                      <div className="text-muted small">
                        <i className="bi bi-clock me-1"></i> {formatDate(blog.created_at)}
                      </div>
                    </div>
                  </div>
                  
                  <p className="card-text">{truncateContent(blog.content)}</p>
                </div>
                
                <div className="card-footer bg-white border-top-0">
                  <Link to={`/blog/${blog.id}`} className="btn btn-link text-decoration-none p-0">
                    Read Full Article <i className="bi bi-arrow-right ms-1"></i>
                  </Link>
                  
                  {blog.attachment_url && !blog.attachment_type?.startsWith('image/') && (
                    <span className="float-end badge bg-secondary">
                      <i className="bi bi-file-pdf me-1"></i> PDF Attached
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  // Loading state
  if (loading && blogs.length === 0) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-loader mb-3"></div>
        <p className="text-muted">Loading articles...</p>
      </div>
    );
  }
  
  // Error state
  if (error && blogs.length === 0) {
    return (
      <div className="alert alert-danger my-5 text-center" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i> {error}
        <div className="mt-3">
          <button 
            className="btn btn-danger" 
            onClick={fetchBlogs}
          >
            <i className="bi bi-arrow-repeat me-2"></i> Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="blog-list-page">
      <div className="container py-4">
        {/* Page Header */}
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold">SVIT Campus Chronicles</h1>
          <p className="lead text-muted">
            Discover the latest news, events, and achievements from Sri Vasavi Institute of Technology
          </p>
        </header>
        
        {/* Search and Filters */}
        {renderSearchAndFilters()}
        
        {/* Active Filters Summary */}
        {(searchTerm || selectedCategory !== '' || sortOption !== 'newest') && (
          <div className="active-filters mb-4 d-flex align-items-center">
            <div className="me-2"><strong>Active Filters:</strong></div>
            <div className="d-flex flex-wrap gap-2">
              {searchTerm && (
                <span className="badge bg-light text-dark p-2">
                  <i className="bi bi-search me-1"></i> Search: "{searchTerm}"
                </span>
              )}
              
              {selectedCategory && (
                <span className={`badge bg-${getCategoryInfo(selectedCategory).color} p-2`}>
                  <i className={`bi ${getCategoryInfo(selectedCategory).icon} me-1`}></i> 
                  {getCategoryInfo(selectedCategory).label}
                </span>
              )}
              
              {sortOption !== 'newest' && (
                <span className="badge bg-dark p-2">
                  <i className={`bi ${sortOptions.find(opt => opt.value === sortOption).icon} me-1`}></i> 
                  Sort: {sortOptions.find(opt => opt.value === sortOption).label}
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Featured Post (only show if no filters applied) */}
        {!searchTerm && !selectedCategory && sortOption === 'newest' && renderFeaturedPost()}
        
        {/* Articles Grid */}
        {renderArticleCards()}
        
        {/* Pagination */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default BlogList;