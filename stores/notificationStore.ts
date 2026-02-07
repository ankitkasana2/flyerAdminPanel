// stores/notificationStore.ts
import { makeAutoObservable, runInAction } from "mobx"

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`

export interface Notification {
  id: number
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
  updated_at: string
  order_id?: number | null
  flyer_id?: number | null
}

class NotificationStore {
  notifications: Notification[] = []
  loading = false
  error: string | null = null

  constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  // Fetch all notifications
  async fetchNotifications() {
    try {
      this.loading = true
      this.error = null

      const response = await fetch(API_BASE)
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch notifications`)
      }

      const data = await response.json()

      runInAction(() => {
        this.notifications = Array.isArray(data) ? data : data.notifications || []
        this.loading = false
      })
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Failed to fetch notifications"
        this.loading = false
      })
      console.error("Error fetching notifications:", err)
    }
  }

  // Mark a single notification as read
  async markAsRead(notificationId: number) {
    const notification = this.notifications.find(n => n.id === notificationId)
    if (!notification) return

    // Store old state for rollback
    const wasRead = notification.is_read

    // Optimistic update
    runInAction(() => {
      notification.is_read = true
    })

    try {
      const response = await fetch(`${API_BASE}/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to mark notification as read`)
      }

      const data = await response.json()
      console.log('Notification marked as read:', data)
    } catch (err: any) {
      console.error("Failed to mark notification as read:", err)
      // Rollback on failure
      runInAction(() => {
        notification.is_read = wasRead
      })
    }
  }

  // Mark all notifications as read
  async markAllAsRead() {
    // Store old states for rollback
    const oldStates = this.notifications.map(n => ({ id: n.id, is_read: n.is_read }))

    // Optimistic update
    runInAction(() => {
      this.notifications.forEach(n => {
        n.is_read = true
      })
    })

    try {
      const response = await fetch(`${API_BASE}/read-all`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to mark all notifications as read`)
      }

      const data = await response.json()
      console.log('All notifications marked as read:', data)
    } catch (err: any) {
      console.error("Failed to mark all notifications as read:", err)
      // Rollback on failure
      runInAction(() => {
        oldStates.forEach(oldState => {
          const notification = this.notifications.find(n => n.id === oldState.id)
          if (notification) {
            notification.is_read = oldState.is_read
          }
        })
      })
    }
  }

  // Computed: Get unread count
  get unreadCount() {
    return this.notifications.filter(n => !n.is_read).length
  }

  // Computed: Get unread notifications
  get unreadNotifications() {
    return this.notifications.filter(n => !n.is_read)
  }

  // Computed: Get read notifications
  get readNotifications() {
    return this.notifications.filter(n => n.is_read)
  }

  // Computed: Get sorted notifications (unread first, then by date)
  get sortedNotifications() {
    return [...this.notifications].sort((a, b) => {
      // Unread notifications first
      if (a.is_read !== b.is_read) {
        return a.is_read ? 1 : -1
      }
      // Then sort by date (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }
}

export const notificationStore = new NotificationStore()

// Auto-fetch on start
notificationStore.fetchNotifications()

// Auto-refresh every 30 seconds
setInterval(() => notificationStore.fetchNotifications(), 30000)
