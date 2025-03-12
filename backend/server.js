const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Debugging Middleware
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`, req.body);
  next();
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function(req, file, cb) {
    // Generate unique filename with original extension
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  }
});

// File filter to allow only PDFs and images
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/gif"
  ];
  
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF and image files are allowed!"), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB file size limit
  }
});

// Database setup
const db = new sqlite3.Database("./college_newspaper.db");

// JWT Secret
const JWT_SECRET = "college_newspaper_secret_key";

// Create and update tables
db.serialize(() => {
  console.log("Setting up database tables...");
  
  // Admins table
  db.run(`CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  // First create the blogs table if it doesn't exist (basic version)
  db.run(`CREATE TABLE IF NOT EXISTS blogs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    author TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  
  db.get("PRAGMA table_info(blogs)", (err, rows) => {
    // ...
    // Helper function to check if a column exists
    const columnExists = (columnName) => {
      return rows.some(row => row.name === columnName);
    };
    // ...
  });
  
  // Check if default admin exists, if not create one
  db.get("SELECT * FROM admins WHERE username = 'admin'", (err, admin) => {
    if (err) {
      console.error("Error checking for admin:", err);
      return;
    }
    
    if (!admin) {
      // Create default admin (username: admin, password: admin123)
      bcrypt.hash("admin123", 10, (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
          return;
        }
        
        db.run("INSERT INTO admins (username, password) VALUES (?, ?)", 
          ["admin", hash], 
          function(err) {
            if (err) {
              console.error("Error creating default admin:", err);
            } else {
              console.log("Default admin created");
            }
          }
        );
      });
    }
  });
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token." });
    }
    req.user = user;
    next();
  });
};

// Login route
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  
  db.get("SELECT * FROM admins WHERE username = ?", [username], (err, admin) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ message: "Server error." });
    }
    
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password." });
    }
    
    bcrypt.compare(password, admin.password, (err, match) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ message: "Server error." });
      }
      
      if (!match) {
        return res.status(401).json({ message: "Invalid username or password." });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { id: admin.id, username: admin.username }, 
        JWT_SECRET, 
        { expiresIn: "1h" }
      );
      
      res.json({ token, username: admin.username });
    });
  });
});

// Get all blogs with search functionality
app.get("/api/blogs", (req, res) => {
  const { search, category } = req.query;
  
  let query = "SELECT * FROM blogs";
  let params = [];
  
  if (search && category) {
    query += " WHERE (title LIKE ? OR content LIKE ? OR author LIKE ?) AND category = ?";
    params = [`%${search}%`, `%${search}%`, `%${search}%`, category];
  } else if (search) {
    query += " WHERE title LIKE ? OR content LIKE ? OR author LIKE ?";
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  } else if (category) {
    query += " WHERE category = ?";
    params = [category];
  }
  
  query += " ORDER BY created_at DESC";
  
  db.all(query, params, (err, blogs) => {
    if (err) {
      console.error("Error querying blogs:", err);
      return res.status(500).json({ message: "Server error." });
    }
    
    res.json(blogs);
  });
});

// Get blogs by category
app.get("/api/blogs/category/:category", (req, res) => {
  const { category } = req.params;
  
  db.all("SELECT * FROM blogs WHERE category = ? ORDER BY created_at DESC", [category], (err, blogs) => {
    if (err) {
      console.error("Error querying blogs by category:", err);
      return res.status(500).json({ message: "Server error." });
    }
    
    res.json(blogs);
  });
});



// Get a specific blog
app.get("/api/blogs/:id", (req, res) => {
  const { id } = req.params;
  
  db.get("SELECT * FROM blogs WHERE id = ?", [id], (err, blog) => {
    if (err) {
      console.error("Error querying blog:", err);
      return res.status(500).json({ message: "Server error." });
    }
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    
    res.json(blog);
  });
});

// Create a new blog with file upload (requires authentication)
app.post("/api/blogs", authenticateToken, upload.single("attachment"), (req, res) => {
  const { title, content, author, category = 'events' } = req.body;
  
  if (!title || !content || !author) {
    return res.status(400).json({ message: "Title, content, and author are required." });
  }
  
  // Get current timestamp
  const now = new Date().toISOString();
  
  // Check if there's a file attached
  let attachmentUrl = null;
  let attachmentType = null;
  
  if (req.file) {
    attachmentUrl = `/uploads/${req.file.filename}`;
    attachmentType = req.file.mimetype;
  }
  
  db.run(
    "INSERT INTO blogs (title, content, author, category, attachment_url, attachment_type, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [title, content, author, category, attachmentUrl, attachmentType, now, now],
    function(err) {
      if (err) {
        console.error("Error creating blog:", err);
        return res.status(500).json({ message: "Server error.", error: err.message });
      }
      
      res.status(201).json({ 
        id: this.lastID, 
        message: "Blog created successfully." 
      });
    }
  );
});

// Update a blog with file upload (requires authentication)
app.put("/api/blogs/:id", authenticateToken, upload.single("attachment"), (req, res) => {
  const { id } = req.params;
  const { title, content, author, category = 'events', keepAttachment } = req.body;
  
  if (!title || !content || !author) {
    return res.status(400).json({ message: "Title, content, and author are required." });
  }
  
  // Get current timestamp
  const now = new Date().toISOString();
  
  // First check if the blog exists and get its current attachment info
  db.get("SELECT attachment_url FROM blogs WHERE id = ?", [id], (err, blog) => {
    if (err) {
      console.error("Error querying blog:", err);
      return res.status(500).json({ message: "Server error." });
    }
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    
    let attachmentUrl = blog.attachment_url;
    let attachmentType = null;
    let oldAttachmentPath = null;
    
    // If there's an existing attachment and we're not keeping it
    if (attachmentUrl && keepAttachment !== 'true' && !req.file) {
      oldAttachmentPath = path.join(__dirname, attachmentUrl);
      attachmentUrl = null;
    }
    
    // If there's a new file, update attachment info
    if (req.file) {
      // If there's an old attachment, mark it for deletion
      if (blog.attachment_url) {
        oldAttachmentPath = path.join(__dirname, blog.attachment_url);
      }
      
      attachmentUrl = `/uploads/${req.file.filename}`;
      attachmentType = req.file.mimetype;
    }
    
    // Update the blog
    db.run(
      "UPDATE blogs SET title = ?, content = ?, author = ?, category = ?, attachment_url = ?, attachment_type = ?, updated_at = ? WHERE id = ?",
      [title, content, author, category, attachmentUrl, attachmentType, now, id],
      function(err) {
        if (err) {
          console.error("Error updating blog:", err);
          return res.status(500).json({ message: "Server error." });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ message: "Blog not found." });
        }
        
        // Delete old attachment file if needed
        if (oldAttachmentPath && fs.existsSync(oldAttachmentPath)) {
          try {
            fs.unlinkSync(oldAttachmentPath);
          } catch (unlinkErr) {
            console.error("Error deleting old attachment:", unlinkErr);
            // Continue despite error in deleting old file
          }
        }
        
        res.json({ message: "Blog updated successfully." });
      }
    );
  });
});

// Delete a blog (requires authentication)
app.delete("/api/blogs/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  
  // First get the blog to check if it has an attachment
  db.get("SELECT attachment_url FROM blogs WHERE id = ?", [id], (err, blog) => {
    if (err) {
      console.error("Error querying blog:", err);
      return res.status(500).json({ message: "Server error." });
    }
    
    if (!blog) {
      return res.status(404).json({ message: "Blog not found." });
    }
    
    // Delete the blog from database
    db.run("DELETE FROM blogs WHERE id = ?", [id], function(err) {
      if (err) {
        console.error("Error deleting blog:", err);
        return res.status(500).json({ message: "Server error." });
      }
      
      // Delete attachment file if exists
      if (blog.attachment_url) {
        const filePath = path.join(__dirname, blog.attachment_url);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (unlinkErr) {
            console.error("Error deleting attachment file:", unlinkErr);
            // Continue despite error in deleting file
          }
        }
      }
      
      res.json({ message: "Blog deleted successfully." });
    });
  });
});

// Error handling middleware for file uploads
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: "File too large. Maximum size is 5MB." });
    }
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  } else if (err) {
    console.error("Server error:", err);
    return res.status(500).json({ message: err.message || "Internal server error" });
  }
  next();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});