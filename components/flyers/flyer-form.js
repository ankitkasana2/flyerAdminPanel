"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function FlyerForm({ onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    price: "Basic",
    formType: "Info-only",
    categories: [],
    recentlyAdded: false,
  })

  const priceOptions = [
    { value: "Basic", label: "Basic - $10" },
    { value: "Regular", label: "Regular - $15" },
    { value: "Premium", label: "Premium - $40" },
  ]

  const formTypes = ["Info-only", "With-images", "Birthday"]
  const categories = ["Birthday", "Wedding", "Corporate", "Anniversary", "Graduation"]

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }))
  }

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-foreground">Create New Flyer</CardTitle>
          <CardDescription className="text-muted-foreground">
            Add a new flyer template to your collection
          </CardDescription>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Title</label>
            <Input
              placeholder="Flyer title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Price Tier</label>
            <select
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm"
            >
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Form Type</label>
            <select
              value={formData.formType}
              onChange={(e) => setFormData({ ...formData, formType: e.target.value })}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm"
            >
              {formTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div> */}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Categories</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryToggle(category)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    formData.categories.includes(category)
                      ? "bg-[#E50914] text-white"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.recentlyAdded}
                onChange={(e) => setFormData({ ...formData, recentlyAdded: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-foreground">Mark as Recently Added</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-foreground hover:bg-secondary bg-transparent"
          >
            Cancel
          </Button>
          <Button className="bg-[#E50914] text-white hover:bg-[#C40812]">Create Flyer</Button>
        </div>
      </CardContent>
    </Card>
  )
}
