import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaRocket,
  FaBullseye,
  FaTasks,
  FaChartLine,
  FaRobot,
  FaArrowRight,
  FaSignInAlt,
  FaCheckCircle,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

/**
 * ============================================================================
 * SKILLFORGE LANDING PAGE COMPONENT
 * ============================================================================
 * 
 * Purpose:
 * The public front face of the SkillForge application. Showcases core features,
 * value proposition, and guides visitors towards onboarding via Signup or Login.
 * 
 * Design Specifications:
 * - Theme: Sleek Dark Mode (Background: #0F0F1A, Cards: #1A1A2E)
 * - Brand Colors: Primary Violet (#6C63FF), Secondary Teal (#3ECFCF)
 * - Visual Effects: Glassmorphism (`.glass-card`), subtle glowing radial gradients,
 *   smooth hover elevation, and responsive typography.
 */
export const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-white flex flex-col selection:bg-primary/30 selection:text-white">
      {/* ==================================================================== */}
      {/* 1. STICKY NAVBAR SECTION                                             */}
      {/* ==================================================================== */}
      <header className="sticky top-0 z-50 bg-[#0F0F1A]/80 backdrop-blur-md border-b border-white/10 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <FaRocket className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Skill<span className="text-secondary">Forge</span>
            </span>
          </Link>

          {/* Center Navigation Anchors */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-secondary transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-secondary transition-colors">
              About
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="gradient-btn text-sm px-5 py-2 flex items-center space-x-2"
              >
                <span>Dashboard</span>
                <FaArrowRight className="text-xs" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-200 hover:text-white hover:bg-white/5 transition-colors flex items-center space-x-1.5"
                >
                  <FaSignInAlt className="text-xs text-secondary" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="gradient-btn text-sm px-4 sm:px-5 py-2 shadow-md shadow-primary/20"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ==================================================================== */}
      {/* 2. HERO SECTION                                                      */}
      {/* ==================================================================== */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Soft Background Glow Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-primary/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-[350px] h-[250px] bg-secondary/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge Tag */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-surface border border-primary/30 text-xs font-semibold text-gray-200 mb-6 shadow-inner">
            <FaRocket className="text-secondary" />
            <span>Accelerate Your Career with Intelligent Goal Tracking</span>
          </div>

          {/* Main Hero Headings with Gradient */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.15]">
            <span className="block text-white">Track Your Learning Journey</span>
            <span className="block mt-1 bg-gradient-to-r from-primary via-purple-300 to-secondary bg-clip-text text-transparent">
              Build Your Career
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Set goals, complete tasks, and get AI-powered career advice tailored to modern industry standards.
          </p>

          {/* Call-to-Action Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to={isAuthenticated ? '/dashboard' : '/signup'}
              className="w-full sm:w-auto gradient-btn text-base font-semibold px-8 py-3.5 shadow-xl shadow-primary/25 flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform"
            >
              <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
              <FaArrowRight className="text-sm" />
            </Link>
            <Link
              to={isAuthenticated ? '/goals' : '/login'}
              className="w-full sm:w-auto gradient-btn-outline text-base font-semibold px-8 py-3.5 flex items-center justify-center space-x-2 hover:scale-[1.02] transition-transform"
            >
              <span>{isAuthenticated ? 'View Goals' : 'Login'}</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-secondary" /> 100% Free to Get Started
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-primary" /> Personalized AI Milestones
            </span>
            <span className="flex items-center gap-1.5">
              <FaCheckCircle className="text-secondary" /> Real-time Progress Metrics
            </span>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. FEATURES SECTION (4 FEATURE CARDS)                                 */}
      {/* ==================================================================== */}
      <section id="features" className="py-16 sm:py-20 bg-[#0C0C16] border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-secondary mb-2">
              Powerful Core Features
            </h2>
            <h3 className="text-3xl sm:text-4xl font-extrabold text-white">
              Everything You Need To Level Up
            </h3>
            <p className="text-gray-400 mt-3 text-base">
              Built with precision for developers, learners, and technical professionals.
            </p>
          </div>

          {/* 4 Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1: Goal Tracking */}
            <div className="glass-card-hover p-6 flex flex-col justify-between bg-surface/70 border border-white/10 rounded-2xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/40 flex items-center justify-center text-primary text-2xl mb-5 shadow-inner">
                  <FaBullseye />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Goal Tracking</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Break long-term ambitions into structured goals, set target completion dates, and monitor measurable progress.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs font-semibold text-secondary flex items-center gap-1">
                <span>Organize roadmaps</span>
                <FaArrowRight className="text-[10px]" />
              </div>
            </div>

            {/* Feature 2: Task Management */}
            <div className="glass-card-hover p-6 flex flex-col justify-between bg-surface/70 border border-white/10 rounded-2xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary text-2xl mb-5 shadow-inner">
                  <FaTasks />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Task Management</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Manage daily learning tasks, assign priorities (High, Medium, Low), and seamlessly transition items from To-Do to Done.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs font-semibold text-secondary flex items-center gap-1">
                <span>Stay productive</span>
                <FaArrowRight className="text-[10px]" />
              </div>
            </div>

            {/* Feature 3: Progress Dashboard */}
            <div className="glass-card-hover p-6 flex flex-col justify-between bg-surface/70 border border-white/10 rounded-2xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-primary/40 flex items-center justify-center text-primary text-2xl mb-5 shadow-inner">
                  <FaChartLine />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">Progress Dashboard</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Get high-level visual analytics on active goals, completed tasks, overall completion percentage, and milestones.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs font-semibold text-secondary flex items-center gap-1">
                <span>Visualize growth</span>
                <FaArrowRight className="text-[10px]" />
              </div>
            </div>

            {/* Feature 4: AI Career Assistant */}
            <div className="glass-card-hover p-6 flex flex-col justify-between bg-surface/70 border border-white/10 rounded-2xl">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary/20 to-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary text-2xl mb-5 shadow-inner">
                  <FaRobot />
                </div>
                <h4 className="text-lg font-bold text-white mb-2">AI Career Assistant</h4>
                <p className="text-sm text-gray-300 leading-relaxed">
                  Receive personalized learning recommendations, resume talking points, and automated roadmap breakdowns powered by AI.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/10 text-xs font-semibold text-secondary flex items-center gap-1">
                <span>Smart guidance</span>
                <FaArrowRight className="text-[10px]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* ABOUT SECTION                                                        */}
      {/* ==================================================================== */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center">
        <div className="glass-card p-8 sm:p-12 border border-white/10 rounded-3xl bg-surface/40 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary/15 rounded-full blur-2xl pointer-events-none" />
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Built for Serious Lifelong Learners
          </h3>
          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            SkillForge brings structure to unstructured learning. Turn broad career goals into weekly executable milestones with clear accountability and intelligent feedback.
          </p>
          <Link
            to="/signup"
            className="gradient-btn px-6 py-2.5 text-sm font-semibold inline-flex items-center gap-2"
          >
            <span>Join SkillForge Today</span>
            <FaArrowRight className="text-xs" />
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. FOOTER SECTION                                                    */}
      {/* ==================================================================== */}
      <footer className="mt-auto bg-[#0A0A12] border-t border-white/10 py-8 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <FaRocket className="text-secondary" />
            <span className="font-semibold text-white">SkillForge</span>
            <span>• Learning & Career Accelerator</span>
          </div>
          <p className="text-gray-400">
            © {new Date().getFullYear()} SkillForge. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/login" className="hover:text-secondary transition-colors">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-secondary transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
