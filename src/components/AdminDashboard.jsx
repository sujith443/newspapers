import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [stats, setStats] = useState({
    total: 0,
    events: 0,
    achievements: 0,
    research: 0,
    thisWeek: 0
  });
  
  // Categories for the filter dropdown
  const categories = [
    { value: '', label: 'All Categories', color: 'secondary', icon: 'bi-grid' },
    { value: 'events', label: 'College Events', color: 'info', icon: 'bi-calendar-event' },
    { value: 'achievements', label: 'Achievements', color: 'success', icon: 'bi-trophy' },
    { value: 'research', label: 'Research Papers', color: 'warning', icon: 'bi-journal-text' }
  ];
  
  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: 'bi-arrow-down' },
    { value: 'oldest', label: 'Oldest First', icon: 'bi-arrow-up' },
    { value: 'a-z', label: 'Title (A-Z)', icon: 'bi-sort-alpha-down' },
    { value: 'z-a', label: 'Title (Z-A)', icon: 'bi-sort-alpha-up' }
  ];
  
  const fetchBlogs = async (search = '', category = '', sort = 'newest') => {
    setLoading(true);
    try {
      let url = 'http://localhost:5000/api/blogs';
      const params = {};
      
      if (search) params.search = search;
      if (category) params.category = category;
      
      // Handle sorting
      switch (sort) {
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
      setBlogs(response.data);
      
      // Calculate stats
      calculateStats(response.data);
    } catch (err) {
      setError('Failed to fetch articles. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate dashboard stats
  const calculateStats = (data) => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: data.length,
      events: data.filter(blog => blog.category === 'events').length,
      achievements: data.filter(blog => blog.category === 'achievements').length,
      research: data.filter(blog => blog.category === 'research').length,
      thisWeek: data.filter(blog => {
        const blogDate = new Date(blog.created_at);
        return blogDate >= oneWeekAgo;
      }).length
    };
    
    setStats(stats);
  };
  
  useEffect(() => {
    fetchBlogs();
  }, []);
  
  // Function to format date
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
  
  // Get relative time for "time ago" display
  const getTimeAgo = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now - date;
      
      // Convert to seconds
      const diffSeconds = Math.floor(diffMs / 1000);
      
      if (diffSeconds < 60) {
        return 'just now';
      }
      
      // Convert to minutes
      const diffMinutes = Math.floor(diffSeconds / 60);
      
      if (diffMinutes < 60) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
      }
      
      // Convert to hours
      const diffHours = Math.floor(diffMinutes / 60);
      
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      }
      
      // Convert to days
      const diffDays = Math.floor(diffHours / 24);
      
      if (diffDays < 30) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      }
      
      // Convert to months
      const diffMonths = Math.floor(diffDays / 30);
      
      if (diffMonths < 12) {
        return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
      }
      
      // Convert to years
      const diffYears = Math.floor(diffMonths / 12);
      return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
    } catch (e) {
      console.error('Error calculating time ago:', e);
      return '';
    }
  };
  
  // Function to get category info
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this article? This action cannot be undone.')) {
      return;
    }
    
    setDeleteLoading(true);
    setDeletingId(id);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh the blog list
      fetchBlogs(searchTerm, selectedCategory, sortOption);
    } catch (err) {
      alert('Failed to delete article. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
      setDeletingId(null);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(searchTerm, selectedCategory, sortOption);
  };
  
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    fetchBlogs(searchTerm, category, sortOption);
  };
  
  const handleSortChange = (e) => {
    const sort = e.target.value;
    setSortOption(sort);
    fetchBlogs(searchTerm, selectedCategory, sort);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSortOption('newest');
    fetchBlogs('', '', 'newest');
  };
  
  // Determine if the file is an image
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };
  
  if (loading && blogs.length === 0) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-loader mb-3"></div>
        <p className="text-muted">Loading dashboard...</p>
      </div>
    );
  }
  
  if (error && blogs.length === 0) {
    return (
      <div className="alert alert-danger my-5" role="alert">
        <div className="d-flex align-items-center">
          <i className="bi bi-exclamation-triangle-fill fs-3 me-3"></i>
          <div>
            <h5 className="mb-1">Error Loading Dashboard</h5>
            <p className="mb-0">{error}</p>
          </div>
        </div>
        <div className="text-center mt-3">
          <button 
            className="btn btn-danger" 
            onClick={() => fetchBlogs()}
          >
            <i className="bi bi-arrow-repeat me-2"></i> Try Again
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <h1 className="mb-4 dashboard-title">
        <i className="bi bi-speedometer2 me-2"></i>
        Admin Dashboard
      </h1>
      
      {/* Stats Cards */}
      <div className="row stats-cards mb-4 g-3">
        <div className="col-md-6 col-lg-3">
          <div className="card bg-primary text-white h-100 dashboard-stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">Total Articles</h6>
                  <h2 className="mb-0">{stats.total}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-newspaper"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="card bg-info text-white h-100 dashboard-stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">College Events</h6>
                  <h2 className="mb-0">{stats.events}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-calendar-event"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="card bg-success text-white h-100 dashboard-stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-white-50">Achievements</h6>
                  <h2 className="mb-0">{stats.achievements}</h2>
                </div>
                <div className="stat-icon">
                  <i className="bi bi-trophy"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="col-md-6 col-lg-3">
          <div className="card bg-warning h-100 dashboard-stat-card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-dark">Research Papers</h6>
                  <h2 className="mb-0 text-dark">{stats.research}</h2>
                </div>
                <div className="stat-icon text-dark">
                  <i className="bi bi-journal-text"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-list-ul me-2"></i> Manage Articles
          </h5>
          <Link to="/admin/create" className="btn btn-success">
            <i className="bi bi-plus-lg me-2"></i> Create New Article
          </Link>
        </div>
        
        <div className="card-body">
          {/* Search and filter section */}
          <div className="admin-filters mb-4">
            <form onSubmit={handleSearch} className="row g-3">
              <div className="col-md-5">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search by title, content, or author..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    Search
                  </button>
                </div>
              </div>
              
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  aria-label="Filter by category"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-3">
                <select
                  className="form-select"
                  value={sortOption}
                  onChange={handleSortChange}
                  aria-label="Sort by"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-1">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                  disabled={!searchTerm && !selectedCategory && sortOption === 'newest'}
                >
                  <i className="bi bi-x-circle"></i>
                </button>
              </div>
            </form>
          </div>
          
          {blogs.length === 0 ? (
            <div className="text-center my-5 empty-state">
              <i className="bi bi-file-earmark-text display-1 text-muted"></i>
              <h4 className="mt-3">No Articles Found</h4>
              <p className="text-muted">
                {searchTerm || selectedCategory ? 
                  'Try different search criteria or clear filters.' : 
                  'Get started by creating your first article.'}
              </p>
              <div className="mt-3">
                {(searchTerm || selectedCategory || sortOption !== 'newest') ? (
                  <button 
                    onClick={clearFilters} 
                    className="btn btn-outline-secondary me-2"
                  >
                    <i className="bi bi-x-circle me-2"></i> Clear Filters
                  </button>
                ) : (
                  <Link to="/admin/create" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i> Create Your First Article
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead className="table-light">
                  <tr>
                    <th scope="col" width="45%">Article</th>
                    <th scope="col" className="text-center">Category</th>
                    <th scope="col" className="text-center">Published</th>
                    <th scope="col" className="text-center">Attachment</th>
                    <th scope="col" className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {blogs.map((blog) => {
                    const categoryInfo = getCategoryInfo(blog.category);
                    
                    return (
                      <tr key={blog.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="article-thumbnail me-3">
                              {blog.attachment_url && isImage(blog.attachment_type) ? (
                                <img 
                                  src={`http://localhost:5000${blog.attachment_url}`} 
                                  alt={blog.title} 
                                  className="thumbnail-img"
                                />
                              ) : (
                                <div className={`thumbnail-placeholder bg-${categoryInfo.color} text-white`}>
                                  <i className={`bi ${categoryInfo.icon}`}></i>
                                </div>
                              )}
                            </div>
                            <div>
                              <h6 className="mb-1">{blog.title}</h6>
                              <small className="text-muted">
                                By {blog.author}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className={`badge bg-${categoryInfo.color}`}>
                            <i className={`bi ${categoryInfo.icon} me-1`}></i>
                            {categoryInfo.label}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column">
                            <span>{formatDate(blog.created_at)}</span>
                            <small className="text-muted">
                              {getTimeAgo(blog.created_at)}
                            </small>
                          </div>
                        </td>
                        <td className="text-center">
                          {blog.attachment_url ? (
                            <span className={`badge bg-${isImage(blog.attachment_type) ? 'info' : 'danger'}`}>
                              <i className={`bi ${isImage(blog.attachment_type) ? 'bi-image' : 'bi-file-pdf'} me-1`}></i>
                              {isImage(blog.attachment_type) ? 'Image' : 'PDF'}
                            </span>
                          ) : (
                            <span className="badge bg-light text-dark">
                              <i className="bi bi-dash-circle me-1"></i>
                              None
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="d-flex justify-content-center gap-2">
                            <Link 
                              to={`/blog/${blog.id}`} 
                              className="btn btn-sm btn-outline-primary"
                              title="View Article"
                            >
                              <i className="bi bi-eye"></i>
                            </Link>
                            <Link 
                              to={`/admin/edit/${blog.id}`} 
                              className="btn btn-sm btn-outline-secondary"
                              title="Edit Article"
                            >
                              <i className="bi bi-pencil"></i>
                            </Link>
                            <button
                              onClick={() => handleDelete(blog.id)}
                              className="btn btn-sm btn-outline-danger"
                              disabled={deleteLoading && deletingId === blog.id}
                              title="Delete Article"
                            >
                              {deleteLoading && deletingId === blog.id ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;