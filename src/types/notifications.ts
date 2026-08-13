export interface UserNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationListResult {
  items: UserNotification[];
  unreadCount: number;
  total: number;
  page: number;
  limit: number;
}
