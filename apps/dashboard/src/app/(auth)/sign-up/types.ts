export enum UserRole {
  BUSINESS = 'BUSINESS',
  CREATOR = 'CREATOR',
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface UserResponse {
  id: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: UserResponse;
}
