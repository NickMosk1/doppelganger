export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  fullName: string;
  role: UserRoles;
};

export interface LoginRequest {
  email: string;
  password: string;
};

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
};

export enum UserRoles {
  ADMIN = "ADMIN",
  ENGINEER = "ENGINEER",
  VIEWER = "VIEWER",
};
