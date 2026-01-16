"use client"

import { useState } from "react"
import { Dashboard } from "../dashboard/Dashboard"
import { OrdersManagement } from "../orders/OrdersManagement"
import { CarouselManagement } from "../carousel/CarouselManagement"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { FlyersManagement } from "../flyers/flyers-management"

interface AdminLayoutProps {
  userRole: "super-admin" | "admin" | "designer"
  onLogout: () => void
}

export function AdminLayout({ userRole, onLogout }: AdminLayoutProps) {
  const [currentPage, setCurrentPage] = useState("dashboard")

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "flyers":
        return <FlyersManagement userRole={userRole} />
      case "orders":
        return <OrdersManagement userRole={userRole} />
      case "carousel":
        return <CarouselManagement userRole={userRole} />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} userRole={userRole} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userRole={userRole} onLogout={onLogout} />
        <main className="flex-1 overflow-auto bg-background">
          <div className="p-6">{renderPage()}</div>
        </main>
      </div>
    </div>
  )
}
