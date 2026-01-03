'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmail as verifyEmailApi, ApiError } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { loadUser } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>(
    'verifying',
  );
  const [errorMessage, setErrorMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Prevent multiple calls (React Strict Mode runs effects twice in dev)
      if (hasVerified.current) return;
      hasVerified.current = true;

      const token = searchParams.get('token');

      if (!token) {
        setStatus('error');
        setErrorMessage('Verification token is missing');
        return;
      }

      // Validate token format (6 digits)
      if (!/^\d{6}$/.test(token)) {
        setStatus('error');
        setErrorMessage('Invalid verification token format');
        return;
      }

      try {
        // Call API to verify email
        await verifyEmailApi(token);

        // If user is logged in, reload their user data to update isVerified status
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
          await loadUser();
        }

        setStatus('success');

        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } catch (error) {
        setStatus('error');
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage(
            'An error occurred during verification. Please try again.',
          );
        }
        console.error('Verification error:', error);
      }
    };

    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying Your Email
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-8 w-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Email Verified Successfully!
              </h2>
              <p className="text-gray-600 mb-4">
                Your email has been verified. Redirecting you to the
                dashboard...
              </p>
              <div className="flex justify-center">
                <div className="animate-pulse text-indigo-600">
                  Redirecting...
                </div>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <svg
                  className="h-8 w-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 mb-6">{errorMessage}</p>
              <button
                onClick={() => router.push('/sign-in')}
                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Go to Sign In
              </button>
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Having trouble?{' '}
          <a
            href="/support"
            className="text-indigo-600 hover:text-indigo-500"
          >
            Contact support
          </a>
        </p>
      </div>
    </div>
  );
}
