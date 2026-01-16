// stores/bannerStore.ts  ← Real DELETE + Status Toggle dono hain
import { makeAutoObservable, runInAction } from "mobx";

const API_BASE = "http://193.203.161.174:3007/api/banners";
const UPLOADS_BASE = "http://193.203.161.174:3007/uploads/banners";

export interface IBanner {
  id: number;
  title: string;
  description: string | null;
  image: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  imageUrl: string;
  button_text?: string | null;
  button_enabled: boolean;
  link_type: "category" | "flyer" | "external" | "none";
  link_value?: string | null;
  display_order?: number;
}

class BannerStore {
  banners: IBanner[] = [];
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchBanners() {
    this.loading = true;
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed");

      runInAction(() => {
        this.banners = json.data.map((b: any) => ({
          ...b,
          imageUrl: b.image_url || `${UPLOADS_BASE}/${b.image}`,
        }));
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message;
        this.loading = false;
      });
    }
  }

  async createBanner(formData: FormData) {
    this.loading = true;
    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      await this.fetchBanners();
      runInAction(() => this.loading = false);
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Create failed";
        this.loading = false;
      });
      throw err;
    }
  }

  async updateBanner(id: number, formData: FormData) {
    this.loading = true;
    try {
      const res = await fetch(`${API_BASE}/update/${id}`, {
        method: "PUT",
        body: formData,
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.message);

      await this.fetchBanners();
      runInAction(() => this.loading = false);
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Update failed";
        this.loading = false;
      });
      throw err;
    }
  }

  // Yeh purana wala (status 0/1 karne ke liye)
  async toggleStatus(id: number, status: number) {
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");

      runInAction(() => {
        const banner = this.banners.find((b) => b.id === id);
        if (banner) banner.status = status === 1;
      });
    } catch (err: any) {
      runInAction(() => this.error = err.message);
      throw err;
    }
  }

  // Yeh NAYA WALA → Real Delete (pura banner hat jayega)
  async deleteBanner(id: number) {
    this.loading = true;
    try {
      const res = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE", // ← DELETE method
      });

      const json = await res.json();
      if (!json.success && !res.ok) {
        throw new Error(json.message || "Delete failed");
      }

      runInAction(() => {
        this.banners = this.banners.filter((b) => b.id !== id);
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = err.message || "Delete failed";
        this.loading = false;
      });
      throw err;
    }
  }
}

export const bannerStore = new BannerStore();