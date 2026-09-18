import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaRocket, FaGraduationCap } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import { validateSignup } from '../utils/validators';

export const SignupPage = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    experienceLevel: 'BEGINNER',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateSignup(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }
    const result = await signup(formData);
    if (result.success) navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-secondary/15 blur-[100px] pointer-events-none rounded-full" />
      <div className="w-full max-w-md glass-card p-8 relative z-10 border border-white/10 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-secondary/20 text-secondary mb-3 border border-secondary/30">
            <FaRocket className="text-xl" />
          </div>
          <h2 className="text-2xl font-bold text-white">Create Your Account</h2>
          <p className="text-gray-400 text-sm mt-1">Start your structured career roadmap</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><FaUser /></span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jane Doe"
                className="input-field pl-10"
              />
            </div>
            {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Email Address</label>
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
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Experience Level</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><FaGraduationCap /></span>
              <select
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="input-field pl-10 bg-surface"
              >
                <option value="BEGINNER">Beginner (0 - 1 years)</option>
                <option value="INTERMEDIATE">Intermediate (1 - 3 years)</option>
                <option value="ADVANCED">Advanced (3+ years)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Password</label>
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

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">Confirm Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"><FaLock /></span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="input-field pl-10"
              />
            </div>
            {errors.confirmPassword && <p className="text-xs text-error mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full gradient-btn py-3 mt-2 text-sm font-semibold disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-secondary font-medium hover:underline">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
export default SignupPage;
