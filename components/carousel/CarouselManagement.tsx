"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { observer } from "mobx-react-lite"
import { GripVertical, Plus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { categoryStore, type Category } from "@/stores/categoryStore"
import { flyerStore } from "@/stores/flyerStore"

interface CarouselManagementProps {
  userRole: "super-admin" | "admin" | "designer"
}

export const CarouselManagement = observer(({ userRole }: CarouselManagementProps) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null)

  // Create Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const canEdit = userRole !== "designer"

  useEffect(() => {
    categoryStore.fetchCategories()
    flyerStore.fetchFlyers() // Fetch flyers to show counts
  }, [])

  const handleDragStart = (id: number) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: number) => {
    if (draggedItem === null || draggedItem === targetId) return

    const categories = categoryStore.categories
    const draggedIndex = categories.findIndex((c) => c.id === draggedItem)
    const targetIndex = categories.findIndex((c) => c.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    // Calculate new rank
    // We are moving the dragged item to the target index.
    // The visual list is 0-indexed, ranks are 1-based (usually).
    // Let's assume the new rank is targetIndex + 1.
    const newRank = targetIndex + 1

    // We optimistically update UI? The store does it.
    await categoryStore.updateCategoryRank(draggedItem, newRank)
    setDraggedItem(null)
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return

    setIsCreating(true)
    const nextRank = categoryStore.categories.length + 1
    const result = await categoryStore.createCategory(newCategoryName, nextRank)

    setIsCreating(false)
    if (result.success) {
      setIsCreateOpen(false)
      setNewCategoryName("")
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      await categoryStore.deleteCategory(id)
    }
  }

  // const togglePin = (id: number) => {
  //   // API doesn't support pinning yet
  // }

  if (categoryStore.loading && categoryStore.categories.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Carousel Management</h1>
          <p className="text-muted-foreground">Manage homepage carousels and their order</p>
        </div>
        {canEdit && (
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-[#E50914] text-white hover:bg-[#C40812] gap-2"
          >
            <Plus className="w-4 h-4" />
            New Carousel
          </Button>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Active Carousels</CardTitle>
          <CardDescription className="text-muted-foreground">Drag to reorder carousels on homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categoryStore.categories.map((carousel: Category, index) => {
              const flyerCount = flyerStore.getFlyersByCategory(carousel.name).length
              return (
                <div
                  key={carousel.id}
                  draggable={canEdit}
                  onDragStart={() => handleDragStart(carousel.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(carousel.id)}
                  className={`p-4 bg-secondary rounded-lg border border-border flex items-center justify-between ${canEdit ? "cursor-move hover:bg-secondary/80" : ""
                    } transition-colors`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    {canEdit && <GripVertical className="w-5 h-5 text-muted-foreground" />}
                    <div>
                      <p className="font-semibold text-foreground">{carousel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Position #{carousel.rank} • {flyerCount} flyers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        {/* Pinning not supported by API yet
                        <button
                          onClick={() => togglePin(carousel.id)}
                          className="p-2 hover:bg-primary/20 rounded transition-colors"
                        >
                          <Pin className="w-5 h-5 text-muted-foreground" />
                        </button> */}
                        <button
                          onClick={() => handleDelete(carousel.id)}
                          className="p-2 hover:bg-destructive/20 rounded transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}

            {categoryStore.categories.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No categories found. Create one to get started.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Carousel Settings</CardTitle>
          <CardDescription className="text-muted-foreground">Configure carousel display options</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-semibold text-foreground">Premium Carousel Style</p>
                <p className="text-sm text-muted-foreground">Enable special styling for premium carousels</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
              <div>
                <p className="font-semibold text-foreground">Auto-rotate Carousels</p>
                <p className="text-sm text-muted-foreground">Automatically rotate carousel content</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Carousel Category</DialogTitle>
            <DialogDescription>
              Add a new category for grouping flyers on the homepage.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="e.g. Club Flyers"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateCategory} disabled={isCreating || !newCategoryName.trim()}>
              {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})

