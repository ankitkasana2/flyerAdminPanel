"use client"

import { TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const topFlyers = [
  { id: 1, name: "Birthday Bash", purchases: 234, favorites: 156, searches: 89 },
  { id: 2, name: "Wedding Elegance", purchases: 198, favorites: 142, searches: 76 },
  { id: 3, name: "Corporate Pro", purchases: 167, favorites: 98, searches: 54 },
  { id: 4, name: "Party Time", purchases: 145, favorites: 87, searches: 42 },
]

export function TopFlyers() {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Top Flyers
        </CardTitle>
        <CardDescription className="text-muted-foreground">Most purchased, favorited & searched</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topFlyers.map((flyer) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
