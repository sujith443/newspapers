import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BlogForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const contentRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'events'
  });
  const [attachment, setAttachment] = useState(null);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [keepAttachment, setKeepAttachment] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [formTouched, setFormTouched] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Categories for the dropdown
  const categories = [
    { value: 'events', label: 'College Events', icon: 'bi-calendar-event', color: 'info' },
    { value: 'achievements', label: 'Student/Faculty Achievements', icon: 'bi-trophy', color: 'success' },
    { value: 'research', label: 'Research Papers', icon: 'bi-journal-text', color: 'warning' }
  ];
  
  // Update form data
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFormTouched(true);
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
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
      return '';
    }
  };
  
  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
          const blog = response.data;
          
          setFormData({
            title: blog.title || '',
            content: blog.content || '',
            author: blog.author || '',
            category: blog.category || 'events'
          });
          
          if (blog.attachment_url) {
            setCurrentAttachment({
              url: `http://localhost:5000${blog.attachment_url}`,
              type: blog.attachment_type,
              name: blog.attachment_url.split('/').pop()
            });
          }
        } catch (err) {
          setError('Failed to fetch article details. Please try again.');
          console.error(err);
        } finally {
          setFetchLoading(false);
          setFormTouched(false);
        }
      };
      
      fetchBlog();
    }
  }, [isEditing, id]);
  
  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file type (PDF or images only)
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        setError('Only PDF and image files are allowed.');
        fileInputRef.current.value = '';
        return;
      }
      
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        fileInputRef.current.value = '';
        return;
      }
      
      setAttachment(file);
      setError('');
      setFormTouched(true);
    }
  };
  
  // Remove selected attachment
  const removeAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setAttachment(null);
    setFormTouched(true);
  };
  
  // Remove current attachment (when editing)
  const handleRemoveCurrentAttachment = () => {
    setKeepAttachment(false);
    setCurrentAttachment(null);
    setFormTouched(true);
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Content is required');
      return;
    }
    
    if (!formData.author.trim()) {
      setError('Author is required');
      return;
    }
    
    setError('');
    setLoading(true);
    
    const token = localStorage.getItem('token');
    
    // Use FormData to handle file uploads
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('content', formData.content);
    submitData.append('author', formData.author);
    submitData.append('category', formData.category);
    
    if (attachment) {
      submitData.append('attachment', attachment);
    }
    
    if (isEditing && currentAttachment && keepAttachment) {
      submitData.append('keepAttachment', 'true');
    }
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
      };
      
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/blogs/${id}`, submitData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/blogs', submitData, { headers });
      }
      
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save article. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle discard changes
  const handleDiscard = () => {
    if (!formTouched || window.confirm('Are you sure you want to discard your changes?')) {
      navigate('/admin');
    }
  };
  
  // Check if file is an image
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };
  
  // Get category information
  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };
  
  // Preview mode renderer
  const renderPreview = () => {
    const categoryInfo = getCategoryInfo(formData.category);
    
    return (
      <div className="preview-container">
        <div className="card shadow-sm mb-4">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Article Preview</h2>
              <button 
                className="btn btn-outline-primary"
                onClick={() => setPreviewMode(false)}
              >
                <i className="bi bi-pencil me-2"></i> Back to Editor
              </button>
            </div>
            
            <div className="preview-content">
              <div className="article-header mb-4">
                <div className="d-flex align-items-center mb-3">
                  <span className={`badge bg-${categoryInfo.color} px-3 py-2 rounded-pill`}>
                    <i className={`bi ${categoryInfo.icon} me-1`}></i> {categoryInfo.label}
                  </span>
                </div>
                
                <h1 className="display-5 fw-bold">{formData.title || 'Untitled Article'}</h1>
                
                <div className="d-flex align-items-center mt-3">
                  <div className="author-avatar me-2">
                    <span className="author-initial">
                      {formData.author ? formData.author.charAt(0).toUpperCase() : 'A'}
                    </span>
                  </div>
                  <div>
                    <span className="author-name">
                      {formData.author || 'Anonymous'}
                    </span>
                    <div className="text-muted small">
                      <i className="bi bi-clock me-1"></i> {formatDate(new Date())}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Preview Attachment (if exists) */}
              {(attachment || (currentAttachment && keepAttachment)) && (
                <div className="preview-attachment mb-4">
                  {attachment && isImage(attachment.type) ? (
                    <img 
                      src={URL.createObjectURL(attachment)} 
                      alt="Preview" 
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : currentAttachment && keepAttachment && isImage(currentAttachment.type) ? (
                    <img 
                      src={currentAttachment.url} 
                      alt="Preview" 
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: '400px' }}
                    />
                  ) : attachment && !isImage(attachment.type) ? (
                    <div className="pdf-preview">
                      <i className="bi bi-file-earmark-pdf display-4 text-danger"></i>
                      <div>
                        <h6 className="mb-1">PDF Document</h6>
                        <p className="text-muted mb-0">{attachment.name}</p>
                      </div>
                    </div>
                  ) : currentAttachment && keepAttachment && !isImage(currentAttachment.type) ? (
                    <div className="pdf-preview">
                      <i className="bi bi-file-earmark-pdf display-4 text-danger"></i>
                      <div>
                        <h6 className="mb-1">PDF Document</h6>
                        <p className="text-muted mb-0">{currentAttachment.name}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
              
              {/* Preview Content */}
              <div className="preview-article-content">
                {formData.content ? (
                  formData.content.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p className="text-muted">No content added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  // Loading state
  if (fetchLoading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-loader mb-3"></div>
        <p className="text-muted">Loading article data...</p>
      </div>
    );
  }
  
  // If in preview mode, show preview
  if (previewMode) {
    return renderPreview();
  }
  
  return (
    <div className="blog-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isEditing ? 'Edit Article' : 'Create New Article'}</h2>
        <div className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => setPreviewMode(true)}
            disabled={!formData.title && !formData.content}
          >
            <i className="bi bi-eye me-2"></i> Preview
          </button>
          {isEditing && (
            <Link 
              to={`/blog/${id}`}
              className="btn btn-outline-secondary"
              target="_blank"
            >
              <i className="bi bi-box-arrow-up-right me-2"></i> View Published
            </Link>
          )}
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <div className="d-flex align-items-center">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>{error}</div>
          </div>
          <button 
            type="button" 
            className="btn-close" 
            onClick={() => setError('')}
            aria-label="Close"
          ></button>
        </div>
      )}
      
      <div className="card border-0 shadow-sm">
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              <div className="col-md-8">
                <div className="mb-4">
                  <label htmlFor="title" className="form-label">
                    <i className="bi bi-type-h1 me-2"></i>Article Title
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    id="title"
                    name="title"
                    placeholder="Enter a descriptive title..."
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label htmlFor="content" className="form-label">
                    <i className="bi bi-file-text me-2"></i>Content
                  </label>
                  <textarea
                    className="form-control content-editor"
                    id="content"
                    name="content"
                    ref={contentRef}
                    rows="15"
                    placeholder="Write your article content here..."
                    value={formData.content}
                    onChange={handleChange}
                    required
                  ></textarea>
                  <div className="form-text">
                    Use double line breaks for new paragraphs.
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card bg-light border-0 mb-4">
                  <div className="card-body">
                    <h5 className="mb-3">Article Details</h5>
                    
                    <div className="mb-3">
                      <label htmlFor="author" className="form-label">Author</label>
                      <input
                        type="text"
                        className="form-control"
                        id="author"
                        name="author"
                        placeholder="Your name"
                        value={formData.author}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="category" className="form-label">Category</label>
                      <select
                        className="form-select"
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                      >
                        {categories.map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="attachment" className="form-label">
                        <i className="bi bi-paperclip me-2"></i>
                        Attachment (PDF or Images)
                      </label>
                      <input
                        type="file"
                        className="form-control"
                        id="attachment"
                        name="attachment"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,image/*"
                      />
                      <div className="form-text">
                        Maximum file size: 5MB
                      </div>
                      
                      {attachment && (
                        <div className="attachment-preview mt-3 p-2 bg-white rounded border">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {isImage(attachment.type) ? (
                                <i className="bi bi-image text-primary fs-4"></i>
                              ) : (
                                <i className="bi bi-file-pdf text-danger fs-4"></i>
                              )}
                            </div>
                            <div className="flex-grow-1 text-truncate">
                              <div className="small fw-bold">{attachment.name}</div>
                              <div className="text-muted small">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </div>
                            </div>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={removeAttachment}
                            >
                              <i className="bi bi-x-lg"></i>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Display current attachment if editing */}
                    {isEditing && currentAttachment && keepAttachment && (
                      <div className="current-attachment mb-3">
                        <label className="form-label">Current Attachment</label>
                        <div className="attachment-preview p-2 bg-white rounded border">
                          <div className="d-flex align-items-center">
                            <div className="me-2">
                              {isImage(currentAttachment.type) ? (
                                <i className="bi bi-image text-primary fs-4"></i>
                              ) : (
                                <i className="bi bi-file-pdf text-danger fs-4"></i>
                              )}
                            </div>
                            <div className="flex-grow-1">
                              <div className="small fw-bold">
                                {currentAttachment.name}
                              </div>
                              <div className="mt-1">
                                <a
                                  href={currentAttachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-sm btn-outline-primary me-2"
                                >
                                  <i className="bi bi-eye me-1"></i> View
                                </a>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={handleRemoveCurrentAttachment}
                                >
                                  <i className="bi bi-trash me-1"></i> Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                  </div>
                </div>
                
                {isEditing && (
                  <div className="alert alert-info">
                    <div className="d-flex">
                      <i className="bi bi-info-circle-fill me-2 fs-5"></i>
                      <div>
                        <strong>Editing Article</strong>
                        <p className="mb-0 small">
                          Originally published on {formatDate(new Date())}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={handleDiscard}
              >
                <i className="bi bi-x-circle me-2"></i>
                {formTouched ? 'Discard Changes' : 'Cancel'}
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {isEditing ? 'Updating...' : 'Publishing...'}
                  </>
                ) : (
                  <>
                    <i className={`bi ${isEditing ? 'bi-check-circle' : 'bi-send'} me-2`}></i>
                    {isEditing ? 'Update Article' : 'Publish Article'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BlogForm;