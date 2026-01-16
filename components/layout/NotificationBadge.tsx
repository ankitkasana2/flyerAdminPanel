"use client"

import { observer } from "mobx-react-lite"
import { Bell } from "lucide-react"
import { notificationStore } from "@/stores/notificationStore"
import { cn } from "@/lib/utils"

interface NotificationBadgeProps {
    className?: string
    showZero?: boolean
    maxCount?: number
    size?: "sm" | "md" | "lg"
}

/**
 * NotificationBadge Component
 * 
 * A reusable badge that displays the unread notification count.
 * Can be used standalone or integrated into other components.
 * 
 * @example
 * ```tsx
 * <NotificationBadge />
 * <NotificationBadge size="lg" maxCount={99} />
 * <NotificationBadge showZero className="my-custom-class" />
 * ```
 */
export const NotificationBadge = observer(({
    className,
    showZero = false,
    maxCount = 99,
    size = "md"
}: NotificationBadgeProps) => {
    const { unreadCount } = notificationStore

    if (!showZero && unreadCount === 0) {
        return null
    }

    const displayCount = unreadCount > maxCount ? `${maxCount}+` : unreadCount

    const sizeClasses = {
        sm: "min-w-[16px] h-[16px] text-[10px]",
        md: "min-w-[18px] h-[18px] text-xs",
        lg: "min-w-[20px] h-[20px] text-sm"
    }

    return (
        <span
            className={cn(
                "bg-red-500 text-white font-semibold rounded-full flex items-center justify-center px-1",
                sizeClasses[size],
                className
            )}
        >
            {displayCount}
        </span>
    )
})

/**
 * NotificationBellIcon Component
 * 
 * A bell icon with an integrated notification badge.
 * Perfect for navigation bars and headers.
 * 
 * @example
 * ```tsx
 * <NotificationBellIcon />
 * <NotificationBellIcon size="lg" />
 * ```
 */
export const NotificationBellIcon = observer(({
    size = "md",
    className
}: {
    size?: "sm" | "md" | "lg"
    className?: string
}) => {
    const { unreadCount } = notificationStore

    const iconSizes = {
        sm: "w-5 h-5",
        md: "w-6 h-6",
        lg: "w-7 h-7"
    }

    const badgeSizes = {
        sm: "sm" as const,
        md: "sm" as const,
        lg: "md" as const
    }

    return (
        <div className={cn("relative inline-block", className)}>
            <Bell className={iconSizes[size]} />
            {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1">
                    <NotificationBadge size={badgeSizes[size]} />
                </div>
            )}
        </div>
    )
})
