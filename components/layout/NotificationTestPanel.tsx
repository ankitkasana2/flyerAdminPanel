"use client"

import { observer } from "mobx-react-lite"
import { notificationStore } from "@/stores/notificationStore"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, RefreshCw, CheckCheck, Loader2 } from "lucide-react"

/**
 * NotificationTestPanel Component
 * 
 * This component demonstrates how to use the notification store
 * and provides testing/debugging capabilities for the notification system.
 * 
 * Usage: Import and add this component to any page for testing
 */
export const NotificationTestPanel = observer(() => {
    const {
        notifications,
        unreadCount,
        loading,
        error,
        fetchNotifications,
        markAllAsRead
    } = notificationStore

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="w-5 h-5" />
                            Notification System Test Panel
                        </CardTitle>
                        <CardDescription>
                            Test and monitor the notification system
                        </CardDescription>
                    </div>
                    <Badge variant={unreadCount > 0 ? "destructive" : "secondary"}>
                        {unreadCount} Unread
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={() => fetchNotifications()}
                        disabled={loading}
                        variant="outline"
                        size="sm"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Loading...
                            </>
                        ) : (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={() => markAllAsRead()}
                        disabled={unreadCount === 0}
                        variant="outline"
                        size="sm"
                    >
                        <CheckCheck className="w-4 h-4 mr-2" />
                        Mark All Read
                    </Button>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                        <p className="text-sm text-red-600 dark:text-red-400">
                            <strong>Error:</strong> {error}
                        </p>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md">
                        <p className="text-xs text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold">{notifications.length}</p>
                    </div>
                    <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md">
                        <p className="text-xs text-muted-foreground">Unread</p>
                        <p className="text-2xl font-bold">{unreadCount}</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                        <p className="text-xs text-muted-foreground">Read</p>
                        <p className="text-2xl font-bold">{notifications.length - unreadCount}</p>
                    </div>
                </div>

                {/* Notification List */}
                <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Recent Notifications</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                No notifications found
                            </p>
                        ) : (
                            notifications.slice(0, 5).map((notification) => (
                                <div
                                    key={notification.id}
                                    className="p-3 border rounded-md flex items-start justify-between gap-3"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium truncate">
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <Badge variant="destructive" className="text-xs">
                                                    New
                                                </Badge>
                                            )}
                                        </div>
                                        <p className="text-xs text-muted-foreground line-clamp-1">
                                            {notification.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className="text-xs">
                                                {notification.type}
                                            </Badge>
                                            {notification.order_id && (
                                                <Badge variant="secondary" className="text-xs">
                                                    Order #{notification.order_id}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground whitespace-nowrap">
                                        ID: {notification.id}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* API Info */}
                <div className="p-3 bg-muted rounded-md">
                    <p className="text-xs font-mono">
                        API: {process.env.NEXT_PUBLIC_API_BASE_URL}/notifications
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        Auto-refresh: Every 30 seconds
                    </p>
                </div>
            </CardContent>
        </Card>
    )
})
