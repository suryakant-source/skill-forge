import axiosInstance from './axiosInstance';

export const taskApi = {
  getTasks: (params) => axiosInstance.get('/tasks', { params }),
  getTasksByGoal: (goalId) => axiosInstance.get(`/tasks/goal/${goalId}`),
  getTaskById: (id) => axiosInstance.get(`/tasks/${id}`),
  createTask: (data) => axiosInstance.post('/tasks', data),
  updateTask: (id, data) => axiosInstance.put(`/tasks/${id}`, data),
  updateTaskStatus: (id, status) => axiosInstance.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => axiosInstance.delete(`/tasks/${id}`),
};

export default taskApi;
