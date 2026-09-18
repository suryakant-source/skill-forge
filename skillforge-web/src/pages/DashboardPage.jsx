/**
 * ============================================================================
 * DashboardPage.jsx - Main Overview & Real-Time Metrics
 * ============================================================================
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiTarget, FiCheckSquare, FiCheckCircle, FiTrendingUp,
  FiPlus, FiArrowRight, FiClock, FiCpu,
} from 'react-icons/fi';
import useAuth from '../hooks/useAuth';
import useGoals from '../hooks/useGoals';
import { useAllTasks } from '../hooks/useTasks';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { goals = [], isLoading: goalsLoading } = useGoals();
  const { data: allTasks = [], isLoading: tasksLoading } = useAllTasks(goals);

  const totalGoals = goals.length;
  const totalTasks = goals.reduce((sum, g) => sum + (g.taskCount || 0), 0);
  const completedTasks = goals.reduce((sum, g) => sum + (g.completedTaskCount || 0), 0);
  const pendingTasks = Math.max(0, totalTasks - completedTasks);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Recent tasks (pending or in-progress)
  const activeTasks = allTasks.filter((t) => t.status !== 'COMPLETED').slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Welcome back, <span className="text-secondary">{user?.name || 'Engineer'}</span>!
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Track your career growth, execute pending tasks, and hit your milestones.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/goals" className="gradient-btn-outline text-xs sm:text-sm px-4 py-2 flex items-center gap-1.5">
            <FiPlus />
            <span>New Goal</span>
          </Link>
          <Link to="/tasks" className="gradient-btn text-xs sm:text-sm px-4 py-2 flex items-center gap-1.5">
            <FiPlus />
            <span>Task Board</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Goals */}
        <div className="glass-card p-5 flex items-center justify-between border border-white/8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Goals</p>
            <p className="text-2xl font-bold text-white mt-1">
              {goalsLoading ? '...' : totalGoals}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center text-xl border border-primary/30">
            <FiTarget style={{ color: '#6C63FF' }} />
          </div>
        </div>

        {/* Tasks Done */}
        <div className="glass-card p-5 flex items-center justify-between border border-white/8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tasks Done</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">
              {goalsLoading ? '...' : completedTasks}
              <span className="text-sm text-gray-500 font-normal"> / {totalTasks}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xl border border-emerald-500/30">
            <FiCheckCircle style={{ color: '#48BB78' }} />
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="glass-card p-5 flex items-center justify-between border border-white/8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Tasks</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">
              {goalsLoading ? '...' : pendingTasks}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-yellow-500/15 text-yellow-400 flex items-center justify-center text-xl border border-yellow-500/30">
            <FiClock style={{ color: '#ECC94B' }} />
          </div>
        </div>

        {/* Completion Rate */}
        <div className="glass-card p-5 flex items-center justify-between border border-white/8">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completion Rate</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">
              {goalsLoading ? '...' : `${progressPercent}%`}
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center text-xl border border-cyan-500/30">
            <FiTrendingUp style={{ color: '#3ECFCF' }} />
          </div>
        </div>
      </div>

      {/* Main Grid: Goals & AI Assistant */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Goals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FiTarget className="text-primary" />
              <span>Current Goals</span>
            </h2>
            <Link to="/goals" className="text-xs text-secondary hover:underline flex items-center gap-1">
              <span>View all</span>
              <FiArrowRight />
            </Link>
          </div>

          {goalsLoading ? (
            <div className="glass-card p-8 text-center text-gray-400 text-sm">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="glass-card p-8 text-center border border-white/8">
              <p className="text-gray-300 font-medium">No goals created yet!</p>
              <p className="text-gray-400 text-xs mt-1">Set your first tech goal to start tracking progress.</p>
              <Link to="/goals" className="gradient-btn text-xs px-4 py-2 mt-4 inline-flex">
                Create First Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 3).map((goal) => {
                const total = goal.taskCount || 0;
                const done = goal.completedTaskCount || 0;
                const prog = goal.progress ?? (total > 0 ? Math.round((done / total) * 100) : 0);

                return (
                  <Link
                    key={goal.id}
                    to={`/goals/${goal.id}`}
                    className="p-5 rounded-xl border border-white/8 hover:border-primary/40 transition flex flex-col justify-between block"
                    style={{ background: 'rgba(26,26,46,0.85)' }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                          style={{
                            background: 'rgba(108,99,255,0.15)',
                            color: '#6C63FF',
                            border: '1px solid rgba(108,99,255,0.3)',
                          }}
                        >
                          {goal.category || 'GENERAL'}
                        </span>
                        <h3 className="text-base font-bold text-white mt-1.5">{goal.title}</h3>
                        {goal.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{goal.description}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold text-cyan-400">{prog}%</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                      <span>{done} of {total} tasks completed</span>
                      <span className="text-secondary font-medium flex items-center gap-1">
                        View Tasks <FiArrowRight className="text-[10px]" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: AI Assistant CTA & Quick Tasks */}
        <div className="space-y-6">
          <div className="glass-card p-6 border border-secondary/25 relative overflow-hidden rounded-2xl"
            style={{ background: 'linear-gradient(135deg, rgba(62,207,207,0.08) 0%, rgba(108,99,255,0.08) 100%)' }}>
            <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center text-xl mb-3 border border-secondary/30">
              <FiCpu style={{ color: '#3ECFCF' }} />
            </div>
            <h3 className="text-base font-bold text-white">AI Career Mentor</h3>
            <p className="text-gray-300 text-xs mt-2 leading-relaxed">
              Need a customized roadmap or stuck on a coding concept? Ask your AI mentor for instant recommendations.
            </p>
            <Link to="/ai-assistant" className="gradient-btn text-xs px-4 py-2 mt-4 inline-flex items-center gap-1.5">
              <span>Chat with Mentor</span>
              <FiArrowRight />
            </Link>
          </div>

          {/* Quick Active Tasks */}
          <div className="glass-card p-5 border border-white/8 rounded-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FiCheckSquare className="text-yellow-400" />
                <span>Active Tasks</span>
              </h3>
              <Link to="/tasks" className="text-[11px] text-gray-400 hover:text-white">
                View All
              </Link>
            </div>

            {activeTasks.length === 0 ? (
              <p className="text-xs text-gray-500 py-4 text-center">No pending tasks. Great job!</p>
            ) : (
              <div className="space-y-2">
                {activeTasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-2.5 rounded-lg bg-surface/80 border border-white/5 flex items-center justify-between text-xs"
                  >
                    <span className="text-gray-200 truncate pr-2">{t.title}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 font-semibold shrink-0">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
