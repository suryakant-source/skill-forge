import axiosInstance from './axiosInstance';

export const authApi = {
  login: (credentials) => axiosInstance.post('/auth/login', credentials),
  signup: (userData) => axiosInstance.post('/auth/signup', userData),
  logout: () => axiosInstance.post('/auth/logout'),
  getCurrentUser: () => axiosInstance.get('/users/me'),
};

export default authApi;
