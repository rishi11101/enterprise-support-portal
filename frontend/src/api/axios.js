import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// attaches JWT token to every request, globally once so no need to attach on evry single request manually
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;