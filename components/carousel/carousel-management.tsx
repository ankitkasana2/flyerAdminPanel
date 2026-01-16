"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { GripVertical, Plus, Trash2, Pin, PinOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { observer } from "mobx-react-lite"
import { carouselStore } from "@/stores/carouselStore"

interface CarouselManagementProps {
  userRole: "super-admin" | "admin" | "designer"
}

export const CarouselManagement = observer(function CarouselManagement({ userRole }: CarouselManagementProps) {
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemRank, setNewItemRank] = useState(1)

  useEffect(() => {
    carouselStore.fetchCarousels()
  }, [])

  const canEdit = userRole !== "designer"

  const handleDragStart = (id: number) => {
    setDraggedItem(id)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (targetId: number) => {
    if (draggedItem === null || draggedItem === targetId) return

    const carousels = carouselStore.carousels
    const draggedIndex = carousels.findIndex((c) => c.id === draggedItem)
    const targetIndex = carousels.findIndex((c) => c.id === targetId)

    // Calculate new rank (1-based index)
    // If we move down (draggedIndex < targetIndex), we effectively want it to be at the target's position...
    // But since the items shift, let's stick to the visual expectation:
    // If I drop on item #3, I expect it to take position 3.
    // However, splice logic puts it there.

    // We'll trust the visual drop target index as the new rank.
    // Note: If you drag from top (0) to bottom (2), visually it becomes the 3rd item (index 2).
    // Rank = index + 1

    const newCarousels = [...carousels]
    const [draggedCarousel] = newCarousels.splice(draggedIndex, 1)
    newCarousels.splice(targetIndex, 0, draggedCarousel)

    // Create the new ordered list with updated rank properties
    const updatedOrder = newCarousels.map((c, idx) => ({ ...c, position: idx + 1 }));

    // Send the ENTIRE new order to the store to be persisted
    await carouselStore.reorderAndSave(updatedOrder);
    setDraggedItem(null)
  }

  const togglePin = (id: number) => {
    carouselStore.togglePin(id)
  }

  const handleCreateCarousel = async () => {
    if (!newItemName) return;

    // Default rank to length + 1 if not specified or override
    const success = await carouselStore.createCarousel({
      name: newItemName,
      rank: Number(newItemRank)
    });

    if (success) {
      setIsDialogOpen(false);
      setNewItemName("");
      setNewItemRank(carouselStore.carousels.length + 1);
    }
  }

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this carousel?")) {
      await carouselStore.deleteCarousel(id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Carousel Management</h1>
          <p className="text-muted-foreground">Manage homepage carousels and their order</p>
        </div>
        {canEdit && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (open) {
              setNewItemRank(carouselStore.carousels.length + 1);
            }
          }}>
            <DialogTrigger asChild>
              <Button className="bg-[#E50914] text-white hover:bg-[#C40812] gap-2">
                <Plus className="w-4 h-4" />
                New Carousel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Carousel</DialogTitle>
                <DialogDescription>
                  Add a new carousel category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g. Club Flyers"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rank" className="text-right">
                    Rank
                  </Label>
                  <Input
                    id="rank"
                    type="number"
                    value={newItemRank}
                    onChange={(e) => setNewItemRank(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateCarousel} disabled={carouselStore.loading}>
                  {carouselStore.loading ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Active Carousels</CardTitle>
          <CardDescription className="text-muted-foreground">Drag to reorder carousels on homepage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {carouselStore.loading && carouselStore.carousels.length === 0 ? (
              <div className="text-center p-4">Loading carousels...</div>
            ) : (
              carouselStore.carousels.map((carousel) => (
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
                        Position #{carousel.position} • {carousel.flyers} flyers
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => togglePin(carousel.id)}
                          className="p-2 hover:bg-primary/20 rounded transition-colors"
                        >
                          {carousel.isPinned ? (
                            <Pin className="w-5 h-5 text-primary" />
                          ) : (
                            <PinOff className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(carousel.id)}
                          className="p-2 hover:bg-destructive/20 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            {!carouselStore.loading && carouselStore.carousels.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">No carousels found.</div>
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
    </div>
  )
})
