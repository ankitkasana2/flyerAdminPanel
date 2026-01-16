// stores/StoreProvider.tsx
"use client";

import { createContext, useContext } from "react";
import { ordersStore } from "./ordersStore";
import { notificationStore } from "./notificationStore";

const StoreContext = createContext({
  ordersStore,
  notificationStore,
});

export const useOrderStore = () => useContext(StoreContext).ordersStore;
export const useNotificationStore = () => useContext(StoreContext).notificationStore;

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <StoreContext.Provider value={{ ordersStore, notificationStore }}>
      {children}
    </StoreContext.Provider>
  );
}