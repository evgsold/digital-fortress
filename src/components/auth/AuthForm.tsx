'use client';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { useUser } from '@/contexts/UserContext';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export const AuthForm = ({ mode }: AuthFormProps) => {
  const tAuth = useTranslations('auth');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const { login, register, loginWithGoogle } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // new: validation state
  const [validationErrors, setValidationErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  // validation rules
  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_PASSWORD_LENGTH = 6;

  // map server error messages/codes to localized strings
  const mapServerError = (err: unknown) => {
    const msg = err instanceof Error ? err.message : String(err);
    // simple mapping by known substrings or keys
    if (/invalid credentials|invalid email or password/i.test(msg)) return tAuth('errors.invalidCredentials');
    if (/email already|already in use/i.test(msg)) return tAuth('errors.emailAlreadyInUse');
    if (/weak password/i.test(msg)) return tAuth('errors.weakPassword');
    if (/passwords do not match/i.test(msg)) return tAuth('errors.passwordsDoNotMatch');
    if (/invalid email/i.test(msg)) return tAuth('errors.invalidEmail');
    if (/required/i.test(msg)) return tAuth('errors.requiredField');
    // fallback to raw message (localized wrapper)
    return msg;
  };

  const validate = () => {
    const errs: { name?: string; email?: string; password?: string } = {};
    if (mode === 'register' && !name.trim()) errs.name = tAuth('errors.requiredField');
    if (!email.trim()) errs.email = tAuth('errors.requiredField');
    else if (!EMAIL_REGEX.test(email.trim())) errs.email = tAuth('errors.invalidEmail');
    if (!password) errs.password = tAuth('errors.requiredField');
    else if (password.length < MIN_PASSWORD_LENGTH) errs.password = tAuth('errors.weakPassword');
    setValidationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // client-side validation
    if (!validate()) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(email.trim(), password, name.trim());
      }
      router.push('/profile');
    } catch (err) {
      setError(mapServerError(err));
    } finally {
      setLoading(false);
    }
  };

  // clear specific validation error on change
  const handleNameChange = (v: string) => { setName(v); if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: undefined })); };
  const handleEmailChange = (v: string) => { setEmail(v); if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: undefined })); };
  const handlePasswordChange = (v: string) => { setPassword(v); if (validationErrors.password) setValidationErrors(prev => ({ ...prev, password: undefined })); };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      if (result !== null) {
        router.push('/profile');
      } else {
        setError(tAuth('continueWithGoogle')); // localized hint about redirect
        setTimeout(() => {
          if (loading) {
            setLoading(false);
            setError(tAuth('errors.invalidCredentials'));
          }
        }, 15000);
      }
    } catch (err) {
      setError(mapServerError(err));
      setLoading(false);
    }
  };

  const floatingVariants = {
    animate: {
      y: [-8, 8, -8],
      rotate: [0, 3, -3, 0],
      transition: {
        duration: 8,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden px-4">
      {/* Minimal geometric decorative elements */}
      <motion.div
        className="absolute top-20 left-10 w-2 h-32 bg-white/10"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-20 right-10 w-32 h-2 bg-white/10"
        variants={floatingVariants}
        animate="animate"
        transition={{ delay: 2 }}
      />

      <motion.div
        className="relative w-full max-w-md space-y-6 sm:space-y-8 p-8 sm:p-12 bg-white border border-gray-300"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="text-center">
          <motion.div
            className="inline-flex items-center gap-3 px-4 py-2 bg-black text-white mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Shield className="w-4 h-4" />
            <span className="text-sm font-mono font-semibold tracking-wider">DIGITAL FORTRESS</span>
          </motion.div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black font-mono">
            {mode === 'login' ? tAuth('login.title') : tAuth('register.title')}
          </h2>
        </div>
        <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label htmlFor="name" className="sr-only">
                  {tCommon('name')}
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-black bg-white focus:outline-none focus:border-black transition-colors text-base font-mono"
                  placeholder={tCommon('name')}
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
                {validationErrors.name && <div className="text-black text-sm mt-2 font-mono">{validationErrors.name}</div>}
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                {tCommon('email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-black bg-white focus:outline-none focus:border-black transition-colors text-base font-mono"
                placeholder={tCommon('email')}
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
              />
              {validationErrors.email && <div className="text-black text-sm mt-2 font-mono">{validationErrors.email}</div>}
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {tCommon('password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 border-2 border-gray-300 placeholder-gray-500 text-black bg-white focus:outline-none focus:border-black transition-colors text-base font-mono"
                placeholder={tCommon('password')}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
              />
              {validationErrors.password && <div className="text-black text-sm mt-2 font-mono">{validationErrors.password}</div>}
            </div>
          </div>

          {error && <div className="text-black text-sm text-center font-medium p-3 bg-gray-100 border border-gray-300 font-mono">{error}</div>}

          <div className="space-y-4">
            <motion.button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border-2 border-black text-sm font-semibold text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                mode === 'login' ? tAuth('signIn') : tAuth('signUp')
              )}
            </motion.button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{tAuth('or')}</span>
              </div>
            </div>

            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 text-sm font-semibold text-black bg-white hover:bg-gray-100 focus:outline-none focus:border-black disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-mono"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="hidden sm:inline">{tAuth('continueWithGoogle')}</span>
              <span className="sm:hidden">Google</span>
            </motion.button>

            <div className="text-center text-sm text-black font-mono">
              {mode === 'login' ? (
                <>
                  {tAuth('noAccount')}{' '}
                  <Link href="/register" className="font-semibold text-black hover:underline">
                    {tAuth('switchToRegister')}
                  </Link>
                </>
              ) : (
                <>
                  {tAuth('haveAccount')}{' '}
                  <Link href="/login" className="font-semibold text-black hover:underline">
                    {tAuth('switchToLogin')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};