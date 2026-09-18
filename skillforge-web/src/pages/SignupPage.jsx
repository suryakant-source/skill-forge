import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaRocket,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/authApi';
import toast from 'react-hot-toast';

/**
 * ============================================================================
 * SKILLFORGE SIGNUP PAGE COMPONENT
 * ============================================================================
 * 
 * Purpose:
 * Enables prospective learners to register an account on SkillForge.
 * Validates password complexity in real-time, ensures password confirmation matches,
 * posts the registration to AuthController, logs the user in upon success,
 * and navigates directly to `/dashboard`.
 * 
 * State Variables:
 * 1. `formData` ({ name, email, password, confirmPassword }): Controlled inputs.
 * 2. `errors` (object): Field-level errors displayed underneath each input.
 * 3. `isLoading` (boolean): Button disable state and spinner status during API call.
 * 4. `showPassword`, `showConfirmPassword` (booleans): Visibility toggles for passwords.
 * 
 * Validation Criteria:
 * - Full Name: Minimum 2 characters.
 * - Email: Standard regex format check.
 * - Password:
 *   - At least 8 characters
 *   - At least one uppercase letter ([A-Z])
 *   - At least one lowercase letter ([a-z])
 *   - At least one number ([0-9])
 * - Confirm Password: Exact match with Password.
 */
export const SignupPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Controlled input states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Inline field validation error strings
  const [errors, setErrors] = useState({});

  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Show/Hide password toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Real-time password criteria evaluation
  const hasMinLength = formData.password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(formData.password);
  const hasLowerCase = /[a-z]/.test(formData.password);
  const hasNumber = /[0-9]/.test(formData.password);
  const isPasswordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber;

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Comprehensive client validation on form submit
  const validateForm = () => {
    const newErrors = {};

    // 1. Name validation
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Full Name must be at least 2 characters';
    }

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }

    // 3. Password requirements validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isPasswordValid) {
      newErrors.password = 'Password does not meet the requirements below';
    }

    // 4. Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Do not call API if any errors exist
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Call backend signup API
      const response = await authApi.signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Extract AuthResponse data
      const authData = response.data || response;

      // Automatically log the user into the application state
      login(authData);

      toast.success('Account created! Welcome!');
      navigate('/dashboard');
    } catch (error) {
      console.error('[Signup Error]:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12 relative selection:bg-primary/30 selection:text-white">
      {/* Background Lighting Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary/15 blur-[100px] pointer-events-none rounded-full" />

      {/* Centered Glass Card */}
      <div className="w-full max-w-md glass-card p-8 sm:p-10 relative z-10 border border-white/10 shadow-2xl rounded-2xl bg-surface/80">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-secondary text-white mb-4 shadow-lg shadow-secondary/25 hover:scale-105 transition-transform">
            <FaRocket className="text-2xl" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-gray-400 text-sm mt-1.5">
            Start tracking your tech career roadmap today
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Full Name Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <FaUser className="text-sm" />
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your name"
                disabled={isLoading}
                className={`input-field pl-10 pr-4 py-2.5 text-sm bg-surface border transition-colors ${
                  errors.name
                    ? 'border-error focus:border-error'
                    : 'border-white/10 focus:border-primary'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-error mt-1 font-medium">{errors.name}</p>
            )}
          </div>

          {/* Email Address Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
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
              <p className="text-xs text-error mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
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
                placeholder="Create a strong password"
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
              <p className="text-xs text-error mt-1 font-medium">{errors.password}</p>
            )}

            {/* Live Password Requirements Checklist */}
            <div className="mt-2 p-2.5 rounded-lg bg-black/20 border border-white/5 space-y-1 text-xs">
              <div className={`flex items-center gap-1.5 ${hasMinLength ? 'text-success' : 'text-gray-400'}`}>
                {hasMinLength ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
                <span>At least 8 characters</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasUpperCase ? 'text-success' : 'text-gray-400'}`}>
                {hasUpperCase ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
                <span>One uppercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasLowerCase ? 'text-success' : 'text-gray-400'}`}>
                {hasLowerCase ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
                <span>One lowercase letter</span>
              </div>
              <div className={`flex items-center gap-1.5 ${hasNumber ? 'text-success' : 'text-gray-400'}`}>
                {hasNumber ? <FaCheck className="text-[10px]" /> : <FaTimes className="text-[10px]" />}
                <span>One number</span>
              </div>
            </div>
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 pointer-events-none">
                <FaLock className="text-sm" />
              </span>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                disabled={isLoading}
                className={`input-field pl-10 pr-11 py-2.5 text-sm bg-surface border transition-colors ${
                  errors.confirmPassword
                    ? 'border-error focus:border-error'
                    : 'border-white/10 focus:border-primary'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
                className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-white transition-colors"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-error mt-1 font-medium">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-btn py-3 mt-4 text-sm font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Sign Up</span>
            )}
          </button>
        </form>

        {/* Bottom Login Link */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-secondary font-semibold hover:underline transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
