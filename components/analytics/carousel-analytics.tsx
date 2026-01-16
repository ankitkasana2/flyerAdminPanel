"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Download } from "lucide-react"
import { exportToExcel, exportToPDF } from "@/lib/export-utils"

const carouselData = {
  performance: [
    { carousel: "Featured Flyers", views: 5200, clicks: 420, ctr: 8.1 },
    { carousel: "New Arrivals", views: 4100, clicks: 328, ctr: 8.0 },
    { carousel: "Trending Now", views: 3800, clicks: 266, ctr: 7.0 },
    { carousel: "Premium Selection", views: 2900, clicks: 203, ctr: 7.0 },
    { carousel: "Seasonal Picks", views: 2100, clicks: 126, ctr: 6.0 },
  ],
  byCategory: [
    { category: "Hookah", impressions: 1200, clicks: 96 },
    { category: "Halloween", impressions: 1500, clicks: 135 },
    { category: "Summer", impressions: 1100, clicks: 77 },
    { category: "Birthday", impressions: 1300, clicks: 104 },
    { category: "Wedding", impressions: 900, clicks: 54 },
  ],
  engagement: [
    { metric: "Total Impressions", value: 18000 },
    { metric: "Total Clicks", value: 1440 },
    { metric: "Avg CTR", value: "8.0%" },
    { metric: "Active Carousels", value: 12 },
  ],
}

export function CarouselAnalytics() {
  const handleExport = () => {
    const exportData = carouselData.performance.map((carousel) => ({
      "Carousel Name": carousel.carousel,
      Views: carousel.views,
      Clicks: carousel.clicks,
      "CTR (%)": carousel.ctr.toFixed(1),
    }))

    exportToExcel(exportData, "carousel-analytics", "Performance")
  }

  const handlePDFExport = () => {
    const columns = ["Carousel Name", "Views", "Clicks", "CTR (%)"]
    const data = carouselData.performance.map((carousel) => [
      carousel.carousel,
      carousel.views.toString(),
      carousel.clicks.toString(),
      carousel.ctr.toFixed(1),
    ])
    exportToPDF("Carousel Analytics Report", columns, data, "carousel-analytics")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Carousel Analytics</h2>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {carouselData.engagement.map((item) => (
          <Card key={item.metric}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{item.metric}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Carousel Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Carousel Performance</CardTitle>
          <CardDescription>Views, clicks, and click-through rate</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={carouselData.performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="carousel" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="views" fill="#E50914" name="Views" />
              <Bar dataKey="clicks" fill="#90EE90" name="Clicks" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Category</CardTitle>
          <CardDescription>Impressions and clicks by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {carouselData.byCategory.map((item) => (
              <div
                key={item.category}
                className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
              >
                <div className="flex-1">
                  <p className="font-medium">{item.category}</p>
                  <p className="text-sm text-muted-foreground">{item.impressions} impressions</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-[#E50914]">{item.clicks} clicks</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
