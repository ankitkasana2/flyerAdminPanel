import { makeAutoObservable, runInAction } from "mobx";
import type { Flyer } from "@/lib/flyer-data";

class FlyerStore {
  flyers: Flyer[] = [];
  loading = false;
  saving = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchFlyers() {
    this.loading = true;
    this.error = null;

    try {
      const res = await fetch("http://193.203.161.174:3007/api/flyers");
      if (!res.ok) throw new Error("Failed to fetch flyers");
      const data = await res.json();

      const mappedFlyers: Flyer[] = data.map((f: any) => ({
        id: f.id.toString(),
        title: f.title,
        category: f.categories?.[0] || "Uncategorized",
        categories: f.categories || [],
        price: f.price,
        formType: f.form_type,
        image: f.image_url || "/placeholder.svg",
        recentlyAdded: !!f.recently_added,
        fileNameOriginal: f.file_name_original || "",
      }));

      runInAction(() => {
        this.flyers = mappedFlyers;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  // updateFlyer(updatedFlyer: Flyer) {
  //   this.flyers = this.flyers.map(f =>
  //     f.id === updatedFlyer.id ? updatedFlyer : f
  //   );
  // }
  // ---------------------------------------------------------
  // UPDATE FLYER (send to backend)
  // ---------------------------------------------------------
  async updateFlyer(updatedFlyer: Flyer) {
    this.saving = true;
    this.error = null;

    try {
      // Transform frontend Flyer object to backend API format
      const apiPayload = {
        title: updatedFlyer.title,
        price: updatedFlyer.price,
        form_type: updatedFlyer.formType, // Convert camelCase to snake_case
        categories: updatedFlyer.categories,
        recently_added: updatedFlyer.recentlyAdded, // Convert camelCase to snake_case
        image_url: updatedFlyer.image,
        file_name_original: updatedFlyer.fileNameOriginal,
      };

      const res = await fetch(
        `http://193.203.161.174:3007/api/flyers/${updatedFlyer.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      // Update locally
      runInAction(() => {
        this.flyers = this.flyers.map((f) =>
          f.id === updatedFlyer.id ? updatedFlyer : f
        );
      });

      return { success: true };
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
      });
      return { success: false, error: err.message };
    } finally {
      runInAction(() => {
        this.saving = false;
      });
    }
  }

  async deleteFlyer(flyerId: string) {
    this.loading = true;
    this.error = null;

    try {
      const res = await fetch(`http://193.203.161.174:3007/api/flyers/${flyerId}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Failed to delete flyer");

      // Remove from local state after successful API deletion
      runInAction(() => {
        this.flyers = this.flyers.filter(f => f.id !== flyerId);
      });

      return { success: true };
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
      });
      return { success: false, error: err.message };
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  getFlyersByCategory(category: string): Flyer[] {
    if (category === "Recently Added") return this.flyers.filter(f => f.recentlyAdded);
    if (category === "All") return this.flyers;
    return this.flyers.filter(f => f.categories?.includes(category) || f.category === category);
  }
}

export const flyerStore = new FlyerStore();
