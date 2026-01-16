"use client"
import { observer } from "mobx-react-lite"
import { Clock, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ordersStore, Order } from "@/stores/ordersStore"
import { useEffect, useState } from "react"

const ActiveOrdersBase = () => {
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // Get active orders and sort by remaining time (most urgent first)
  const activeOrders = ordersStore.orders
    .filter(o => o.status !== 'completed' && o.status !== 'pending')
    .filter(o => o.status !== 'completed')
    .map(order => {
      const priorityInfo = ordersStore.getOrderPriority(order)
      const remainingMs = priorityInfo.remainingMs
      return {
        ...order,
        remainingMs,
        fastestDelivery: priorityInfo.fastest
      }
    })
    .sort((a, b) => a.remainingMs - b.remainingMs)
    .slice(0, 5) // Show top 5 urgent

  const formatTime = (ms: number) => {
    if (ms <= 0) return <span className="text-red-600 font-bold">Overdue</span>

    const totalSeconds = Math.floor(ms / 1000)
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60

    const parts: string[] = []
    if (h > 0) parts.push(`${h}h`)
    if (m > 0) parts.push(`${m}m`)
    // Always show seconds if under an hour or if it's the only thing
    if (h === 0 || parts.length === 0) parts.push(`${s}s`)

    return <>{parts.join(" ")}</>
  }

  const getPriorityColor = (deliveryType: string) => {
    switch (deliveryType) {
      case "1H":
        return "text-red-500"
      case "5H":
        return "text-orange-500"
      default:
        return "text-blue-500" // 24H
    }
  }

  // Helper to determine border/bg style based on urgency
  const getOrderStyle = (remainingMs: number) => {
    const hoursLeft = remainingMs / (1000 * 60 * 60)
    if (remainingMs <= 0) return "border-red-500/50 bg-red-500/10"
    if (hoursLeft < 1) return "border-red-500/30 bg-red-500/5"
    if (hoursLeft < 5) return "border-orange-500/30 bg-orange-500/5"
    return "border-border bg-card/50"
  }

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Active Orders
        </CardTitle>
        <CardDescription className="text-muted-foreground">Orders with countdown timers</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activeOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active orders.</p>
          ) : (
            activeOrders.map((order) => (
              <div
                key={order.id}
                className={`p-4 rounded-lg border ${getOrderStyle(order.remainingMs)} transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground">Order #{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.name || order.event_title || "Unknown Customer"}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${getPriorityColor(order.fastestDelivery)}`}>
                      {order.fastestDelivery}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end font-mono">
                      <Clock className="w-3 h-3" />
                      {formatTime(order.remainingMs)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export const ActiveOrders = observer(ActiveOrdersBase)
