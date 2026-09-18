import axiosInstance from './axiosInstance';

export const dashboardApi = {
  getSummary: () => axiosInstance.get('/dashboard/summary'),
  getStats: () => axiosInstance.get('/dashboard/stats'),
  getRecentActivities: () => axiosInstance.get('/dashboard/activities'),
};

export default dashboardApi;
