"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Download } from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"

const ordersData = {
  statusBreakdown: [
    { status: "Completed", count: 850, percentage: 68 },
    { status: "Pending", count: 250, percentage: 20 },
    { status: "Processing", count: 100, percentage: 8 },
    { status: "Cancelled", count: 50, percentage: 4 },
  ],
  dailyOrders: [
    { date: "Mon", orders: 180, revenue: 5400 },
    { date: "Tue", orders: 195, revenue: 5850 },
    { date: "Wed", orders: 210, revenue: 6300 },
    { date: "Thu", orders: 225, revenue: 6750 },
    { date: "Fri", orders: 240, revenue: 7200 },
    { date: "Sat", orders: 200, revenue: 6000 },
    { date: "Sun", revenue: 2500, orders: 85 },
  ],
  topCustomers: [
    { name: "John Doe", orders: 15, totalSpent: 450 },
    { name: "Jane Smith", orders: 12, totalSpent: 360 },
    { name: "Mike Johnson", orders: 10, totalSpent: 300 },
    { name: "Sarah Williams", orders: 9, totalSpent: 270 },
    { name: "Tom Brown", orders: 8, totalSpent: 240 },
  ],
}

export function OrdersAnalytics() {
  const handleExport = () => {
    const exportData = ordersData.topCustomers.map((customer) => ({
      "Customer Name": customer.name,
      "Total Orders": customer.orders,
      "Total Spent": `$${customer.totalSpent}`,
    }))

    exportToExcel(exportData, "orders-analytics", "Top Customers")
  }

  const handlePDFExport = () => {
    const columns = ["Customer Name", "Total Orders", "Total Spent"]
    const data = ordersData.topCustomers.map((customer) => [
      customer.name,
      customer.orders.toString(),
      `$${customer.totalSpent}`,
    ])
    exportToPDF("Orders Analytics Report", columns, data, "orders-analytics")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Orders Analytics</h2>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline" className="border-border bg-transparent">
            <Download className="w-4 h-4 mr-2" />
            Export Excel
          </Button>
          <Button onClick={handlePDFExport} className="bg-[#E50914] hover:bg-[#C40812] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Status Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Breakdown</CardTitle>
          <CardDescription>Current order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordersData.statusBreakdown.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{item.status}</p>
                  <div className="w-full bg-card rounded-full h-2 mt-2">
                    <div className="bg-[#E50914] h-2 rounded-full" style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold">{item.count}</p>
                  <p className="text-sm text-muted-foreground">{item.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Orders Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Orders & Revenue</CardTitle>
          <CardDescription>This week's performance</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ordersData.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="orders" fill="#E50914" name="Orders" />
              <Bar dataKey="revenue" fill="#90EE90" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
          <CardDescription>Most valuable customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ordersData.topCustomers.map((customer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-medium">{customer.name}</p>
                  <p className="text-sm text-muted-foreground">{customer.orders} orders</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#E50914]">${customer.totalSpent}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
