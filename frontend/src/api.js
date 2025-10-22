// src/api.js
import axios from 'axios';

// Get the backend API URL from the environment variable.
// Fallback to localhost for development and relative path for production
const API_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000');

// Create a new instance of axios with a custom configuration.
const apiClient = axios.create({
  baseURL: API_URL, // This sets the base for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;