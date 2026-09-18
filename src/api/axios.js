import axios from 'axios';

// 1. Assign the instance to the 'api' variable
const api = axios.create({
  baseURL: 'https://taskflow-api-7y9e.onrender.com/api', // Updated to live URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// 2. The Interceptor: Automatically attach the token to every request
api.interceptors.request.use((config) => {
    // Look inside the browser's local storage for our saved token
    const token = localStorage.getItem('access_token');
    
    // If it exists, attach it to the Authorization header
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
}, (error) => {
    return Promise.reject(error);
});

// 3. Export the 'api' variable once at the bottom
export default api;