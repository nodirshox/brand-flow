"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/api";

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loadUser: () => Promise<void>;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  const loadUser = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      setIsAuthenticated(false);
      setIsAuthLoading(false);
      return;
    }

    setIsAuthenticated(true);

    try {
      // Fetch user data from API
      const userData = await getCurrentUser();
      setUser(userData);
    } catch (error) {
      // If token is invalid, clear it and mark as unauthenticated
      console.error("Failed to fetch user:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const setUserAndPersist = (nextUser: User | null) => {
    setUser(nextUser);
    if (nextUser) {
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    router.push("/sign-in");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser: setUserAndPersist,
        logout,
        loadUser,
        isAuthenticated,
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
