import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

if (API_BASE_URL.includes('ngrok')) {
  apiClient.interceptors.request.use(config => {
    config.params = {
      ...config.params,
      'ngrok-skip-browser-warning': 'true'
    };
    return config;
  });
}