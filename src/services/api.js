import axios from 'axios';

const API_BASE_URL = "https://dumpai-api.onrender.com/api/v1";
const api = axios.create({
    baseURL: API_BASE_URL,
});
//
// WHAT: Interceptor
// WHY: This automatically adds your JWT token to EVERY request so you don't have to.
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;