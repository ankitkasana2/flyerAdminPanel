"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Download } from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"

const flyersData = {
  byCategory: [
    { category: "Hookah", count: 85, revenue: 2550 },
    { category: "Halloween", count: 120, revenue: 3600 },
    { category: "Summer", count: 95, revenue: 2850 },
    { category: "Birthday", count: 110, revenue: 3300 },
    { category: "Wedding", count: 75, revenue: 2250 },
  ],
  byFormType: [
    { type: "With Photo", count: 180, percentage: 56 },
    { type: "Only Info", count: 95, percentage: 30 },
    { type: "Birthday", count: 65, percentage: 14 },
  ],
  topPerformers: [
    { name: "Halloween Party Flyer", views: 1250, orders: 45, revenue: 1350 },
    { name: "Summer Beach Bash", views: 980, orders: 38, revenue: 1140 },
    { name: "Birthday Celebration", views: 850, orders: 32, revenue: 960 },
    { name: "Wedding Invitation", views: 720, orders: 28, revenue: 840 },
    { name: "Hookah Lounge Night", views: 650, orders: 22, revenue: 660 },
  ],
}

export function FlyersAnalytics() {
  const handleExport = () => {
    const exportData = flyersData.topPerformers.map((flyer) => ({
      "Flyer Name": flyer.name,
      Views: flyer.views,
      Orders: flyer.orders,
      Revenue: `$${flyer.revenue}`,
    }))

    exportToExcel(exportData, "flyers-analytics", "Top Performers")
  }

  const handlePDFExport = () => {
    const columns = ["Flyer Name", "Views", "Orders", "Revenue"]
    const data = flyersData.topPerformers.map((flyer) => [
      flyer.name,
      flyer.views.toString(),
      flyer.orders.toString(),
      `$${flyer.revenue}`,
    ])
    exportToPDF("Flyers Analytics Report", columns, data, "flyers-analytics")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Flyers Analytics</h2>
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

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>Flyer count and revenue by category</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={flyersData.byCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#E50914" name="Flyer Count" />
              <Bar dataKey="revenue" fill="#90EE90" name="Revenue ($)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Form Type Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Form Type Distribution</CardTitle>
          <CardDescription>Breakdown of flyer form types</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flyersData.byFormType.map((item) => (
              <div key={item.type} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{item.type}</p>
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

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Flyers</CardTitle>
          <CardDescription>Best performing flyers by views and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {flyersData.topPerformers.map((flyer, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-medium">{flyer.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {flyer.views} views • {flyer.orders} orders
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#E50914]">${flyer.revenue}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
