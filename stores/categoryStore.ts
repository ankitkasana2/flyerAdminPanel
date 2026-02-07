import { makeAutoObservable, runInAction } from "mobx";

export interface Category {
    id: number;
    name: string;
    rank: number;
}

class CategoryStore {
    categories: Category[] = [];
    loading = false;
    error: string | null = null;
    saving = false;

    constructor() {
        makeAutoObservable(this);
    }

    async fetchCategories() {
        this.loading = true;
        this.error = null;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
            const data = await res.json();

            if (data.success && Array.isArray(data.categories)) {
                runInAction(() => {
                    this.categories = data.categories.sort((a: Category, b: Category) => a.rank - b.rank);
                });
            } else {
                throw new Error(data.message || "Failed to fetch categories");
            }
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message || "Failed to fetch categories";
            });
        } finally {
            runInAction(() => {
                this.loading = false;
            });
        }
    }

    async createCategory(name: string, rank: number) {
        this.saving = true;
        this.error = null;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, rank }),
            });
            const data = await res.json();

            if (data.success) {
                await this.fetchCategories(); // Refresh list
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to create category");
            }
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

    async deleteCategory(id: number) {
        this.saving = true;
        this.error = null;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}`, {
                method: "DELETE",
            });
            const data = await res.json();

            if (data.success) {
                runInAction(() => {
                    this.categories = this.categories.filter((c) => c.id !== id);
                });
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to delete category");
            }
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

    async updateCategoryRank(id: number, newRank: number) {
        // Optimistic update
        const previousCategories = [...this.categories];

        // We don't just change one rank, we typically are moving items. 
        // But the API just accepts a new rank. 
        // The UI drag-and-drop will probably trigger this.

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories/${id}/rank`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rank: newRank }),
            });
            const data = await res.json();

            if (data.success) {
                // Ideally we should refetch to get the canonical order if strictly managed by server
                // but for responsiveness we might rely on UI state or refetch quietly
                await this.fetchCategories();
                return { success: true };
            } else {
                throw new Error(data.message || "Failed to update rank");
            }
        } catch (err: any) {
            runInAction(() => {
                this.error = err.message;
                // Revert on failure
                this.categories = previousCategories;
            });
            return { success: false, error: err.message };
        }
    }
}

export const categoryStore = new CategoryStore();
