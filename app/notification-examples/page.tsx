"use client"

import { observer } from "mobx-react-lite"
import { notificationStore } from "@/stores/notificationStore"
import { NotificationTestPanel } from "@/components/layout/NotificationTestPanel"
import { NotificationBadge, NotificationBellIcon } from "@/components/layout/NotificationBadge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Bell,
    CheckCircle,
    AlertTriangle,
    AlertCircle,
    Info,
    RefreshCw,
    CheckCheck,
    Filter
} from "lucide-react"
import {
    formatNotificationTime,
    createNotificationSummary,
    filterNotificationsByType,
    getRecentNotifications
} from "@/lib/notification-utils"

/**
 * NotificationExamplesPage
 * 
 * This page demonstrates all notification system features and components.
 * Use this as a reference for implementing notifications in your own pages.
 */
const NotificationExamplesPage = observer(() => {
    const {
        notifications,
        sortedNotifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAsRead,
        markAllAsRead
    } = notificationStore

    const summary = createNotificationSummary(notifications)
    const recentNotifications = getRecentNotifications(notifications, 24)

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold flex items-center gap-3">
                        <Bell className="w-10 h-10" />
                        Notification System Examples
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Comprehensive examples of the notification system implementation
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Total Notifications</CardDescription>
                            <CardTitle className="text-3xl">{summary.total}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Unread</CardDescription>
                            <CardTitle className="text-3xl text-red-500">{summary.unread}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Last 24 Hours</CardDescription>
                            <CardTitle className="text-3xl text-blue-500">{summary.recent24h}</CardTitle>
                        </CardHeader>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardDescription>Errors/Warnings</CardDescription>
                            <CardTitle className="text-3xl text-yellow-500">
                                {summary.byType.error + summary.byType.warning}
                            </CardTitle>
                        </CardHeader>
                    </Card>
                </div>

                {/* Badge Examples */}
                <Card>
                    <CardHeader>
                        <CardTitle>Badge Components</CardTitle>
                        <CardDescription>
                            Reusable notification badge components for different use cases
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-3">
                            <h4 className="font-semibold">NotificationBadge Sizes</h4>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <NotificationBadge size="sm" />
                                    <span className="text-sm">Small</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <NotificationBadge size="md" />
                                    <span className="text-sm">Medium</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <NotificationBadge size="lg" />
                                    <span className="text-sm">Large</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="font-semibold">NotificationBellIcon Sizes</h4>
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <NotificationBellIcon size="sm" />
                                    <span className="text-xs">Small</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <NotificationBellIcon size="md" />
                                    <span className="text-xs">Medium</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <NotificationBellIcon size="lg" />
                                    <span className="text-xs">Large</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Notification Types */}
                <Card>
                    <CardHeader>
                        <CardTitle>Notifications by Type</CardTitle>
                        <CardDescription>
                            Distribution of notifications across different types
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <Info className="w-5 h-5 text-blue-500" />
                                    <span className="font-semibold">Info</span>
                                </div>
                                <p className="text-2xl font-bold">{summary.byType.info}</p>
                            </div>

                            <div className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <span className="font-semibold">Success</span>
                                </div>
                                <p className="text-2xl font-bold">{summary.byType.success}</p>
                            </div>

                            <div className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                                    <span className="font-semibold">Warning</span>
                                </div>
                                <p className="text-2xl font-bold">{summary.byType.warning}</p>
                            </div>

                            <div className="p-4 border rounded-lg space-y-2">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <span className="font-semibold">Error</span>
                                </div>
                                <p className="text-2xl font-bold">{summary.byType.error}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Notifications */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Recent Notifications (24h)</CardTitle>
                                <CardDescription>
                                    Notifications from the last 24 hours
                                </CardDescription>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fetchNotifications()}
                                    disabled={loading}
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </Button>
                                {unreadCount > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => markAllAsRead()}
                                    >
                                        <CheckCheck className="w-4 h-4 mr-2" />
                                        Mark All Read
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {error && (
                            <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md mb-4">
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    <strong>Error:</strong> {error}
                                </p>
                            </div>
                        )}

                        <div className="space-y-2">
                            {recentNotifications.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Bell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>No notifications in the last 24 hours</p>
                                </div>
                            ) : (
                                recentNotifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={`p-4 border rounded-lg ${!notification.is_read
                                                ? 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                                                : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-3 flex-1">
                                                {notification.type === 'info' && <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />}
                                                {notification.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />}
                                                {notification.type === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />}
                                                {notification.type === 'error' && <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />}

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h4 className="font-semibold">{notification.title}</h4>
                                                        {!notification.is_read && (
                                                            <Badge variant="destructive" className="text-xs">New</Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        {notification.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <Badge variant="outline" className="text-xs">
                                                            {notification.type}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatNotificationTime(notification.created_at)}
                                                        </span>
                                                        {notification.order_id && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Order #{notification.order_id}
                                                            </Badge>
                                                        )}
                                                        {notification.flyer_id && (
                                                            <Badge variant="secondary" className="text-xs">
                                                                Flyer #{notification.flyer_id}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {!notification.is_read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    Mark Read
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Test Panel */}
                <NotificationTestPanel />

                {/* Code Examples */}
                <Card>
                    <CardHeader>
                        <CardTitle>Code Examples</CardTitle>
                        <CardDescription>
                            How to use the notification system in your components
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Basic Usage</h4>
                            <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                                {`import { useNotificationStore } from "@/stores/StoreProvider"
import { observer } from "mobx-react-lite"

const MyComponent = observer(() => {
  const { unreadCount } = useNotificationStore()
  return <div>Unread: {unreadCount}</div>
})`}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Using Notification Badge</h4>
                            <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                                {`import { NotificationBellIcon } from "@/components/layout/NotificationBadge"

<NotificationBellIcon size="md" />`}
                            </pre>
                        </div>

                        <div className="space-y-2">
                            <h4 className="font-semibold text-sm">Manual Operations</h4>
                            <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
                                {`import { notificationStore } from "@/stores/notificationStore"

// Fetch notifications
await notificationStore.fetchNotifications()

// Mark as read
await notificationStore.markAsRead(notificationId)

// Mark all as read
await notificationStore.markAllAsRead()`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
})

export default NotificationExamplesPage
