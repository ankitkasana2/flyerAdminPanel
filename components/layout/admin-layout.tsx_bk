"use client"

import { useState } from "react"

import { FlyersManagement } from "@/components/flyers/flyers-management"
import { OrdersManagement } from "@/components/orders/orders-management"
import { CarouselManagement } from "@/components/carousel/carousel-management"
import { Dashboard } from "../dashboard/Dashboard"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import LiveFlyers from "../liveFlyer/LiveFlyers"


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
        case "liveflyer":
        return <LiveFlyers />
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
