import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TECHFLASH_LOGO_LOGIN } from '../constants/branding';
import { passwordResetsAPI, passwordSetupAPI } from '../api/api';

const PASSWORD_HINT =
  'Use at least 6 characters with uppercase, lowercase, one number, and one special character.';

function passwordMeetsRules(pw) {
  if (!pw || pw.length < 6) return false;
  return /[A-Z]/.test(pw) && /[a-z]/.test(pw) && /\d/.test(pw) && /[^A-Za-z0-9]/.test(pw);
}

function secondsUntil(isoString) {
  if (!isoString) return 0;
  const ms = new Date(isoString).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 1000));
}

const inputClass =
  'mt-1 block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-[#3A7CA5] focus:border-[#3A7CA5] text-[#2E2E2E] text-base';

const primaryButtonClass =
  'w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#3A7CA5] hover:bg-[#2f6690] disabled:opacity-50';

const CreatePasswordPage = () => {
  const [searchParams] = useSearchParams();
  const prefillEmail = useMemo(() => searchParams.get('email')?.trim() || '', [searchParams]);

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(prefillEmail);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resendAvailableAt, setResendAvailableAt] = useState('');
  const [resendSeconds, setResendSeconds] = useState(0);

  useEffect(() => {
    if (prefillEmail) setEmail(prefillEmail);
  }, [prefillEmail]);

  useEffect(() => {
    if (!resendAvailableAt) {
      setResendSeconds(0);
      return undefined;
    }
    const tick = () => setResendSeconds(secondsUntil(resendAvailableAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resendAvailableAt]);

  const loginHref = `/login?email=${encodeURIComponent(email.trim())}`;

  const handleApiError = (err, fallback) => {
    setError(err?.message || fallback);
  };

  const handleStart = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const normalized = email.trim();
    if (!normalized || !normalized.includes('@')) {
      setError('Enter the email address you used to sign up for TechFlash.');
      return;
    }
    setLoading(true);
    try {
      const res = await passwordSetupAPI.start(normalized);
      if (res.status === 'already_setup') {
        setStep('already_setup');
        return;
      }
      if (res.status === 'not_eligible') {
        setError(
          res.error ||
            "We couldn't verify that email for password setup. Make sure you're using the same email you used to sign up for TechFlash."
        );
        return;
      }
      if (res.status === 'code_sent') {
        setChallengeId(res.challenge_id);
        setMaskedEmail(res.masked_email || '');
        setResendAvailableAt(res.resend_available_at || '');
        setCode('');
        setVerificationToken('');
        setStep('code');
        return;
      }
      setError(res.error || 'Could not start password setup.');
    } catch (err) {
      handleApiError(err, 'Could not start password setup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    const trimmedCode = code.replace(/\s+/g, '');
    if (!/^\d{6}$/.test(trimmedCode)) {
      setError('Enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      const res = await passwordSetupAPI.verify(challengeId, trimmedCode);
      if (res.status === 'verified') {
        setVerificationToken(res.verification_token);
        setStep('password');
        return;
      }
      setError(res.error || 'Could not verify that code.');
    } catch (err) {
      handleApiError(err, 'Could not verify that code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendSeconds > 0 || loading) return;
    setError('');
    setNotice('');
    setLoading(true);
    try {
      const res = await passwordSetupAPI.start(email.trim());
      if (res.status === 'already_setup') {
        setStep('already_setup');
        return;
      }
      if (res.status === 'not_eligible') {
        setError(
          res.error ||
            "We couldn't verify that email for password setup. Make sure you're using the same email you used to sign up for TechFlash."
        );
        return;
      }
      if (res.status === 'code_sent') {
        setChallengeId(res.challenge_id);
        setMaskedEmail(res.masked_email || '');
        setResendAvailableAt(res.resend_available_at || '');
        setCode('');
        setNotice('We sent a new verification code.');
        return;
      }
      setError(res.error || 'Could not resend the code.');
    } catch (err) {
      handleApiError(err, 'Could not resend the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (e) => {
    e.preventDefault();
    setError('');
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
      const res = await passwordSetupAPI.complete(
        challengeId,
        verificationToken,
        password,
        passwordConfirmation
      );
      if (res.status === 'password_created') {
        setPassword('');
        setPasswordConfirmation('');
        setVerificationToken('');
        setStep('success');
        return;
      }
      setError(res.error || (Array.isArray(res.errors) ? res.errors.join(', ') : 'Could not create password.'));
    } catch (err) {
      handleApiError(err, 'Could not create password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setNotice('');
    setLoading(true);
    try {
      await passwordResetsAPI.request(email.trim());
      setNotice('If an account exists for that email, we sent a password reset link.');
    } catch (err) {
      handleApiError(err, 'Could not start password reset.');
    } finally {
      setLoading(false);
    }
  };

  const heading =
    step === 'code'
      ? 'Verify your email'
      : step === 'password'
        ? 'Create your password'
        : step === 'success'
          ? 'Password created'
          : step === 'already_setup'
            ? 'Your account is already set up.'
            : 'Create your TechFlash password';

  return (
    <div className="min-h-screen bg-[#F7F7F7] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <img src={TECHFLASH_LOGO_LOGIN} alt="TechFlash" className="h-16 mx-auto object-contain" />
          <h1 className="mt-4 text-xl font-semibold text-[#2E2E2E]">{heading}</h1>
          {step === 'email' && (
            <p className="mt-2 text-gray-600">Enter the email address you used to sign up for TechFlash.</p>
          )}
          {step === 'code' && (
            <p className="mt-2 text-gray-600">
              We sent a verification code to {maskedEmail || 'your email'}.
            </p>
          )}
          {step === 'success' && (
            <p className="mt-2 text-gray-600">Your TechFlash account is ready.</p>
          )}
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-md rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>
          )}
          {notice && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded text-sm">{notice}</div>
          )}

          {step === 'email' && (
            <form onSubmit={handleStart} className="space-y-6">
              <div>
                <label htmlFor="setup-email" className="block text-sm font-medium text-[#2E2E2E]">
                  Email address
                </label>
                <input
                  type="email"
                  id="setup-email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading ? 'Checking…' : 'Continue'}
              </button>
              <p className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-[#3A7CA5] font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <label htmlFor="setup-code" className="block text-sm font-medium text-[#2E2E2E]">
                  6-digit verification code
                </label>
                <input
                  type="text"
                  id="setup-code"
                  name="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  className={`${inputClass} tracking-[0.4em] text-center text-lg`}
                />
              </div>
              <button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading ? 'Verifying…' : 'Verify'}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={loading || resendSeconds > 0}
                className="w-full text-sm text-[#3A7CA5] font-medium hover:underline disabled:text-gray-400 disabled:no-underline"
              >
                {resendSeconds > 0 ? `Resend code in ${resendSeconds}s` : 'Resend code'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setError('');
                  setNotice('');
                }}
                className="w-full text-sm text-gray-500 hover:underline"
              >
                Use a different email
              </button>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleComplete} className="space-y-6">
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
                  className={inputClass}
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
                  className={inputClass}
                />
              </div>
              <button type="submit" disabled={loading} className={primaryButtonClass}>
                {loading ? 'Saving…' : 'Create password'}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="space-y-6">
              <Link to={loginHref} className={`${primaryButtonClass} no-underline`}>
                Log in to TechFlash
              </Link>
            </div>
          )}

          {step === 'already_setup' && (
            <div className="space-y-4">
              <Link to={loginHref} className={`${primaryButtonClass} no-underline`}>
                Log in
              </Link>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="w-full text-sm text-[#3A7CA5] font-medium hover:underline disabled:opacity-50"
              >
                {loading ? 'Sending…' : 'Forgot password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePasswordPage;
