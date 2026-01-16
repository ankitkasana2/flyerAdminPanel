"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, X } from "lucide-react"

interface PhotoUploadFormProps {
  title?: string
  onSubmit?: (data: PhotoUploadFormData) => void
}

export interface PhotoUploadFormData {
  name: string
  email: string
  phone: string
  eventType: string
  photos: File[]
  message: string
}

export function PhotoUploadForm({ title = "Photo Upload Form", onSubmit }: PhotoUploadFormProps) {
  const [formData, setFormData] = useState<PhotoUploadFormData>({
    name: "",
    email: "",
    phone: "",
    eventType: "DJ",
    photos: [],
    message: "",
  })

  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const eventTypes = ["DJ", "Artist", "Event", "Party", "Wedding", "Corporate"]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const newFiles = Array.from(files)
    const newPreviews: string[] = []

    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string)
        if (newPreviews.length === newFiles.length) {
          setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...newFiles] }))
          setPreviewUrls((prev) => [...prev, ...newPreviews])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }))
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Photo Upload Form submitted:", formData)
    onSubmit?.(formData)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <Card className="bg-card border-border max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">Upload your photos and provide details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="text-sm font-medium text-foreground block mb-1">Event Type</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground text-sm"
              >
                {eventTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
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
          </div>

          {/* Photo Upload Area */}
          <div>
            <label className="text-sm font-medium text-foreground block mb-2">Upload Photos</label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-[#E50914]/50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-foreground font-medium">Click to upload photos</p>
              <p className="text-xs text-muted-foreground">or drag and drop</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </div>
          </div>

          {/* Photo Previews */}
          {previewUrls.length > 0 && (
            <div>
              <p className="text-sm font-medium text-foreground mb-2">{previewUrls.length} photo(s) selected</p>
              <div className="grid grid-cols-3 gap-2">
                {previewUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img
                      src={url || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 bg-destructive rounded hover:bg-destructive/80"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-foreground block mb-1">Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any additional details or requests..."
              rows={3}
              className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder:text-muted-foreground text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-[#E50914] text-white hover:bg-[#C40812]"
            disabled={isSubmitted || formData.photos.length === 0}
          >
            {isSubmitted ? "Submitted!" : "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
