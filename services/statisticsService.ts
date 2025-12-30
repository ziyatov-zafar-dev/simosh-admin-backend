
import { apiClient } from './apiClient';
import { Statistics, Order, OrderStatus } from '../types';

export const statisticsService = {
  get: () => apiClient.get<Statistics>('/statistics'),
  
  getStatuses: () => apiClient.get<OrderStatus[]>('/statistics/statuses'),
  
  getOrders: () => apiClient.get<Order[]>('/statistics/orders'),
  
  getOrdersByStatus: (status: string) => 
    apiClient.get<Order[]>(`/statistics/orders/status/${status}`),
  
  updateOrderStatus: (id: string, status: string) => 
    apiClient.post<Order>(`/statistics/orders/${id}/status/${status}`, {})
};
