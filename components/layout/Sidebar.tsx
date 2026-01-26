"use client"

import { LayoutDashboard, FileText, ShoppingCart, Layers, RectangleHorizontal, Settings } from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  userRole: "super-admin" | "admin" | "designer"
}

export function Sidebar({ currentPage, onPageChange, userRole }: SidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "flyers", label: "Flyers", icon: FileText },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "carousel", label: "Carousels", icon: Layers },
    { id: "liveflyer", label: "Live flyer", icon: Layers },     
    { id: "banner", label: "Banner", icon: RectangleHorizontal },
  ]

  const filteredItems = menuItems.filter((item) => {
    if (userRole === "designer" && item.id === "carousel") return false
    return true
  })

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div 
        className="p-6 border-b border-sidebar-border cursor-pointer hover:bg-sidebar-accent/50 transition-colors"
        onClick={() => onPageChange("dashboard")}
      >
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Gkodify" className="h-8 w-auto object-contain" />
          <div className="border-l border-sidebar-border pl-3">
            <h1 className="font-bold text-lg text-sidebar-foreground">Admin</h1>
            <p className="text-xs text-muted-foreground">Flyer Manager</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
      </div>
    </aside>
  )
}
