import axios from 'axios';

export const laravelAPI = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Accept': 'application/json' }
});

export const nodeAPI = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: { 'Accept': 'application/json' }
});

[laravelAPI, nodeAPI].forEach(api => {
  api.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
});
