// types/notification.types.ts

/**
 * Notification Type Definitions
 * 
 * Centralized type definitions for the notification system.
 * Import these types throughout your application for type safety.
 */

/**
 * Notification type enum
 */
export type NotificationType = "info" | "success" | "warning" | "error"

/**
 * Core notification interface
 */
export interface INotification {
  id: number
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
  updated_at: string
  order_id?: number | null
  flyer_id?: number | null
}

/**
 * Notification API response for GET /api/notifications
 */
export interface NotificationListResponse {
  notifications?: INotification[]
  // If API returns array directly
  [key: number]: INotification
}

/**
 * Notification API response for PATCH /api/notifications/{id}/read
 */
export interface NotificationReadResponse {
  success: boolean
  message: string
  notification: {
    id: number
    is_read: boolean
    updated_at: string
  }
}

/**
 * Notification API response for PATCH /api/notifications/read-all
 */
export interface NotificationReadAllResponse {
  success: boolean
  message: string
  count: number
}

/**
 * Notification store state interface
 */
export interface INotificationStore {
  notifications: INotification[]
  loading: boolean
  error: string | null
  
  // Computed properties
  unreadCount: number
  unreadNotifications: INotification[]
  readNotifications: INotification[]
  sortedNotifications: INotification[]
  
  // Methods
  fetchNotifications: () => Promise<void>
  markAsRead: (notificationId: number) => Promise<void>
  markAllAsRead: () => Promise<void>
}

/**
 * Notification summary interface
 */
export interface NotificationSummary {
  total: number
  unread: number
  byType: Record<NotificationType, number>
  recent24h: number
}

/**
 * Notification filter options
 */
export interface NotificationFilterOptions {
  type?: NotificationType
  isRead?: boolean
  orderId?: number
  flyerId?: number
  startDate?: Date
  endDate?: Date
}

/**
 * Notification sort options
 */
export type NotificationSortBy = 
  | "date_asc" 
  | "date_desc" 
  | "priority" 
  | "type" 
  | "read_status"

/**
 * Notification group by date result
 */
export interface NotificationsByDate {
  [dateKey: string]: INotification[]
}

/**
 * Notification component props
 */
export interface NotificationDropdownProps {
  className?: string
}

export interface NotificationBadgeProps {
  className?: string
  showZero?: boolean
  maxCount?: number
  size?: "sm" | "md" | "lg"
}

export interface NotificationBellIconProps {
  size?: "sm" | "md" | "lg"
  className?: string
}

export interface NotificationItemProps {
  notification: INotification
  onMarkAsRead?: (id: number) => void
  onClick?: (notification: INotification) => void
}

/**
 * Notification utility function types
 */
export type FormatNotificationTime = (dateString: string) => string
export type GetNotificationTypeColor = (type: NotificationType) => string
export type GetNotificationTypeBgColor = (type: NotificationType) => string
export type FilterNotificationsByType = (
  notifications: INotification[], 
  type: NotificationType
) => INotification[]
export type GetRecentNotifications = (
  notifications: INotification[], 
  hours?: number
) => INotification[]
export type GroupNotificationsByDate = (
  notifications: INotification[]
) => NotificationsByDate
export type CreateNotificationSummary = (
  notifications: INotification[]
) => NotificationSummary

/**
 * API endpoint configuration
 */
export interface NotificationAPIConfig {
  baseUrl: string
  endpoints: {
    list: string
    markRead: (id: number) => string
    markAllRead: string
  }
}

/**
 * Notification preferences (for future use)
 */
export interface NotificationPreferences {
  enabled: boolean
  soundEnabled: boolean
  desktopNotifications: boolean
  emailNotifications: boolean
  types: {
    info: boolean
    success: boolean
    warning: boolean
    error: boolean
  }
}

/**
 * Type guard to check if a value is a valid notification type
 */
export function isNotificationType(value: string): value is NotificationType {
  return ["info", "success", "warning", "error"].includes(value)
}

/**
 * Type guard to check if an object is a valid notification
 */
export function isNotification(obj: any): obj is INotification {
  return (
    typeof obj === "object" &&
    obj !== null &&
    typeof obj.id === "number" &&
    typeof obj.title === "string" &&
    typeof obj.message === "string" &&
    isNotificationType(obj.type) &&
    typeof obj.is_read === "boolean" &&
    typeof obj.created_at === "string" &&
    typeof obj.updated_at === "string"
  )
}
