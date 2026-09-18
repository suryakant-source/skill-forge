import React from 'react';
import { Link } from 'react-router-dom';
import { FaBullseye, FaTasks, FaCheckCircle, FaRobot, FaFire, FaPlus, FaArrowRight } from 'react-icons/fa';
import useAuth from '../hooks/useAuth';
import useGoals from '../hooks/useGoals';
import useTasks from '../hooks/useTasks';

export const DashboardPage = () => {
  const { user } = useAuth();
  const { goals, isLoading: goalsLoading } = useGoals();
  const { tasks, isLoading: tasksLoading, updateStatus } = useTasks();

  const totalGoals = goals.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Hello, <span className="text-secondary">{user?.name || 'Engineer'}</span>! 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">Track your career growth, execute pending tasks, and hit your milestones.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link to="/goals" className="gradient-btn-outline text-xs sm:text-sm px-4 py-2 space-x-1.5">
            <FaPlus />
            <span>New Goal</span>
          </Link>
          <Link to="/tasks" className="gradient-btn text-xs sm:text-sm px-4 py-2 space-x-1.5">
            <FaPlus />
            <span>Add Task</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Active Goals</p>
            <p className="text-2xl font-bold text-white mt-1">{goalsLoading ? '...' : totalGoals}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-primary/20 text-primary flex items-center justify-center text-xl border border-primary/30">
            <FaBullseye />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Tasks Done</p>
            <p className="text-2xl font-bold text-success mt-1">
              {tasksLoading ? '...' : completedTasks}
              <span className="text-sm text-gray-400 font-normal"> / {totalTasks}</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-success/20 text-success flex items-center justify-center text-xl border border-success/30">
            <FaCheckCircle />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Pending Tasks</p>
            <p className="text-2xl font-bold text-warning mt-1">{tasksLoading ? '...' : pendingTasks}</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-warning/20 text-warning flex items-center justify-center text-xl border border-warning/30">
            <FaTasks />
          </div>
        </div>

        <div className="glass-card p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase">Completion Rate</p>
            <p className="text-2xl font-bold text-secondary mt-1">{progressPercent}%</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center text-xl border border-secondary/30">
            <FaFire />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <FaBullseye className="text-primary" />
              <span>Current Goals</span>
            </h2>
            <Link to="/goals" className="text-xs text-secondary hover:underline flex items-center space-x-1">
              <span>View all</span>
              <FaArrowRight />
            </Link>
          </div>

          {goalsLoading ? (
            <div className="glass-card p-8 text-center text-gray-400 text-sm">Loading goals...</div>
          ) : goals.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <p className="text-gray-300 font-medium">No goals created yet!</p>
              <p className="text-gray-400 text-xs mt-1">Set your first tech goal to start tracking progress.</p>
              <Link to="/goals" className="gradient-btn text-xs px-4 py-2 mt-4 inline-flex">
                Create First Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.slice(0, 3).map((goal) => (
                <Link
                  key={goal.id}
                  to={`/goals/${goal.id}`}
                  className="glass-card-hover p-5 block border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 uppercase">
                        {goal.category || 'General'}
                      </span>
                      <h3 className="text-base font-bold text-white mt-2">{goal.title}</h3>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{goal.description}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                    <span>Target: {goal.targetDate || 'Ongoing'}</span>
                    <span className="text-secondary font-medium">View Roadmap →</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border border-secondary/20 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center text-xl mb-3 border border-secondary/30">
              <FaRobot />
            </div>
            <h3 className="text-lg font-bold text-white">AI Career Mentor</h3>
            <p className="text-gray-300 text-xs mt-2 leading-relaxed">
              Need a customized learning roadmap or stuck on a coding concept? Ask your AI mentor for instant recommendations.
            </p>
            <Link to="/ai" className="gradient-btn text-xs px-4 py-2.5 mt-4 w-full justify-center">
              Chat with Mentor
            </Link>
          </div>

          <div className="glass-card p-6 border border-white/10">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <FaTasks className="text-warning" />
              <span>Pending Tasks</span>
            </h3>
            {tasksLoading ? (
              <p className="text-xs text-gray-400">Loading tasks...</p>
            ) : tasks.filter((t) => t.status !== 'COMPLETED').length === 0 ? (
              <p className="text-xs text-gray-400">All caught up! No pending tasks.</p>
            ) : (
              <div className="space-y-2.5">
                {tasks
                  .filter((t) => t.status !== 'COMPLETED')
                  .slice(0, 4)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-2.5 rounded-lg bg-surface border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2.5">
                        <button
                          onClick={() => updateStatus({ id: task.id, status: 'COMPLETED' })}
                          className="w-4 h-4 rounded border border-gray-500 hover:border-success transition flex items-center justify-center"
                        />
                        <span className="text-xs text-gray-200">{task.title}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-warning/20 text-warning font-semibold">
                        {task.status}
                      </span>
                    </div>
                  ))}
              </div>
            )}
            <Link to="/tasks" className="text-xs text-secondary hover:underline block text-center mt-4">
              Manage all tasks →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardPage;
