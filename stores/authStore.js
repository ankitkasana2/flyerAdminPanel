import { makeAutoObservable, runInAction } from "mobx";

class AuthStore {
  user = null;
  token = null;
  loading = false;
  error = "";
  isInitialized = false;

  constructor() {
    makeAutoObservable(this);

    // Load persisted user if exists (client-side only)
    if (typeof window !== "undefined") {
      // Initialize immediately but mark as not initialized
      this.initializeAuth();
    } else {
      // Server-side - mark as initialized immediately
      this.isInitialized = true;
    }
  }

  async initializeAuth() {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        // Validate token format and expiry
        const tokenData = this.parseJWT(savedToken);
        if (tokenData && tokenData.exp * 1000 > Date.now()) {
          // Token is valid, restore user session
          runInAction(() => {
            this.user = JSON.parse(savedUser);
            this.token = savedToken;
            this.isInitialized = true;
          });
        } else {
          // Token expired, clear storage
          this.clearStorage();
        }
      } catch (error) {
        console.error("Failed to restore auth session:", error);
        this.clearStorage();
      }
    } else {
      runInAction(() => {
        this.isInitialized = true;
      });
    }
  }

  parseJWT(token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  clearStorage() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    runInAction(() => {
      this.user = null;
      this.token = null;
    });
  }

  async login(email, password, role, onLogin) {
    this.loading = true;
    this.error = "";

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save token & user info
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Update observable state
      runInAction(() => {
        this.user = data.user;
        this.token = data.token;
      });

      // Optional: trigger callback
      if (onLogin) onLogin(data.user.role);
    } catch (err) {
      this.error = err.message;
      this.clearStorage();
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  logout() {
    this.clearStorage();
  }

  get isAuthenticated() {
    return !!this.user && !!this.token;
  }
}

const authStore = new AuthStore();
export default authStore;
