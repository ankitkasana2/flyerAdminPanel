"use client"

import { useState } from "react"
import { Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface OrdersManagementProps {
  userRole: "super-admin" | "admin" | "designer"
}

const mockOrders = [
  { id: "ORD-001", email: "john@example.com", amount: "$45.00", status: "Completed", date: "2024-01-15" },
  { id: "ORD-002", email: "jane@example.com", amount: "$60.00", status: "Processing", date: "2024-01-14" },
  { id: "ORD-003", email: "bob@example.com", amount: "$30.00", status: "Pending", date: "2024-01-13" },
  { id: "ORD-004", email: "alice@example.com", amount: "$75.00", status: "Completed", date: "2024-01-12" },
]

export function OrdersManagement({ userRole }: OrdersManagementProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const statuses = ["All", "Completed", "Processing", "Pending"]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-900/30 text-green-400"
      case "Processing":
        return "bg-blue-900/30 text-blue-400"
      case "Pending":
        return "bg-yellow-900/30 text-yellow-400"
      default:
        return "bg-gray-900/30 text-gray-400"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders Management</h1>
        <p className="text-muted-foreground">View and manage all customer orders</p>
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Orders</CardTitle>
          <CardDescription className="text-muted-foreground">Search and filter orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email or order #..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-secondary gap-2 bg-transparent"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
            </div>

            <div className="flex gap-2">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? "bg-[#E50914] text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Order ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                    <td className="py-3 px-4 text-foreground font-semibold">{order.id}</td>
                    <td className="py-3 px-4 text-muted-foreground">{order.email}</td>
                    <td className="py-3 px-4 text-foreground font-semibold text-primary">{order.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{order.date}</td>
                    <td className="py-3 px-4">
                      <button className="text-primary hover:text-primary/80 font-medium text-sm">View Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
