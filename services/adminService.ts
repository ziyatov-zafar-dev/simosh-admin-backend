
import { apiClient } from './apiClient';
import { AdminUser } from '../types';

export const adminService = {
  getAll: () => apiClient.get<AdminUser[]>('/super-admin/admins'),
  
  getById: (id: string) => apiClient.get<AdminUser>(`/super-admin/admins/${id}`),
  
  create: (admin: Omit<AdminUser, 'id' | 'role'> & { password?: string }) => 
    apiClient.post<AdminUser>('/super-admin/admins', admin),
  
  update: (id: string, admin: Partial<Omit<AdminUser, 'id' | 'role'>> & { password?: string }) =>
    apiClient.put<AdminUser>(`/super-admin/admins/${id}`, admin),
  
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/super-admin/admins/${id}`)
};
