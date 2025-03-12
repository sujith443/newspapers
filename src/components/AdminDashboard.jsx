import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Categories for the filter dropdown
  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'events', label: 'College Events' },
    { value: 'achievements', label: 'Student/Faculty Achievements' },
    { value: 'research', label: 'Research Papers' }
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
  
  // Function to format date - improved to handle SQLite date strings
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
  
  // Function to get category label
  const getCategoryLabel = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`http://localhost:5000/api/blogs/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh the blog list
      fetchBlogs(searchTerm, selectedCategory);
    } catch (err) {
      alert('Failed to delete blog post. Please try again.');
      console.error(err);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    fetchBlogs(searchTerm, selectedCategory);
  };
  
  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    fetchBlogs(searchTerm, category);
  };
  
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    fetchBlogs('', '');
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
      <div className="alert alert-danger my-5" role="alert">
        {error}
      </div>
    );
  }
  
  return (
    <div className="admin-dashboard">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <Link to="/admin/create" className="btn btn-success">
          Create New Article
        </Link>
      </div>
      
      {/* Search and filter section */}
      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSearch}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search articles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="btn btn-primary">
                    <i className="bi bi-search"></i> Search
                  </button>
                </div>
              </div>
              
              <div className="col-md-4">
                <select
                  className="form-select"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary w-100"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      {blogs.length === 0 ? (
        <div className="alert alert-info">
          No articles found. {searchTerm || selectedCategory ? 'Try different search criteria or ' : ''} 
          Create your first article by clicking the button above.
        </div>
      ) : (
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">Manage Articles</h5>
          </div>
          <div className="list-group list-group-flush">
            {blogs.map((blog) => (
              <div key={blog.id} className="list-group-item admin-blog-item">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-1">
                      {blog.title}
                      {blog.category && (
                        <span className="badge bg-primary ms-2">{getCategoryLabel(blog.category)}</span>
                      )}
                    </h5>
                    <small className="text-muted">
                      By {blog.author} | Published on {formatDate(blog.created_at)}
                      {blog.attachment_url && (
                        <span className="ms-2">
                          <i className="bi bi-paperclip"></i> Has attachment
                        </span>
                      )}
                    </small>
                  </div>
                  <div className="admin-actions">
                    <Link 
                      to={`/blog/${blog.id}`} 
                      className="btn btn-sm btn-outline-primary"
                    >
                      View
                    </Link>
                    <Link 
                      to={`/admin/edit/${blog.id}`} 
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="btn btn-sm btn-outline-danger"
                      disabled={deleteLoading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;