import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaEnvelope, FaLock, FaRocket } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { validateLogin } from '../utils/validators';

export const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateLogin(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    const result = await login(formData);
    if (result.success) navigate(from, { replace: true });
  };

  const fillDemo = (email, password) => {
    setFormData({ email, password });
    setErrors({});
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/15 blur-[100px] pointer-events-none rounded-full" />
      <div className="w-full max-w-md glass-card p-8 relative z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 text-primary mb-3 border border-primary/30">
            <FaRocket className="text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your SkillForge account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><FaEnvelope /></span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="input-field pl-10"
              />
            </div>
            {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><FaLock /></span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field pl-10"
              />
            </div>
            {errors.password && <p className="text-xs text-error mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-btn py-3 mt-2 text-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-white/10 text-center">
          <p className="text-xs text-gray-400 mb-2">Quick Test Accounts:</p>
          <div className="flex justify-center gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@skillforge.com', 'Admin@123')}
              className="text-xs px-2.5 py-1 rounded bg-surface border border-white/10 hover:border-primary text-gray-300"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => fillDemo('user@skillforge.com', 'User@123')}
              className="text-xs px-2.5 py-1 rounded bg-surface border border-white/10 hover:border-secondary text-gray-300"
            >
              Demo User
            </button>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-secondary font-medium hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
