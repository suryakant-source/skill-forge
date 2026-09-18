import axiosInstance from './axiosInstance';

export const goalApi = {
  getGoals: (params) => axiosInstance.get('/goals', { params }),
  getGoalById: (id) => axiosInstance.get(`/goals/${id}`),
  createGoal: (data) => axiosInstance.post('/goals', data),
  updateGoal: (id, data) => axiosInstance.put(`/goals/${id}`, data),
  deleteGoal: (id) => axiosInstance.delete(`/goals/${id}`),
  getCategories: () => axiosInstance.get('/goals/categories'),
};

export default goalApi;
