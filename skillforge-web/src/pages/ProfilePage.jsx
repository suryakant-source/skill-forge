import React from 'react';
import { FaGraduationCap, FaShieldAlt } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

export const ProfilePage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">User Profile</h1>

      <div className="glass-card p-6 sm:p-8 border border-white/10">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-primary/30">
            {user?.name ? user.name[0].toUpperCase() : 'U'}
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-bold text-white">{user?.name || 'SkillForge Learner'}</h2>
            <p className="text-gray-400 text-sm">{user?.email || 'user@skillforge.com'}</p>
            <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                {user?.role || 'USER'}
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded bg-secondary/20 text-secondary border border-secondary/30">
                {user?.experienceLevel || 'INTERMEDIATE'}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-surface border border-white/5 flex items-center space-x-3">
            <div className="p-2 rounded bg-primary/20 text-primary">
              <FaGraduationCap />
            </div>
            <div>
              <p className="text-xs text-gray-400">Experience Track</p>
              <p className="text-sm font-semibold text-white">{user?.experienceLevel || 'Intermediate'}</p>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-white/5 flex items-center space-x-3">
            <div className="p-2 rounded bg-secondary/20 text-secondary">
              <FaShieldAlt />
            </div>
            <div>
              <p className="text-xs text-gray-400">Account Access</p>
              <p className="text-sm font-semibold text-white">{user?.role === 'ADMIN' ? 'Administrator' : 'Standard Member'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
