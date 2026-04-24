import React, { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TECHFLASH_LOGO_LOGIN } from '../constants/branding';
import { passwordResetsAPI } from '../api/api';
import { auth } from '../auth';

const PASSWORD_HINT =
  'Use at least 6 characters with uppercase, lowercase, one number, and one special character.';

function passwordMeetsRules(pw) {
  if (!pw || pw.length < 6) return false;
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!token) {
      setError('This link is missing a token. Open the link from your email.');
      return;
    }
    if (!passwordMeetsRules(password)) {
      setError(PASSWORD_HINT);
      return;
    }
    if (password !== passwordConfirmation) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await passwordResetsAPI.complete(token, password, passwordConfirmation);
      if (res.token && res.user) {
        auth.setToken(res.token);
        auth.setUser(res.user);
      }
      setDone(true);
      const role = res.role;
      const dest =
        role === 'company'
          ? '/dashboard?welcome=1'
          : role === 'technician'
            ? '/jobs?welcome=1'
            : '/login';
      setTimeout(() => {
        if (res.token && res.user) {
          window.location.assign(dest);
        } else {
          window.location.assign('/login');
        }
      }, 600);
    } catch (err) {
      setError(err.message || 'Could not update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img src={TECHFLASH_LOGO_LOGIN} alt="TechFlash" className="h-16 mx-auto object-contain" />
          <p className="mt-3 text-gray-600">Set a secure password for your account.</p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10">
          {done ? (
            <p className="text-center text-gray-700">Password saved. Taking you to TechFlash…</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
              )}
              {!token && (
                <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded p-3">
                  Use the link from your email. If it expired, ask your admin to resend or use account recovery when
                  available.
                </p>
              )}
              <p className="text-xs text-gray-600">{PASSWORD_HINT}</p>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-[#2E2E2E]">
                  New password
                </label>
                <input
                  type="password"
                  id="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#3A7CA5] focus:border-[#3A7CA5] text-[#2E2E2E]"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-[#2E2E2E]">
                  Confirm password
                </label>
                <input
                  type="password"
                  id="confirm-password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#3A7CA5] focus:border-[#3A7CA5] text-[#2E2E2E]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3A7CA5] hover:bg-[#2f6690] disabled:opacity-50"
              >
                {loading ? 'Saving…' : 'Save password & continue'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-[#3A7CA5] font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
