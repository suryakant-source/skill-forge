import React from 'react';
import { Link } from 'react-router-dom';
import { FaRocket, FaBullseye, FaRobot, FaChartLine, FaArrowRight } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/20 blur-[120px] pointer-events-none rounded-full" />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-surface border border-primary/30 text-xs font-semibold text-primary mb-6">
          <FaRocket className="text-secondary" />
          <span>SkillForge • AI Tech Career Accelerator</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Master Modern Tech Skills with{' '}
          <span className="bg-gradient-to-r from-primary via-secondary to-secondary bg-clip-text text-transparent">
            AI Guidance
          </span>
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Set ambitious goals, break them into structured milestones, and level up your engineering career with continuous feedback from your AI mentor.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to={isAuthenticated ? '/dashboard' : '/signup'}
            className="w-full sm:w-auto gradient-btn text-base font-semibold px-8 py-3.5 shadow-lg shadow-primary/25 flex items-center justify-center space-x-2"
          >
            <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
            <FaArrowRight className="text-sm" />
          </Link>
          <Link
            to={isAuthenticated ? '/ai' : '/login'}
            className="w-full sm:w-auto gradient-btn-outline text-base font-semibold px-8 py-3.5 flex items-center justify-center space-x-2"
          >
            <span>{isAuthenticated ? 'Open AI Mentor' : 'Sign In'}</span>
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-white">100%</div>
            <div className="text-xs text-gray-400 mt-1">Goal-Oriented</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-secondary">24/7</div>
            <div className="text-xs text-gray-400 mt-1">AI Career Guidance</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-primary">8+</div>
            <div className="text-xs text-gray-400 mt-1">Tech Tracks</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="text-2xl sm:text-3xl font-bold text-success">10x</div>
            <div className="text-xs text-gray-400 mt-1">Faster Mastery</div>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-3xl font-bold text-white">Engineered For Rapid Growth</h2>
          <p className="text-gray-400 mt-3">From beginner basics to advanced production systems.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card-hover p-6">
            <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-2xl mb-4 border border-primary/30">
              <FaBullseye />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Targeted Goals</h3>
            <p className="text-gray-400 text-sm">Define clear learning goals categorized by Frontend, Backend, AI/ML, and DevOps.</p>
          </div>
          <div className="glass-card-hover p-6">
            <div className="w-12 h-12 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center text-2xl mb-4 border border-secondary/30">
              <FaRobot />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">AI Career Mentor</h3>
            <p className="text-gray-400 text-sm">Generate dynamic study roadmaps and get custom explanations and debugging tips.</p>
          </div>
          <div className="glass-card-hover p-6">
            <div className="w-12 h-12 rounded-xl bg-success/20 text-success flex items-center justify-center text-2xl mb-4 border border-success/30">
              <FaChartLine />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Progress Analytics</h3>
            <p className="text-gray-400 text-sm">Track completion rates, active task states, and milestone achievements visually.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
export default LandingPage;
