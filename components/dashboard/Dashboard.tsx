"use client"

import { useEffect } from "react"
import { observer } from "mobx-react-lite"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

import { TopFlyers } from "./top-flyers"
import { ActiveOrders } from "./ActiveOrders"
import { ordersStore } from "@/stores/ordersStore"
import { flyerStore } from "@/stores/flyerStore"
import { categoryStore } from "@/stores/categoryStore"

const COLORS = [
  "#E50914", "#FF6B6B", "#FFA500", "#FFD700",
  "#28a745", "#20c997", "#17a2b8", "#6f42c1",
  "#fd7e14", "#e83e8c"
]

const DashboardBase = () => {
  useEffect(() => {
    flyerStore.fetchFlyers()
    categoryStore.fetchCategories()
  }, [])

  const totalOrders = ordersStore.orders.length

  const revenue = ordersStore.orders.reduce((acc, order) => {
    const priceStr = order.total_price || order.totalAmount || "0"
    const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""))
    return acc + (isNaN(price) ? 0 : price)
  }, 0)

  const activeFlyers = flyerStore.flyers.length

  const stats = [
    {
      label: "Total Orders",
      value: totalOrders.toLocaleString(),
      change: "+12%",
      period: "Today"
    },
    {
      label: "Revenue",
      value: `$${revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+8%",
      period: "Today"
    },
    {
      label: "New Users",
      value: "89",
      change: "+5%",
      period: "Today"
    },
    {
      label: "Active Flyers",
      value: activeFlyers.toLocaleString(),
      change: "+3%",
      period: "This Week"
    },
  ]

  // Calculate Chart Data (Last 7 Days)
  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i)); // Go back 6 days to today
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
    const fullDateStr = date.toISOString().split('T')[0];

    const dayOrders = ordersStore.orders.filter(o => {
      const orderDate = new Date(o.created_at || o.createdAt || 0);
      return orderDate.toISOString().split('T')[0] === fullDateStr;
    });

    const dayRevenue = dayOrders.reduce((acc, order) => {
      const priceStr = order.total_price || order.totalAmount || "0";
      const price = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
      return acc + (isNaN(price) ? 0 : price);
    }, 0);

    return {
      name: dateStr,
      orders: dayOrders.length,
      revenue: dayRevenue
    };
  });

  // Calculate Category Data
  // Logic: For each known category, count how many flyers match it (strings contain the name).
  const categoryCounts: Record<string, number> = {};

  // We iterate categories first, and for each, we check ALL flyers. 
  // This allows a single flyer to be counted in multiple categories if it matches multiple.
  categoryStore.categories.forEach(cat => {
    const count = flyerStore.flyers.filter(f => {
      const fCat = f.category || "";
      // Check if flyer's category string includes this category name
      return fCat.includes(cat.name);
    }).length;
    categoryCounts[cat.name] = count;
  });

  const categoryData = Object.entries(categoryCounts)
    .map(([name, value]) => ({
      name,
      value
    }))
    .filter(item => item.value > 0) // Filter 0s for cleaner Pie Chart
    .sort((a, b) => b.value - a.value);

  const finalCategoryData = categoryData.length > 0 ? categoryData : [
    { name: "No Data", value: 1 }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <Card key={idx} className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-primary">
                  {stat.change} from {stat.period}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Orders & Revenue</CardTitle>
            <CardDescription className="text-muted-foreground">Weekly performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis stroke="#666" dataKey="name" />
                <YAxis stroke="#666" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#E50914",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Bar dataKey="orders" fill="#E50914" name="Orders" />
                <Bar dataKey="revenue" fill="#FF6B6B" name="Revenue ($)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border flex flex-col">
          <CardHeader>
            <CardTitle className="text-foreground">Category Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">Flyer counts by type</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={finalCategoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {finalCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    color: "#E50914",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Orders and Top Flyers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActiveOrders />
        <TopFlyers />
      </div>
    </div>
  )
}

export const Dashboard = observer(DashboardBase)
