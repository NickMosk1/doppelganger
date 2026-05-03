import { AuthResponse } from "../shared";
import { api } from "../utils/api";

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/login", { email, password });
    return response.data;
  }

  async register(email: string, password: string, fullName: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>("/auth/register", { email, password, fullName });
    return response.data;
  }

  async getCurrentUser(): Promise<AuthResponse> {
    const response = await api.get<AuthResponse>("/auth/me");
    return response.data;
  }
}

export default AuthService;
