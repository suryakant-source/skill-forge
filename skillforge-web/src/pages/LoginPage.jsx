import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaRocket, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

/**
 * ============================================================================
 * SKILLFORGE LOGIN PAGE COMPONENT
 * ============================================================================
 * 
 * Purpose:
 * Authenticates registered users with their email and password, retrieving
 * a JWT Bearer token and user profile, and updating the global AuthContext.
 * 
 * State Variables Architecture:
 * 1. `formData` ({ email: '', password: '' }):
 *    Controlled component pattern tracking user inputs for immediate validation.
 * 2. `errors` ({ email?: '', password?: '' }):
 *    Holds specific inline validation messages under inputs before triggering server calls.
 * 3. `isLoading` (boolean):
 *    Prevents duplicate submissions, disables input controls, and reflects interactive button state.
 * 4. `showPassword` (boolean):
 *    Toggles password input type between 'password' and 'text' for enhanced user visibility.
 * 
 * Form Submission Flow:
 * 1. `handleSubmit` prevents default browser form reload.
 * 2. Performs client-side validation (checks if email is present and well-formed; checks password).
 * 3. If validation fails, sets local errors and halts.
 * 4. Sets `isLoading(true)` and invokes `authApi.login(formData)`.
 * 5. On HTTP 200:
 *    - Passes the response data into `auth.login(response.data || response)`
 *    - Displays success notification via `toast.success('Welcome back!')`
 *    - Seamlessly redirects to `/dashboard` via `navigate('/dashboard')`.
 * 6. On Error:
 *    - Displays server error or network message via `toast.error(error.message)`
 *    - Re-enables form controls.
 */
export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Controlled form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Inline field validation error state
  const [errors, setErrors] = useState({});

  // Loading spinner & button disabled state
  const [isLoading, setIsLoading] = useState(false);

  // Toggle password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Updates form state and clears associated field error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Client-side input validation
  const validateForm = () => {
    const newErrors = {};
    const emailTrimmed = formData.email.trim();

    if (!emailTrimmed) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side validation check
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 2. Call backend AuthController via authApi
      const response = await authApi.login({
        email: formData.email.trim(),
        password: formData.password,
      });

      // 3. Update global auth state & localStorage
      const authData = response.data || response;
      login(authData);

      // 4. User feedback & redirection
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      // 5. Handle network or authentication failures
      console.error('[Login Error]:', error);
      toast.error(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative selection:bg-primary/30 selection:text-white">
      {/* Background Soft Radiant Gradient Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-secondary/15 blur-[100px] pointer-events-none rounded-full" />

      {/* Centered Glassmorphism Card */}
      <div className="w-full max-w-md glass-card p-8 sm:p-10 relative z-10 border border-white/10 shadow-2xl rounded-2xl bg-surface/80">
        {/* Brand Logo & Heading */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white mb-4 shadow-lg shadow-primary/25 hover:scale-105 transition-transform">
            <FaRocket className="text-2xl" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-gray-400 text-sm mt-1.5">
            Sign in to access your SkillForge learning dashboard
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {/* Email Input Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <FaEnvelope className="text-sm" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                disabled={isLoading}
                className={`input-field pl-10 pr-4 py-2.5 text-sm bg-surface border transition-colors ${
                  errors.email
                    ? 'border-error focus:border-error'
                    : 'border-white/10 focus:border-primary'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-error mt-1.5 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Input Field */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <FaLock className="text-sm" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                disabled={isLoading}
                className={`input-field pl-10 pr-11 py-2.5 text-sm bg-surface border transition-colors ${
                  errors.password
                    ? 'border-error focus:border-error'
                    : 'border-white/10 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex="-1"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-error mt-1.5 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Full-width Gradient Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-btn py-3 mt-2 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </form>

        {/* Bottom Registration Link */}
        <div className="mt-8 pt-5 border-t border-white/10 text-center text-sm text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="text-secondary font-semibold hover:underline transition-colors"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
