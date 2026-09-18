import React from 'react';
import { FaShieldAlt, FaServer, FaDatabase, FaCheckCircle } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';

export const AdminPage = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2.5 rounded-xl bg-warning/20 text-warning text-xl border border-warning/30">
          <FaShieldAlt />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Management Console</h1>
          <p className="text-xs text-gray-400">System metrics, health status, and user directory</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Backend Status</p>
            <p className="text-lg font-bold text-success mt-1 flex items-center space-x-1.5">
              <FaCheckCircle className="text-xs" />
              <span>Spring Boot 3.2.5 (Online)</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-success/20 text-success flex items-center justify-center text-lg">
            <FaServer />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Database Engine</p>
            <p className="text-lg font-bold text-secondary mt-1 flex items-center space-x-1.5">
              <FaCheckCircle className="text-xs" />
              <span>PostgreSQL 16.3 (Port 5432)</span>
            </p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary/20 text-secondary flex items-center justify-center text-lg">
            <FaDatabase />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Access Level</p>
            <p className="text-lg font-bold text-warning mt-1">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-warning/20 text-warning flex items-center justify-center text-lg">
            <FaShieldAlt />
          </div>
        </div>
      </div>

      <div className="glass-card p-6 border border-white/10">
        <h3 className="text-base font-bold text-white mb-4">Platform Administration</h3>
        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Welcome, {user?.name}. You have full operational control over user accounts, goal templates, and platform resources.
        </p>

        <div className="p-4 rounded-lg bg-surface border border-white/5 text-xs text-gray-400">
          All systems are operational. REST API endpoints under <code className="text-secondary font-mono">/api/*</code> are mapped and active.
        </div>
      </div>
    </div>
  );
};
export default AdminPage;
