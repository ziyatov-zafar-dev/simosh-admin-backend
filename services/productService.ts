
import { apiClient } from './apiClient';
import { Product } from '../types';

export interface FileUploadResponse {
  url: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  contentType: string;
}

export const productService = {
  // Mahsulotlar ro'yxatini olish
  getAll: () => apiClient.get<Product[]>('/products/list'),
  
  // ID bo'yicha mahsulotni olish
  getById: (id: string) => apiClient.get<Product>(`/products/get/${id}`),
  
  // Faylni alohida yuklash (Yaratish va Yangilash uchun)
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post<FileUploadResponse>('/files/upload', formData);
  },

  // Yangi mahsulot yaratish (JSON)
  create: (data: Partial<Product>) => 
    apiClient.post<Product>('/products/create', data),
  
  // Mahsulotni yangilash (JSON formatida)
  update: (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => 
    apiClient.put<Product>(`/products/update/${id}`, data),
  
  // Mahsulotni o'chirish
  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/products/delete/${id}`)
};
