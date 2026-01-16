"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface BirthdayFormProps {
  title?: string
  onSubmit?: (data: BirthdayFormData) => void
}

export interface BirthdayFormData {
  celebrantName: string
  celebrantAge: number
  celebrantEmail: string
  celebrantPhone: string
  celebrationDate: string
  guestCount: number
  specialRequests: string
}

export function BirthdayForm({ title = "Birthday Celebration Form", onSubmit }: BirthdayFormProps) {
  const [formData, setFormData] = useState<BirthdayFormData>({
    celebrantName: "",
    celebrantAge: 0,
    celebrantEmail: "",
    celebrantPhone: "",
    celebrationDate: "",
    guestCount: 1,
    specialRequests: "",
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Birthday Form submitted:", formData)
    onSubmit?.(formData)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <Card className="bg-card border-border max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">Plan the perfect birthday celebration</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Celebrant Name</label>
            <Input
              type="text"
              name="celebrantName"
              value={formData.celebrantName}
              onChange={handleChange}
              placeholder="Birthday person's name"
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Age</label>
              <Input
                type="number"
                name="celebrantAge"
                value={formData.celebrantAge}
                onChange={handleChange}
                placeholder="Age"
                min="1"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground block mb-1">Guest Count</label>
              <Input
                type="number"
                name="guestCount"
                value={formData.guestCount}
                onChange={handleChange}
                placeholder="Number of guests"
                min="1"
                required
                className="bg-input border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email</label>
            <Input
              type="email"
              name="celebrantEmail"
              value={formData.celebrantEmail}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Phone</label>
            <Input
              type="tel"
              name="celebrantPhone"
              value={formData.celebrantPhone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Celebration Date</label>
            <Input
              type="date"
              name="celebrationDate"
              value={formData.celebrationDate}
              onChange={handleChange}
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Special Requests</label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests or preferences..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>

          <Button type="submit" className="w-full bg-[#E50914] text-white hover:bg-[#C40812]" disabled={isSubmitted}>
            {isSubmitted ? "Submitted!" : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
