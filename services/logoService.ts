
import { apiClient } from './apiClient';
import { Logo } from '../types';

export const logoService = {
  get: () => apiClient.get<Logo>('/logo'),
  
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<Logo>('/logo/upload', formData);
  }
};
