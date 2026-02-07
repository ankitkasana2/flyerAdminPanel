// stores/carouselStore.ts
import { makeAutoObservable, runInAction } from "mobx";

const API_BASE = `${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`;

export interface Carousel {
    id: number;
    name: string;
    position: number;
    flyers: number;
    isPinned: boolean;
}

class CarouselStore {
    carousels: Carousel[] = [];
    loading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    async fetchCarousels() {
        this.loading = true;
        this.error = null;
        try {
            const res = await fetch(API_BASE);
            if (!res.ok) throw new Error("Failed to fetch carousels");
            const json = await res.json();

            // Expected response: { success: true, count: 3, categories: [...] }
            if (json.success && Array.isArray(json.categories)) {
                runInAction(() => {
                    this.carousels = json.categories.map((c: any) => ({
                        id: c.id,
                        name: c.name,
                        position: c.rank || 0,
                        flyers: 0, // Not provided in current API response, defaulting to 0
                        isPinned: false, // Not provided in current API response, defaulting to false
                    }));
                    this.loading = false;
                });
            } else {
                runInAction(() => {
                    this.loading = false;
                });
                console.warn("Unexpected API response structure", json);
            }

        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                this.loading = false;
            });
        }
    }

    async createCarousel(data: { name: string; rank: number }) {
        this.loading = true;
        this.error = null;
        try {
            const res = await fetch(API_BASE, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to create carousel");
            }

            // Refresh list
            await this.fetchCarousels();

            runInAction(() => {
                this.loading = false;
            });
            return { success: true };
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                this.loading = false;
            });
            return { success: false, error: err.message };
        }
    }

    async togglePin(id: number) {
        const carousel = this.carousels.find(c => c.id === id);
        if (carousel) {
            carousel.isPinned = !carousel.isPinned;
            // TODO: Call API to save pin state if endpoint becomes available
        }
    }

    async deleteCarousel(id: number) {
        this.loading = true;
        this.error = null;
        try {
            const res = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE",
            });
            const json = await res.json();

            if (!res.ok || !json.success) {
                throw new Error(json.message || "Failed to delete carousel");
            }

            runInAction(() => {
                this.carousels = this.carousels.filter(c => c.id !== id);
                this.loading = false;
            });
            return { success: true };
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                this.loading = false;
            });
            return { success: false, error: err.message };
        }
    }

    async reorderAndSave(newOrder: Carousel[]) {
        // 1. Optimistic Update
        runInAction(() => {
            this.carousels = newOrder;
        });

        // 2. Persist to API
        // We update all items to ensure the server is perfectly in sync with our new order.
        // This handles cases where dragging one item affects the relative order of others.
        // We run these updates in parallel for speed, but catch errors individually.
        this.loading = true;

        try {
            const updatePromises = newOrder.map((carousel) =>
                fetch(`${API_BASE}/${carousel.id}/rank`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rank: carousel.position }),
                }).then(res => res.json())
            );

            await Promise.all(updatePromises);

            // 3. Final Fetch to ensure consistency
            await this.fetchCarousels();

        } catch (err: any) {
            runInAction(() => {
                this.error = "Failed to save order: " + err.message;
                // We might want to revert here, but simpler to just fetchCarousels() to restore truth
            });
            await this.fetchCarousels();
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }
}

export const carouselStore = new CarouselStore();
