"use client";

import { useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { CATEGORIES, type Flyer } from "@/lib/flyer-data";
import { flyerStore } from "@/stores/flyerStore";
import { CategorySection } from "./category-section";
import { DeleteFlyerDialog } from "./delete-flyer-dialog";
import { Sparkles } from "lucide-react";
import { EditFlyerModal } from "./edit-flyer-modal";

const LiveFlyers = observer(() => {
  const [editingFlyer, setEditingFlyer] = useState<Flyer | null>(null);
  const [deletingFlyer, setDeletingFlyer] = useState<Flyer | null>(null);
  const [categoryChangeConfirm, setCategoryChangeConfirm] = useState<{
    flyer: Flyer;
    oldCategory: string;
    newCategory: string;
  } | null>(null);

  // Fetch flyers from API on mount
  useEffect(() => {
    flyerStore.fetchFlyers();
  }, []);

  // Group flyers by category
  const flyersByCategory = useMemo(() => {
    return CATEGORIES.reduce((acc, category) => {
      acc[category] = flyerStore.getFlyersByCategory(category);
      return acc;
    }, {} as Record<string, Flyer[]>);
  }, [flyerStore.flyers]);

  const handleEditSave = (
    updatedFlyer: Flyer,
    oldCategory: string,
    newCategory: string
  ) => {
    if (oldCategory !== newCategory) {
      setCategoryChangeConfirm({
        flyer: updatedFlyer,
        oldCategory,
        newCategory,
      });
    } else {
      flyerStore.updateFlyer(updatedFlyer);
    }
    setEditingFlyer(null);
  };

  const confirmCategoryChange = () => {
    if (categoryChangeConfirm) {
      flyerStore.updateFlyer(categoryChangeConfirm.flyer);
      setCategoryChangeConfirm(null);
    }
  };

  const handleDelete = async () => {
    if (deletingFlyer) {
      const result = await flyerStore.deleteFlyer(deletingFlyer.id);
      if (result.success) {
        setDeletingFlyer(null);
      }
      // Error handling is managed by the dialog component
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
      <header className="sticky top-0 z-40 bg-gradient-to-b from-background via-background to-background/80 backdrop-blur-md border-b border-primary/20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-primary to-primary/60 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70">
              Flyer Collections
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Browse premium and custom flyers across all categories
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-16">
          {CATEGORIES.filter((category) =>
            category === "All" || flyersByCategory[category]?.length > 0
          ).map((category) => (
            <CategorySection
              key={category}
              category={category}
              flyers={flyersByCategory[category]}
              onEdit={setEditingFlyer}
              onDelete={setDeletingFlyer}
            />
          ))}
        </div>
      </div>

      {/* Ribbon Guide */}
      <section className="bg-gradient-to-r from-primary/10 via-transparent to-primary/5 border-t border-primary/20 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Ribbon Guide
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 bg-card/50 border border-border/40 rounded-lg backdrop-blur-sm hover:border-primary/40 transition-colors">
              <h3 className="font-bold text-foreground mb-3 text-lg">
                PHOTO Ribbon
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Appears on all flyers using the With Photo form (any price tier:
                $10 or $15)
              </p>
              <p className="text-sm text-muted-foreground">
                On $40 Premium flyers, the PHOTO ribbon appears below the
                PREMIUM ribbon in a smaller size.
              </p>
            </div>
            <div className="p-6 bg-card/50 border border-border/40 rounded-lg backdrop-blur-sm hover:border-primary/40 transition-colors">
              <h3 className="font-bold text-foreground mb-3 text-lg">
                PREMIUM Ribbon
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Automatically displayed on all $40 price tier flyers
              </p>
              <p className="text-sm text-muted-foreground">
                Appears at the top with priority when combined with the PHOTO
                ribbon.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Edit Modal */}
      {editingFlyer && (
        <EditFlyerModal
          flyer={editingFlyer}
          isOpen={!!editingFlyer}
          onClose={() => setEditingFlyer(null)}
          onSave={handleEditSave}
        />
      )}

      {/* Category Change Confirmation */}
      {categoryChangeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-xl shadow-2xl p-6 max-w-md transform animate-in">
            <h3 className="text-lg font-bold text-foreground mb-3">
              Move Flyer to Different Category?
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              You are moving{" "}
              <span className="font-semibold text-primary">
                {categoryChangeConfirm.flyer.title}
              </span>{" "}
              from{" "}
              <span className="font-semibold text-primary">
                {categoryChangeConfirm.oldCategory}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-primary">
                {categoryChangeConfirm.newCategory}
              </span>
              . This flyer will appear in the new category after confirmation.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setCategoryChangeConfirm(null)}
                className="px-4 py-2 rounded-lg bg-muted/80 text-muted-foreground hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmCategoryChange}
                className="px-4 py-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 transition-all font-medium shadow-lg"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      {deletingFlyer && (
        <DeleteFlyerDialog
          isOpen={!!deletingFlyer}
          flyerTitle={deletingFlyer.title}
          onConfirm={handleDelete}
          onCancel={() => setDeletingFlyer(null)}
        />
      )}
    </main>
  );
});

export default LiveFlyers;
