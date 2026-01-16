"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { bannerStore } from "@/stores/bannerStore";
import {
  GripVertical,
  Plus,
  Trash2,
  Edit2,
  X,
  Eye,
  EyeOff,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface BannerManagementProps {
  userRole: "super-admin" | "admin" | "designer";
}

export const BannerManagement = observer(({ userRole }: BannerManagementProps) => {
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageFile: null as File | null,
    previewImage: "", // base64 for preview
    buttonText: "GET IT",
    buttonEnabled: true,
    linkType: "category" as "category" | "flyer" | "external" | "none",
    linkValue: "",
  });

  const canEdit = userRole !== "designer";

  // Load banners on mount
  useEffect(() => {
    bannerStore.fetchBanners();
  }, []);

  // Drag & Drop (Local reordering only - abhi backend mein position save nahi ho raha)
  const handleDragStart = (id: number) => {
    setDraggedItem(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: number) => {
    if (draggedItem === null || draggedItem === targetId) return;

    const draggedBanner = bannerStore.banners.find((b) => b.id === draggedItem);
    const targetBanner = bannerStore.banners.find((b) => b.id === targetId);
    if (!draggedBanner || !targetBanner) return;

    const newBanners = [...bannerStore.banners];
    const draggedIdx = newBanners.findIndex((b) => b.id === draggedItem);
    const targetIdx = newBanners.findIndex((b) => b.id === targetId);

    newBanners.splice(draggedIdx, 1);
    newBanners.splice(targetIdx, 0, draggedBanner);

    // Position update locally (optional: backend API bana to bata dena)
    bannerStore.banners = newBanners.map((b, idx) => ({ ...b, position: idx + 1 }));
    setDraggedItem(null);
  };

  const toggleActive = async (id: number) => {
    const banner = bannerStore.banners.find((b) => b.id === id);
    if (banner) {
      const newStatus = banner.status ? 0 : 1;
      await bannerStore.toggleStatus(id, newStatus);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imageFile: file });

      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData((prev) => ({
          ...prev,
          previewImage: event.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOpenModal = (banner?: any) => {
    if (banner) {
      setEditingId(banner.id);
      setFormData({
        title: banner.title,
        description: banner.description,
        imageFile: null,
        previewImage: banner.imageUrl, // full URL from store
        buttonText: banner.button_text || "GET IT",
        buttonEnabled: banner.button_enabled,
        linkType: banner.link_type || "category",
        linkValue: banner.link_value || "",
      });
    } else {
      setEditingId(null);
      setFormData({
        title: "",
        description: "",
        imageFile: null,
        previewImage: "",
        buttonText: "GET IT",
        buttonEnabled: true,
        linkType: "category",
        linkValue: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBanner = async () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Please fill title and description!");
      return;
    }

    if (formData.buttonEnabled && !formData.linkValue.trim() && formData.linkType !== "none") {
      alert("Please fill link value when button is enabled!");
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    if (formData.imageFile) {
      formDataToSend.append("image", formData.imageFile);
    }
    
    // New fields
    formDataToSend.append("button_text", formData.buttonText);
    formDataToSend.append("button_enabled", formData.buttonEnabled ? "1" : "0");
    formDataToSend.append("link_type", formData.linkType);
    if (formData.linkValue) {
      formDataToSend.append("link_value", formData.linkValue);
    }

    try {
      if (editingId) {
        await bannerStore.updateBanner(editingId, formDataToSend);
      } else {
        await bannerStore.createBanner(formDataToSend);
      }
      setIsModalOpen(false);
    } catch (err) {
      alert("Banner not saved try again.");
    }
  };

  const handleDeleteBanner = async (id: number) => {
  if (!confirm("Are you Sure? banner delete parmanantly")) return;

  try {
    await bannerStore.deleteBanner(id);
    // Success toast ya message (optional)
  } catch (err) {
    alert("Not deleted " + bannerStore.error);
  }
};
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Banner Management</h1>
          <p className="text-muted-foreground">Manage banners and their display order</p>
        </div>
        {canEdit && (
          <Button
            className="bg-[#E50914] text-white hover:bg-[#C40812] gap-2"
            onClick={() => handleOpenModal()}
          >
            <Plus className="w-4 h-4" />
            Add Banner
          </Button>
        )}
      </div>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">Active Banners</CardTitle>
          <CardDescription className="text-muted-foreground">
            Drag to reorder banners on homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bannerStore.loading && <p className="text-center py-8">Loading banners...</p>}
          {bannerStore.error && <p className="text-red-500 text-center">{bannerStore.error}</p>}

          <div className="space-y-4">
            {bannerStore.banners
              .filter((b) => b.status === true) // sirf active dikhaye (optional)
              .map((banner) => (
                <div
                  key={banner.id}
                  draggable={canEdit}
                  onDragStart={() => handleDragStart(banner.id)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(banner.id)}
                  className={`p-4 bg-secondary rounded-lg border border-border flex items-center justify-between gap-4 ${
                    canEdit ? "cursor-move hover:bg-secondary/80" : ""
                  } transition-colors`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {canEdit && <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />}
                    <img
                      src={banner.imageUrl || "/placeholder.svg"}
                      alt={banner.title}
                      className="w-20 h-16 object-cover rounded flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">{banner.title}</p>
                      <p className="text-sm text-muted-foreground truncate">{banner.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          Status: {banner.status ? "Active" : "Inactive"}
                        </span>
                        {banner.button_enabled && (
                          <span className="text-xs text-green-600 font-medium">
                            Button: {banner.button_text || "GET IT"}
                          </span>
                        )}
                      </div>
                      {banner.button_enabled && banner.link_type !== "none" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Links to: {banner.link_type} → {banner.link_value}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canEdit && (
                      <>
                        <button
                          onClick={() => toggleActive(banner.id)}
                          className="p-2 hover:bg-primary/20 rounded transition-colors"
                        >
                          {banner.status ? (
                            <Eye className="w-5 h-5 text-primary" />
                          ) : (
                            <EyeOff className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>
                        <button
                          onClick={() => handleOpenModal(banner)}
                          className="p-2 hover:bg-blue-500/20 rounded transition-colors"
                        >
                          <Edit2 className="w-5 h-5 text-muted-foreground hover:text-blue-500" />
                        </button>
                        <button
                          onClick={() => handleDeleteBanner(banner.id)}
                          className="p-2 hover:bg-destructive/20 rounded transition-colors"
                        >
                          <Trash2 className="w-5 h-5 text-muted-foreground hover:text-destructive" />
                        </button>
                      </>
                    )}  
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-card border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-foreground">
                {editingId ? "Edit Banner" : "Create New Banner"}
              </CardTitle>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-secondary rounded transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Banner Name</label>
                <input
                  type="text"
                  placeholder="e.g., Summer Sale"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  placeholder="e.g., 50% off on all items"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none h-24"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Banner Image</label>
                <div className="flex gap-4">
                  <label className="flex-1">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="w-full px-4 py-3 border-2 border-dashed border-border rounded-lg bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer flex items-center justify-center gap-2 text-foreground">
                      <Upload className="w-4 h-4" />
                      <span>{formData.imageFile ? formData.imageFile.name : "Choose Image"}</span>
                    </div>
                  </label>
                </div>

                {(formData.previewImage || formData.imageFile) && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Preview</p>
                    <img
                      src={formData.previewImage || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                  </div>
                )}
              </div>

              {/* Button Configuration Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Button Configuration</h3>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="buttonEnabled"
                    checked={formData.buttonEnabled}
                    onChange={(e) => setFormData({ ...formData, buttonEnabled: e.target.checked })}
                    className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-primary"
                  />
                  <label htmlFor="buttonEnabled" className="text-sm font-medium text-foreground">
                    Enable Button
                  </label>
                </div>

                {formData.buttonEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Button Text</label>
                      <input
                        type="text"
                        placeholder="e.g., GET IT, SHOP NOW, EXPLORE"
                        value={formData.buttonText}
                        onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Link Type</label>
                      <select
                        value={formData.linkType}
                        onChange={(e) => setFormData({ ...formData, linkType: e.target.value as any })}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="category">Category</option>
                        <option value="flyer">Flyer</option>
                        <option value="external">External URL</option>
                        <option value="none">None</option>
                      </select>
                    </div>

                    {formData.linkType !== "none" && (
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          {formData.linkType === "category" ? "Category Name" : formData.linkType === "flyer" ? "Flyer Name" : "External URL"}
                        </label>
                        <input
                          type="text"
                          placeholder={
                            formData.linkType === "category" ? "e.g., Ladies Night, Summer, Party" :
                            formData.linkType === "flyer" ? "e.g., Summer Sale, Happy Hour" :
                            "e.g., https://example.com"
                          }
                          value={formData.linkValue}
                          onChange={(e) => setFormData({ ...formData, linkValue: e.target.value })}
                          className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#E50914] text-white hover:bg-[#C40812]"
                  onClick={handleSaveBanner}
                  disabled={bannerStore.loading}
                >
                  {bannerStore.loading ? "Saving..." : editingId ? "Update Banner" : "Create Banner"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
});