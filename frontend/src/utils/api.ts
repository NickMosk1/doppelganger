import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// По умолчанию 8081 (для Docker), можно переопределить через .env
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

console.log(`[API Client] Using API endpoint: ${API_BASE_URL}`);

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem('access_token');
      
      // ДОБАВЬТЕ ЭТО ЛОГИРОВАНИЕ
      console.log('[API Interceptor] URL:', config.url);
      console.log('[API Interceptor] Token exists:', !!token);
      console.log('[API Interceptor] Token value:', token ? token.substring(0, 30) + '...' : 'null');
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('[API Interceptor] Authorization header SET');
      } else {
        console.log('[API Interceptor] Authorization header NOT SET');
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Очищаем localStorage при 401
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export const api = apiClient.getClient();
