import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BlogForm = ({ isEditing = false }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('events');
  const [attachment, setAttachment] = useState(null);
  const [currentAttachment, setCurrentAttachment] = useState(null);
  const [keepAttachment, setKeepAttachment] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  
  // Categories for the dropdown
  const categories = [
    { value: 'events', label: 'College Events' },
    { value: 'achievements', label: 'Student/Faculty Achievements' },
    { value: 'research', label: 'Research Papers' }
  ];
  
  useEffect(() => {
    if (isEditing) {
      const fetchBlog = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/api/blogs/${id}`);
          const blog = response.data;
          
          setTitle(blog.title);
          setContent(blog.content);
          setAuthor(blog.author);
          setCategory(blog.category || 'events');
          
          if (blog.attachment_url) {
            setCurrentAttachment({
              url: `http://localhost:5000${blog.attachment_url}`,
              type: blog.attachment_type
            });
          }
        } catch (err) {
          setError('Failed to fetch blog details. Please try again.');
          console.error(err);
        } finally {
          setFetchLoading(false);
        }
      };
      
      fetchBlog();
    }
  }, [isEditing, id]);
  
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
    }
  };
  
  const removeAttachment = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setAttachment(null);
  };
  
  const handleRemoveCurrentAttachment = () => {
    setKeepAttachment(false);
    setCurrentAttachment(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const token = localStorage.getItem('token');
    
    // Use FormData to handle file uploads
    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('author', author);
    formData.append('category', category);
    
    if (attachment) {
      formData.append('attachment', attachment);
    }
    
    if (isEditing && currentAttachment && keepAttachment) {
      formData.append('keepAttachment', 'true');
    }
    
    try {
      const headers = {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type header when using FormData; let the browser set it with the boundary
      };
      
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/blogs/${id}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/blogs', formData, { headers });
      }
      
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save blog. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to determine if the file is an image
  const isImage = (fileType) => {
    return fileType && fileType.startsWith('image/');
  };
  
  if (fetchLoading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <h2 className="mb-4">{isEditing ? 'Edit Article' : 'Create New Article'}</h2>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="title" className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="author" className="form-label">Author</label>
              <input
                type="text"
                className="form-control"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="category" className="form-label">Category</label>
              <select
                className="form-select"
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              <label htmlFor="content" className="form-label">Content</label>
              <textarea
                className="form-control"
                id="content"
                rows="10"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              ></textarea>
            </div>
            
            <div className="mb-3">
              <label htmlFor="attachment" className="form-label">
                Attachment (PDF or Images only, max 5MB)
              </label>
              <input
                type="file"
                className="form-control"
                id="attachment"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,image/*"
              />
              {attachment && (
                <div className="mt-2">
                  <span className="badge bg-info me-2">
                    {attachment.name} ({(attachment.size / 1024).toFixed(2)} KB)
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={removeAttachment}
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            
            {/* Display current attachment if editing */}
            {isEditing && currentAttachment && keepAttachment && (
              <div className="mb-3">
                <label className="form-label">Current Attachment</label>
                <div className="d-flex align-items-center">
                  {isImage(currentAttachment.type) ? (
                    <img
                      src={currentAttachment.url}
                      alt="Current attachment"
                      style={{ maxHeight: '100px', maxWidth: '200px' }}
                      className="me-3"
                    />
                  ) : (
                    <span className="badge bg-secondary me-3">PDF Document</span>
                  )}
                  <div>
                    <a
                      href={currentAttachment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm btn-outline-primary me-2"
                    >
                      View
                    </a>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleRemoveCurrentAttachment}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/admin')}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Saving...
                  </>
                ) : (
                  isEditing ? 'Update Article' : 'Publish Article'
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