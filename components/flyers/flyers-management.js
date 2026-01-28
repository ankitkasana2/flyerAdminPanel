"use client"

import { useState, useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Plus, Edit2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { FlyerForm } from "./flyer-form"
import { BulkUpload } from "./bulk-upload"
import { flyerStore } from "@/stores/flyerStore"
import { EditFlyerModal } from "@/components/liveFlyer/edit-flyer-modal"

const FlyersManagementList = ({ userRole }) => {
  const [showForm, setShowForm] = useState(false)
  const [showBulkUpload, setShowBulkUpload] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingFlyer, setEditingFlyer] = useState(null)

  useEffect(() => {
    flyerStore.fetchFlyers()
  }, [])

  const canEdit = userRole !== "designer"

  const handleBulkUpload = (uploadedFlyers) => {
    console.log("[v0] Bulk upload received:", uploadedFlyers)
    setShowBulkUpload(false)
    flyerStore.fetchFlyers() // Refresh after upload
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this flyer?")) {
      const result = await flyerStore.deleteFlyer(id)
      if (result.success) {
        // Success alert or silent refresh (store already updates state)
      } else {
        alert("Failed to delete flyer")
      }
    }
  }

  const handleEdit = (flyer) => {
    setEditingFlyer(flyer)
  }

  const handleEditSave = async (updatedFlyer) => {
    await flyerStore.updateFlyer(updatedFlyer)
    setEditingFlyer(null)
  }

  const filteredFlyers = flyerStore.flyers.filter(flyer =>
    flyer.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Flyers Management</h1>
          <p className="text-muted-foreground">Create and manage your flyer templates</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Button
              onClick={() => setShowBulkUpload(true)}
              className="bg-[#E50914] text-white hover:bg-[#C40812] gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Flyers
            </Button>
            {/* <Button onClick={() => setShowForm(true)} className="bg-[#E50914] text-white hover:bg-[#C40812] gap-2">
              <Plus className="w-4 h-4" />
              New Flyer
            </Button> */}
          </div>
        )}
      </div>

      {showBulkUpload && <BulkUpload onClose={() => setShowBulkUpload(false)} onUpload={handleBulkUpload} />}

      {showForm && <FlyerForm onClose={() => setShowForm(false)} />}

      {editingFlyer && (
        <EditFlyerModal
          flyer={editingFlyer}
          isOpen={!!editingFlyer}
          onClose={() => setEditingFlyer(null)}
          onSave={handleEditSave}
        />
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">All Flyers</CardTitle>
          <CardDescription className="text-muted-foreground">Manage your flyer templates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input
              placeholder="Search flyers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-input border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="overflow-x-auto">
            {flyerStore.loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading flyers...</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Title</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Price</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Original Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Category</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFlyers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">No flyers found.</td>
                    </tr>
                  ) : (
                    filteredFlyers.map((flyer) => (
                      <tr key={flyer.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                        <td className="py-3 px-4 text-foreground font-medium">{flyer.title}</td>
                        <td className="py-3 px-4 text-foreground font-semibold text-primary">
                          {typeof flyer.price === 'number' ? `$${flyer.price}` : flyer.price}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono text-[11px] max-w-[150px] truncate" title={flyer.fileNameOriginal}>
                          {flyer.fileNameOriginal || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {flyer.categories && flyer.categories.length > 0
                            ? flyer.categories.join(", ")
                            : flyer.category}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className="px-2 py-1 rounded text-xs font-semibold bg-green-900/30 text-green-400"
                          >
                            Active
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {canEdit && (
                              <>
                                <button
                                  className="p-1 hover:bg-secondary rounded transition-colors"
                                  title="Edit"
                                  onClick={() => handleEdit(flyer)}
                                >
                                  <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                                </button>
                                <button
                                  className="p-1 hover:bg-secondary rounded transition-colors"
                                  title="Delete"
                                  onClick={() => handleDelete(flyer.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export const FlyersManagement = observer(FlyersManagementList)
