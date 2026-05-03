import { makeAutoObservable, runInAction } from 'mobx';
import { RootStore } from './RootStore';
import { AuthService } from '../services/AuthService';

export const AUTH_STORE = Symbol('AuthStore');

export interface AppLoadingState {
  isLoaded: boolean;
  error: { isError: boolean; message: string };
}

class AuthStore {
  private rootStore: RootStore;
  private authService: AuthService;

  private _authLoading: AppLoadingState = { isLoaded: true, error: { isError: false, message: '' } };

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.authService = new AuthService();
    makeAutoObservable(this);
  }

  get accessToken(): string | null {
    return this.rootStore.userStore.accessToken;
  }

  get isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  get authLoading(): AppLoadingState {
    return this._authLoading;
  }

  setAuthLoading(value: AppLoadingState) {
    this._authLoading = value;
  }

  async login(email: string, password: string): Promise<void> {
    this.setAuthLoading({ isLoaded: false, error: { isError: false, message: '' } });
    
    try {
      const response = await this.authService.login(email, password);
      runInAction(() => {
        this.rootStore.userStore.setAccessToken(response.token);
        this.rootStore.userStore.setUser({
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        });
        this.setAuthLoading({ isLoaded: true, error: { isError: false, message: '' } });
      });
    } catch (error: any) {
      runInAction(() => {
        this.setAuthLoading({
          isLoaded: true,
          error: { isError: true, message: error.response?.data?.message || 'Ошибка входа' },
        });
      });
      throw error;
    }
  }

  async register(email: string, password: string, fullName: string): Promise<void> {
    this.setAuthLoading({ isLoaded: false, error: { isError: false, message: '' } });
    
    try {
      const response = await this.authService.register(email, password, fullName);
      runInAction(() => {
        this.rootStore.userStore.setAccessToken(response.token);
        this.rootStore.userStore.setUser({
          id: response.userId,
          email: response.email,
          fullName: response.fullName,
          role: response.role,
        });
        this.setAuthLoading({ isLoaded: true, error: { isError: false, message: '' } });
      });
    } catch (error: any) {
      runInAction(() => {
        this.setAuthLoading({
          isLoaded: true,
          error: { isError: true, message: error.response?.data?.message || 'Ошибка регистрации' },
        });
      });
      throw error;
    }
  }

  logout(): void {
    this.rootStore.userStore.clearToken();
    this.rootStore.userStore.clearUser();
  }
}

export default AuthStore;