import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Import Bootstrap CSS and JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import Bootstrap Icons
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import our custom styles
import './App.css';
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
