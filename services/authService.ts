
import { apiClient } from './apiClient';
import { LoginResponse, VerifyResponse } from '../types';

export const authService = {
  login: (usernameOrEmail: string, password: string) => 
    apiClient.post<LoginResponse>('/auth/login', { usernameOrEmail, password }),

  verify: (usernameOrEmail: string, code: string) =>
    apiClient.post<VerifyResponse>('/auth/login/verify', { usernameOrEmail, code }),

  forgotPassword: (usernameOrEmail: string) =>
    apiClient.post<{ message: string }>('/auth/password/forgot', { usernameOrEmail }),

  resetPassword: (usernameOrEmail: string, code: string, newPassword: string) =>
    apiClient.post<{ message: string }>('/auth/password/reset', { usernameOrEmail, code, newPassword })
};
