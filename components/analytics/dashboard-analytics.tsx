"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Download } from "lucide-react"
import { exportToExcel, exportToPDF, exportToCSV } from "@/lib/export-utils"

// Sample data
const dashboardData = {
  totalOrders: 1250,
  totalRevenue: 45000,
  totalFlyers: 320,
  activeCarousels: 12,
  ordersTrend: [
    { month: "Jan", orders: 120, revenue: 3500 },
    { month: "Feb", orders: 150, revenue: 4200 },
    { month: "Mar", orders: 180, revenue: 5100 },
    { month: "Apr", orders: 200, revenue: 6000 },
    { month: "May", orders: 220, revenue: 6800 },
    { month: "Jun", orders: 250, revenue: 7500 },
  ],
  categoryDistribution: [
    { name: "Hookah", value: 85 },
    { name: "Halloween", value: 120 },
    { name: "Summer", value: 95 },
    { name: "Birthday", value: 110 },
    { name: "Wedding", value: 75 },
  ],
}

const COLORS = ["#E50914", "#FF6B6B", "#FFA500", "#FFD700", "#90EE90"]

export function DashboardAnalytics() {
  const [exportFormat, setExportFormat] = useState<"excel" | "pdf" | "csv">("excel")

  const handleExport = () => {
    const exportData = [
      {
        Metric: "Total Orders",
        Value: dashboardData.totalOrders,
        "Last Updated": new Date().toLocaleDateString(),
      },
      {
        Metric: "Total Revenue",
        Value: `$${dashboardData.totalRevenue}`,
        "Last Updated": new Date().toLocaleDateString(),
      },
      {
        Metric: "Total Flyers",
        Value: dashboardData.totalFlyers,
        "Last Updated": new Date().toLocaleDateString(),
      },
      {
        Metric: "Active Carousels",
        Value: dashboardData.activeCarousels,
        "Last Updated": new Date().toLocaleDateString(),
      },
    ]

    if (exportFormat === "excel") {
      exportToExcel(exportData, "dashboard-analytics", "Dashboard")
    } else if (exportFormat === "pdf") {
      const columns = ["Metric", "Value", "Last Updated"]
      const data = exportData.map((row) => [row.Metric, row.Value, row["Last Updated"]])
      exportToPDF("Dashboard Analytics Report", columns, data, "dashboard-analytics")
    } else {
      exportToCSV(exportData, "dashboard-analytics")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Analytics</h2>
        <div className="flex gap-2">
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value as any)}
            className="px-3 py-2 bg-card border border-border rounded-md text-sm"
          >
            <option value="excel">Excel</option>
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
          </select>
          <Button onClick={handleExport} className="bg-[#E50914] hover:bg-[#C40812] text-white">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">+12% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${dashboardData.totalRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">+8% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Flyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalFlyers}</div>
            <p className="text-xs text-muted-foreground mt-1">+5 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Carousels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeCarousels}</div>
            <p className="text-xs text-muted-foreground mt-1">All running smoothly</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Orders & Revenue Trend</CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.ordersTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="orders" stroke="#E50914" name="Orders" />
                <Line type="monotone" dataKey="revenue" stroke="#90EE90" name="Revenue ($)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Flyers by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
