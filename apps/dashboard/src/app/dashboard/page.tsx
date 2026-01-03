"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, isAuthenticated, isAuthLoading } = useAuth();

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    // Wait for auth state to hydrate from localStorage before redirecting
    if (isAuthLoading) return;

    // If not authenticated, redirect to sign-in
    if (!isAuthenticated) {
      router.push("/sign-in");
      return;
    }

    // If authenticated but user isn't loaded yet, stay on page and show loading UI
  }, [isAuthLoading, isAuthenticated, router]);

  // Show loading or redirect
  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-zinc-900 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
              BrandFlow Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6">
          {/* Welcome Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
              Welcome back!
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              You're logged in as{" "}
              <span className="font-medium text-zinc-900 dark:text-white">
                {user.email}
              </span>
            </p>
          </div>

          {/* User Information Card */}
          <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">
              Account Information
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Email
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Role
                </span>
                <span className="text-sm font-medium text-zinc-900 dark:text-white capitalize">
                  {user.role.toLowerCase()}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                  Status
                </span>
                <span
                  className={`text-sm font-medium ${
                    user.isVerified
                      ? "text-green-600 dark:text-green-400"
                      : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {user.isVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
