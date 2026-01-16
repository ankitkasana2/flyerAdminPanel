"use client"

import { User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NotificationDropdown } from "./NotificationDropdown"

interface HeaderProps {
  userRole: "super-admin" | "admin" | "designer"
  onLogout: () => void
}

export function Header({ userRole, onLogout }: HeaderProps) {
  const roleLabel = {
    "super-admin": "Super Admin",
    admin: "Admin",
    designer: "Designer",
  }

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">Welcome back, {roleLabel[userRole]}</p>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />

        <div className="flex items-center gap-3 pl-4 border-l border-border">
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">{roleLabel[userRole]}</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary-foreground" />
          </div>
        </div>

        <Button onClick={onLogout} variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <LogOut className="w-5 h-5" />
        </Button>
      </div>
    </header>
  )
}
