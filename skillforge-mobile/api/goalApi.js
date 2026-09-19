/**
 * goalApi.js - SkillForge Mobile Goal API Layer
 * Wraps all backend /goals endpoints for clean separation of concerns.
 */
import axiosInstance from './axiosInstance';

const normalize = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  return res?.data ?? res;
};

export const getAllGoals = async () => {
  const res = await axiosInstance.get('/goals');
  return Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : []);
};

export const getGoalById = async (id) => {
  const res = await axiosInstance.get(`/goals/${id}`);
  return normalize(res);
};

export const createGoal = async (goalData) => {
  const res = await axiosInstance.post('/goals', goalData);
  return normalize(res);
};

export const updateGoal = async (id, goalData) => {
  const res = await axiosInstance.put(`/goals/${id}`, goalData);
  return normalize(res);
};

export const deleteGoal = async (id) => {
  const res = await axiosInstance.delete(`/goals/${id}`);
  return normalize(res);
};

const goalApi = { getAllGoals, getGoalById, createGoal, updateGoal, deleteGoal };
export default goalApi;
