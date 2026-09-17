import axios from 'axios';

// 1. Create a base Axios instance pointing to your Laravel server
const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api',
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

export default api;