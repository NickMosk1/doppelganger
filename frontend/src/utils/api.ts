import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import Injector from './injector';
import { AuthStore } from '../stores';
import { AUTH_STORE } from '../stores/identifiers';

const API_BASE_URL = 'http://localhost:8080/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const authStore = Injector.get<AuthStore>(AUTH_STORE);
      const token = authStore.accessToken;

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const authStore = Injector.get<AuthStore>(AUTH_STORE);
          authStore.logout();
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
