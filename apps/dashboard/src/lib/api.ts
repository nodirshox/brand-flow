import type { LoginRequest, AuthResponse } from "@/app/(auth)/sign-in/types";
import type {
  RegisterRequest,
  AuthResponse as RegisterAuthResponse,
} from "@/app/(auth)/sign-up/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function loginUser(
  credentials: LoginRequest
): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new ApiError(response.status, error.message || "Login failed", error);
  }

  return response.json();
}

export async function registerUser(
  credentials: RegisterRequest
): Promise<RegisterAuthResponse> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new ApiError(
      response.status,
      error.message || "Registration failed",
      error
    );
  }

  return response.json();
}

export async function getCurrentUser() {
  const accessToken = localStorage.getItem("accessToken");

  if (!accessToken) {
    throw new ApiError(401, "No access token found");
  }

  const response = await fetch(`${API_URL}/auth/me`, {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new ApiError(
      response.status,
      error.message || "Failed to fetch user",
      error
    );
  }

  return response.json();
}

export async function verifyEmail(token: string): Promise<{ message: string; verified: boolean }> {
  const response = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "An error occurred" }));
    throw new ApiError(
      response.status,
      error.message || "Email verification failed",
      error
    );
  }

  return response.json();
}
