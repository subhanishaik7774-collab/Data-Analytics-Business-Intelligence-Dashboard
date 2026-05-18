import axios from 'axios';

// Configure Axios Instance
const api = axios.create({
  baseURL: '', // Empty base URL is optimal. It automatically uses the current host + /api (e.g. localhost:3000/api proxied or live-url/api)
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Prefix URL with /api to ensure it goes to the API router
    if (!config.url.startsWith('http') && !config.url.startsWith('/api')) {
      config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    console.error('API Error Response:', message);
    return Promise.reject({
      status: error.response?.status,
      message: message,
      originalError: error
    });
  }
);

export default api;
