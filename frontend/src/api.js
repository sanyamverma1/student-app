// src/api.js
import axios from 'axios';

// Get the backend API URL from the environment variable.
// This variable will be replaced by its actual value during the build process.
const API_URL = process.env.REACT_APP_API_URL;

// Create a new instance of axios with a custom configuration.
const apiClient = axios.create({
  baseURL: API_URL, // This sets the base for all requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;