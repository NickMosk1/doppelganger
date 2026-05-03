import { UserRoles } from "./auth";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRoles;
  companyId?: string;
  companyName?: string;
  avatarUrl?: string;
  lastLoginAt?: string;
};

export interface Account {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
  user: User;
};
