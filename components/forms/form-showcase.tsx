"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OnlyInfoForm } from "./only-info-form"
import { BirthdayForm } from "./birthday-form"
import { PhotoUploadForm } from "./photo-upload-form"

export function FormShowcase() {
  const [activeForm, setActiveForm] = useState<"info" | "birthday" | "photo">("info")

  const formTabs = [
    { id: "info", label: "Only Info Form", description: "Basic information collection" },
    { id: "birthday", label: "Birthday Form", description: "Birthday celebration details" },
    { id: "photo", label: "Photo Upload Form", description: "With photo upload capability" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Form Types</h2>
        <p className="text-muted-foreground">Preview the different flyer form types available</p>
      </div>

      {/* Form Tabs */}
      <div className="flex flex-wrap gap-2">
        {formTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveForm(tab.id as "info" | "birthday" | "photo")}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeForm === tab.id
                ? "bg-[#E50914] text-white"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="text-left">
              <p className="font-semibold text-sm">{tab.label}</p>
              <p className="text-xs opacity-75">{tab.description}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Form Display */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">
            {activeForm === "info" && "Only Info Form"}
            {activeForm === "birthday" && "Birthday Form"}
            {activeForm === "photo" && "Photo Upload Form"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {activeForm === "info" && "Collect basic information from users"}
            {activeForm === "birthday" && "Gather birthday celebration details"}
            {activeForm === "photo" && "Allow users to upload photos with their submission"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          {activeForm === "info" && <OnlyInfoForm />}
          {activeForm === "birthday" && <BirthdayForm />}
          {activeForm === "photo" && <PhotoUploadForm />}
        </CardContent>
      </Card>
    </div>
  )
}
