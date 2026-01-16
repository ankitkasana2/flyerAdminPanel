// lib/notification-utils.ts

import { Notification } from "@/stores/notificationStore"

/**
 * Utility functions for working with notifications
 */

/**
 * Format notification time in a human-readable format
 */
export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

/**
 * Get notification type color class
 */
export function getNotificationTypeColor(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return 'text-green-500'
    case 'warning':
      return 'text-yellow-500'
    case 'error':
      return 'text-red-500'
    case 'info':
    default:
      return 'text-blue-500'
  }
}

/**
 * Get notification type background color class
 */
export function getNotificationTypeBgColor(type: Notification['type']): string {
  switch (type) {
    case 'success':
      return 'bg-green-50 dark:bg-green-950/20'
    case 'warning':
      return 'bg-yellow-50 dark:bg-yellow-950/20'
    case 'error':
      return 'bg-red-50 dark:bg-red-950/20'
    case 'info':
    default:
      return 'bg-blue-50 dark:bg-blue-950/20'
  }
}

/**
 * Filter notifications by type
 */
export function filterNotificationsByType(
  notifications: Notification[],
  type: Notification['type']
): Notification[] {
  return notifications.filter(n => n.type === type)
}

/**
 * Filter notifications by order ID
 */
export function filterNotificationsByOrder(
  notifications: Notification[],
  orderId: number
): Notification[] {
  return notifications.filter(n => n.order_id === orderId)
}

/**
 * Filter notifications by flyer ID
 */
export function filterNotificationsByFlyer(
  notifications: Notification[],
  flyerId: number
): Notification[] {
  return notifications.filter(n => n.flyer_id === flyerId)
}

/**
 * Get notifications from the last N hours
 */
export function getRecentNotifications(
  notifications: Notification[],
  hours: number = 24
): Notification[] {
  const cutoffTime = new Date()
  cutoffTime.setHours(cutoffTime.getHours() - hours)
  
  return notifications.filter(n => {
    const notificationTime = new Date(n.created_at)
    return notificationTime >= cutoffTime
  })
}

/**
 * Group notifications by date
 */
export function groupNotificationsByDate(
  notifications: Notification[]
): Record<string, Notification[]> {
  const groups: Record<string, Notification[]> = {}
  
  notifications.forEach(notification => {
    const date = new Date(notification.created_at)
    const dateKey = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(notification)
  })
  
  return groups
}

/**
 * Get notification priority (for sorting)
 * Higher number = higher priority
 */
export function getNotificationPriority(notification: Notification): number {
  let priority = 0
  
  // Unread notifications have higher priority
  if (!notification.is_read) priority += 100
  
  // Type-based priority
  switch (notification.type) {
    case 'error':
      priority += 40
      break
    case 'warning':
      priority += 30
      break
    case 'success':
      priority += 20
      break
    case 'info':
      priority += 10
      break
  }
  
  // Recent notifications have higher priority
  const age = Date.now() - new Date(notification.created_at).getTime()
  const ageHours = age / (1000 * 60 * 60)
  if (ageHours < 1) priority += 5
  else if (ageHours < 24) priority += 3
  
  return priority
}

/**
 * Sort notifications by priority
 */
export function sortNotificationsByPriority(
  notifications: Notification[]
): Notification[] {
  return [...notifications].sort((a, b) => {
    return getNotificationPriority(b) - getNotificationPriority(a)
  })
}

/**
 * Create a notification summary
 */
export function createNotificationSummary(notifications: Notification[]): {
  total: number
  unread: number
  byType: Record<Notification['type'], number>
  recent24h: number
} {
  const summary = {
    total: notifications.length,
    unread: 0,
    byType: {
      info: 0,
      success: 0,
      warning: 0,
      error: 0,
    } as Record<Notification['type'], number>,
    recent24h: 0,
  }
  
  const cutoff24h = new Date()
  cutoff24h.setHours(cutoff24h.getHours() - 24)
  
  notifications.forEach(notification => {
    if (!notification.is_read) summary.unread++
    summary.byType[notification.type]++
    
    const notificationTime = new Date(notification.created_at)
    if (notificationTime >= cutoff24h) summary.recent24h++
  })
  
  return summary
}
