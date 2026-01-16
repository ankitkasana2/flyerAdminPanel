"use client"

import { useState, useRef } from "react"
import { Upload, X, Save, Download, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BulkUpload({ onClose, onUpload }) {
  const [flyers, setFlyers] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [uploadMode, setUploadMode] = useState("image") // 'image' or 'csv'
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const fileInputRef = useRef(null)
  const csvInputRef = useRef(null)

  const priceOptions = ["$10", "$15", "$40"]
  const formTypes = ["With Photo", "Only Info", "Birthday"]
  const categories = [
    "Recently Added",
    "Premium Flyers",
    "Basic Flyers",
    "DJ Image or Artist",
    "Ladies Night",
    "Brunch",
    "Summer",
    "Hookah Flyers",
    "Clean Flyers",
    "Drink Flyers",
    "Birthday Flyers",
    "Beach Party",
    "Pool Party",
    "Tropical",
    "Foam Party",
    "White Party",
    "All Black Party",
    "Halloween",
    "Winter",
    "Christmas",
    "Memorial Day",
    "Back to School",
    "President Day",
    "Saint Valentine's Day",
    "5 de Mayo",
    "Mexican Day",
    "4th of July",
    "Autumn / Fall Vibes",
    "Hip Hop Flyers",
    "Luxury Flyers",
    "Food Flyers",
    "Party Flyers",
  ]

  const parseCSV = (csvText) => {
    const lines = csvText.trim().split("\n")
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const rows = []

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const row = {}
      let currentValue = ""
      let insideQuotes = false
      let valueIndex = 0

      for (let j = 0; j < line.length; j++) {
        const char = line[j]
        const nextChar = line[j + 1]

        if (char === '"') {
          insideQuotes = !insideQuotes
        } else if (char === "," && !insideQuotes) {
          let trimmed = currentValue.trim()
          // Remove surrounding quotes if present
          if (
            (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
            (trimmed.startsWith("'") && trimmed.endsWith("'"))
          ) {
            trimmed = trimmed.slice(1, -1)
          }
          row[headers[valueIndex]] = trimmed
          currentValue = ""
          valueIndex++
        } else {
          currentValue += char
        }
      }

      // Handle last value
      let trimmed = currentValue.trim()
      if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
        trimmed = trimmed.slice(1, -1)
      }
      row[headers[valueIndex]] = trimmed

      rows.push(row)
    }
    return rows
  }

  const downloadImage = async (imageUrl) => {
    // Check if it's a local file path
    if (imageUrl.includes("\\") || imageUrl.includes(":")) {
      console.log("[v0] Local file path detected, skipping:", imageUrl)
      return null
    }

    let finalUrl = imageUrl

    if (imageUrl.includes("unsplash.com")) {
      // Extract the photo ID from various Unsplash URL formats
      let photoId = ""
      if (imageUrl.includes("/photos/")) {
        const parts = imageUrl.split("/photos/")
        photoId = parts[1]?.split("?")[0] || ""
      }

      if (photoId) {
        // Use direct Unsplash CDN URL with proper parameters
        finalUrl = `https://images.unsplash.com/photo-${photoId}?w=400&h=500&fit=crop&q=80`
      } else {
        // Fallback: use the original URL with parameters
        finalUrl = imageUrl + (imageUrl.includes("?") ? "&" : "?") + "w=400&h=500&fit=crop&q=80"
      }
    }

    try {
      const response = await fetch(finalUrl, {
        mode: "cors",
        credentials: "omit",
        headers: {
          Accept: "image/*",
        },
      })

      if (!response.ok) {
        console.log("[v0] Image fetch failed:", response.status, finalUrl)
        return null
      }

      const blob = await response.blob()
      console.log("[v0] Image successfully fetched:", finalUrl, "Size:", blob.size)
      return blob
    } catch (error) {
      console.log("[v0] Error fetching image:", error.message, finalUrl)
      return null
    }
  }

  const handleCSVUpload = async (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      setMessage({ type: "error", text: "Please select a valid CSV file." })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const text = await file.text()
      const rows = parseCSV(text)

      if (rows.length === 0) {
        setMessage({ type: "error", text: "CSV file is empty." })
        setIsLoading(false)
        return
      }

      const newFlyers = []
      let successCount = 0
      let errorCount = 0
console.log("[v0] Parsed ankit kasana CSV rows:", rows);
      for (let i = 0; i < Math.min(rows.length, 30 - flyers.length); i++) {
        const row = rows[i]

        // Validate required fields
        if (!row.image_url || !row.flyer_name || !row.price) {
          console.log("[v0] Skipping row", i + 2, "- missing required fields")
          errorCount++
          continue
        }

        const flyer_categories = row.category
          ? row.category
              .split(",")
              .map((c) => c.trim())
              .filter((c) => c && c.length > 0)
          : []

        // Parse recently_added (Yes/No)
        const recently_added = row.recently_added && row.recently_added.toLowerCase() === "no" ? false : true

        console.log("[v0] Processing row", i + 2, "- categories:", flyer_categories)

        let imageBlob = null
        let imageError = false

        if (row.image_url && row.image_url.trim() !== "") {
          // image_url =row.image_url;
          imageBlob = await downloadImage(row.image_url)
          if (!imageBlob) {
            imageError = true
            console.log("[v0] Row", i + 2, "- image failed to load, will use placeholder")
          } else {
            console.log("[v0] Row", i + 2, "- image loaded successfully")
          }
        }
        console.log("this is image url",row.image_url);

        const createFlyerObject = (preview) => ({
          id: `${Date.now()}-${i}-${Math.random()}`,
          file: imageBlob,
          preview: row.image_url || "/event-flyer.png",
          title: row.flyer_name || "Untitled",
          fileNameOriginal: row.file_name_original || "",
          price: row.price.trim() || "$10",
          formType: row.form_type || "Only Info",
          categories: flyer_categories,
          recentlyAdded: recently_added,
          imageError: imageError,
        })

        if (imageBlob) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const flyerObj = createFlyerObject(e.target?.result)
            console.log("[v0] Flyer created with image preview, categories:", flyerObj.categories)
            newFlyers.push(flyerObj)
            successCount++

            if (successCount + errorCount === Math.min(rows.length, 30 - flyers.length)) {
              setFlyers((prev) => [...prev, ...newFlyers])
              const errorMsg =
                errorCount > 0 ? ` (${errorCount} rows skipped due to missing fields or image load errors)` : ""
              setMessage({
                type: "success",
                text: `Loaded ${successCount} flyer${successCount !== 1 ? "s" : ""} from CSV.${errorMsg}`,
              })
            }
          }
          reader.onerror = () => {
            console.error("[v0] FileReader error for image blob")
            successCount++
            errorCount++
            if (successCount + errorCount === Math.min(rows.length, 30 - flyers.length)) {
              setFlyers((prev) => [...prev, ...newFlyers])
              const errorMsg = errorCount > 0 ? ` (${errorCount} rows skipped due to errors)` : ""
              setMessage({
                type: "success",
                text: `Loaded ${successCount} flyer${successCount !== 1 ? "s" : ""} from CSV.${errorMsg}`,
              })
            }
          }
          reader.readAsDataURL(imageBlob)
        } else {
          const flyerObj = createFlyerObject(null)
          console.log("[v0] Flyer created without image, categories:", flyerObj.categories)
          newFlyers.push(flyerObj)
          successCount++

          if (successCount + errorCount === Math.min(rows.length, 30 - flyers.length)) {
            setFlyers((prev) => [...prev, ...newFlyers])
            const errorMsg = errorCount > 0 ? ` (${errorCount} rows skipped due to missing fields)` : ""
            setMessage({
              type: "success",
              text: `Loaded ${successCount} flyer${successCount !== 1 ? "s" : ""} from CSV.${errorMsg}`,
            })
          }
        }
      }
    } catch (error) {
      setMessage({ type: "error", text: `Error parsing CSV: ${error.message}` })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (files) => {
    if (!files) return

    const newFlyers = []
    for (let i = 0; i < Math.min(files.length, 30 - flyers.length); i++) {
      const file = files[i]
      if (file.type.startsWith("image/")) {
        const reader = new FileReader()
        reader.onload = (e) => {
          newFlyers.push({
            id: `${Date.now()}-${i}`,
            file,
            preview: e.target?.result,
            title: file.name.replace(/\.[^/.]+$/, ""),
            fileNameOriginal: "",
            price: "$10",
            formType: "Only Info",
            categories: [],
            recentlyAdded: true,
            imageError: false,
          })

          if (newFlyers.length === Math.min(files.length, 30 - flyers.length)) {
            setFlyers((prev) => [...prev, ...newFlyers])
          }
        }
        reader.readAsDataURL(file)
      }
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (uploadMode === "csv") {
      handleCSVUpload(e.dataTransfer.files[0])
    } else {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const updateFlyer = (id, updates) => {
    setFlyers((prev) => prev.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const removeFlyer = (id) => {
    setFlyers((prev) => prev.filter((f) => f.id !== id))
  }

  const toggleCategory = (id, category) => {
    setFlyers((prev) =>
      prev.map((f) => {
        if (f.id === id) {
          return {
            ...f,
            categories: f.categories.includes(category)
              ? f.categories.filter((c) => c !== category)
              : [...f.categories, category],
          }
        }
        return f
      }),
    )
  }

  // const handleSave = () => {
  //   if (flyers.length > 0) {
  //     onUpload(flyers)
  //     setFlyers([])
  //     setUploadMode("image")
  //     setMessage({
  //       type: "success",
  //       text: "All flyers have been uploaded successfully.",
  //     })
  //   }
  // }

  const handleSave = async () => {
  if (flyers.length === 0) return;

  setIsLoading(true);
  setMessage(null);

  try {
    // Prepare payload
    const payload = flyers.map((flyer) => ({
      title: flyer.title,
      price: flyer.price,
      formType: flyer.formType,
      recentlyAdded: flyer.recentlyAdded,
      categories: flyer.categories,
      image_url: flyer.preview || "", // URL or base64
      fileNameOriginal: flyer.fileNameOriginal || "",
    }));

    const response = await fetch("http://193.203.161.174:3007/api/flyers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ flyers: payload }),
    });

    // Read the raw text first
    const text = await response.text();

    let data;
    try {
      data = JSON.parse(text); // parse only if valid JSON
    } catch {
      throw new Error(`Invalid JSON response from server: ${text}`);
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to upload flyers");
    }

    console.log("Upload result:", data);

    setMessage({ type: "success", text: "All flyers have been uploaded successfully." });
    setFlyers([]);
    setUploadMode("image");
  } catch (error) {
    console.error("Upload error:", error);
    setMessage({ type: "error", text: `Error uploading flyers: ${error.message}` });
  } finally {
    setIsLoading(false);
  }
};





  const downloadSampleCSV = () => {
    const sampleCSV = `file_name_original,flyer_name,price,form_type,recently_added,category,image_url
grodify0123457,Neon Party,$40,With Photo,Yes,"Summer, Ladies Night, Drink Flyers",https://unsplash.com/photos/a-black-and-white-photo-of-a-sand-dune-wqDdhIM2JaI
party_001,Beach Vibes,$15,Only Info,Yes,"Beach Party, Summer, Party Flyers",https://unsplash.com/photos/a-black-and-white-photo-of-a-sand-dune-wqDdhIM2JaI
dj_night_01,DJ Night,$10,With Photo,No,"DJ Image or Artist, Premium Flyers",https://unsplash.com/photos/a-black-and-white-photo-of-a-sand-dune-wqDdhIM2JaI`

    const element = document.createElement("a")
    element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(sampleCSV))
    element.setAttribute("download", "sample_flyers.csv")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-foreground">Bulk Flyer Upload</CardTitle>
          <CardDescription className="text-muted-foreground">
            Upload up to 30 flyers at once and configure them
          </CardDescription>
        </div>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </CardHeader>
      <CardContent className="space-y-6">
        {flyers.length === 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={uploadMode === "image" ? "default" : "outline"}
              onClick={() => setUploadMode("image")}
              className={uploadMode === "image" ? "bg-[#E50914] text-white" : "border-border text-foreground"}
            >
              Upload Images
            </Button>
            <Button
              variant={uploadMode === "csv" ? "default" : "outline"}
              onClick={() => setUploadMode("csv")}
              className={uploadMode === "csv" ? "bg-[#E50914] text-white" : "border-border text-foreground"}
            >
              Upload CSV
            </Button>
            {uploadMode === "csv" && (
              <Button
                variant="outline"
                onClick={downloadSampleCSV}
                className="ml-auto border-border text-foreground gap-2 bg-transparent"
              >
                <Download className="w-4 h-4" />
                Sample CSV
              </Button>
            )}
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg flex items-center gap-2 ${
              message.type === "success"
                ? "bg-green-500/10 text-green-700 border border-green-200"
                : "bg-red-500/10 text-red-700 border border-red-200"
            }`}
          >
            {message.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Upload Area */}
        {flyers.length === 0 ? (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? "border-[#E50914] bg-[#E50914]/5" : "border-border"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-foreground font-semibold mb-1">
              {uploadMode === "csv" ? "Drag and drop your CSV file here" : "Drag and drop your flyers here"}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {uploadMode === "csv" ? "or click to select a CSV file" : "or click to select files (up to 30 images)"}
            </p>
            <Button
              onClick={() => (uploadMode === "csv" ? csvInputRef.current?.click() : fileInputRef.current?.click())}
              disabled={isLoading}
              className="bg-[#E50914] text-white hover:bg-[#C40812]"
            >
              {isLoading ? "Loading..." : "Select File"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
            <input
              ref={csvInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && handleCSVUpload(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {flyers.length} flyer{flyers.length !== 1 ? "s" : ""} selected
              </p>
              <Button
                variant="outline"
                onClick={() => (uploadMode === "csv" ? csvInputRef.current?.click() : fileInputRef.current?.click())}
                disabled={isLoading}
                className="border-border text-foreground hover:bg-secondary bg-transparent"
              >
                Add More
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
              <input
                ref={csvInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && handleCSVUpload(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Flyers Preview List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {flyers.map((flyer) => {
                const isPremium = flyer.price === "$40"
                const hasPhoto = flyer.formType === "With Photo"
                return (
                  <div key={flyer.id} className="p-4 bg-[#141414] rounded-lg border border-[#333] shadow-sm">
                    <div className="flex gap-4">
                      {/* Preview Image */}
                      <div className="flex-shrink-0 relative w-24 h-32">
                        {isPremium && (
                          <div
                            aria-hidden="true"
                            className="absolute z-30"
                            style={{
                              top: 17,
                              left: -1,
                              transform: "rotate(-40deg)",
                            }}
                          >
                            <div
                              className="inline-block px-2 py-[3px] text-[11px] font-semibold rounded-sm shadow-md"
                              style={{
                                background: "linear-gradient(180deg,#F6C84C,#D6A91E)",
                                color: "#111",
                              }}
                            >
                              Premium
                            </div>
                          </div>
                        )}

                        {hasPhoto && (
                          <div
                            aria-hidden="true"
                            className={isPremium ? "absolute z-20" : "absolute z-30"}
                            style={{
                              top: isPremium ? 4 : 4,
                              left: isPremium ? -13 : -13,
                              transform: "rotate(-37deg)",
                            }}
                          >
                            <div className="w-[55px] h-auto flex items-center justify-center">
                              <img src="/rib.png" alt="Photo Ribbon" className="w-[22px] h-[22px] drop-shadow-md" />
                            </div>
                          </div>
                        )}

                        <img
                          src={flyer.preview || "/event-flyer.png"}
                          // src={flyer.preview || "/event-flyer.png"}
                          alt={flyer.title || "flyer preview"}
                          className="w-full h-full object-cover rounded border border-[#333]"
                          crossOrigin="anonymous"
                        />

                        {/* {flyer.imageError && (
                          <div className="absolute inset-0 bg-black/50 rounded flex items-center justify-center">
                            <span className="text-xs text-white text-center px-1">Image failed to load</span>
                          </div>
                        )} */}
                      </div>

                      {/* Configuration Fields */}
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          {/* Title */}
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-gray-300 mb-1">Title</label>
                            <Input
                              value={flyer.title}
                              onChange={(e) => updateFlyer(flyer.id, { title: e.target.value })}
                              className="bg-[#1F1F1F] border border-[#333] text-white text-sm px-2 py-1 rounded"
                            />
                          </div>

                          {/* Price */}
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-gray-300 mb-1">Price</label>
                            <select
                              value={flyer.price}
                              onChange={(e) => updateFlyer(flyer.id, { price: e.target.value })}
                              className="w-full px-2 py-1 bg-[#1F1F1F] border border-[#333] rounded text-white text-sm accent-[#E50914]"
                            >
                              {priceOptions.map((price) => (
                                <option key={price} value={price} className="bg-[#1F1F1F] text-white">
                                  {price}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Form Type */}
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-gray-300 mb-1">Form Type</label>
                            <select
                              value={flyer.formType}
                              onChange={(e) =>
                                updateFlyer(flyer.id, {
                                  formType: e.target.value,
                                })
                              }
                              className="w-full px-2 py-1 bg-[#1F1F1F] border border-[#333] rounded text-white text-sm"
                            >
                              {formTypes.map((type) => (
                                <option key={type} value={type} className="bg-[#1F1F1F] text-white">
                                  {type}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Recently Added */}
                          <div className="flex flex-col justify-end">
                            <label className="flex items-center gap-2 cursor-pointer mt-auto">
                              <input
                                type="checkbox"
                                checked={flyer.recentlyAdded}
                                onChange={(e) =>
                                  updateFlyer(flyer.id, {
                                    recentlyAdded: e.target.checked,
                                  })
                                }
                                className="w-4 h-4 rounded border-[#333] checked:bg-[#E50914] checked:border-[#E50914] checked:accent-[#E50914] focus:ring-0"
                              />
                              <span className="text-xs font-medium text-white">Recently Added</span>
                            </label>
                          </div>
                        </div>

                        {/* File Name Original (read-only) */}
                        {flyer.fileNameOriginal && (
                          <div className="flex flex-col">
                            <label className="text-xs font-medium text-gray-400 mb-1">Original File Name (Admin)</label>
                            <div className="text-xs text-gray-400 px-2 py-1 bg-[#0F0F0F] rounded border border-[#333]">
                              {flyer.fileNameOriginal}
                            </div>
                          </div>
                        )}

                        <div className="flex flex-col">
                          <label className="text-xs font-medium text-gray-300 mb-2">
                            Categories (Select multiple) - {flyer.categories.length} selected
                          </label>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto bg-[#0F0F0F] p-2 rounded border border-[#333]">
                            {categories.map((category) => (
                              <label key={category} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={flyer.categories.includes(category)}
                                  onChange={() => toggleCategory(flyer.id, category)}
                                  className="w-3 h-3 rounded border-[#333] checked:bg-[#E50914] checked:border-[#E50914]"
                                />
                                <span className="text-xs text-gray-300">{category}</span>
                              </label>
                            ))}
                          </div>
                          {flyer.categories.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {flyer.categories.map((cat) => (
                                <span key={cat} className="text-xs bg-[#E50914]/20 text-[#E50914] px-2 py-1 rounded">
                                  {cat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFlyer(flyer.id)}
                        className="flex-shrink-0 p-2 hover:bg-[#E50914]/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-400 hover:text-[#E50914]" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {flyers.length > 0 && (
          <div className="flex gap-3 justify-end pt-4 border-t border-border">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-border text-foreground hover:bg-secondary bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-[#E50914] text-white hover:bg-[#C40812] gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? "Saving..." : "Save All Flyers"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
