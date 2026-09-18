import axiosInstance from './axiosInstance';

export const aiApi = {
  generateLearningPath: (data) => axiosInstance.post('/ai/learning-path', data),
  getRecommendations: (params) => axiosInstance.get('/ai/recommendations', { params }),
  chatWithAssistant: (data) => axiosInstance.post('/ai/chat', data),
};

export default aiApi;
