/**
 * taskApi.js - SkillForge Mobile Task API Layer
 */
import axiosInstance from './axiosInstance';

const norm = (res) =>
  Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : res?.data ?? res;

/** Fetch all tasks for a given goal */
export const getTasksByGoal = async (goalId) => {
  const res = await axiosInstance.get(`/goals/${goalId}/tasks`);
  return Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
};

/** Create a task under a goal */
export const createTask = async (goalId, taskData) =>
  norm(await axiosInstance.post(`/goals/${goalId}/tasks`, taskData));

/** Full update of a task */
export const updateTask = async (taskId, taskData) =>
  norm(await axiosInstance.put(`/tasks/${taskId}`, taskData));

/** Patch only the status */
export const updateTaskStatus = async (taskId, status) =>
  norm(await axiosInstance.patch(`/tasks/${taskId}/status`, { status }));

/** Delete a task */
export const deleteTask = async (taskId) =>
  norm(await axiosInstance.delete(`/tasks/${taskId}`));

export default { getTasksByGoal, createTask, updateTask, updateTaskStatus, deleteTask };
