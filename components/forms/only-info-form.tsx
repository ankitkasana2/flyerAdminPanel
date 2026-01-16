"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface OnlyInfoFormProps {
  title?: string
  onSubmit?: (data: OnlyInfoFormData) => void
}

export interface OnlyInfoFormData {
  name: string
  email: string
  phone: string
  message: string
}

export function OnlyInfoForm({ title = "Information Form", onSubmit }: OnlyInfoFormProps) {
  const [formData, setFormData] = useState<OnlyInfoFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Only Info Form submitted:", formData)
    onSubmit?.(formData)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <Card className="bg-card border-border max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">Please provide your information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Full Name</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your name"
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
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
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
              required
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Your message here..."
              rows={4}
              required
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
