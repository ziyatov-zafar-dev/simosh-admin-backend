
import { apiClient } from './apiClient';
import { About } from '../types';

export const aboutService = {
  get: () => apiClient.get<About>('/about'),
  
  update: (data: About) => apiClient.put<About>('/about', data)
};
