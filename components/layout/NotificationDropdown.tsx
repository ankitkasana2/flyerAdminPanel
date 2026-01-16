"use client"

import { observer } from "mobx-react-lite"
import { Bell, Check, CheckCheck, Clock, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react"
import { notificationStore } from "@/stores/notificationStore"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export const NotificationDropdown = observer(() => {
    const { sortedNotifications, unreadCount, loading, markAsRead, markAllAsRead } = notificationStore

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-4 h-4 text-green-500" />
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-yellow-500" />
            case "error":
                return <AlertCircle className="w-4 h-4 text-red-500" />
            default:
                return <Info className="w-4 h-4 text-blue-500" />
        }
    }

    const formatTime = (dateString: string) => {
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

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent">
                    <Bell className="w-6 h-6" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center px-1">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[380px] p-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            className="h-7 text-xs gap-1"
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {/* Notifications List */}
                <ScrollArea className="h-[400px]">
                    {loading && sortedNotifications.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <div className="text-center">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Loading notifications...</p>
                            </div>
                        </div>
                    ) : sortedNotifications.length === 0 ? (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            <div className="text-center">
                                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-medium">No notifications</p>
                                <p className="text-xs mt-1">You're all caught up!</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {sortedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer relative",
                                        !notification.is_read && "bg-blue-50/50 dark:bg-blue-950/20"
                                    )}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                >
                                    {/* Unread indicator */}
                                    {!notification.is_read && (
                                        <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full" />
                                    )}

                                    <div className="flex gap-3 ml-2">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className={cn(
                                                    "text-sm font-medium line-clamp-1",
                                                    !notification.is_read && "font-semibold"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.is_read && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-6 w-6 p-0 flex-shrink-0"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            markAsRead(notification.id)
                                                        }}
                                                    >
                                                        <Check className="w-3.5 h-3.5" />
                                                    </Button>
                                                )}
                                            </div>

                                            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatTime(notification.created_at)}
                                                </div>
                                                {notification.order_id && (
                                                    <span className="text-xs bg-accent px-2 py-0.5 rounded">
                                                        Order #{notification.order_id}
                                                    </span>
                                                )}
                                                {notification.flyer_id && (
                                                    <span className="text-xs bg-accent px-2 py-0.5 rounded">
                                                        Flyer #{notification.flyer_id}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>

                {/* Footer */}
                {sortedNotifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator />
                        <div className="px-4 py-2 text-center">
                            <Button variant="ghost" size="sm" className="w-full text-xs">
                                View all notifications
                            </Button>
                        </div>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
})
