"use client"

import { observer } from "mobx-react-lite"
import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { flyerStore } from "@/stores/flyerStore"
import { ordersStore } from "@/stores/ordersStore"

const TopFlyersBase = () => {
  // Calculate top flyers based on order mentions
  const flyerStats = flyerStore.flyers.map(flyer => {
    // Count how many orders mention this flyer name/title
    // This is an approximation based on string matching
    const purchases = ordersStore.orders.reduce((acc, order) => {
      // Check legacy flyers array
      const inLegacy = order.flyers?.some(f => f.name === flyer.title)
      // Check main event title or flyer info
      const inMain = order.event_title === flyer.title || order.flyer_info === flyer.title

      return acc + ((inLegacy || inMain) ? 1 : 0)
    }, 0)

    return {
      id: flyer.id,
      name: flyer.title,
      purchases,
      favorites: Math.floor(Math.random() * 50), // Mock data as API doesn't provide this yet
      searches: Math.floor(Math.random() * 100)  // Mock data as API doesn't provide this yet
    }
  })

  // Sort by purchases descending
  const topFlyers = flyerStats
    .sort((a, b) => b.purchases - a.purchases)
    .slice(0, 4)

  return (
    <Card className="bg-card border-border h-full">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Flyers
        </CardTitle>
        <CardDescription className="text-muted-foreground">Most purchased, favorited & searched</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topFlyers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No data available.</p>
          ) : (
            topFlyers.map((flyer) => (
              <div key={flyer.id} className="p-3 bg-secondary rounded-lg">
                <p className="font-semibold text-foreground mb-2">{flyer.name}</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Purchases</p>
                    <p className="font-bold text-primary">{flyer.purchases}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Favorites</p>
                    <p className="font-bold text-primary">{flyer.favorites}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Searches</p>
                    <p className="font-bold text-primary">{flyer.searches}</p>
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

export const TopFlyers = observer(TopFlyersBase)
