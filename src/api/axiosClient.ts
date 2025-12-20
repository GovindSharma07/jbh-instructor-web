import axios from 'axios';

const axiosClient = axios.create({
  baseURL: "http://localhost:5173/api",
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Token to every request
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;