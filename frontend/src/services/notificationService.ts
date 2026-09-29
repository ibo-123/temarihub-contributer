import type { NotificationItem } from '../types';
import { apiRequest } from './api';

export function listNotifications() {
  return apiRequest<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
}

export function markNotificationRead(id: string) {
  return apiRequest<{ notification: NotificationItem }>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ unreadCount: number }>('/api/notifications/read-all', {
    method: 'PATCH',
  });
}
